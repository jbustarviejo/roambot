//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getRoamersByCountryAllCountries(session, direction){
		var self=this;

		console.log("Direction for report",direction,{originCountry: country.equivalency}, {sumSuccesses: 1});

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({},{sumSuccesses: 1}).toArray(function(err, docs){
				var sumSuccesses=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumSuccesses+=docs[i].sumSuccesses;
		            }
		        }

		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú en inbound en las últimas 24 horas para todos los países es de %s", self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound...");
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({},{sumSuccesses: 1}).toArray(function(err, docs){
				var sumSuccesses=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumSuccesses+=docs[i].sumSuccesses;
		            }
		        }

		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú en outbound en las últimas 24 horas para todos los países es de %s", self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound...");
	            	session.endDialog();
		        }
		    });
		}
	},
	getRoamersByCountryBothDirectionsAllCountries(session){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		self.database.reportsDataOutbound.find({},{sumSuccesses: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].sumSuccesses;
           		} 	
            }

            self.database.reportsDataInbound.find({},{sumSuccesses: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].sumSuccesses;
		            }
		        }

		        var sumSuccesses=outboundTransactions+inboundTransactions;
		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú para todos los países en las últimas 24 horas es de %s (%s de inbound y %s de outbound)", self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("¡Pst! Un consejo, puedes probar solicitando datos más concretos: 'Dime el Número inbound de roamers de Italia de las últimas 12 horas'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú...");
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountryBothDirections(session, country){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		console.log("Country: "+country);

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency},{sumSuccesses: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].sumSuccesses;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency},{sumSuccesses: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].sumSuccesses;
		            }
		        }

		        var sumSuccesses=outboundTransactions+inboundTransactions;
		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú para %s para las últimas 24 horas es de %s (%s de inbound y %s de outbound)", country.spanish, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("Un briconsejo, puedes probar solicitando datos más concretos: 'Oye Roambot, ¿Cuál es el Número inbound de roamers de Chile de la última semana?'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para %s (0 roamers) en las últimas 24 horas",country.spanish);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountry(session, country, direction){
		var self=this;

		console.log("Direction for report",direction,{originCountry: country.equivalency}, {sumSuccesses: 1});

		if(direction=="inbound"){
			self.database.reportsDataInbound.find().toArray(function(err, docs){
				console.log(err,docs);
			});
			self.database.reportsDataInbound.find({originCountry: country.equivalency}, {sumSuccesses: 1}).toArray(function(err, docs){
				console.log(err,docs);
				var sumSuccesses=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumSuccesses+=docs[i].sumSuccesses;
		            }
		        }

		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú en inbound para %s de las últimas 24 horas es de %s", country.spanish, self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound para %s en las últimas 24 horas", country.spanish);
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency},{sumSuccesses: 1}).toArray(function(err, docs){
				var sumSuccesses=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumSuccesses+=docs[i].sumSuccesses;
		            }
		        }

		        if(sumSuccesses>0){
					session.send("En total, el número de roamers de Perú en outbound para %s de las últimas 24 horas es de %s", country.spanish, self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para %s en las últimas 24 horas", country.spanish);
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