var restify = require('restify');
var builder = require('botbuilder');
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var metrics = require('./metrics.js');
var parse = require('./parse.js');

//=========================================================
// Bot Setup
//=========================================================

var database={};
var production=false;
var debug=true;
var serverPort=3978;
var enableHttps=false;

//Global vars
var bot;
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=d501ee34-9ae0-4d74-a9f3-60f41f99a4e5&subscription-key=57964100a34f4d1aa3c5cd619690f610&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

console.log("=>RoamBot starting...");

(function() {
    //Stablish connection with DataBase
    MongoClient.connect('mongodb://127.0.0.1:27017/roambot', function(err, db) {
        if(err){
            console.log("=>ERROR while connecting database");
            throw err;
        }

        database.users = db.collection('users');
        database.reportsDataInbound = db.collection('reportsDataInbound');
        database.reportsDataOutbound = db.collection('reportsDataOutbound');
        database.reports = db.collection('reports');

        database.getUser=function(id, callback){
            this.users.findOne({_id: id}, function(err, doc){
                if (doc){
                    debug && console.log("user found!...");
                    callback && callback(doc);
                }else{
                    debug && console.log("No user found...");
                    callback && callback(null);
                }
            });
        }

        database.updateUser=function(user, callback){
            console.log("Actualizando...",user);
            this.users.update({userName: user.userName},{$set:{
                updatedAt: new Date(),
                userName: user.userName,
                welcomed: user.welcomed || false,
                authorized: user.authorized || false,
                email: user.email
            }}, function(){
                    callback && callback();
                }
            );
        };


        metrics.database=database;
        if(!production){
            var connector = new builder.ConsoleConnector().listen();
            bot = new builder.UniversalBot(connector);
        }else{
            // Setup Restify Server
            if(enableHttps){
                var server = restify.createServer({
                  certificate: fs.readFileSync('/home/ubuntu/.ssh/server.crt'),
                  key: fs.readFileSync('/home/ubuntu/.ssh/server.key'),
                  name: 'Roambot',
                });
            }else{
                var server = restify.createServer();
            }
            
            server.listen(serverPort, function () {
               console.log('%s listening to %s', server.name, server.url); 
            });
              
            // Create chat bot
            var connector = new builder.ChatConnector({
                appId: "4e22b0fa-96e8-49c7-abeb-7b0efb9149db",
                appPassword: "XofU1vyfYNCLxmfvtRdkfaD"
            });
            bot = new builder.UniversalBot(connector);
            server.post('/', connector.listen());
        }
        bot.dialog('/', dialog);

        setupDialogs();

        console.log("=>RoamBot ready!");
    });
        
})();

function setupDialogs(){
    bot.on('contactRelationUpdate', function (message) {
        console.log(message);
        if (message.action === 'add') {
            database.getUser(message.user.id, function(dbUser){
                if(!dbUser){
                    name = util.getFirstName(message.user ? message.user.name: null);
                    name = name ? " "+name : "";

                    database.users.insert({_id: message.user.id ,createdAt: new Date(), userName: message.user.name, authorized: false, welcomed: true});

                    var reply = new builder.Message().address(message.address).text("¡Hola%s! Soy Roambot, el bot de estadísticas de roaming de GRTU, gracias por agregarme :)", name);
                    bot.send(reply);
                }else{
                    name = util.getFirstName(message.user ? message.user.name: null);
                    name = name ? " "+name : "";

                    var reply = new builder.Message().address(message.address).text("¡Hola de nuevo%s! ;)", name);
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

    dialog.matches('roamersNumber', [
        function (session, args, next) {
            var toReply="Vale, te digo lo que he pillado... Métrica #roamers.";
            console
            if(args.entities){

                var direction = builder.EntityRecognizer.findEntity(args.entities, 'direction');

                var countryList = builder.EntityRecognizer.findAllEntities(args.entities, 'country');
                var subscriberList = builder.EntityRecognizer.findAllEntities(args.entities, 'subscriber');

                var origin = builder.EntityRecognizer.findEntity(args.entities, 'origin');
                var destination = builder.EntityRecognizer.findEntity(args.entities, 'destination');

                var timeList = builder.EntityRecognizer.findAllEntities(args.entities, 'time');
                var dateIntervalStart = builder.EntityRecognizer.findEntity(args.entities, 'time::dateIntervalStart');
                var dateIntervalEnd = builder.EntityRecognizer.findEntity(args.entities, 'time::dateIntervalEnd');
                var puntualDate = builder.EntityRecognizer.findEntity(args.entities, 'time::puntualDate');
                
                if(direction){
                    //If direction
                    if(origin){

                        toReply+=" Origen: ";

                        country=luisUtil.getElementInSentence(origin, countryList);

                        if(country){
                            toReply+=" país "+luisUtil.parseCountry(country.entity,true)+" ['"+country.entity+"'],";
                        }else{
                            toReply+=" no sé el país,";
                        } 

                        subscriber=luisUtil.getElementInSentence(origin, subscriberList);

                        if(subscriber){
                            toReply+=" operadora "+luisUtil.parseOperator(subscriber.entity,true)+" ['"+subscriber.entity+"'],";
                        }else{
                            toReply+=" no sé la operadora,";
                        }
                        toReply+=" en dirección "+direction.entity;

                    }else if(destination){

                        country=luisUtil.getElementInSentence(destination, countryList);

                        toReply+=" Destino: ";
                        if(country){
                            toReply+=" país "+luisUtil.parseCountry(country.entity,true)+" ['"+country.entity+"'],";
                        }else{
                            toReply+=" no sé el país,";
                        } 

                        subscriber=luisUtil.getElementInSentence(destination, subscriberList);

                        if(subscriber){
                            toReply+=" operadora "+luisUtil.parseOperator(subscriber.entity,true)+" ['"+subscriber.entity+"'],";
                        }else{
                            toReply+=" no sé la operadora,";
                        }
                        toReply+=" en dirección "+direction.entity;
                        
                    }else{
                        toReply+=" Dirección "+direction.entity+", pero no sé el país ni la operadora.";
                    }
                }else{
                    //No direction
                    if(origin){
                        toReply+=" Origen: ";

                        country=luisUtil.getElementInSentence(origin, countryList);

                        if(country){
                            toReply+=" país "+luisUtil.parseCountry(country.entity,true)+" ['"+country.entity+"'],";
                        }else{
                            toReply+=" no sé el país,";
                        } 

                        subscriber=luisUtil.getElementInSentence(origin, subscriberList);

                        if(subscriber){
                            toReply+=" operadora "+luisUtil.parseOperator(subscriber.entity,true)+" ['"+subscriber.entity+"'],";
                        }else{
                            toReply+=" no sé qué operadora.";
                        }
                    }else{
                        toReply+=" No sé el país ni la operadora.";
                    }

                    if(destination){
                        toReply+=" Destino: ";

                        country=luisUtil.getElementInSentence(destination, countryList);

                        if(country){
                            toReply+=" país "+luisUtil.parseCountry(country.entity,true)+" ['"+country.entity+"'],";
                        }else{
                            toReply+=" no sé el país,";
                        } 

                        subscriber=luisUtil.getElementInSentence(destination, subscriberList);

                        if(subscriber){
                            toReply+=" operadora "+luisUtil.parseOperator(subscriber.entity,true)+" ['"+subscriber.entity+"'],";
                        }else{
                            toReply+=" no sé qué operadora.";
                        }
                    }else{
                        toReply+=" No sé el país ni la operadora.";
                    }
                }

                //Dates - time
                if(puntualDate){
                    toReply+=" El tiempo es '"+puntualDate.entity+"'";
                }else{
                    if(dateIntervalStart){
                        if(dateIntervalEnd){
                            toReply+=" El tiempo es 'Desde "+dateIntervalEnd.entity+"', Hasta "+dateIntervalEnd.entity+"'.";
                        }else{
                            toReply+=" El tiempo es 'Desde "+dateIntervalEnd.entity+"', pero no sé 'hasta cuándo', daría los datos hasta hoy.";
                        }
                    }else if(dateIntervalEnd){
                        toReply+=" El tiempo es 'Hasta "+dateIntervalEnd.entity+"', pero no sé 'desde cuándo.'";
                    }else{
                        toReply+=" No sé la unidad de tiempo, daría los de las últimas 24hrs.";
                    }
                }

            }
            console.log(args);
            session.send(toReply); 
        }
    ]);

    dialog.matches('roamersStatsNotEnoughData', [
        function (session, args, next) {
            var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
            var time = builder.EntityRecognizer.findEntity(args.entities, 'time');

            var toReply="Vale, te digo lo que he pillado: \n-Métrica de roamers sin muchos datos (no sé algún dato fundamental para entenderlo). "+JSON.stringify(args);
            console.log(args);
            session.send(toReply); 
        }
    ]);


    /*
 =>Número de roamers: 
    Por hora, día, comparado con ayer o el mismo dia de la semana anterior
    tanto in como out
    por remote partner
    por pais

    Cuántos roamers habían de Perú el 16-sept a las 18 registrados en Orange España

    */

    //=========================================================
    // Bots Defaults
    //=========================================================

    dialog.onBegin(function (session, args, next) {
        database.getUser(session.message.user.id, function(dbUser){
            console.log("Getted user:\n", dbUser);
            if(!dbUser){
                dbUser={_id: session.message.user.id ,createdAt: new Date(), userName: session.message.user.name, authorized: false, welcomed: true};
                database.users.insert(dbUser);
            }
            
            session.userData.dbUser = dbUser;

            if(!session.userData.dbUser.email){
                session.replaceDialog("/get-user-email",{welcome: true});
            }else if(session.userData.dbUser.authorized!==true){
                session.userData.accessAttemps=1;
                session.replaceDialog("/user-not-authorized");
            }else{
                next();
            }
        });
    });

    //dialog.onDefault(builder.DialogAction.beginDialog('/dont-understand'));
    dialog.onDefault(builder.DialogAction.send('Esta no la entendí nada...'));

    bot.dialog('/dont-understand', [
        function (session, args, next) {
            console.log(session,args);
            session.send("No estoy seguro de la estadística que quieres, estoy aún aprendiendo a hablar y me cuesta un poco :(");
            builder.Prompts.choice(session, "¿Cómo puedo ayudarte?", "Número de roamers outbound|Número de roamers inbound");
        },
        function (session, result, next) {
            console.log(result);
            if (result.response) {
                switch(result.response.entity){
                    case "Número de roamers outbound":
                    case 1:
                        session.send("La funcionalidad de outbound está pendiente... (tumbleweed)"); //TODO
                        session.endDialog();
                    break;
                    case "Número de roamers inbound":
                    case 2:
                        session.send("La funcionalidad de inbound pendiente... (tumbleweed)"); //TODO
                        session.endDialog();
                    break;
                    default:
                        session.send("Sigo sin entenderte, aprenderé de esta conversación para la próxima vez :(");
                        session.endDialog();
                    break;
                }
            } else {
                session.send("Ok");
            }
        },
    ]);

    //=========================================================
    // Bots Dialogs
    //=========================================================

    bot.dialog('/get-user-email', [
        function (session, args) {
            console.log("email dialog");
            if(args && args.welcome){
                session.send("Para usar mis servicios es necesario confirmar tu identidad, para ello, el administrador tiene que darte de alta en el sistema mediante tu email");
            }
            builder.Prompts.text(session, "Por favor, dime tu email corporativo:");
        },
        function (session, result, next) {
            // Check their answer
            console.log("Email result",session,"Answer",result.response);

            var emailEntered=result.response.trim();

            if(emailEntered.toLowerCase().endsWith("email corporativo")||emailEntered.toLowerCase().endsWith("email corporativo:")){
                session.send("¡Anda! Tenemos un graciosillo... Lo que quiero es que me escribas tu email de la empresa");
                session.reset('/get-user-email',{welcome: false});
            }else{
                if(result.response.indexOf("mailto:")>0){
                    emailEntered=emailEntered.substring(emailEntered.indexOf("mailto:")+7);
                    emailEntered=emailEntered.substring(0,emailEntered.indexOf('">')); 
                }
                var validEmail=util.validateEmail(emailEntered);
                switch(validEmail){
                    case -2:
                        session.send("No parece ser un email de la empresa, ¿puedes revisarlo?");
                        session.reset('/get-user-email',{welcome: false});
                    break;
                    case 1:
                        session.send("¡Genial! Ese me vale");
                        sendAlertByEmailToAdmin(emailEntered, session.userData.dbUser.userName);
                        session.send("Ahora a esperar... el administrador se pondrá en contacto contigo por tu email (time)");
                        session.userData.dbUser.email=emailEntered;
                        database.updateUser(session.userData.dbUser, function(){
                            session.endDialog();
                        });
                    break;
                    default:
                        session.send("No parece ser un email válido, ¿puedes revisarlo?");
                        session.reset('/get-user-email',{welcome: false});
                    break;
                }
            }
        }
    ]);

    bot.dialog('/user-not-authorized', [
        function (session, args) {
            console.log("Session received",session);
            database.getUser(session.message.user.id, function(dbUser){
                session.userData.dbUser=dbUser;
                if(session.userData.dbUser.authorized===true){
                    //session.send("¡Genial! El administrador te ha dado de alta en el sistema y ya puedes empezar a utilizar mis servicios. Simplemente pregúntame por alguna estadística, de manera natural como _'Oye Roambot, dime el número de roamers en Perú de ayer'_");
                    session.send("¡Genial! El administrador te ha dado de alta en el sistema ¡Ahora me toca entrenar! Simplemente pregúntame por alguna estadística, de manera natural como _'Oye Roambot, dime el número de roamers en Perú de ayer'_");
                    session.endDialog();
                }else{
                    if(!args || !args.mute){
                        session.userData.accessAttemps=session.userData.accessAttemps?session.userData.accessAttemps+1:1;
                        if(session.userData.accessAttemps>=3){
                            builder.Prompts.confirm(session, "A ver... ¿El email "+session.userData.dbUser.email+" es correcto?");
                        }else{
                            session.send(["Aún no estás autorizado en el sistema, debes esperar :x", "Lo siento, pero el administrador aún no ha tramitado tu alta", "Tienes que esperar a que el administrador se ponga en contacto contigo para poder utilizar mis servicios", "Debes esperar... el administrador está trabajando en tu alta (computerrage)", "Sé que es eterno, pero tienes que esperar a estar dado de alta en el sistema (tumbleweed)"]);
                        }
                    }
                }
            });
        },
        function (session, result) {
            session.userData.accessAttemps=1;
            if (result.response) {
                session.send("¡Ok! Entonces sólo tienes que esperar a que el administrador te escriba");
                session.beginDialog('/user-not-authorized',{mute:true});
            } else{
                session.send("Ok, entonces vamos entonces a reintroducir el email...");
                session.userData.dbUser.email=null;
                delete session.userData.dbUser.email;
                database.updateUser(session.userData.dbUser,function(){
                    session.replaceDialog("/get-user-email",{welcome: true});
                });
            }
        }
    ]);

    function sendAlertByEmailToAdmin(email, userName){
        console.log("Generando email de alerta para ",email,userName);
     
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'roambotgrtu@gmail.com',
                pass: 'GRTU2016'
            }
        }, {
        });

        // setup e-mail data with unicode symbols 
        var message = {
            to: "j.bustarviejo@gmail.com", // list of receivers 
            subject: 'Nuevo usuario para Roambot', // Subject line 
            text: 'El usuario '+userName+" con email "+email+" espera confirmación", // plaintext body 
            html: 'El usuario <b>'+userName+"</b> con email <b>"+email+"</b> espera confirmación" // html body 
        };
         
       transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
            return;
        }
        console.log('Message sent successfully!');
        console.log('Server responded with "%s"', info.response);
        });
    };


    /*
    dialog.matches('roamersNumberOutbound', [
        function (session, args, next) {
            console.log("Model for outbound: ",args);
            var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
            var time = builder.EntityRecognizer.findEntity(args.entities, 'time');
            if(time){
                time=time.entity;
            }else{
                time=null;
            }
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
                    metrics.getOutboundRoamers(session, results.country, results.time);
                }else{
                    session.send("Métrica recuperada: #Roamers outbound de %s (más reciente)", results.country);
                    metrics.getOutboundRoamers(session, results.country);   
                }
            } else {
                session.send("Métrica recuperada: #Roamers global");
            }
        }
    ]);

    dialog.matches('roamersNumberInbound', [
        function (session, args, next) {
            console.log("Model for inbound: ",args);
            var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
            var time = builder.EntityRecognizer.findEntity(args.entities, 'time');
            if(time){
                time=time.entity;
            }else{
                time=null;
            }
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
                    session.send("Métrica recuperada: #Roamers inbound de %s para %s", results.country, results.time);
                    console.log("Métrica recuperada: #Roamers inbound de %s para %s", results.country, results.time);
                    metrics.getOutboundRoamers(session, results.country, results.time);
                }else{
                    session.send("Métrica recuperada: #Roamers inbound de %s (más reciente)", results.country);
                    metrics.getOutboundRoamers(session, results.country);   
                }
            } else {
                session.send("Métrica recuperada: #Roamers global");
            }
        }
    ]);
    }*/

    /*
if(direction){
                    //If direction
                    if(originCountry){
                        if(originSubscriber){
                            toReply+=" País "+originCountry.entity+ ", operadora "+originSubscriber.entity+" en dirección "+direction.entity;
                        }else if(destinationSubscriber){
                            toReply+=" País "+originCountry.entity+ ", operadora "+destinationSubscriber.entity+" en dirección "+direction.entity;
                        }else{
                            toReply+=" País "+originCountry.entity+ ", pero no sé qué operadora, en dirección "+direction.entity;
                        }
                    }else if(destinationCountry){
                        if(destinationSubscriber){
                            toReply+=" País "+destinationCountry.entity+ ", operadora "+destinationSubscriber.entity+" en dirección "+direction.entity;
                        }else if(originSubscriber){
                            toReply+=" País "+destinationCountry.entity+ ", operadora "+originSubscriber.entity+" en dirección "+direction.entity;
                        }else{
                            toReply+=" País "+destinationCountry.entity+ ", pero no sé qué operadora, en dirección "+direction.entity;
                        }
                    }else{
                        toReply+=" Dirección "+direction.entity+", pero no sé el país ni la operadora.";
                    }
                }else{
                    //No direction
                    if(originCountry){
                        if(originSubscriber){
                            toReply+=" País de origen "+originCountry.entity+ ", operadora "+originSubscriber.entity+".";
                        }else{
                            toReply+=" País de origen "+originCountry.entity+ ", pero no sé qué operadora.";
                        }
                    }else{
                        toReply+=" No sé el país de origen ni la operadora.";
                    }
                    if(destinationCountry){
                        if(destinationSubscriber){
                            toReply+=" País de destino "+destinationCountry.entity+ ", operadora "+destinationSubscriber.entity+".";
                        }else{
                            toReply+=" País de destino "+destinationCountry.entity+ ", pero no sé qué operadora.";
                        }
                    }
                }
                //Dates
                if(puntualDate){
                    toReply+=" El tiempo es '"+puntualDate.entity+"'";
                }else{
                    if(dateIntervalStart){
                        if(dateIntervalEnd){
                            toReply+=" El tiempo es 'Desde "+dateIntervalEnd.entity+"', Hasta "+dateIntervalEnd.entity+"'.";
                        }else{
                            toReply+=" El tiempo es 'Desde "+dateIntervalEnd.entity+"', pero no sé 'hasta cuándo', daría los datos hasta hoy.";
                        }
                    }else if(dateIntervalEnd){
                        toReply+=" El tiempo es 'Hasta "+dateIntervalEnd.entity+"', pero no sé 'desde cuándo.'";
                    }else{
                        if(time){
                            toReply+=" Unidad de tiempo: '"+time+"'.";
                        }else{
                            toReply+=" No sé la unidad de tiempo, daría los de las últimas 24hrs.";
                        }
                    }
                }
    */
}

var util={
    getFirstName: function(userName){
        if(!userName){
            return null;
        }
        var names=userName.split(" ");
        return names[0];
    },
    validateEmail: function(email){
        var email=email.trim();
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var validEmail = re.test(email);
        if(!validEmail){
            return -1;
        }
        if(!email.endsWith("telefonica.es")||!email.endsWith("telefonica.com")){
            return -2;
        }
        return 1;
    }
};

var luisUtil={
    getElementInSentence: function(sentente, elementList){
        for(var i=0; i<elementList.length; i++){
            if(elementList[i].startIndex>=sentente.startIndex && elementList[i].endIndex<=sentente.endIndex){
                return elementList[i];
            }
        }
        return null;
    },
    parseCountry: function(sentence, returnString){
        var countryEN = builder.EntityRecognizer.findBestMatch(parse.countryListEN, sentence,0.01);
        var countryES = builder.EntityRecognizer.findBestMatch(parse.countryListES, sentence,0.01);
        var countryCode = builder.EntityRecognizer.findBestMatch(parse.countryCodes, sentence,0.01);

        console.log("Country recognition ES: ",countryES,"\nCountryEN:",countryEN,"\nCCountry code:",countryCode);

        if(countryES && countryES.score && countryES.score >= countryEN.score && countryES.score >= countryCode.score){
            return countryES.entity;
        }

        if(countryEN && countryEN.score && countryEN.score >= countryCode.score){
            return parse.countryListES[countryEN.index];
        }

        if(countryCode && countryCode.score){
            return parse.countryListES[parse.countryListEN.indexOf(parse.countryCodesEquivalency[countryCode.index])];
        }

        return returnString ? "-no sé cuál-" : null;

    },
    parseOperator: function(sentence, returnString){
        var subscribersGeneral = builder.EntityRecognizer.findBestMatch(parse.subscribersGeneral, sentence,0.01);
        var subscribersConcrete = builder.EntityRecognizer.findBestMatch(parse.subscribersConcrete, sentence,0.01);
        console.log("Subscriber recognition concrete: ",subscribersConcrete,"\nGeneral:",subscribersGeneral);
        if(subscribersConcrete && subscribersConcrete.entity && subscribersGeneral && subscribersGeneral.entity ){
            //Both equivalences
            if(subscribersGeneral.score>=subscribersConcrete.score){
                //Better in concrete
                return subscribersGeneral.entity;
            }else{
                //Better in concrete, return in general
                return parse.subscribersGeneral[subscribersConcrete.index]
            }
        }else{
            if(subscribersGeneral && subscribersGeneral.entity){
                //Better in general
                return subscribersGeneral.entity;
            }else if(subscribersConcrete && subscribersConcrete.entity ){
                //Better in concrete, return in general
                return parse.subscribersGeneral[subscribersConcrete.index]
            }else{
                return returnString?"-no sé cuál-":null;
            }
        }
    }
};