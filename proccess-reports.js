//Proccess reports
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var csv = require("fast-csv");
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var CronJob = require('cron').CronJob;
var uuid = require('uuid');
var os = require('os');

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
					//console.log("items",items);

					function readReportInPos(post){
						//console.log("pos recibida",post, " Archivo"+items[post]);
						if(post>=items.length){
							console.log("=>All finish!!"); return;
						}
				        if(items[post].endsWith(".csv") && (items[post].startsWith("inbound") || items[post].startsWith("outbound"))){
							files.readReport(items[post], function(){
								//console.log("Nueva pos va  aser ",post+1)
								readReportInPos(post+1); return;
							});
						}else{
							console.log("File ignored!: "+items[post]);
							readReportInPos(post+1); return;
						}
						return;
				    }
				    readReportInPos(0);
				});
			};
			files.readReport=function(reportName, callback){
				fs.readFile("./reports/"+reportName, function (err, data) {
					console.log("Proccessing file: "+"./reports/"+reportName);
					if(!data){
						console.log("No data ",err);
						callback(); return;
					}
				    allEntries = data.toString().split('\n'); 

				    function readFromPos(pos){
				    	var progress=Math.round(pos*10000/allEntries.length)/100;
				    	if(progress%10==0){
				    		console.log(progress+"%");
				    	}
				    	if(pos>=allEntries.length-1){
				    		fs.rename("./reports/"+reportName, "./reports/Security_copy/"+reportName, function(){
				    			callback(); return;
				    		});
				    		return;
				    	}
				    	csv.fromString(allEntries[pos], {delimiter: ";"})
						.on("data", function(data){
							//console.log("Data! "+data, pos)
						 	if(data[0]=="Hour" || data[0]=="Day" || data.length<=0){ //Skip headers
					        	readFromPos(pos+1); return;
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
						        database.insertInboundData(cell, function(){
						        	readFromPos(pos+1); return;
						        });
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
						        database.insertOutboundData(cell, function(){
						        	readFromPos(pos+1); return;
						        });
						        readFromPos(pos+1); return;
					        }else{
					        	//ignore
					        }
					        readFromPos(pos+1); return;
						});
				    }

				    readFromPos(0);
				});

			};
			database.insertInboundData=function(report, callback){
				var toSearch = {subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, dataDate: report.dataDate, originCountry: report.originCountry};
				database.reportsDataInbound.update(toSearch, { $set : report},{ upsert: true }, function(err, result) {
			        if(err){
						console.log(err);
			        }
			        callback(); return;
			    });
	            return;
			}
			database.insertOutboundData=function(report, callback){
				var toSearch = {subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, dataDate: report.dataDate};
				database.reportsDataOutbound.update(toSearch, { $set : report},{ upsert: true }, function(err, result) {
			        if(err){
						console.log(err);
			        }
			        callback(); return;
			    });
	            return;
			}
			files.dateFromReport=function(dateStr){
				dateStr.split(/[\s,\/:]+/);
				var parts = dateStr.split(/[\s,\/:]+/);
				var dt = new Date(Date.UTC(parseInt(parts[0], 10),
				                parseInt(parts[1], 10) - 1,
				                parseInt(parts[2], 10),
                		        parseInt(parts[3], 10),
                				parseInt(parts[4], 10)));
				//console.log("Date 1: "+parts[0]+"/"+parts[1]+"/"+parts[2]+" "+parts[3]+":"+parts[4]+" => "+dt+" year:"+dt1y);
				if(dt.getFullYear()<2010){
					var dt = new Date(Date.UTC(parseInt(parts[2], 10),
				                parseInt(parts[1], 10) - 1,
				                parseInt(parts[0], 10),
                		        parseInt(parts[3], 10),
                				parseInt(parts[4], 10)));
					//console.log("Date 2 por "+dt1y+"!!: "+parts[0]+"/"+parts[1]+"/"+parts[2]+" "+parts[3]+":"+parts[4]+" => "+dt);
				}
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
			files.getReports= function(){
				var self=this;
				self.getReportsFromServerWithDelete("Inbound", function(inResult){
					self.getReportsFromServerWithDelete("Outbound", function(outResult){
						console.log("Results",inResult,outResult);
						files.updateReportsData();
					});
				});
			}
			files.getReportsFromServerWithDelete= function(direction, callback){	
				this.getReportByDirecion(direction, function(result){
					if(result===true){
						console.log("Continue!");
						files.RemoveReportsInServerByDirection(direction, function(result){
							if(result===true){
								console.log("Removed "+direction+" in server!");
								callback(true);
							}else{
								console.log("Stop!");
								callback(false);
							}
						});
					}else{
						console.log("Stop!");
						callback(false);
					}
				});
			};
			files.getReportByDirecion = function(direction, callback){	
				var uuidReport=uuid.v4();
				console.log("Getting "+direction+"...");
				var fileDirection="reports/"+direction.toLowerCase()+"_"+uuidReport+".csv";

				var startCommand;
				if(os.hostname()=="MacBook-de-jbustarviejogmailcom.local"){
		        	startCommand="sshpass";
		        }else{
		        	startCommand="/usr/bin/sshpass";
		        }

				var child = exec(startCommand+' -p "datatronics1" ssh -o StrictHostKeyChecking=no datatronics@80.28.51.171 ssh mclaw@213.140.41.202 ssh bo cat "/var/opt/anritsu/mclaw/BO_reports/'+direction+'*.csv" > '+fileDirection, // command line argument directly in string
				function (error, stdout, stderr) {
				    //console.log('stdout: ' + stdout);
				    if (error !== null) {
					    console.log('Error: ' + stderr);
					    console.log("File "+fileDirection+" not filled... deleting");
					    fs.unlink(fileDirection);
					    callback(false);
				    }else{
				    	var stats = fs.statSync(fileDirection)
						var fileSizeInBytes = stats["size"]
	 					console.log("File "+fileDirection+" size: "+fileSizeInBytes);
	 					if(fileSizeInBytes==0){
	 						console.log("Empty file... deleting");
	 						fs.unlink(fileDirection);
	 						callback(false);
	 					}else{
	 						callback(true);
	 					}
				    }
				});
			}
			files.RemoveReportsInServerByDirection = function(direction, callback){	
				console.log("Removing "+direction+" in server...");
				var startCommand;
				if(os.hostname()=="MacBook-de-jbustarviejogmailcom.local"){
		        	startCommand="sshpass";
		        }else{
		        	startCommand="/usr/bin/sshpass";
		        }
				var child = exec(startCommand+' -p "datatronics1" ssh -o StrictHostKeyChecking=no datatronics@80.28.51.171 ssh mclaw@213.140.41.202 ssh bo rm "/var/opt/anritsu/mclaw/BO_reports/'+direction+'*.csv"', // command line argument directly in string
				function (error, stdout, stderr) {
				    console.log('stdout: ' + stdout);
				    if (error !== null) {
				      	console.log('Error: ' + stderr);
				      	callback(false);
				    }else{
 						callback(true);
				    }
				});
			}
			console.log("=>Creating crons...");

			if(process.argv[2]=="-o"){
				files.updateReportsData(); return;
			}

			//Crons
			new CronJob({
				//Run every 30 minutes
				cronTime: '00 */30 * * * *',
				start: true,
				timeZone: 'Europe/Madrid',
				onTick: function() {
					console.log("Cronjob tick");
					files.getReports();
				}
			}).start();
			
			console.log("=>RoamBot files procesing ready!");
		});	
	});
});