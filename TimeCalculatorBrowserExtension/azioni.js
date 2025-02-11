var workingHours = "08:00";
var workingHours1 = "08:00";
var workingHours2 = "08:00";
var workingHours3 = "08:00";
var workingHours4 = "08:00";
var workingHours5 = "08:00";
var showPopups_a = false;
var showPopups_t = true;

$(document).ready(function() {
	chrome.storage.sync.get("workingTime", function (obj) {
		if(obj.workingTime) {
			workingHours = obj.workingTime;
			workingHours1 = obj.workingTime;
			workingHours2 = obj.workingTime;
			workingHours3 = obj.workingTime;
			workingHours4 = obj.workingTime;
			workingHours5 = obj.workingTime;
		}
	});
	
	chrome.storage.sync.get("workingTime1", function (obj) {
		if(obj.workingTime1) {
			workingHours1 = obj.workingTime1;
		}
	});
	
	chrome.storage.sync.get("workingTime2", function (obj) {
		if(obj.workingTime2) {
			workingHours2 = obj.workingTime2;
		}
	});
	
	chrome.storage.sync.get("workingTime3", function (obj) {
		if(obj.workingTime3) {
			workingHours3 = obj.workingTime3;
		}
	});
	
	chrome.storage.sync.get("workingTime4", function (obj) {
		if(obj.workingTime4) {
			workingHours4 = obj.workingTime4;
		}
	});
	
	chrome.storage.sync.get("workingTime5", function (obj) {
		if(obj.workingTime5) {
			workingHours5 = obj.workingTime5;
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

var showShoeLunchCountdown = false;

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
			
			checkingDay = 0;
			if(checkingActualDate.indexOf(' ') > 0) {
				var checkArr = divObject.split(" ");
				checkingActualDate = checkArr[1];
				checkingDay = checkArr[0];
				checkArr = checkingActualDate.split("/");
				if(checkArr[2].length < 4) {
					checkingActualDate = checkArr[0] + "/" + checkArr[1] + "/20" + checkArr[2];
				}
				
				if(checkingDay == 'lun') {
					checkingDay = 1;
				} else if(checkingDay == 'mar') {
					checkingDay = 2;
				} else if(checkingDay == 'mer') {
					checkingDay = 3;
				} else if(checkingDay == 'gio') {
					checkingDay = 4;
				} else if(checkingDay == 'ven') {
					checkingDay = 5;
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
				
				var dateMsg = checkingActualDate.replaceAll('/','%2F');
				var newText2 = divObject + "<a href='mailto:tulipweb@venistar.retexspa.com?subject=Timbratura%20mancante%20per%20il%20giorno%20"+dateMsg+"&body=Qui%20metti%20il%20messaggio' style='float:right;padding: 0px 8px 0px 8px;background-color: #41A5D7;color: ghostwhite;border-radius: 7px;text-decoration: none;font-weight: 500;'>&#9993; CONTATTA TULIP</a>";
				obj.innerHTML = newText2;
			}
		} else if(divObject.indexOf('nevermind1985.github.io') > 0) {
			if(alertMissingStamping) {
				obj.style="border:2px solid red;padding-top:0px;";
				alertMissingStamping = false;
				
				var dateMsg = checkingActualDate.replaceAll('/','%2F');
				var newText3 = divObject + "<a href='mailto:tulipweb@venistar.retexspa.com?subject=Timbratura%20mancante%20per%20il%20giorno%20"+dateMsg+"&body=Qui%20metti%20il%20messaggio' style='float:right;padding: 0px 8px 0px 8px;background-color: #41A5D7;color: ghostwhite;border-radius: 7px;text-decoration: none;font-weight: 500;'>&#9993; CONTATTA TULIP</a>";
				obj.innerHTML = newText3;
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
	
	var userName = document.getElementsByClassName("dx-item-content dx-toolbar-item-content");
	
	var userField = document.getElementsByClassName("dx-item dx-toolbar-item dx-toolbar-label text-body1");
	if(userField[0]) {
		userField[0].style = "max-width: unset!important;";
	}
	
	var x = 0;
	while (x < userName.length) {
		var text = userName[x].innerHTML
		
		if(text.indexOf("Cartellino") > 0 ) { 
			if(text.indexOf(" SCARPA ") > 0) {
				calcolaRompiDaniele(userName[x]);
			} else if (text.indexOf(" PASQUATO ") > 0 || text.indexOf(" GOBBI ") > 0) {
				pagaLaMossa(userName[x]);
			}
		}
		x++;
	}

	setTimeout(checkTimeLink, 1000);
}

function pagaLaMossa(text) {
	var textField = text.innerHTML;
	textField = textField.substring(5, textField.length-6);
	if(textField.indexOf("data:image") < 0) {
		textField = textField + " <img style='margin-left:20px;' src='data:image/jpeg;base64,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' />";
		text.innerHTML = "<div style='display:flex;'>" + textField + "</div>";
	}
}

function calcolaRompiDaniele(text) {
	
	var textField = text.innerHTML;
	if(textField.indexOf(" <br> -&gt; ") > 0) {
		textField = textField.substring(5, textField.indexOf(" <br> -&gt; "));
	} else {
		textField = textField.substring(5, textField.length-6);
	}
	
	let now = new Date();
	let hours = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	
	var actualTime = hours + ":" + minutes + ":" + seconds;
	
	hours = hours * 3600;
	minutes = minutes * 60;
	
	seconds = hours + minutes + seconds;
	let referenceSeconds = (12*3600) + (45*60);
		
	var difference = referenceSeconds - seconds;
	
	if(difference > 0) {
		var outputString = "";
		
		outputString = outputString + " " + difference;
		
		textField = textField + " <br> -> TRA "+ outputString + " SECONDI PUOI ANDARE A ROMPERE LE BALLE A DANIELE PER IL PRANZO";
		text.innerHTML = "<div>" + textField + "</div>";
	} else {
		console.log(difference)
		if((difference+600) > 0) {
			textField = textField + " <br> -> <span style='"+getBackgroundAlert(difference+600)+"'> NON SEI ANCORA ANDATO A ROMPERE LE BALLE A DANIELE PER IL PRANZO?</span>";
			text.innerHTML = "<div>" + textField + "</div>";
		} else {
			text.innerHTML = "<div>" + textField + "</div>";
		}
	}
}

function getBackgroundAlert(sec) {
    if(sec%2 > 0) {
		return "color: white;background-color:red;";
	} else {
		return "color: black;";
	}
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
		
		var extraTime = '';
		if(checkingDay == 1 && (workingHours != workingHours1)) {
			extraTime = calcolaDiff(workingHours1, workedTime);
		} else if(checkingDay == 2 && (workingHours != workingHours2)) {
			extraTime = calcolaDiff(workingHours2, workedTime);
		} else if(checkingDay == 3 && (workingHours != workingHours3)) {
			extraTime = calcolaDiff(workingHours3, workedTime);
		} else if(checkingDay == 4 && (workingHours != workingHours4)) {
			extraTime = calcolaDiff(workingHours4, workedTime);
		} else if(checkingDay == 5 && (workingHours != workingHours5)) {
			extraTime = calcolaDiff(workingHours5, workedTime);
		} else {
			extraTime = calcolaDiff(workingHours, workedTime);
		}
		
		
		
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
					var r1 = '';
					if(checkingDay == 1 && (workingHours != workingHours1)) {
						r1 = calcolaDiff(workedTime, workingHours1);
					} else if(checkingDay == 2 && (workingHours != workingHours2)) {
						r1 = calcolaDiff(workedTime, workingHours2);
					} else if(checkingDay == 3 && (workingHours != workingHours3)) {
						r1 = calcolaDiff(workedTime, workingHours3);
					} else if(checkingDay == 4 && (workingHours != workingHours4)) {
						r1 = calcolaDiff(workedTime, workingHours4);
					} else if(checkingDay == 5 && (workingHours != workingHours5)) {
						r1 = calcolaDiff(workedTime, workingHours5);
					} else {
						r1 = calcolaDiff(workedTime, workingHours);
					}
					
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