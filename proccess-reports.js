//Proccess reports
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var csv = require("fast-csv");

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
	database.reports = db.collection('reports',function(){
    	database.reportsDataInbound = db.collection('reportsDataInbound',function(){
    		database.reportsDataOutbound = db.collection('reportsDataOutbound',function(){
				database.getNewestReport=function(callback){
					this.reports.find().sort({createdAt : 1}).limit(1).toArray(function(err, docs){
				        if (docs && docs.length>0){
				            debug && console.log("Newest Report found!...");
				            callback && callback(docs[0]);
				        }else{
				            debug && console.log("No reports found...");
				            callback && callback(null);
				        }
				    });
				}
				files.getReportsListToParse=function(callback){
					database.getNewestReport(function(report){
						if(!report){
							//Get all
							callback && callback(null);
						}else{
							//Start date
							var startDate=report.reportDate;
							//End date
							var endDate=new Date();
							var dates=files.getDates(startDate, endDate);
							console.log(dates);
							for(var i=0; i<dates.length; i++){
								console.log("Date: "+dates[i]);
							}
							console.log("A der",dates);
							callback && callback(dates);
						}
					});
				}
				files.getDates=function(startDate, stopDate) {
					console.log("init",startDate,"end",stopDate);
				    var dateArray = new Array();
				    var currentDate = startDate;
				    while (currentDate <= stopDate) {
				        dateArray.push( new Date (currentDate) )
				        currentDate = currentDate.addDays(1);
				    }
				    return dateArray;
				}
				files.updateReportsData=function(){
					/*var reportsList = files.getReportsListToParse(function(reportsList){
						console.log(reportsList);
						reportsList=null; //REMOVE THIS LINE IN FUTURE
						if(!reportsList){*/
							//Parse all
					fs.readdir("./reports", function(err, items) {
					    for (var i=0; i<items.length; i++) {
					        if(items[i].endsWith(".csv")){
					        	debug && console.log("Proccessing file: "+items[i]);
								files.readReport(items[i]);
					        }
					    }
					});
						/*}else{
							//Parse only a few
						}
					});*/
				};
				files.readReport=function(reportName){
					var reportParts=reportName.split(" ");
					var reportType=reportParts[0];
					var reportDate=reportParts[3].substring(4).substring(0,reportParts[3].length-8).split("-");
					var report={name: reportName, type: reportType, reportDate: new Date(reportDate[0]+"-"+reportDate[1]+"-"+reportDate[2]+" "+reportDate[3]+":"+reportDate[4]+":"+reportDate[5]+"Z"), createdAt: new Date()}; 

					var stream = fs.createReadStream("./reports/"+reportName);
					var csvStream = csv({delimiter: ";"})
					    .on("data", function(data){
					        // console.log("Un dato",data);
					        if(data[0]=="Day"){ //Skip header
					        	return;
					        }
					        if(reportType=="Inbound"){
								var cell={
						        	dataDate: files.dateFromReport(data[0]),
						        	dataType: reportType,
						        	subscriberOperatorName: data[1],
						        	subscriberCountryName: "Peru",
						        	originCountry: data[2],
						        	originOperatorName: data[3],
						        	sumTransactions: parseInt(data[4]),
						        	successes: parseInt(data[5])
						        }
						        database.insertInboundData(cell);
					        }else{ //Outbound
					        	var cell={
						        	dataDate: files.dateFromReport(data[0]),
						        	dataType: reportType,
						        	subscriberCountryName: data[1],
						        	subscriberOperatorName: data[2],
						        	prefix: data[6],
						        	originOperatorName: data[3],
						        	sumTransactions: parseInt(data[4]),
						        	successes: parseInt(data[5])
						        }
						        database.insertOutboundData(cell);
					        }
					    })
					    .on("end", function(){
					    	stream.close();
					    	database.reports.insert(report);
					    //	fs.unlink("./reports/"+reportName);
					        console.log("done");
					    });
					stream.pipe(csvStream);
				};
				database.insertInboundData=function(report){
					database.reportsDataInbound.findOne({subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, reportDate: report.reportDate, originCountry: report.originCountry}, function(err, doc){
		                if (doc != null){
		                	console.log("data already stored",report,doc);
		                    //Already stored, continue...
		                }else{
		                    database.reportsDataInbound.insert(report);
		                }
		            });
				}
				database.insertOutboundData=function(report){
					database.reportsDataOutbound.findOne({subscriberOperatorName: report.subscriberOperatorName, subscriberCountryName: report.subscriberCountryName, originOperatorName: report.originOperatorName, reportDate: report.reportDate}, function(err, doc){
		                if (doc){
		                    //Already stored, continue...
		                }else{
		                    database.reportsDataOutbound.insert(report);
		                }
		            });
				}
				files.dateFromReport=function(dateStr){
					var parts = dateStr.split("/");
					var dt = new Date(Date.UTC(parseInt(parts[0], 10),
					                  parseInt(parts[1], 10) - 1,
					                  parseInt(parts[2].substr(0,2), 10)));
					return dt;
				}

				//Trick to avoid empty values
				setTimeout(function(){
					//database.reports.insert({createdAt:new Date(),name:"report1",reportDate: new Date()});
	    			files.updateReportsData();
				}, 1);
			});	
		});
	});
});

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

console.log("=>RoamBot files procesing ready...");