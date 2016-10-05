var luisConfig = require('./roambot-luis-app-base.js');
var parse = require('./parse.js');
var fs = require('fs');

var countryListFull=parse.countryList;
var subscribersListFull=parse.subscribersList;
var countryList=parse.countryListBasic;
var subscriberList=parse.subscribersListBasic;
var utterances=luisConfig.defaultUtterances;


function writeEntityUtterance(offsetText, country, doubleCheck, entityName){
	var countrySplit = country.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/);
	var offsetSplitLength = 0;
	var startPos = 0;

	if(offsetText){
		offsetSplitLength = offsetText.replace(" ("," ( ").replace(")"," ) ").replace("-"," - ").replace("&"," & ").replace("  "," ").trim().split(/[\s,]+/).length;
		startPos=offsetSplitLength;
	}

	var utterance = {
      "text": offsetText+country,
      "intent": "roamersNumber",
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
		      "intent": "roamersNumber",
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

function writeEntityUtteranceWithDirection(offsetText, country, keywordPosition, offsetEnd, entityName){
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
      "intent": "roamersNumber",
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
	      "intent": "roamersNumber",
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
	writeEntityUtterance("",countryListFull[i],true, "country");
}

//Roamers de {country}
for(var i=0;i<countryList.length;i++){
	writeEntityUtterance("Roamers de ",countryList[i], false, "country");
}

//Roamers {country}
for(var i=0;i<countryList.length;i++){
	writeEntityUtterance("Roamers ",countryList[i], false, "country");
}

//Número de roamers de {country}
for(var i=0;i<countryList.length;i++){
    writeEntityUtterance("Número de roamers de ",countryList[i], false, "country");
}

//=========================================================
// Only subscribers sentences
//=========================================================

//Only countries (Full)
for(var i=0;i<subscribersListFull.length;i++){
	writeEntityUtterance("",subscribersListFull[i],true, "subscriber");
}

//Roamers de {subscriber}
for(var i=0;i<subscriberList.length;i++){
	writeEntityUtterance("Roamers de ",subscriberList[i], false, "subscriber");
}

//Roamers {subscriber}
for(var i=0;i<subscriberList.length;i++){
	writeEntityUtterance("Roamers ",subscriberList[i], false, "subscriber");
}

//Número de roamers de {subscriber}
for(var i=0;i<subscriberList.length;i++){
    writeEntityUtterance("Número de roamers de ",subscriberList[i], false, "subscriber");
}

//=========================================================
// Countries + direction sentences
//=========================================================

//At start

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("inbound de ",countryList[i],0,"", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("outbound de ",countryList[i],0,"", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound de ",countryList[i],1,"", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound de ",countryList[i],1,"", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound ",countryList[i],1,"", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound ",countryList[i],1,"", "country");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers inbound de ",countryList[i],3,"", "country");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers outbound de ",countryList[i],3,"", "country");
}

//At end

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("",countryList[i],-1, " inbound", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("",countryList[i],-1, " outbound", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",countryList[i],-1," inbound", "country");
}

for(var i=0;i<countryList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",countryList[i],-1," outbound", "country");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " inbound", "country");
}

for(var i=0;i<countryList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " outbound", "country");
}

//=========================================================
// Subscriber + direction sentences
//=========================================================

//At start

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("inbound de ",subscriberList[i],0,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("outbound de ",subscriberList[i],0,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound de ",subscriberList[i],1,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound de ",subscriberList[i],1,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers inbound ",subscriberList[i],1,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers outbound ",subscriberList[i],1,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers inbound de ",subscriberList[i],3,"", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers outbound de ",subscriberList[i],3,"", "subscriber");
}

//At end

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("",subscriberList[i],-1, " inbound", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("",subscriberList[i],-1, " outbound", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",subscriberList[i],-1," inbound", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
	writeEntityUtteranceWithDirection("Roamers de ",subscriberList[i],-1," outbound", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " inbound", "subscriber");
}

for(var i=0;i<subscriberList.length;i++){
    writeEntityUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " outbound", "subscriber");
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