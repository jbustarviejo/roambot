//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getRoamersByCountryAllCountries(session, direction){
		var self=this;

		console.log("Direction for report",direction);

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({},{sumTransactions: 1}).toArray(function(err, docs){
				var sumTransactions=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumTransactions+=docs[i].sumTransactions;
		            }
		        }

		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú en inbound para todos los países es de %s", self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound para esta combinación");
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({},{sumTransactions: 1}).toArray(function(err, docs){
				var sumTransactions=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumTransactions+=docs[i].sumTransactions;
		            }
		        }

		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú en outbound para todos los países es de %s", self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para esta combinación");
	            	session.endDialog();
		        }
		    });
		}
	},
	getRoamersByCountryBothDirectionsAllCountries(session){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;

		self.database.reportsDataOutbound.find({},{sumTransactions: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find({},{sumTransactions: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].sumTransactions;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para todos los países es de %s (%s de inbound y %s de outbound)", self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("¡Pst! Un consejo, puedes probar solicitando datos más concretos: 'Dime el Número inbound de roamers de Italia de las últimas 24 horas'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para esta combinación");
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

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency},{sumTransactions: 1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency},{sumTransactions: 1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].sumTransactions;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú para %s es de %s (%s de inbound y %s de outbound)", country.spanish, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
					session.send("Un briconsejo, puedes probar solicitando datos más concretos: 'Oye Roambot, ¿Cuál es el Número inbound de roamers de Chile de la última semana?'");
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú para %s (0 roamerss)",country.spanish);
	            	session.endDialog();
		        }
		    });
	    });
	},
	getRoamersByCountry(session, country, direction){
		var self=this;

		console.log("Direction for report",direction);

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originCountry: country.equivalency}, {sumTransactions: 1}).toArray(function(err, docs){
				var sumTransactions=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumTransactions+=docs[i].sumTransactions;
		            }
		        }

		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú en inbound para %s es de %s", country.spanish, self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú inbound para esta combinación");
	            	session.endDialog();
		        }
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency},{sumTransactions: 1}).toArray(function(err, docs){
				var sumTransactions=0;

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	sumTransactions+=docs[i].sumTransactions;
		            }
		        }

		        if(sumTransactions>0){
					session.send("En total, el número de roamers de Perú en outbound para %s es de %s", country.spanish, self.numberWithDots(sumTransactions));
	            	session.endDialog();
		        }else{
					session.send("No tengo datos de Perú outbound para esta combinación");
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