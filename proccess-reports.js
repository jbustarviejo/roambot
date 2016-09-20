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
				//MAIN
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
					var reportsList = files.getReportsListToParse(function(reportsList){
						console.log(reportsList);
						if(!reportsList){
							//Parse all
							fs.readdir("./reports", function(err, items) {
							    for (var i=0; i<items.length; i++) {
							        if(items[i].endsWith(".csv")){
							        	debug && console.log("Proccessing file: "+items[i]);
										files.readReport(items[i]);
							        }
							    }
							});
						}else{
							//Parse only a few
						}
					});
				};
				files.readReport=function(reportName){
					var reportType=reportName.startsWith("Inbound")? "Inbound":"Outbound";
					var report={name: reportName, type: reportType, reportDate: new Date("2016-01-03"), createdAt: new Date()}; 
					//TODO: get date of this report

					var stream = fs.createReadStream("./reports/"+reportName);
					var csvStream = csv({delimiter: ";"})
					    .on("data", function(data){
					        // console.log("Un dato",data);
					        if(data[0]=="Day"){ //Skip header
					        	return;
					        }
					        if(reportType=="Inbound"){
								var cell={
						        	date: files.dateFromReport(data[0]),
						        	dataType: reportType,
						        	subscriberCountryName: data[1],
						        	subscriberOperatorName: data[2],
						        	prefix: data[6],
						        	originOperatorName: data[3],
						        	sumTransactions: data[4],
						        	successes: data[5]
						        }
						        database.reportsDataInbound.insert(cell);
					        }else{ //Outbound
					        	var cell={
						        	date: files.dateFromReport(data[0]),
						        	dataType: reportType,
						        	subscriberOperatorName: data[1],
						        	originCountry: data[2],
						        	originOperatorName: data[3],
						        	sumTransactions: data[4],
						        	successes: data[5]
						        }
						        database.reportsDataOutbound.insert(cell);
					        }
					    })
					    .on("end", function(){
					    	database.reports.insert(report);
					        console.log("done");
					    });
					 
					stream.pipe(csvStream);
				};

				files.dateFromReport=function(dateStr){
					var parts = dateStr.split("/");
					var dt = new Date(parseInt(parts[0], 10),
					                  parseInt(parts[1], 10) - 1,
					                  parseInt(parts[2].substr(0,2), 10));
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