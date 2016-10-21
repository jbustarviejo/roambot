var restify = require('restify');
var builder = require('botbuilder');
var nodemailer = require('nodemailer');
require('datejs');

var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var os = require('os');

var metrics = require('./metrics.js');
var parse = require('./parse.js');

//=========================================================
// Bot Setup
//=========================================================

var database={};
var production=true;
var debug=true;
var serverPort=3978;
var enableHttps=false;

//Global vars
var bot;
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=b76ed2f0-631a-41e4-bddf-b5f5b6896fac&subscription-key=57964100a34f4d1aa3c5cd619690f610&q=');
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
                    callback && callback(doc);
                }else{
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

        if(os.hostname()=="MacBook-de-jbustarviejogmailcom.local"){
            production=false;
            enableHttps=false;
        }

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

    //=========================================================
    // Bots Intents dialogs
    //=========================================================

    dialog.matches('roamersNumber', [
        function (session, args, next) {
            console.log("=>RN: Detected by Luis: \n",args,"\n");
            
            var result=luisUtil.getDataFromArgs(args);
            next(result);
        },
        function (session, result, next) {
            console.log("=>Args received in l2\n", result,"\n");

            luisUtil.createAnswerWithData(session, result, 1);
        },
    ]);

    dialog.matches('successRate', [
        function (session, args, next) {
            console.log("=>SR: Detected by Luis: \n",args,"\n");

            var result=luisUtil.getDataFromArgs(args);
            next(result);
        },
        function (session, result, next) {
            console.log("=>Args received in l2\n", result,"\n");

            luisUtil.createAnswerWithData(session, result, 2);
        },
    ]);

    dialog.matches('roamersStatsNoMetric', [
        function (session, args, next) {
            console.log("=>NoEnoughData: Detected by Luis: \n",args,"\n");

            var result=luisUtil.getDataFromArgs(args);
            session.dialogData.proccesedArgs=result;

            session.send("No estoy seguro de la estadística que quieres");
            builder.Prompts.choice(session, "¿Qué estadística buscas?", "Número de roamers|Tasa de éxito de registro de roamers");

        }, function (session, result, next) {
            console.log("=>Args received in l2\n", session.dialogData.proccesedArgs,"\n");
            session.dialogData.proccesedArgs.timePeriod.since=new Date(session.dialogData.proccesedArgs.timePeriod.since); //Fix to MS error
            session.dialogData.proccesedArgs.timePeriod.to=new Date(session.dialogData.proccesedArgs.timePeriod.to); 
            
            if (result.response && session.dialogData.proccesedArgs) {
                switch(result.response.entity){
                    case "Número de roamers":
                    case 1:
                         luisUtil.createAnswerWithData(session, session.dialogData.proccesedArgs, 1);
                    break;
                    case "Tasa de éxito de registro de roamers":
                    case 2:
                         luisUtil.createAnswerWithData(session, session.dialogData.proccesedArgs, 2);
                    break;
                    default:
                        session.send("No te he entendido");
                        session.endDialog();
                    break;
                }
            } else {
                session.send("No te he entendido");
                session.endDialog();
            }
        }
    ]);

    //=========================================================
    // Bots Defaults
    //=========================================================

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

    dialog.onBegin(function (session, args, next) {
        database.getUser(session.message.user.id, function(dbUser){
            console.log("=>Getted user:\n", dbUser,"\n");
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
    dialog.onDefault(builder.DialogAction.send('No te he entendido, aún estoy aprendiendo :( Prueba con algo del estilo de "Dime el número de roamers inbound de TIM Italia de las últimas 12 horas" o algo como "¿Cuál es la tasa de éxito de registro para Chile de las últimas dos semanas?"'));

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
                        util.sendAlertByEmailToAdmin(emailEntered, session.userData.dbUser.userName);
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
                    session.send("¡Genial! El administrador te ha dado de alta en el sistema ¡Ahora me toca entrenar! Simplemente pregúntame por alguna estadística, de manera natural como _'Oye Roambot, dime el número de roamers outbound de Chile de ayer'_");
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
}

//=========================================================
// Util
//=========================================================

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
        if(!email.endsWith("telefonica.es") && !email.endsWith("telefonica.com")){
            return -2;
        }
        return 1;
    },
    sendAlertByEmailToAdmin: function(email, userName){
        console.log("Generando email de alerta para ",email,userName);
     
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'roambotgrtu@gmail.com',
                pass: 'GRTU2016'
            }
        },{
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
    },
};

var luisUtil={
    parseCountry: function(sentence){
        var countryDetected = builder.EntityRecognizer.findBestMatch(parse.countryList, sentence, 0.01);
        //console.log("Country recognition: ",countryDetected);

        if(countryDetected && countryDetected.score > 0 && countryDetected.index>=0){
            return {original: sentence, equivalency: parse.countryListEquivalency[countryDetected.index], spanish: parse.countryListES[countryDetected.index]};
        }

        return null;
    },
    parseSubscriber: function(sentence, country, callback){
        if(country){
            //TODO by country
        }
        //Detect from all operators
        var subscriberDetected = builder.EntityRecognizer.findBestMatch(parse.subscribersList, sentence, 0.01);
        console.log("subscriber recognition from all: ", sentence);

        if(subscriberDetected && subscriberDetected.score > 0 && subscriberDetected.index>=0){
            var detected = {original: sentence, equivalency: parse.subscribersListEquivalency[subscriberDetected.index]};
            callback && callback(detected);return detected;
        }

        callback && callback(null);return null;
    },
    parseDirection: function(sentence){
        var directions=parse.directions;
        var directionsEquivalency=parse.directionsEquivalency;
        console.log("Direction sentence: ",sentence);
        var parseDirection = builder.EntityRecognizer.findBestMatch(directions, sentence);
        console.log("Direction recognition: ", parseDirection);
        if(parseDirection && parseDirection.score){
            return {original: sentence, equivalency: directionsEquivalency[parseDirection.index]}
        }
        return null;
    },
    parseTimeQuantity: function(sentence){
        if(!isNaN(sentence)){ //If is a number, return it
            console.log("Quantity parsing, number: "+sentence);
            return {original: sentence, equivalency: sentence};
        }
        var quantityDetected = builder.EntityRecognizer.findBestMatch(parse.quantity, sentence, 0.20);

        if(quantityDetected && quantityDetected.score > 0 && quantityDetected.index>=0){
            console.log("Quantity parsing, returned",{original: sentence, equivalency: parse.quantityEquivalency[quantityDetected.index]});
            return {original: sentence, equivalency: parse.quantityEquivalency[quantityDetected.index]};
        }

        console.log("Quantity parsing, null");
        return null;
    },
    parseTimePeriod: function(sentence, fulltime){
        var periodDetected = builder.EntityRecognizer.findBestMatch(parse.period, sentence, 0.20);
        console.log("=>Period parsed: ",periodDetected);

        if(periodDetected && periodDetected.score > 0 && periodDetected.index>=0){
            if(parse.periodSingle[periodDetected.index]){
                console.log("Static period ",parse.periodSingle[periodDetected.index]);
                return {original: sentence, 
                equivalency: parse.periodEquivalency[periodDetected.index], 
                single:parse.periodSingle[periodDetected.index], 
                plural: parse.periodPlural[periodDetected.index], 
                toSingle: parse.period2Single[periodDetected.index], 
                toPlural: parse.period2Plural[periodDetected.index], 
                isDinamic: false};
            }else{
                console.log("Dinamic period");
                var toCurrent = false;

                if(fulltime && fulltime.entity){
                    var words=fulltime.entity.split(" ");
                    var day=parse.period2Single[periodDetected.index];
                    switch(words[0]){
                        case "desde":
                            toCurrent=true;
                            dateString = "desde "+day;
                        break;
                        default:
                            if(day.startsWith("el")){
                                dateString = "d"+day;
                            }else{
                                dateString = "de "+day;
                            } 
                        break;
                    }
                    console.log("Time detected!: "+ words[0]);
                }else{
                    console.log("No fulltime");
                    var day=parse.period2Single[periodDetected.index];
                    if(day.startsWith("el")){
                        dateString = "d"+day;
                    }else{
                        dateString = "de "+day;
                    }                    
                }

                switch(parse.periodEquivalency[periodDetected.index]){
                    case "ayer":                        
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.today(),
                            dateEnd: toCurrent ? new Date() : Date.today().add(-1).days(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "antes de ayer":
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.today().add(-2).days(),
                            dateEnd: toCurrent ? new Date() : Date.today().add(-1).days(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "semana pasada":
                        var lastSunday=Date.today().last().sunday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: lastSunday.add(-6).days(),
                            dateEnd: toCurrent ? new Date() : lastSunday,
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "mes pasado":
                        d = new Date();
                        if(d.getMonth()==0){
                          var previousMonth = 11;
                          var previousMonthYear = d.getFullYear()-1;  
                        }else{
                          var previousMonth=d.getMonth()-1 
                          var previousMonthYear=d.getFullYear();  
                        }
                        
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: new Date(year,month),
                            dateEnd: toCurrent ? new Date() : new Date(d.getFullYear(),d.getMonth()),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "hoy":
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.today(),
                            dateEnd: new Date(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "lunes":
                        var date=Date.last().monday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "martes":
                        var date=Date.last().tuesday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "miércoles":
                        var date=Date.last().wednesday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "jueves":
                        var date=Date.last().thursday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "sábado":
                        var date=Date.last().saturday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "domingo":
                        var date=Date.last().sunday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(24).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "fin de semana":
                        var date=Date.today().add(-1).days().last().saturday();
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: date,
                            dateEnd: toCurrent ? new Date() : date.add(48).hours(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "enero":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().january(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "febrero":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().february(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "marzo":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().march(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "abril":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().april(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "mayo":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().may(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "junio":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().june(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "julio":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().july(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "agosto":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().august(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "septiembre":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().september(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "octubre":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().october(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "noviembre":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().november(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                    case "diciembre":
                        var d=new Date(Date.today().getFullYear(),Date.today().getMonth())
                        return {original: sentence, 
                            equivalency: parse.periodEquivalency[periodDetected.index], 
                            dateStart: Date.parse(d).last().december(),
                            dateEnd: toCurrent ? new Date() : new Date(start).add(1).month(),
                            string: dateString,
                            isDinamic: true};
                        break;
                }
            }
        }
        return null;
    },
    getDataFromArgs: function(args){
        var country = builder.EntityRecognizer.findEntity(args.entities, 'country');
        var subscriber= builder.EntityRecognizer.findEntity(args.entities, 'subscriber');
        var direction = builder.EntityRecognizer.findEntity(args.entities, 'direction');
        var quantity = builder.EntityRecognizer.findEntity(args.entities, 'time::quantity');
        var period = builder.EntityRecognizer.findEntity(args.entities, 'time::period');
        var fulltime = builder.EntityRecognizer.findEntity(args.entities, 'fulltime');

        //Get country
        if(country && country.entity){
            country.equivalency=luisUtil.parseCountry(country.entity);
        }

        //inbound or outbound
        if(direction && direction.entity){
            var directionParsed = luisUtil.parseDirection(direction.entity);
        }else{
            var directionParsed = null;
        }

        //Subscriber TODO: By country
        if(subscriber && subscriber.entity){
            subscriber.equivalency=luisUtil.parseSubscriber(subscriber.entity);
        }

        var timePeriod = {};
        timePeriod.since = new Date(new Date().getTime() - (1000 * 60) * 60 * 24);
        timePeriod.string = "las últimas 24 horas";

        if(quantity && quantity.entity && period && period.entity){
            console.log("Q y P");
            quantity.equivalency=luisUtil.parseTimeQuantity(quantity.entity);

            period.equivalency=luisUtil.parseTimePeriod(period.entity, fulltime);

            //Period type
            if(period.equivalency && period.equivalency.equivalency){
                console.log("Pe2");
                if(period.equivalency.isDinamic){
                    console.log("Ped2");
                    timePeriod.since = period.equivalency.dateStart;
                    timePeriod.to = period.equivalency.dateEnd;
                    timePeriod.string = period.equivalency.string;
                }else if(quantity.equivalency && quantity.equivalency.equivalency){
                    console.log("Qe2 y Pe2");
                    timePeriod.since = new Date(new Date().getTime() - (1000 * 60) * quantity.equivalency.equivalency * period.equivalency.equivalency);
                    timePeriod.to=new Date();
                    if(quantity.equivalency.equivalency==1){
                        timePeriod.string = "en " + period.equivalency.single+" "+period.equivalency.toSingle;   
                    }else{
                        timePeriod.string = "en " + period.equivalency.plural+" "+quantity.equivalency.equivalency+" "+period.equivalency.toPlural;   
                    }
                }else{
                    console.log("Pe3");
                    timePeriod.since = new Date(new Date().getTime() - (1000 * 60) * period.equivalency.equivalency);
                    timePeriod.to=new Date();
                    timePeriod.string = "en " + period.equivalency.plural+" "+period.equivalency.toSingle;   
                }
            }
        }else if(period && period.entity){
            console.log("P");
            period.equivalency=luisUtil.parseTimePeriod(period.entity, fulltime);
            if(period.equivalency && period.equivalency.isDinamic){
                console.log("Ped1");
                timePeriod.since = period.equivalency.dateStart;
                timePeriod.to = period.equivalency.dateEnd;
                timePeriod.string = period.equivalency.string;
            }else if(period.equivalency && period.equivalency.equivalency){
                console.log("Pe1");
                timePeriod.since = new Date(new Date().getTime() - (1000 * 60) * period.equivalency.equivalency);
                timePeriod.to=new Date();
                timePeriod.string = "en " + period.equivalency.toSingle+" "+period.equivalency.single;   
            }
        }

        return {country: country, subscriber: subscriber, direction: directionParsed, timePeriod: timePeriod};
    },
    createAnswerWithData: function(session, result, metricCode){
        console.log("Received for compute: ", result);

        if(result.country && result.country.equivalency && result.country.equivalency.equivalency){
            countryEntity=result.country.equivalency;
            if(result.direction && result.direction.equivalency){
                if(result.subscriber && result.subscriber.equivalency && result.subscriber.equivalency.equivalency){
                    metrics.getRoamersByCountryAndSubscriber(session, metricCode, countryEntity, result.direction.equivalency, result.subscriber.equivalency, result.timePeriod);
                }else{
                    metrics.getRoamersByCountry(session, metricCode, countryEntity, result.direction.equivalency, result.timePeriod);
                }
            }else{
                if(result.subscriber && result.subscriber.equivalency && result.subscriber.equivalency.equivalency){
                    metrics.getRoamersByCountryAndSubscriberBothDirections(session, metricCode, countryEntity, result.subscriber.equivalency, result.timePeriod);
                }else{
                    metrics.getRoamersByCountryBothDirections(session, metricCode, countryEntity, result.timePeriod);
                }
            }
        }else{
            if(result.direction && result.direction.equivalency){
                if(result.subscriber && result.subscriber.equivalency && result.subscriber.equivalency.equivalency){
                    metrics.getRoamersByCountryAndSubscriberAllCountries(session, metricCode, result.direction.equivalency, result.subscriber.equivalency, result.timePeriod);
                }else{
                    metrics.getRoamersByCountryAllCountries(session, metricCode, result.direction.equivalency, result.timePeriod);
                }
            }else{
                if(result.subscriber && result.subscriber.equivalency && result.subscriber.equivalency.equivalency){
                    metrics.getRoamersByCountryAndSubscriberBothDirectionsAllCountries(session, metricCode, result.subscriber.equivalency, result.timePeriod);
                }else{
                    metrics.getRoamersByCountryBothDirectionsAllCountries(session, metricCode, result.timePeriod);
                }
            }
        }
        session.endDialog();
    }
};