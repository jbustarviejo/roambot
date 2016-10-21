//Metrics 
var parse = require('./parse.js');

debug=true;

module.exports = {
	getRoamersByCountryAllCountries(session, metricCode, direction, timeToApply){
		var self=this;

		var callbackFuntion=function(err, docs){
			var successes=0;
			var attemps=0;

			if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
	            	successes+=docs[i].successes;
	            	attemps+=docs[i].sumTransactions;
	            }
	        }
	        switch(metricCode){
	        	case 1:
	        	default:
	 				if(successes>0){
						session.send("En total, el número de roamers de Perú en %s %s para todos los países es de %s", direction, timeToApply.string, self.numberWithDots(successes));
			        }else{
						session.send("No tengo roamers de Perú en %s %s...", direction, timeToApply.string);
			        }
	        	break;
	        	case 2:
	        		if(attemps>0){
						session.send("La tasa de éxito de registro de los roamers de Perú en %s %s para todos los países es de %s", direction, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
			        }else{
						session.send("No tengo roamers de Perú en %s %s...", direction, timeToApply.string);
			        }
	        	break;
	        }
	        session.endDialog();
		}

		var query = {$and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		if(direction=="inbound"){
			self.database.reportsDataInbound.find(query, filter).toArray(callbackFuntion);
		}else{
			self.database.reportsDataOutbound.find(query, filter).toArray(callbackFuntion);
		}
	},
	getRoamersByCountryAndSubscriberAllCountries(session, metricCode, direction, subscriber, timeToApply){
		var self=this;

		var callbackFuntion=function(err, docs){
			var successes=0;
			var attemps=0;

			if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
	            	successes+=docs[i].successes;
	            	attemps+=docs[i].sumTransactions;
	            }
	        }

        	switch(metricCode){
	        	case 1:
	        	default:
	 				 if(successes>0){
						session.send("En total, el número de roamers de Perú en %s %s para la operadora %s es de %s", direction, timeToApply.string, self.toTitleCase(subscriber.equivalency), self.numberWithDots(successes));
			        }else{
						session.send("No tengo roamers de Perú %s para la operadora %s %s...", direction, self.toTitleCase(subscriber.equivalency), timeToApply.string);
			        }
	        	break;
	        	case 2:
	        		if(attemps>0){
	        			session.send("La tasa de éxito de registro de los roamers de Perú en %s %s para la operadora %s es de %s", direction, timeToApply.string, self.toTitleCase(subscriber.equivalency), self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
			        }else{
						session.send("No tengo roamers de Perú en %s para la operadora %s %s...", direction, self.toTitleCase(subscriber.equivalency), timeToApply.string);
			        }
	        	break;
	        }
	        session.endDialog();
		}

		var queryIn = {originOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryOut = {subscriberOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		if(direction=="inbound"){
			self.database.reportsDataInbound.find(queryIn, filter).toArray(callbackFuntion);
		}else{
			self.database.reportsDataOutbound.find(queryOut, filter).toArray(callbackFuntion);
		}
	},
	getRoamersByCountry(session, metricCode, country, direction, timeToApply){
		var self=this;

		var callbackFuntion=function(err, docs){
			var successes=0;
			var attemps=0;

			if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
	            	successes+=docs[i].successes;
	            	attemps+=docs[i].sumTransactions;
	            }
	        }

			switch(metricCode){
	        	case 1:
	        	default:
			        if(successes>0){
						session.send("En total, el número de roamers de Perú en %s para %s %s es de %s", direction, country.spanish, timeToApply.string, self.numberWithDots(successes));
			        }else{
						session.send("No tengo roamers de Perú en %s para %s %s", direction, country.spanish, timeToApply.string);
			        }
	        	break;
	        	case 2:
	        		if(attemps>0){
	        			session.send("La tasa de éxito de registro de los roamers de Perú en %s para %s %s es de %s", direction, country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
			        }else{
						session.send("No tengo roamers de Perú en %s para %s %s", direction, country.spanish, timeToApply.string);
			        }
	        	break;
	        }
	        session.endDialog();
		}

		var queryIn = {originCountry: country.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryOut= {subscriberCountryName: country.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		if(direction=="inbound"){
			self.database.reportsDataInbound.find(queryIn, filter).toArray(callbackFuntion);
		}else{
			self.database.reportsDataOutbound.find(queryOut, filter).toArray(callbackFuntion);
		}
	},
	getRoamersByCountryAndSubscriber(session, metricCode, country, direction, subscriber, timeToApply){
		var self=this;

		var callbackFuntion=function(err, docs){
			var successes=0;
			var attemps=0;

			if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
	            	successes+=docs[i].successes;
	            	attemps+=docs[i].sumTransactions;
	            }
	        }

	        switch(metricCode){
	        	case 1:
	        	default:
			        if(successes>0){
						session.send("En total, el número de roamers de Perú en %s de %s para %s %s es de %s", direction, self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string, self.numberWithDots(successes));
			        }else{
						session.send("No tengo roamers de Perú en %s de %s para %s %s", direction, self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string);
			        }
	        	break;
	        	case 2:
	        		if(attemps>0){
	        			session.send("La tasa de éxito de registro de los roamers de Perú en %s de %s para %s %s es de %s", direction, self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*successes/attemps)/100)+"%");
			        }else{
						session.send("No tengo roamers de Perú en %s para %s %s", direction, country.spanish, timeToApply.string);
			        }
	        	break;
	        }
	        session.endDialog();
		}

		var queryIn = {originCountry: country.equivalency, originOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryOut = {subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		if(direction=="inbound"){
			self.database.reportsDataInbound.find(queryIn, filter).toArray(callbackFuntion);
		}else{
			self.database.reportsDataOutbound.find(queryOut, filter).toArray(callbackFuntion);
		}
	},
	getRoamersByCountryBothDirectionsAllCountries(session, metricCode, timeToApply){
		var self=this;

		var outboundTransactions=0;
		var inboundTransactions=0;
		var outboundAttemps=0;
		var inboundAttemps=0;

		var queryIn = {$and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryOut = {$and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		self.database.reportsDataOutbound.find(queryIn, filter).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find(queryOut, filter).toArray(function(err, docs){
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
							session.send("En total, el número de roamers de Perú para todos los países %s es de %s (%s en inbound y %s en outbound)", timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo el número de roamers de Perú %s...", timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para todos los países %s es de %s (siendo de un %s en inbound y %s en outbound)", timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo el número de roamers de Perú %s...", timeToApply.string);
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

		var queryOut = {subscriberOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryIn = {originOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		self.database.reportsDataOutbound.find(queryOut, filter).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }
            self.database.reportsDataInbound.find(queryIn, filter).toArray(function(err, docs){
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
							session.send("En total, el número de roamers de Perú para la operadora %s (todos los países) %s es de %s (%s en inbound y %s en outbound)", self.toTitleCase(subscriber.equivalency), timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s %s", self.toTitleCase(subscriber.equivalency), timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para la operadora %s (todos los países) %s es de %s (siendo de un %s en inbound y %s en outbound)", self.toTitleCase(subscriber.equivalency), timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s %s", self.toTitleCase(subscriber.equivalency), timeToApply.string);
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

		var queryOut = {subscriberCountryName: country.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryIn = {originCountry: country.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};
console.log("1.qIn: ",queryIn, "\n 2.quout:",queryOut," Date:"+timeToApply.since+"-"+timeToApply.to);
		self.database.reportsDataOutbound.find(queryOut, filter).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find(queryIn, filter).toArray(function(err, docs){
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
							session.send("En total, el número de roamers de Perú para %s %s es de %s (%s en inbound y %s en outbound)", country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para %s %s",country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
							session.send("La tasa de éxito de registro de los roamers de Perú para %s %s es de %s (siendo de un %s en inbound y %s en outbound)", country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para %s %s",country.spanish, timeToApply.string);
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

		var queryIn = {originCountry: country.equivalency, originOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var queryOut = {subscriberCountryName: country.equivalency, subscriberOperatorName: subscriber.equivalency, $and:[{dataDate: {$gte: timeToApply.since}},{dataDate: {$lte: timeToApply.to}} ]};
		var filter = {successes: 1, sumTransactions:1};

		self.database.reportsDataOutbound.find(queryOut, filter).toArray(function(err, docs){
	        if (docs && docs.length>0){
	            for (var i = 0; i < docs.length; i++) {
            		outboundTransactions+=docs[i].successes;
            		outboundAttemps+=docs[i].sumTransactions;
           		} 	
            }

            self.database.reportsDataInbound.find(queryIn, filter).toArray(function(err, docs){

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
							session.send("En total, el número de roamers de Perú para la operadora %s de %s %s es de %s (%s en inbound y %s en outbound)", self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string, self.numberWithDots(sumTransactions), self.numberWithDots(inboundTransactions), self.numberWithDots(outboundTransactions));
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s de %s %s", self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string);
				        }
		        	break;
		        	case 2:
		        		if(sumAttemps>0){
		        			session.send("La tasa de éxito de registro de los roamers de Perú para la operadora %s de %s %s es de %s (siendo de un %s en inbound y %s en outbound)", self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string, self.numberWithDots(Math.round(10000*sumTransactions/sumAttemps)/100)+"%", self.numberWithDots(Math.round(10000*inboundTransactions/inboundAttemps)/100)+"%", self.numberWithDots(Math.round(10000*outboundTransactions/outboundAttemps)/100)+"%");
				        }else{
							session.send("No tengo roamers de Perú para la operadora %s de %s %s", self.toTitleCase(subscriber.equivalency), country.spanish, timeToApply.string);
				        }
		        	break;
		        }
		        session.endDialog();
		    });
	    });
	},
	numberWithDots: function(x){
	    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	},
	toTitleCase: function(str){
	    return str.replace(/\w\S*/g, function(txt){
	      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	}
}