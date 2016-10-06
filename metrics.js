//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getRoamersByCountryAllCountries(session, metricCode, direction, timeToApply){
		var self=this;

		console.log("Direction for report",direction);

		var successes=0;
		var attemps=0;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
		 				if(successes>0){
							session.send("En total, el número de roamers de Perú en inbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en inbound en %s...", timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú en inbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en inbound en %s...", timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}else{
			self.database.reportsDataOutbound.find({dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
		 				if(successes>0){
							session.send("En total, el número de roamers de Perú en outbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en outbound en %s...", timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú en outbound en %s para todos los países es de %s", timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en outbound en %s...", timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}
	},
	getRoamersByCountryAndSubscriberAllCountries(session, metricCode, direction, subscriber, timeToApply){
		var self=this;

		console.log("Direction for report",direction);

		var successes=0;
		var attemps=0;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

	        	switch(metricCode){
		        	case 1:
		        	default:
		 				 if(successes>0){
							session.send("En total, el número de roamers de Perú en inbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú inbound para la operadora %s en %s...", subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en inbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en inbound para la operadora %s en %s...", subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
		 				 if(successes>0){
							session.send("En total, el número de roamers de Perú en outbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú outbound para la operadora %s en %s...", subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en outbound en %s para la operadora %s es de %s", timeToApply.string, subscriber.equivalency, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en outbound para la operadora %s en %s...", subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}
	},
	getRoamersByCountryBothDirectionsAllCountries(session, metricCode, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;
		var outboundAttemps=0;
		var inboundAttemps=0;

		self.database.reportsDataOutbound.find({dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find({dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            	inboundAttemps+=docs[i].sumTransactions;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        var sumAttemps=outboundAttemps+inboundAttemps;

		        switch(metricCode){
		        	case 1:
		        	default:
    			        if(sumTransactions>0){
							session.send("En total, el número de roamers de Perú para todos los países en %s es de %s (%s en inbound y %s en outbound)", timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú en %s...", timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para todos los países en %s es de %s (siendo de un %s en inbound y %s en outbound)", timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en %s...", timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
	    });
	},
	getRoamersByCountryAndSubscriberBothDirectionsAllCountries(session, metricCode, subscriber, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;
		var outboundAttemps=0;
		var inboundAttemps=0;

		self.database.reportsDataOutbound.find({subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }
            self.database.reportsDataInbound.find({originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            	inboundAttemps+=docs[i].sumTransactions;
		            }
		        }
		        var sumTransactions=outboundTransactions+inboundTransactions;
		        var sumAttemps=outboundAttemps+inboundAttemps;

		        switch(metricCode){
		        	case 1:
		        	default:
			        	if(sumTransactions>0){
							session.send("En total, el número de roamers de Perú para la operadora %s (todos los países) en %s es de %s (%s en inbound y %s en outbound)", subscriber.equivalency, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s en %s",subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para la operadora %s (todos los países) en %s es de %s (siendo de un %s en inbound y %s en outbound)", subscriber.equivalency, timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s en %s",subscriber.equivalency, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
	    });
	},
	getRoamersByCountryBothDirections(session, metricCode, country, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;
		var outboundAttemps=0;
		var inboundAttemps=0;

		console.log("Country: ",country, "executed query:",{subscriberCountryName: country.equivalency});

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            	inboundAttemps+=docs[i].sumTransactions;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        var sumAttemps=outboundAttemps+inboundAttemps;
		        switch(metricCode){
		        	case 1:
		        	default:
			        	if(sumTransactions>0){
							session.send("En total, el número de roamers de Perú para %s en %s es de %s (%s en inbound y %s en outbound)", country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para %s en %s",country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para %s en %s es de %s (siendo de un %s en inbound y %s en outbound)", country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para %s en %s",country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
	    });
	},
	getRoamersByCountryAndSubscriberBothDirections(session, metricCode, country, subscriber, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;
		var outboundAttemps=0;
		var inboundAttemps=0;

		console.log("Country: "+country);

		self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find({originCountry: country.equivalency, originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	inboundTransactions+=docs[i].successes;
		            	inboundAttemps+=docs[i].sumTransactions;
		            }
		        }

		        var sumTransactions=outboundTransactions+inboundTransactions;
		        var sumAttemps=outboundAttemps+inboundAttemps;

		        switch(metricCode){
		        	case 1:
		        	default:
				        if(sumTransactions>0){
							session.send("En total, el número de roamers de Perú para la operadora %s de %s en %s es de %s (%s en inbound y %s en outbound)", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s de %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú para la operadora %s de %s en %s es de %s (siendo de un %s en inbound y %s en outbound)", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s de %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
	    });
	},
	getRoamersByCountry(session, metricCode, country, direction, timeToApply){
		var self=this;

		var successes=0;
		var attemps=0;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originCountry: country.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
				console.log(err,docs);

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

				switch(metricCode){
		        	case 1:
		        	default:
				        if(successes>0){
							session.send("En total, el número de roamers de Perú en inbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en inbound para %s en %s", country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en inbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en inbound para %s en %s", country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, dataDate: {$gt: timeToApply.since}},{successes: 1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
				        if(successes>0){
							session.send("En total, el número de roamers de Perú en outbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en outbound para %s en %s", country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en outbound para %s en %s es de %s", country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en outbound para %s en %s", country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}
	},
	getRoamersByCountryAndSubscriber(session, metricCode, country, direction, subscriber, timeToApply){
		var self=this;

		var successes=0;
		var attemps=0;

		if(direction=="inbound"){
			self.database.reportsDataInbound.find({originCountry: country.equivalency, originOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){
				console.log(err,docs);

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
				        if(successes>0){
							session.send("En total, el número de roamers de Perú en inbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en inbound de %s para %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en inbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en inbound para %s en %s", country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}else{
			self.database.reportsDataOutbound.find({subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, dataDate: {$gt: timeToApply.since}}, {successes: 1, sumTransactions:1}).toArray(function(err, docs){

		        if (docs && docs.length>0){
		            for (var i = 0; i < docs.length; i++) {
		            	successes+=docs[i].successes;
		            	attemps+=doc[i].sumTransactions;
		            }
		        }

		        switch(metricCode){
		        	case 1:
		        	default:
				        if(successes>0){
							session.send("En total, el número de roamers de Perú en outbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(successes));
				        }else{
							session.send("No tengo roamers de Perú en outbound de %s para %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(attemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú en outbound de %s para %s en %s es de %s", subscriber.equivalency, country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú en outbound de %s para %s en %s", subscriber.equivalency, country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
		}
	},
	/*getNewestReportDateOutbound: function(callback){
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
	},*/
	numberWithDots: function(x){
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}
}