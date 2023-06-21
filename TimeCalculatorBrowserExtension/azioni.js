var workingHours = "08:00";
var showPopups_a = false;
var showPopups_t = true;

$(document).ready(function() {
	chrome.storage.sync.get("workingTime", function (obj) {
		if(obj.workingTime) {
			workingHours = obj.workingTime;
		}
	});
	
	chrome.storage.sync.get("popupEnabled_a", function (obj) {
		if (obj.popupEnabled_a !== undefined && obj.popupEnabled_a !== null) {
			showPopups_a = obj.popupEnabled_a;
		}
	});
	
	chrome.storage.sync.get("popupEnabled_t", function (obj) {
		if (obj.popupEnabled_t !== undefined && obj.popupEnabled_t !== null) {
			showPopups_t = obj.popupEnabled_t;
		}
	});
	
	setTimeout(checkTimeLink, 5000);
});

var alertShowed = false;
var alertStampingShowed = false;

var showPopupFromSettings = true;

var datechanged = false;
var dateCheck = '';

var todaysTime = '';

const extraTimeText = 'TEMPO EXTRA';

const messageTitle = 'SONO PRESENTI DELLE ASSENZE\n\n';
const messageFooter = '\nCONTROLLA DI AVERE INSERITO I GIUSTIFICATIVI';

const messageStampingTitle = 'MANCANO DELLE TIMBRATURE\n\n';
const messageStampingFooter = '\nCONTROLLA DI NON AVER DIMENTICATO QUALCOSA';

var checkTimeObj;
var modifyCheckAfterCausali = false;
var missingTimeToCheck = '';

function checkTimeLink() {	
	const regexExp = /(a-z{3})*(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/gi;
	const daysBack = 7;
	
	var messageBody = '';
	var messageStampingBody = '';
		
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	if(dd<10) { dd='0'+dd; } 
	if(mm<10) { mm='0'+mm; } 
	var todayStr = dd+'/'+mm+'/'+yyyy;
	
	var ddCheck = '01';
	if(today.getDate() > daysBack) {
		var tmpDD = today.getDate() - daysBack;
		if(tmpDD<10) { ddCheck='0'+tmpDD; }
	}
	
	var dateCheckFrom = '01'+'/'+mm+'/'+yyyy;
	
	var checkMissingTime = false;
	var checkingDate = '';
	var checkingActualDate = '';
	var alertMissingStamping = false;
	
	var firstCheck = true;
	todaysTime = '';
	var goToHome = '';
	var goToHomeMessage = '';
	var goToHomeDiv = '';
	var extraMessage = '';

	var extraTime = '';
	$("[aria-label='Colonna Straordinarie']").each(function(i, obj) {
		extraTime = "[aria-describedby='"+obj.id+"']";
	});
	
	var missingTimeId = '';
	$("[aria-label='Colonna Assenze']").each(function(i, obj) {
		missingTimeId = 'aria-describedby="'+obj.id+'"';
	});	
	
	var causaliID = '';
	$("[aria-label='Colonna Causali']").each(function(i, obj) {
		causaliID = 'aria-describedby="'+obj.id+'"';
	});
	
	var giornoID = '';
	$("[aria-label='Colonna Giorno']").each(function(i, obj) {
		giornoID = 'aria-describedby="'+obj.id+'"';
	});
	
	/***************************************
	INIZIO SCRIPT PRINCIPALE
	****************************************/
	
	$("[role='gridcell']").each(function(i, obj) {
		var divObject = obj.innerHTML;
		if((obj.outerHTML).indexOf(giornoID) >= 0) {
			
			if(dateCheckFrom <= divObject && divObject < todayStr) {
				checkMissingTime = true;
				checkingDate = divObject;
			} 
			
			checkingActualDate = divObject;
			if(checkingActualDate.indexOf(' ') > 0) {
				var checkArr = divObject.split(" ");
				checkingActualDate = checkArr[1];
				checkArr = checkingActualDate.split("/");
				if(checkArr[2].length < 4) {
					checkingActualDate = checkArr[0] + "/" + checkArr[1] + "/20" + checkArr[2];
				}
			}
			
			if(firstCheck == true) {
				if(dateCheck === divObject) {
					datechanged = false;
				} else {
					dateCheck = divObject;
					datechanged = true;
					messageBody = '';
					messageStampingBody = '';
					alertShowed = false;
					alertStampingShowed = false;
				}
				firstCheck = false;
			}
		}
		
		//CONTROLLO TIMBRATURE DISPARI
		if(divObject.indexOf('E') == 5 || divObject.indexOf('nevermind1985.github.io') > 0) {
				var countE = (divObject.match(/E/g) || []).length;
				var countU = (divObject.match(/U/g) || []).length;
				
				if(divObject.indexOf(extraTimeText) > 0) {
					var countEmsg = (extraTimeText.match(/E/g) || []).length;
					var countUmsg = (extraTimeText.match(/U/g) || []).length;
					
					countE = countE - countEmsg;
					countU = countU - countUmsg;
				}
				
				if(todayStr === checkingActualDate) {
					if(divObject.indexOf('PUOI ANDARE A CASA') > 0) {
						countE = countE - 2;
						countU = countU - 1;
					}
				}
				
				if(divObject.indexOf('nevermind1985.github.io') > 0) {
					countE = countE / 2;
					if(countU > 0) {
						countU = countU /2;
					}
				}
				
				if((countE+countU) % 2 == 1) {
					if(todayStr === checkingActualDate) {
						alertMissingStamping = false;
						getTodayTime = true;
						todaysTime = divObject;
						goToHome = calculateGoToHome(todaysTime, false);
						goToHomeMessage = 'DALLE ' + goToHome + ' PUOI ANDARE A CASA';
						extraMessage = '';
						
						//BLINKER
						var today = new Date();
						var h = today.getHours();
						var m = today.getMinutes();
						var s = today.getSeconds(); 
						
						var goOutAtSpl = goToHome.split(":");
						var hu = goOutAtSpl[0];
						var mu = goOutAtSpl[1];
						
						var t = (h * 3600) + (m * 60) + s;
						var tu = (hu * 3600) + (mu * 60);
						
						var td = tu -t;
						
						var hd = Math.floor(td/3600);
						var md = Math.floor((td%3600)/60);
						var sd = td%60;
						
						if(hd < 0 || md < 0 || sd < 0) {
							if(hd < 0)
								hd = (hd * (-1))-1;
							if(md < 0)
								md = (md * (-1))-1;
							if(sd < 0) {
								if(sd < 0) {
									sd = sd * (-1);
								}
								
								goToHomeDiv = "<style> .blink {animation: blinker 1s linear infinite;background:#53f500;color:black;font-weight:bold;width:100%;text-align: center;} @keyframes blinker {  50% {    opacity: 0;  }}</style><div class='blink'>==== VA CASA ====</div>"
							}
						} else {
							
							stot = (hd * 3600) + (md * 60 ) + sd;
							splitWork = workingHours.split(":");
							
							wtot = (splitWork[0] * 3600) + (splitWork[1] * 60);
							wtotPerc = wtot / 100;
							
							wrem = (hd * 3600) + (md * 60) + sd;
							wremPerc = wrem / wtotPerc;
							
							workedPerc = 100 - wremPerc;
							
							if(hd <= 9) hd = '0'+hd;
							if(md <= 9) md = '0'+md;
							if(sd <= 9) sd = '0'+sd;
							goToHomeDiv = "<div style='width:100%;font-weight:bold;text-align:center;color:white;'>"+hd+":"+md+":"+sd+"</div>";
							
							workedPercStr = workedPerc.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
							goToHomeDiv = goToHomeDiv + "<div style='width:"+workedPerc+"%;background-color:black;height:12px;color:white;border-radius: 12px;text-align:right;font-size:10px;'><p style='margin:0;margin-right:8px;line-height:1.2;'>"+workedPercStr+"%</p></div>";
						}
						
					} else {
						alertMissingStamping = true;
						messageStampingBody = messageStampingBody + checkingActualDate + ' : Timbratura mancante \n'
						
					}
				} else {
					todaysTime = divObject;
					extraMessage = calculateExtraWorkedTime(todaysTime);
				}
		}
		
		if(divObject.indexOf('E') == 5) {
			var newText = "<a href='https://nevermind1985.github.io/TimeCalculator/?"+divObject+"' target='_blank' style='color:green;' title='"+goToHomeMessage+"'>"+divObject+"</a> " + extraMessage;
			obj.innerHTML = newText;
			
			if(alertMissingStamping) {
				obj.style="border:2px solid red;padding-top:0px;";
				alertMissingStamping = false;
			}
		} else if(divObject.indexOf('nevermind1985.github.io') > 0) {
			if(alertMissingStamping) {
				obj.style="border:2px solid red;padding-top:0px;";
				alertMissingStamping = false;
			}
		}
		
		if(checkMissingTime) {
			if((obj.outerHTML).indexOf(missingTimeId) >= 0) {
				if(divObject.indexOf('00:00') < 0 && divObject.length == 5) {
					messageBody = messageBody + checkingDate + ' : ' + divObject + '\n';
					checkTimeObj = obj;
					modifyCheckAfterCausali = true;
					missingTimeToCheck = divObject;
				}
			}
		}
		
		if((obj.outerHTML).indexOf(causaliID) >= 0) {
			if(modifyCheckAfterCausali) {
				var causaliTxt = obj.innerHTML;
				var causaliArr = causaliTxt.split(' ');
				if(causaliArr.length > 0 && causaliArr[0] != '&nbsp;') {
					var x = 0;
					var remainingTime = missingTimeToCheck;
					while (x < causaliArr.length) {
						//SE NON E' UNA FLESSIBILITA GODUTA LA CALCOLO
						if(causaliArr[x].indexOf('FG') < 0) {
							var causaleTmp = causaliArr[x].split('[');
							if(causaleTmp.length > 1) {
								var causale = causaleTmp[1].substring(0,5);
								remainingTime = calcolaDiff(causale, remainingTime);
							}
						}
						x++;
					}
					
					if(remainingTime.indexOf('00:00') < 0) {
						checkTimeObj.style="background-color:red;color:white;font-weight:bold;text-align:center;border:2px solid blue;";
					} else {
						checkTimeObj.style="background-color:green;color:white;font-weight:bold;text-align:center;";
					}
				} else {
					checkTimeObj.style="background-color:red;color:white;font-weight:bold;text-align:center;";
				}
			}
			modifyCheckAfterCausali = false;
			checkTimeObj = null;
			missingTimeToCheck = '';
			
			if(todayStr === checkingActualDate) {
				if(goToHomeDiv != '') {
					obj.innerHTML = goToHomeDiv;
					obj.style="background-color:green;"
				}
			}
		}
	});
	
	/***************************************
	FINE SCRIPT PRINCIPALE
	****************************************/
	
	if(messageBody.length > 0 && (alertShowed == false || datechanged == true)) {
		alertShowed = true;
		if(showPopups_a) {
			alert(messageTitle + messageBody + messageFooter);
		}
	}

	if(messageStampingBody.length > 0 && (alertStampingShowed == false || datechanged == true)) {
		alertStampingShowed = true;
		if(showPopups_t) {
			alert(messageStampingTitle + messageStampingBody + messageStampingFooter);
		}
	}

	setTimeout(checkTimeLink, 1000);
}

function calculateExtraWorkedTime(timeStamps) {
	if(timeStamps.length > 0) {
		var workedTime = "00:00"
		
		if (timeStamps.indexOf('nevermind1985.github.io') > 0) {
			
			var tmpArray = timeStamps.split(">");
			timeStamps = tmpArray[1];
			tmpArray = timeStamps.split("<");
			timeStamps = tmpArray[0];
		}
		
		var stampArray = timeStamps.split(" ");
		var stamps = stampArray.length;
		
		var ent = '';
		var usc = '';
		
		var whileCheck = true;
		
		while(whileCheck) { 
			if(stamps >= 2) {
				ent = stampArray[0].substring(0,5);
				usc = stampArray[1].substring(0,5);
				workedTime = calcolaSum(workedTime, calcolaDiff(ent, usc));
				
				stampArray.splice(0, 2)
				stamps = stampArray.length;
			} else {
				whileCheck = false;
			}
		}
		
		var extraTime = calcolaDiff(workingHours, workedTime);
		
		
		
		if(extraTime.indexOf('-') < 0) {
			//CONTROLLO SE E' MENO DI 15 MINUTI
			var notMuch = calcolaDiff(extraTime, '00:14');
			if(notMuch.indexOf('-') < 0) {
				//TEMPO EXTRA INFERIORE A 15 MINUTI
			} else {
				var extraTimeHour = extraTime.substring(0,3);
				var extraTimeTest = extraTime.substring(3);				
				var extraTimeMin = '';
				if(extraTimeTest < 15) {
					extraTimeMin = '00';
				} else if(extraTimeTest < 30) {
					extraTimeMin = '15';
				} else if(extraTimeTest < 45) {
					extraTimeMin = '30';
				} else {
					extraTimeMin = '45';
				}
				
				return ' <b title="Che effettivamente sono ' + extraTime +  '">(' + extraTimeText + ' → ' + extraTimeHour + extraTimeMin + ')</b>';
			}
		}
		
		return '';
	}
}

function calculateGoToHome(timeStamps, useTimeout) {
	if(timeStamps.length > 0) {
		var countE = (timeStamps.match(/E/g) || []).length;
		var countU = (timeStamps.match(/U/g) || []).length;
		
		var stampArray;
		var workedTime = "00:00"
			
		if(useTimeout) {
			setTimeout(function(){
				console.log("Executed after 2 seconds");
			}, 2000);
		}
		
		if(timeStamps.indexOf('PUOI ANDARE A CASA') > 0) {
			countE = countE - 2;
			countU = countU - 1;
		}
			
		if (timeStamps.indexOf('nevermind1985.github.io') > 0) {
			countE = countE / 2;
			if(countU > 0) {
				countU = countU /2;
			}
			if((countE+countU) % 2 == 1) {
				var tmpArray = timeStamps.split(">");
				timeStamps = tmpArray[1];
				tmpArray = timeStamps.split("<");
				timeStamps = tmpArray[0];
			}
		}
		if (timeStamps.indexOf(extraTimeText) > 0) {
			if((countE+countU) % 2 == 0) {
				var tmpArray = timeStamps.split("<");
				timeStamps = tmpArray[0];
			}
		}
		if((countE+countU) % 2 == 1) {
			stampArray = timeStamps.split(" ");
			var stamps = stampArray.length;
			
			var ent = '';
			var usc = '';
			
			var whileCheck = true;
			
			while(whileCheck) { 
				if(stamps > 2) {
					ent = stampArray[0].substring(0,5);
					usc = stampArray[1].substring(0,5);
					workedTime = calcolaSum(workedTime, calcolaDiff(ent, usc));
					
					stampArray.splice(0, 2)
					stamps = stampArray.length;
				} else {
					var r1 = calcolaDiff(workedTime, workingHours);
					whileCheck = false;
					return calcolaSum(stampArray[0].substring(0,5), r1);
				}
			}
		}
	}
	
	return workedTime;
}

function calcolaSum(d_start, d_end) {
	var start = d_start.split(":");
	var end = d_end.split(":");
	
	var hours = parseInt(start[0])+parseInt(end[0]);
	var minutes = parseInt(start[1])+parseInt(end[1]);
	var hours = Math.floor(hours + minutes/60);
	var minutes = minutes%60;
	
	if(hours < 10) {
		hours = "0"+hours;
	} else if(hours > 23) {
		hours = hours-24;
		if(hours < 10) {
			hours = "0"+hours;
		}
	}
	
	if(minutes < 10) {
		minutes = "0"+minutes;
	}

	return hours+":"+minutes;
}

function calcolaDiff(d_start, d_end) {
	var start = d_start.split(":");
	var end = d_end.split(":");
	var startDate = new Date(0, 0, 0, start[0], start[1], 0);
	var endDate = new Date(0, 0, 0, end[0], end[1], 0);
	var diff = endDate.getTime() - startDate.getTime();
	
	var hours = Math.floor(diff / 1000 / 60 / 60);
	diff -= hours * 1000 * 60 * 60;
	var minutes = Math.floor(diff / 1000 / 60);
	
	if(hours < 10) {
		hours = "0"+hours;
	}
	
	if(minutes < 10) {
		minutes = "0"+minutes;
	}
	
	return hours+":"+minutes;
}