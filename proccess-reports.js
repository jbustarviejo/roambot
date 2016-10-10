//Proccess reports
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var csv = require("fast-csv");
var spawn = require('child_process').spawn;
var CronJob = require('cron').CronJob;

var database={};
var files={};
var debug=true;

console.log("=>RoamBot files procesing starting...");

//Stablish connection with DataBase
MongoClient.connect('mongodb://127.0.0.1:27017/roambot', function(err, db) {
	if(err){
        console.log("=>ERROR while connecting database");
        throw err;
    }

	database.reportsDataInbound = db.collection('reportsDataInbound',function(){
		database.reportsDataOutbound = db.collection('reportsDataOutbound',function(){
			files.updateReportsData=function(){
				fs.readdir("./reports", function(err, items) {
				    for (var i=0; i<items.length; i++) {
				        if(items[i].endsWith(".csv") && (items[i].startsWith("inbound") || items[i].startsWith("outbound"))){
							debug && console.log("Proccessing file: "+items[i]);
							files.readReport(items[i]);
						}else{
							console.log("Report ignored!: "+items[i]);
						}
				    }
				});
			};
			files.readReport=function(reportName){
				var stream = fs.createReadStream("./reports/"+reportName);
				var csvStream = csv({delimiter: ";"})
				    .on("data", function(data){
				        if(data[0]=="Hour" || data[0]=="Day" || data.length<=0){ //Skip headers
				        	return;
				        }
				        if(reportName.startsWith("inbound")){
							var cell={
					        	dataDate: files.dateFromReport(data[0]),
					        	dataType: "inbound",
					        	subscriberOperatorName: files.subscriberFromOperator(data[1]),
					        	subscriberOperatorNameWithCode: data[1],
					        	subscriberCountryName: "Peru",
					        	originCountry: data[2],
					        	originOperatorName: files.subscriberFromOperator(data[3]),
					        	originOperatorNameWithCode: data[3],
					        	sumTransactions: parseInt(data[4]),
					        	successes: parseInt(data[5])
					        }
					        database.insertInboundData(cell);
					        return;
				        }else if(reportName.startsWith("outbound")){
				        	var cell={
					        	dataDate: files.dateFromReport(data[0]),
					        	dataType: "outbound",
					        	subscriberCountryName: data[1],
					        	subscriberOperatorName: files.subscriberFromOperator(data[2]),
					        	subscriberOperatorNameWithCode: data[2],
					        	prefix: data[6],
					        	originOperatorName: files.subscriberFromOperator(data[3]),
					        	originOperatorNameWithCode: data[3],
					        	sumTransactions: parseInt(data[4]),
					        	successes: parseInt(data[5])
					        }
					        database.insertOutboundData(cell);
					        return;
				        }else{
				        	//ignore
				        }
				    })
				    .on("end", function(){
				    	stream.close();
				    //	fs.unlink("./reports/"+reportName); //UNCOMENT
				        console.log("Done with report: "+reportName);
				        return;
				    });
				stream.pipe(csvStream);
			};
			database.insertInboundData=function(report){
				var toSearch = {subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, dataDate: report.dataDate, originCountry: report.originCountry};
				database.reportsDataInbound.update(toSearch, { $set : report},{ upsert: true });
	            return;
			}
			database.insertOutboundData=function(report){
				var toSearch = {subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, dataDate: report.dataDate};
				database.reportsDataOutbound.update(toSearch, { $set : report},{ upsert: true });
	            return;
			}
			files.dateFromReport=function(dateStr){
				dateStr.split(/[\s,\/:]+/);
				var parts = dateStr.split(/[\s,\/:]+/);
				var dt = new Date(Date.UTC(parseInt(parts[2], 10),
				                parseInt(parts[1], 10) - 1,
				                parseInt(parts[0], 10),
                		        parseInt(parts[3], 10),
                				parseInt(parts[4], 10)));
				//console.log("Date "+parts[0]+"/"+parts[1]+"/"+parts[2]+" "+parts[3]+":"+parts[4]+" => "+dt);
				return dt;
			}
			files.subscriberFromOperator=function(subscriberName){
				var initCode=subscriberName.indexOf("(");
				if(subscriberName.indexOf("VODAFONE")>0){
					subscriberName="VODAFONE";
				}else if(subscriberName.indexOf("ORANGE")>0 || subscriberName.indexOf("MOBISTAR")>0){
					subscriberName="ORANGE";
				}else if(subscriberName.indexOf("MOVISTAR")>0 || subscriberName.indexOf("TELEFONICA")>0){
					subscriberName="TELEFONCIA MOVISTAR";
				}else if(subscriberName.indexOf("TELE2")>0){
					subscriberName="TELE2";
				}else if(subscriberName.indexOf("T-MOBILE")>0){
					subscriberName="T-MOBILE";
				}else if(initCode>0){
					subscriberName = subscriberName.substring(0,initCode-1);
				}
				return subscriberName.trim();
			}

			console.log("=>Creating crons...");

			//Crons
			new CronJob({
				//Run every 30 minutes
				cronTime: '00 */30 * * * *',
				start: true,
				timeZone: 'Europe/Madrid',
					onTick: function() {
					console.log("Cronjob tick");
					//Get the reports by code
					spawn('sh', [ 'getReports.sh' ], {});
					//Wait some minutes and then proccess the file
					setTimeout(function(){
						files.updateReportsData();
					}, 1000 * 60 * 10);
				}
			}).start();
			
			files.updateReportsData();
			
			console.log("=>RoamBot files procesing ready!");
		});	
	});
});