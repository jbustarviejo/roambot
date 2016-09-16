var restify = require('restify');
var builder = require('botbuilder');
var MongoClient = require('mongodb').MongoClient;

var database={};

//=========================================================
// Bot Setup
//=========================================================

var production=false;
var debug=false;

console.log("=>RoamBot starting...");

//Stablish connection with DataBase
MongoClient.connect('mongodb://127.0.0.1:27017/roambot', function(err, db) {
    if(err){
        console.log("=>ERROR while connecting database");
        throw err;
    }
    database.users = db.collection('users',function(){
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

//=========================================================
// Bots Dialogs
//=========================================================

    bot.dialog('/', [
        function (session, args, next) {
            //console.log(0);
            if (!session.dbUser) {
                //If no user stored, get profile
                debug && console.log(JSON.stringify(session.message));
                session.beginDialog('/get-profile');
            } else {
                next();
            }
        },
        function (session, result) {
            //console.log("Response"+JSON.stringify(result.response));
            if(!result.response.ok==true && !result.response.userName){
                //console.log("nope...");
                session.endDialog();
            }else{
                //console.log("yes!");
                session.dbUser=result.response.dbUser;
                session.beginDialog('/get-profile');
                session.endDialog();
            }
        }
    ]);

    bot.dialog('/get-profile', [
        function (session, args, next) {
            var userName=session.message.user.name;
            database.getUser(userName, function(dbUser){
                if(!dbUser){
                    //console.log("1");
                    session.send("Hola "+getFirstName(userName)+". Para poder acceder a mis servicios es necesario que se confirme tu identidad en el sistema, no tienes que hacer nada, el administrador se pondrá en contacto contigo. ¡gracias!");
                    database.users.insert({_id: session.message.user.id ,createdAt: new Date(), userName: userName, authorized: false});
                    session.endDialog(false);
                }else{
                    //console.log("2");
                    if(!dbUser.authorized){
                        next();
                    }else{
                        if(!dbUser.welcomed){
                            //console.log("4");
                            dbUser.welcomed=true;
                            dbUser.updateUser();
                            session.endDialogWithResult({response: {dbUser: dbUser}});
                            session.send("¡Hola "+getFirstName(session.message.user.name)+"! Por si no me conoces déjame presentarme: Soy RoamBot, el bot de Roaming de Telefónica GRTU. ¿Cómo puedo ayudarte?\n"+
                                "Puedes preguntarme por el tiempo");
                            session.endDialog();
                            //console.log("4.6");
                        }else{
                            //console.log("4.2");
                            session.endDialogWithResult({response: {ok: true, dbUser: dbUser}});
                        }
                    }
                    //console.log("5");
                    session.endDialog();
                }
            });
        },function (session, answer) {
            //console.log("3");
            var answers=["Lo siento, pero no estás confirmado en el sistema aún","Debes esperar a que se te autorice a hablar conmigo","Sé que estás impaciente por hablar conmigo, pero debes esperar...","Espera a que el administrador te identifique...","Aún no hemos confirmado tu identidad, tienes que esperar", "Tienes que esperar a ser identificado por el administrador"];
            var randomNumber=Math.floor(Math.random()*answers.length);
            session.send(answers[randomNumber]);
            session.endDialog();
        }
    ]);

    bot.dialog('/welcome', new builder.IntentDialog()
        .matches(/^hola/i, function (session) {
            console.log(1);
            session.send("Holaaa "+session.dbUser.name);
        })
        .onDefault(function (session) {
            console.log(2);
            session.send("No te entendí, ¡sólo dime hola!");
            session.endDialog();
        }));

    //End of dialogs
    });
    console.log("=>RoamBot ready!");
});

database.getUser=function(userName, callback){
    this.users.findOne({userName: userName}, function(err, doc){
        if (doc){
            debug && console.log("user found!...");
            doc.updateUser=function(){
                var user=this;
                //console.log(this);
                database.users.update({userName: user.userName},{$set:{
                    updatedAt: new Date(),
                    userName: user.userName,
                    welcomed: user.welcomed || false,
                }});/*}, function(err, doc){
                    if(err){
                        console.log("Error updating user: "+err);
                    }
                    callback && callback(); return;
                }*/
            };
            callback && callback(doc);
        }else{
            debug && console.log("No user found...");
            callback && callback(null);
        }
    }); 
}

getFirstName=function(userName){
    var names=userName.split(" ");
    return names[0];
}