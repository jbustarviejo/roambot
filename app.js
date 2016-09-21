var restify = require('restify');
var builder = require('botbuilder');
var MongoClient = require('mongodb').MongoClient;

var metrics = require('./metrics.js');

//=========================================================
// Bot Setup
//=========================================================

var database={};
var production=false;
var debug=false;

console.log("=>RoamBot starting...");

database.initDatabase=function(callback){
    //Stablish connection with DataBase
    MongoClient.connect('mongodb://127.0.0.1:27017/roambot', function(err, db) {
        if(err){
            console.log("=>ERROR while connecting database");
            throw err;
        }
        database.getUser=function(id, callback){
            this.users.findOne({_id: id}, function(err, doc){
                if (doc){
                    debug && console.log("user found!...");
                    doc.updateUser = database.updateUser;
                    callback && callback(doc);
                }else{
                    debug && console.log("No user found...");
                    callback && callback(null);
                }
            }); 
        }

        database.updateUser=function(user, callback){
            console.log("Actualizando...",user);
            database.users.update({userName: user.userName},{$set:{
                updatedAt: new Date(),
                userName: user.userName,
                welcomed: user.welcomed || false,
                authorized: user.authorized || false,
                validationCode: user.validationCode
            }}, function(){
                callback && callback();
            });
        };
        database.users = db.collection('users',function(){
            database.reportsDataInbound = db.collection('reportsDataInbound',function(){
                database.reportsDataOutbound = db.collection('reportsDataOutbound',function(){
                    database.reports = db.collection('reports',function(){
                        metrics.database=database;
                        callback && callback(); return;
                    });
                });
            });
        });
    });
}

database.initDatabase(function(){
                    
if(!production){
    var connector = new builder.ConsoleConnector().listen();
    var bot = new builder.UniversalBot(connector);
}else{
    // Setup Restify Server
    var server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
       console.log('%s listening to %s', server.name, server.url); 
    });
      
    // Create chat bot
    var connector = new builder.ChatConnector({
        appId: "1b0298a9-3405-4cc8-9584-5b3424f2fc19",
        appPassword: "QDvJQbqFZzWLagySMFv0qMm"
    });
    var bot = new builder.UniversalBot(connector);
    server.post('/', connector.listen());
}

//LUIS recognizer
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=6bcb8477-a066-4e21-a15e-864af9bda1b9&subscription-key=57964100a34f4d1aa3c5cd619690f610&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        database.getUser(message.user.id, function(dbUser){
            if(!dbUser){
                var name = message.user ? message.user.name: null;
                name = getFirstName(name);
                name = name ? " "+name : null;
                database.users.insert({_id: message.user.id ,createdAt: new Date(), userName: name, authorized: false});
                var reply = new builder.Message()
                        .address(message.address)
                        .text("¡Hola %s! Soy Roambot, un placer conocerte :)", name);
                bot.send(reply);
            }else{
                //if(dbUser.authorized){
                var name = message.user ? message.user.name: null;
                name = getFirstName(name);
                name = name ? " "+name : null;
                var reply = new builder.Message()
                        .address(message.address)
                        .text("¡Hola de nuevo %s! ;)", getFirstName(name) || '');
                bot.send(reply);
            }
        });
    } else {
        // delete their data
    }
});

//=========================================================
// Bots Intents dialogs
//=========================================================

dialog.matches('hello', [
    function (session, args, next) {
        console.log(session);
        session.send("¡Hola "+getFirstName(session.message.user.name)+"! (highfive)");
    }
]);

dialog.matches('roamersNumberOutbound', [
    function (session, args, next) {
        console.log("Model for outbound: ",args);
        var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
        var time = builder.EntityRecognizer.findEntity(args.entities, 'time');
        if (!country) {
            builder.Prompts.text(session, "¿De qué país querrías saber el número de roamers?");
        } else {
            next({ country: country.entity, time: time});
        }
    },
    function (session, results) {
        console.log(results);
        if (results.country) {
            if(results.time){
                session.send("Métrica recuperada: #Roamers outbound de %s para %s", results.country, results.time);
                console.log("Métrica recuperada: #Roamers outbound de %s para %s", results.country, results.time);
            }else{
                session.send("Métrica recuperada: #Roamers outbound de %s (más reciente)", results.country);
                metrics.getOutboundRoamers(session, results.country, results.time);   
            }
        } else {
            session.send("Métrica recuperada: #Roamers global");
        }
    }
]);

dialog.matches('roamersNumberInbound', [
    function (session, args, next) {
        console.log("Model for inbound:",args);
        var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
        if (!country) {
            builder.Prompts.text(session, "¿De qué país querrías saber el número de roamers?");
        } else {
            next({ response: country.entity });
        }
    },
    function (session, results) {
        var time = builder.EntityRecognizer.findEntity(args.entities, 'time');
        if (results.response) {
            if(time){
                session.send("Métrica recuperada: #Roamers inbound de %s para %s", results.response, time);
            }else{
                session.send("Métrica recuperada: #Roamers inbound de %s (más reciente)", results.response);
            }
        } else {
            session.send("Métrica recuperada: #Roamers global");
        }
    }
]);

//=========================================================
// Bots Dialogs
//=========================================================

    dialog.onBegin(function (session, args, next) {
        database.getUser(session.message.user.id, function(dbUser){
            if(!dbUser){
                dbUser = {_id: session.message.user.id, createdAt: new Date(), userName: session.message.user.name, authorized: false, welcomed: true};
                database.users.insert(dbUser);
            }
            if(!dbUser.authorized){
                session.replaceDialog('/get-user-auth', dbUser);
            }else{
                session.dbUser=dbUser;
                next();
            }
        });
    });

    bot.dialog('/get-user-auth', [
        function (session, args, next) {
            console.log("Args: ", args);
            if(!session.userData.dbUser && !args){
                throw Exception("Error: No dbUser received");
            }
            if(args){
                session.userData.dbUser=args;
            }
            if(!session.dialogData.welcomed){
                session.dialogData.welcomed=true;
                // call custom prompt
                session.beginDialog('/validate-email-dialog',true);
            }else{
                next();
            }
        },
        //Request & validate email
        function (session, result, next) {
            console.log("Res1: ",session);
            if(!session.dialogData.email){
                session.dialogData.email=session.message.text.trim().toLowerCase();
                session.userData.dbUser.email=session.dialogData.email;
                session.userData.dbUser.validationCode=42;

                // call custom prompt
                session.beginDialog('/validate-code-dialog', true);
            }else{
                next();
            }
        },
        function (session, result, next) {
            console.log("Res2: ",session);
            session.userData.dbUser.authorized=true;
            database.updateUser(session.userData.dbUser, function(){
                session.endDialogWithResult({result: {ok: true, dbUser: session.userData.dbUser}});    
            });
        }
    ]);

    dialog.onDefault(builder.DialogAction.send("No te he entendido bien, estoy aún aprendiendo a hablar y me cuesta un poco"));

    bot.dialog('/validate-email-dialog', [
        function (session, args) {
            if(args===true){
                session.send(session, "Para usar mis servicios es necesario confirmar tu identidad, te voy a enviar un código a tu email para que me lo escribas y así te pueda identificar");
            }
            // call custom prompt
            session.beginDialog('/validate-email-prompt', { 
                prompt: "Dime tu email corporativo:", 
                retryPrompt: "No parece un email corporativo correcto, reintrodúcelo." 
            });
        },
        function (session, results) {
            // Check their answer
            if (results.response) {
                session.send("¡Así es!");
                session.endDialogWithResult();
            } else{
                session.send("Debes introducir un email corporativo válido y este no lo es :(\n");
            }
        }
    ]);

    bot.dialog('/validate-email-prompt', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        var email=response.trim();
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var valid_email = re.test(email);
        var valid_telefonica_email = email.endsWith("telefonica.es");
        return valid_email && valid_telefonica_email;
    }));

    bot.dialog('/validate-code-dialog', [
        function (session, args) {
            if(args){
                session.send(session, "Genial, ¡un último paso! Voy a enviarte a "+session.userData.dbUser.email+" un código de seguridad para verificar tu identidad. Cuando lo recibas, vuelve y dime el código aquí:");
            }
            // call custom prompt
            session.beginDialog('/validate-code-prompt', { 
                prompt: "Dime el código enviado a tu email", 
                retryPrompt: "No parece ser el código correcto, revísalo y reintrodúcelo." 
            });
        },
        function (session, results) {
            // Check their answer
            if (results.response) {
                session.send("Gracias por verificar tu identidad. Es importante estar seguros (cool)");
                session.endDialog();
            } else{
                session.send("Debes revisar en tu correo para verificar el código que te ha llegado y decírmelo aquí sin espacios y respetando las mayúsculas");
            }
        }
    ]);

    bot.dialog('/validate-code-prompt', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        if(response=="42"){
            return true;
        }
        return false;
    }));

    console.log("=>RoamBot ready!");    
});

getFirstName=function(userName){
    if(!userName){
        return null;
    }
    var names=userName.split(" ");
    return names[0];
}