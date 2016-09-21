//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getOutboundRoamers: function(session, country, date){
		var self=this;
		var parsedCountry=parse.parseCountry(country);
		if(!parsedCountry){
			session.send("Lo siento, pero no tengo datos de %s :(", parsedCountry);
		}
		if(date){
			var parsedDate=parse.parseDate(date);
			if(!parsedDate){
				session.send("Aún no sé interpretar la unidad de tiempo de '%' :(\nTe devuelvo los más actuales", date);
				//TODO return the newest report
			}
			//TODO: date intervals
			//TODO: Display if no data available (out of registered range)
		}else{
			//The newest report
			self.getSumOutboundRoamersMetric(session, parsedCountry);
		}
	},
	getSumOutboundRoamersMetric: function(session, country, startDate, endDate){
		var self=this;
		if(!startDate){
			//Get the newest
			self.getNewestReportDateOutbound(function(newestDataDate){
				debug && console.log("Comparing to ",newestDataDate);
				self.database.reportsDataOutbound.find({dataDate: newestDataDate}).toArray(function(err, docs){
			        if (docs && docs.length>0){
			            debug && console.log("Outbound data found!...", docs);

			            var totalSumTransactions=0;
			            var totalSumSuccessesTransactions=0;
			            for (var i = 0; i < docs.length; i++) {
			            	totalSumTransactions+=docs[i].sumTransactions;
			            	totalSumSuccessesTransactions+=docs[i].successes;
			            }
			            session.send("En total hay %s romeros, que se logran registrar con una tasa de éxito del %s%%.", totalSumTransactions, Math.round(totalSumSuccessesTransactions*1000/totalSumTransactions)/10);
			        }else{
			            debug && console.log("Outbound data not found...");
			            callback && callback(null);
			        }
			    });
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
	}
}