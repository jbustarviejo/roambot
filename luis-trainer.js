var luisConfig = require('./roambot-luis-app-base.js');
var parse = require('./parse.js');
var fs = require('fs');

var countryListFull=parse.countryList;
var subscribersListFull=parse.subscribersList;
var countryList=parse.countryListBasic;
var subscriberList=parse.subscribersListBasic;
var utterances=luisConfig.defaultUtterances;


function writeCountryUtterance(offsetText, country, doubleCheck){
	var countrySplit = country.replace(" ("," ( ").replace(")"," ) ").replace("  "," ").trim().split(/[\s,]+/);
	var offsetSplitLength = 0;
	var startPos = 0;

	if(offsetText){
		offsetSplitLength = offsetText.replace(" ("," ( ").replace(")"," ) ").replace("  "," ").trim().split(/[\s,]+/).length;
		startPos=offsetSplitLength;
	}

	var utterance = {
      "text": offsetText+country,
      "intent": "roamersNumber",
      "entities": [
        {
          "entity": "country",
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
		          "entity": "country",
		          "startPos": startPos,
		          "endPos": countrySplit.length-1+offsetSplitLength
		        }
		      ]
		    };
	    	utterances.push(utterance2);
	    }
    }
}

function writeCountryUtteranceWithDirection(offsetText, country, keywordPosition, offsetEnd){
	var countrySplit = country.replace(" ("," ( ").replace(")"," ) ").replace("  "," ").trim().split(/[\s,]+/);
	var offsetSplitLength = 0;
	var startPos = 0;

	if(offsetText){
		offsetSplitLength = offsetText.replace(" ("," ( ").replace(")"," ) ").replace("  "," ").trim().split(/[\s,]+/).length;
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
          "entity": "country",
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
	          "entity": "country",
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
	writeCountryUtterance("",countryListFull[i],true);
}

//Roamers de {country}
for(var i=0;i<countryList.length;i++){
	writeCountryUtterance("Roamers de ",countryList[i]);
}

//Roamers {country}
for(var i=0;i<countryList.length;i++){
	writeCountryUtterance("Roamers ",countryList[i]);
}

//Número de roamers de {country}
for(var i=0;i<countryList.length;i++){
      writeCountryUtterance("Número de roamers de ",countryList[i]);
}

//=========================================================
// Only subscribers sentences
//=========================================================

//Only countries (Full)
for(var i=0;i<subscribersListFull.length;i++){
	writeCountryUtterance("",subscribersListFull[i],true);
}

//Roamers de {country}
for(var i=0;i<subscriberList.length;i++){
	writeCountryUtterance("Roamers de ",subscriberList[i]);
}

//Roamers {country}
for(var i=0;i<subscriberList.length;i++){
	writeCountryUtterance("Roamers ",subscriberList[i]);
}

//Número de roamers de {country}
for(var i=0;i<subscriberList.length;i++){
      writeCountryUtterance("Número de roamers de ",subscriberList[i]);
}

//=========================================================
// Countries + direction sentences
//=========================================================

//At start

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("inbound de ",countryList[i],0,"");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("outbound de ",countryList[i],0,"");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers inbound de ",countryList[i],1,"");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers outbound de ",countryList[i],1,"");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers inbound ",countryList[i],1,"");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers outbound ",countryList[i],1,"");
}

for(var i=0;i<countryList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers inbound de ",countryList[i],3,"");
}

for(var i=0;i<countryList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers outbound de ",countryList[i],3,"");
}

//At end

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("",countryList[i],-1, " inbound");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("",countryList[i],-1, " outbound");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers de ",countryList[i],-1," inbound");
}

for(var i=0;i<countryList.length;i++){
	writeCountryUtteranceWithDirection("Roamers de ",countryList[i],-1," outbound");
}

for(var i=0;i<countryList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " inbound");
}

for(var i=0;i<countryList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers de ",countryList[i],-1, " outbound");
}

//=========================================================
// Subscriber + direction sentences
//=========================================================

//At start

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("inbound de ",subscriberList[i],0,"");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("outbound de ",subscriberList[i],0,"");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers inbound de ",subscriberList[i],1,"");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers outbound de ",subscriberList[i],1,"");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers inbound ",subscriberList[i],1,"");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers outbound ",subscriberList[i],1,"");
}

for(var i=0;i<subscriberList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers inbound de ",subscriberList[i],3,"");
}

for(var i=0;i<subscriberList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers outbound de ",subscriberList[i],3,"");
}

//At end

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("",subscriberList[i],-1, " inbound");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("",subscriberList[i],-1, " outbound");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers de ",subscriberList[i],-1," inbound");
}

for(var i=0;i<subscriberList.length;i++){
	writeCountryUtteranceWithDirection("Roamers de ",subscriberList[i],-1," outbound");
}

for(var i=0;i<subscriberList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " inbound");
}

for(var i=0;i<subscriberList.length;i++){
    writeCountryUtteranceWithDirection("Número de roamers de ",subscriberList[i],-1, " outbound");
}

//=========================================================
// Subscriber + country + direction sentences
//=========================================================


//=========================================================
// Time sentences
//=========================================================



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