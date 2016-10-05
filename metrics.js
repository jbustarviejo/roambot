//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getRoamersByCountryAllCountries(session, direction, timeToApply){
		var self=this;

		console.log("Direction for report",direction);

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en inbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound en %s...", timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en outbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound en %s...", timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}
	},
	getRoamersByCountryAndSubscriberAllCountries(session, direction, subscriber, timeToApply){
		var self=this;

		console.log("Direction for report",direction);

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en inbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para la operadora %s...", subscriber.equivalency);
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en outbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para la operadora %s en %s...", subscriber.equivalency, timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}
	},
	getRoamersByCountryBothDirectionsAllCountries(session, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		self.database.reportsDataOutbound.find({dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
           		} 	
            }

            self.database.reportsDataInbound.find({dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para todos los países en %s es de %s (%s de inbound y %s de outbound)", timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("¡Pst! Un consejo, puedes probar solicitando datos más concretos: 'Dime el Número inbound de roamers de Italia de las últimas 12 horas'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú en %s...", timeToApply.string);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountryAndSubscriberBothDirectionsAllCountries(session, subscriber, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		self.database.reportsDataOutbound.find({subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
           		} 	
            }
            self.database.reportsDataInbound.find({originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            }
		        }
		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para la operadora %s en %s es de %s (%s de inbound y %s de outbound)", subscriber.equivalency, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para la operadora %s en %s",subscriber.equivalency, timeToApply.string);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountryBothDirections(session, country, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		console.log("Country: ",country, "executed query:",{subscriberCountryName: country.equivalency});

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para %s en %s es de %s (%s de inbound y %s de outbound)", country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("Un briconsejo, puedes probar solicitando datos más concretos: 'Oye Roambot, ¿Cuál es el Número inbound de roamers de Chile de la última semana?'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para %s (0 roamers) en %s",country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountryAndSubscriberBothDirections(session, country, subscriber, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		console.log("Country: "+country);

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency, originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para la operadora %s de %s en %s es de %s (%s de inbound y %s de outbound)", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para la operadora %s de %s (0 roamers) en %s", subscriber.equivalency, country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountry(session, country, direction, timeToApply){
		var self=this;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originCountry: country.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1}).toArray(function(err, docs){
				console.log(err,docs);
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en inbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound para %s en %s", country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en outbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para %s en %s", country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}
	},
	getRoamersByCountryAndSubscriber(session, country, direction, subscriber, timeToApply){
		var self=this;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originCountry: country.equivalency, originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1}).toArray(function(err, docs){
				console.log(err,docs);
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }

		        if(successes>0){
					session.send("En total, el número de roamers de Perú en inbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound de %s para %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){
				var successes=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            }
		        }
		        if(successes>0){
					session.send("En total, el número de roamers de Perú en outbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(successes));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound de %s para %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
	            	session.endDialog();
		        }
		    });
		}
	},
	getNewestReportDateOutbound: function(callback){
		var self=this;
		self.database.reportsDataOutbound.find().sort({dataDate : 1}).limit(1).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            debug && console.log("Newest Outbound report found!...");
	            callback && callback(docs[0].dataDate);
	        }else{
	            debug && console.log("No reports found in outbound...");
	            callback && callback(null);
	        }
	    });
	},
	numberWithDots: function(x){
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}
}