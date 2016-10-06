var luisConfig = require('./roambot-luis-app-base.js');
var parse = require('./parse.js');
var fs = require('fs');

var countryListFull=parse.countryList;
var subscribersListFull=parse.subscribersList;
var countryList=parse.countryListBasic;
var subscriberList=parse.subscribersListBasic;
var utterances=luisConfig.defaultUtterances;


function writeEntityUtterance(offsetText, country, doubleCheck, entityName, intent){
	var countrySplit = country.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/);
	var offsetSplitLength = 0;
	var startPos = 0;

	if(offsetText){
		offsetSplitLength = offsetText.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/).length;
		startPos=offsetSplitLength;
	}

	var utterance = {
      "text": offsetText+country,
      "intent": intent,
      "entities": [
        {
          "entity": entityName,
          "startPos": startPos,
          "endPos": countrySplit.length-1+offsetSplitLength
        }
      ]
    };
    utterances.push(utterance);

    if(doubleCheck){
    	var countryNoDiacritics=parse.removeDiacritics(offsetText+country);
	    if(countryNoDiacritics!==countryList[i]){
	    	var utterance2 = {
		      "text": countryNoDiacritics,
		      "intent": intent,
		      "entities": [
		        {
		          "entity": entityName,
		          "startPos": startPos,
		          "endPos": countrySplit.length-1+offsetSplitLength
		        }
		      ]
		    };
	    	utterances.push(utterance2);
	    }
    }
}

function writeEntityUtteranceWithDirection(offsetText, country, keywordPosition, offsetEnd, entityName, intent){
	var countrySplit = country.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/);
	var offsetSplitLength = 0;
	var startPos = 0;

	if(offsetText){
		offsetSplitLength = offsetText.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/).length;
		startPos=offsetSplitLength;
	}

	if(keywordPosition==-1){
		keywordPosition=countrySplit.length+offsetSplitLength;
	}

	var utterance = {
      "text": offsetText+country+offsetEnd,
      "intent": intent,
      "entities": [
        {
          "entity": entityName,
          "startPos": startPos,
          "endPos": countrySplit.length-1+offsetSplitLength
        },
        {
          "entity": "direction",
          "startPos": keywordPosition,
          "endPos": keywordPosition
        }
      ]
    };
    utterances.push(utterance);

    /*var countryNoDiacritics=parse.removeDiacritics(offsetText+country+offsetEnd);
    if(countryNoDiacritics!==countryList[i]){
    	var utterance2 = {
	      "text": countryNoDiacritics,
	      "intent": intent,
	      "entities": [
	        {
	          "entity": entityName,
	          "startPos": startPos,
	          "endPos": countrySplit.length-1+offsetSplitLength
	        },
	        {
	          "entity": "direction",
	          "startPos": keywordPosition,
	          "endPos": keywordPosition
	        }
	      ]
	    };
    	utterances.push(utterance2);
    }*/
}

//=========================================================
// Only countries sentences
//=========================================================

//Only countries (Full)
for(var i=0;i<countryListFull.length;i++){
	writeEntityUtterance("",countryListFull[i],true, "country", "roamersStatsNoMetric");
}

//Roamers de {country}
for(var i=0;i<countryList.length;i++){
	writeEntityUtterance("Roamers de ",countryList[i], false, "country", "roamersNumber");
}

//Roamers {country}
for(var i=0;i<countryList.length;i++){
	writeEntityUtterance("Roamers ",countryList[i], false, "country", "roamersNumber");
}

//Número de roamers de {country}
for(var i=0;i<countryList.length;i++){
    writeEntityUtterance("Número de roamers de ",countryList[i], false, "country", "roamersNumber");
}

//Tasa de registro de {country}
for(var i=0;i<countryList.length;i++){
    writeEntityUtterance("Tasa de registro de ",countryList[i], false, "country", "successRate");
}

//Porcentaje de countryList de {country}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Porcentaje de éxito de ",countryList[i], false, "country", "successRate");
}

//Registro de {country}
for(var i=0;i<countryList.length;i++){
    writeEntityUtterance("Registro de ",countryList[i], false, "country", "successRate");
}

//=========================================================
// Only subscribers sentences
//=========================================================

//Only countries (Full)
for(var i=0;i<subscribersListFull.length;i++){
	writeEntityUtterance("",subscribersListFull[i],true, "subscriber", "roamersStatsNoMetric");
}

//Roamers de {subscriber}
for(var i=0;i<subscriberList.length;i++){
	writeEntityUtterance("Roamers de ",subscriberList[i], false, "subscriber", "roamersNumber");
}

//Roamers {subscriber}
for(var i=0;i<subscriberList.length;i++){
	writeEntityUtterance("Roamers ",subscriberList[i], false, "subscriber", "roamersNumber");
}

//Número de roamers de {subscriber}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Número de roamers de ",subscriberList[i], false, "subscriber", "roamersNumber");
}

//Tasa de registro de {subscriber}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Tasa de registro de ",subscriberList[i], false, "subscriber", "successRate");
}

//Porcentaje de éxito de {subscriber}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Porcentaje de éxito de ",subscriberList[i], false, "subscriber", "successRate");
}

//Registro de {subscriber}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Registro de ",subscriberList[i], false, "subscriber", "successRate");
}

//=========================================================
// Countries + direction sentences
//=========================================================

//At start

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("inbound de ",countryList[i],0,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("outbound de ",countryList[i],0,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound de ",countryList[i],1,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound de ",countryList[i],1,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound ",countryList[i],1,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound ",countryList[i],1,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Registro outbound ",countryList[i],1,"", "country", "successRate");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers inbound de ",countryList[i],3,"", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers outbound de ",countryList[i],3,"", "country", "roamersNumber");
}

//At end

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("",countryList[i],-1, " inbound", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("",countryList[i],-1, " outbound", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",countryList[i],-1," inbound", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Tasa de registro de ",countryList[i],-1," inbound", "country", "successRate");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",countryList[i],-1," outbound", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " inbound", "country", "roamersNumber");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " outbound", "country", "roamersNumber");
}

//=========================================================
// Subscriber + direction sentences
//=========================================================

//At start

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("inbound de ",subscriberList[i],0,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Porcentaje de éxito de ",subscriberList[i],0,"", "subscriber", "successRate");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("outbound de ",subscriberList[i],0,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound de ",subscriberList[i],1,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound de ",subscriberList[i],1,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound ",subscriberList[i],1,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound ",subscriberList[i],1,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers inbound de ",subscriberList[i],3,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers outbound de ",subscriberList[i],3,"", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Porcentaje de registro de outbound de ",subscriberList[i],4,"", "subscriber", "successRate");
}

//At end

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("",subscriberList[i],-1, " inbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("",subscriberList[i],-1, " outbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",subscriberList[i],-1," inbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Porcentaje de registro de ",subscriberList[i],-1," inbound", "subscriber", "successRate");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",subscriberList[i],-1," outbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " inbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " outbound", "subscriber", "roamersNumber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Tasa de registro de ",subscriberList[i],-1, " outbound", "subscriber", "successRate");
}

//=========================================================
// Write to file
//=========================================================

luisConfig.config.utterances=utterances;

fs.writeFile("roambot-luis-app-generated.json", JSON.stringify(luisConfig.config), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was generated!");
}); 

/*
* Replace all occurrences for a string
* @param {string} search
* @param {string} replacement
*/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};