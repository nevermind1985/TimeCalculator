var hasCountDown = false;
var hasBpCountDown = false;
var timeId = 2; //the standard number of elements in page
var canStartAudio = false;
var audioEnabled = true;

var defaultWorkingHours = "08:00";
var workingHours;

var defaultBPHours = "06:00";
var bpHours;

function calcolaOrari() {
	canStartAudio = false;
	//PERMESSI
	var d_oPER = document.getElementById('oPER').value;
	//ORE VIAGGIO 1
	var d_ovP1 = document.getElementById('ovP1').value;
	var d_ovA1 = document.getElementById('ovA1').value;
	//ORE VIAGGIO 2
	var d_ovP2 = document.getElementById('ovP2').value;
	var d_ovA2 = document.getElementById('ovA2').value;
	//ORE VIAGGIO 3
	var d_ovP3 = document.getElementById('ovP3').value;
	var d_ovA3 = document.getElementById('ovA3').value;
	
	var workedTime = "00:00";
	var oldUsc = "";
	var lastEnt = "";
	var testTime = "";
	var filledTime = 0;
	var partialTime = 0;
	for (var i = 1; i <= timeId; i++) {
		var ent = document.getElementById('ent'+i).value;
		var usc = document.getElementById('usc'+i).value;
		
		if(ent != "") {
			lastEnt = ent;
		}
		
		if(oldUsc == "") {
			oldUsc = usc;
		} else {
			if(usc != "") {
				testTime = calcolaDiff(oldUsc, ent, true, true);
				if(testTime == "") {
					return;
				}
				oldUsc = usc;
			}
		}
		if(ent != "" && usc != "") {
			workedTime = calcolaSum(workedTime, calcolaDiff(ent, usc, true));
			filledTime++;
			partialTime = 0;
		} else if (ent != "" && usc == "") {
			partialTime = 1;
		}
	}
	
	var r1 = calcolaDiff(workedTime, workingHours);
	var rbp = calcolaDiff(workedTime, bpHours);
	if(d_oPER != "") {
		r1 = calcolaDiff(d_oPER, r1);
	}
	document.getElementById('oLAV').value = workedTime;
	if(partialTime == 1) {
		document.getElementById('estUsc').value = calcolaSum(lastEnt, r1);
		document.getElementById('estBP').value = calcolaSum(lastEnt, rbp);
			
		hasCountDown = true;
		if(filledTime >= 1) {
			canStartAudio = true;
		} 
	} else {
		hasCountDown = false;
		document.getElementById('estUsc').value = "";
		document.getElementById('countdown').value = "";
	}
		
	//ORE LAVORATE
	var d_oLAV = document.getElementById('oLAV').value;
	
	//CALCOLO ORE VIAGGIO
	var ov1 = calcolaOv(d_ovP1, d_ovA1, 'ovP1', 'ovA1');
	var ov2 = calcolaOv(d_ovP2, d_ovA2, 'ovP2', 'ovA2');
	var ov3 = calcolaOv(d_ovP3, d_ovA3, 'ovP3', 'ovA3');
	
	var ov_TOT = calcolaSum(ov1,ov2);
	ov_TOT = calcolaSum(ov_TOT, ov3);
	
	if(ov1=="00:00" && ov2=="00:00" && ov3=="00:00") {
		//NESSUNA ORA VIAGGIO INSERITA
		document.getElementById('ovAC').value = "";
	} else if(d_oLAV != "") {
		var ol = d_oLAV;
		if(d_oPER != "") {
			//AGGIUNGO EVENTUALI PERMESSI
			ol = calcolaSum(d_oLAV, d_oPER);
		}
		ol = calcolaDiff(ol,workingHours);
		if(ol == "00:00") {
			//SONO TUTTE ORE EXTRA LAVORO
			document.getElementById('ovEX').value = ov_TOT;
			document.getElementById('ovAC').value = "00:00";
		} else {
			//SMISTO TRA ORE VIAGGIO E ORE EXTRA
			if(calcolaDiff(ol, ov_TOT) == "00:00") {
				document.getElementById('ovAC').value = ov_TOT;
				document.getElementById('ovEX').value = "00:00";
			} else {
				var ex = calcolaDiff(ol, ov_TOT);
				var ac = calcolaDiff(ex, ov_TOT);
				document.getElementById('ovAC').value = ac;
				document.getElementById('ovEX').value = ex;
			}
		}
	} else {
		//SONO TUTTE ORE VIAGGIO
		document.getElementById('ovAC').value = ov_TOT;
	}
	
	//CALCOLO STRAORDINARI
	var st = d_oLAV;
	if(d_oPER != "") {
		//AGGIUNGO EVENTUALI PERMESSI
		st = calcolaSum(d_oLAV, d_oPER);
	}
	
	if(calcolaDiff(workingHours,st)!="00:00") {
		document.getElementById('oSTR').value = calcolaDiff(workingHours,st);
	} else {
		document.getElementById('oSTR').value = "";
	}
	calcolaBuonoPastoAlert();
}

function calcolaBuonoPastoAlert() {
	//SE ARRIVA DA TULIP
	var tu = document.getElementById('tulipUrl').value;
	if(tu == "") {
		tu = document.getElementById('tulipUrlMobile').value;
	}
	if(tu == "") {
		return;
	}
	
	//SE LE TIMBRATURE SONO ALMENO 4 BIOMETRICHE
	var timbrature = contaTimbratureTulipValide(tu);
	var oreLavorate = 0;
	if(timbrature >= 4) {
	//SE ALMENO 6 ORE LAVORATE
		var oLav = document.getElementById('oLAV').value;
		if(oLav != "") {
			var oLavSplit = oLav.split(":");
			oreLavorate = parseInt(oLavSplit[0]);
		}
		
		if(!hasBpCountDown) {
			hasBpCountDown = true;
			if(document.getElementById('buonoPastoTimer').classList.contains('infoOff')) {
				document.getElementById('buonoPastoTimer').classList.remove('infoOff');
				document.getElementById('buonoPastoTimer').classList.add('infoOn');
			}
		}
		
		if(oreLavorate >= 6) {
			document.getElementById('bpContainer').classList.remove('infoOff');
			document.getElementById('bpContainer').classList.add('infoOn');
		}
	} else if(timbrature >= 3) {
		hasBpCountDown = true;
		document.getElementById('buonoPastoTimer').classList.remove('infoOff');
		document.getElementById('buonoPastoTimer').classList.add('infoOn');
	} else {
		hasBpCountDown = false;
	}
}

function calcolaDiff(d_start, d_end) {
	return calcolaDiff(d_start, d_end, false);
}

function calcolaDiff(d_start, d_end, sendAlert) {
	return calcolaDiff(d_start, d_end, sendAlert, false);
}

function calcolaDiff(d_start, d_end, sendAlert, reverseCheck) {
	start = d_start.split(":");
	end = d_end.split(":");
	var startDate = new Date(0, 0, 0, start[0], start[1], 0);
	var endDate = new Date(0, 0, 0, end[0], end[1], 0);
	var diff = endDate.getTime() - startDate.getTime();
	
	var hours = Math.floor(diff / 1000 / 60 / 60);
	diff -= hours * 1000 * 60 * 60;
	var minutes = Math.floor(diff / 1000 / 60);
	
	if(hours < 0) {
		if(sendAlert == true) {
			if(reverseCheck == true) {
				alert('Orario di uscita e di rientro non coerenti!');
			} else {
				alert('Orario di inizio e orario di fine non coerenti!');
			}
			return "";
		} else {
			return "00:00";
		}
	}
	
	if(hours < 10) {
		hours = "0"+hours;
	}
	
	if(minutes < 10) {
		minutes = "0"+minutes;
	}
	
	return hours+":"+minutes;
}

function calcolaSum(d_start, d_end) {
	start = d_start.split(":");
	end = d_end.split(":");
	
	hours = parseInt(start[0])+parseInt(end[0]);
	minutes = parseInt(start[1])+parseInt(end[1]);
	hours = Math.floor(hours + minutes/60);
	minutes = minutes%60;
	
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

function calcolaOv(d_start, d_end, c_start, c_end) {
	if(d_start != "") {
		if(d_end != "") {
			pulisci(c_end);
			pulisci(c_start);
			if(calcolaDiff(d_start, d_end) != "00:00") {
				return calcolaDiff(d_start, d_end);
			} else {
				alert('Orario di arrivo non coerente con orario di partenza');
				document.getElementById(c_end).value = "";
			}
		} else {
			//DEVO EVIDENZIARE MANCANZA ORA DI ARRIVO
			evidenzia(c_end);
		}
	} else if(d_end != "") {
		//DEVO EVIDENZIARE MANCANZA ORA DI PARTENZA
		evidenzia(c_start);
	}
	return "00:00";
}

function evidenzia(cName) {
	document.getElementById('c_'+cName).style = "border:1px solid red;";
}

function pulisci(cName) {
	document.getElementById('c_'+cName).style = "";
}

function pulisciAll() {
	hasCountDown = false;
	hasBpCountDown = false;
	document.getElementById('countdown').classList.remove('green')
	pulisci('ent1');
	pulisci('usc1');
	pulisci('ent2');
	pulisci('usc2');
	pulisci('ovP1');
	pulisci('ovA1');
	pulisci('ovP2');
	pulisci('ovA2');
	pulisci('ovP3');
	pulisci('ovA3');
	
	if(timeId > 2) {
		for(var i = 3; i<=timeId; i++) {
			removeElement("timeId-"+i);
		}
		timeId = 2;
	}
	
	document.getElementById('buonoPastoTimer').classList.remove('infoOn');
	document.getElementById('buonoPastoTimer').classList.remove('infoOff');
	document.getElementById('buonoPastoTimer').classList.add('infoOff');
	
	document.getElementById('bpOn').classList.remove('infoOn');
	document.getElementById('bpOn').classList.add('infoOff');
	document.getElementById('bpOff').classList.remove('infoOff');
	document.getElementById('bpOff').classList.add('infoOn');
	
	document.getElementById('confettiContainer').style.display='none';
}

function clickReset() {
	document.getElementById('resetBtn').click();;
}

function contaTimbratureTulipValide(campoTulip) {
	var campoIn = ""+campoTulip;
	var el = campoIn.split(" ");
	var contaTulip = 0;
	if(campoIn == "") {
		return;
	}
	try {
		for (var i = 0; i < el.length; i++) {
			if(el[i].includes("[W]") == false && el[i]!="") {
				contaTulip++;
			}
		}
	} catch (error){}
	
	return contaTulip;
}

function caricaDaTulipMobile() {
	var rigaTulip = (document.getElementById('tulipUrlMobile').value).trim();
	caricaDaTulipMain(rigaTulip);
}

function caricaDaTulip() {
	var rigaTulip = (document.getElementById('tulipUrl').value).trim();
	caricaDaTulipMain(rigaTulip);
}

function clearBaseBadges() {
	document.getElementById('ent1').value = "";
	document.getElementById('usc1').value = "";
	document.getElementById('ent2').value = "";
	document.getElementById('usc2').value = "";
}

function caricaDaTulipMain(campoTulip) {
	pulisciAll();
	clearBaseBadges();
	
	var campoIn = ""+campoTulip;
	var el = campoIn.split(" ");
	var chk=false;
	var elTest = 0;
	var elId = 1;
	
	if(campoIn == "") {
		clickReset();
		return;
	} 
	try {
		for (var i = 0; i < el.length; i++) {
			elTest = i+1;
			if(i > 3 && elTest%2==1) { // I must add automatically new enter and exit section
				addTime();
			}
			if(elTest%2==0) {
				chk = checkTimbraturaTulip((el[i].split("[W]"))[0],'usc'+elId,'U');
				elId++;
			} else {
				chk = checkTimbraturaTulip((el[i].split("[W]"))[0],'ent'+elId,'E');
			}
			if(!chk) {
				return;
			}
		}		
	} catch (error){}
	
	calcolaOrari();
}

function checkTimbraturaTulip(campoTulip, campoHtml, checkTipo) {
	var tipoTimbratura = campoTulip.charAt(0);
	var orario = campoTulip.substring(1);
	if(tipoTimbratura == checkTipo) {
		var oraSplit = orario.split(":");		
		try {
			if(oraSplit[0].length == 2 && oraSplit[1].length == 2) {
				document.getElementById(campoHtml).value = orario;
				return true;
			} else {
				alert('ER1 - La stringa inserita non è corretta! ');
				return false;
			}
		} catch (error) {
			alert('ER2 - La stringa inserita non è corretta!');
			clickReset();
			return false;
		}
	}
	alert('ER3 - La stringa inserita non è corretta!');
	clickReset();
	return false;
}

function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	h = checkTime(h);
	m = checkTime(m);
	s = checkTime(s);
	document.getElementById('orario').value = "    " + h + ":" + m + ":" + s;
	if(hasCountDown) {
		startCountDown();
	}
	if(hasBpCountDown) {
		startBPCountDown();
	}
	var t = setTimeout(startTime, 500);
}

function startCountDown() {
	var goOutAt = document.getElementById('estUsc').value;
	var segno = "";
	
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds(); 
	
	var goOutAtSpl = goOutAt.split(":");
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
		if(sd < 0)
			sd = sd * (-1);
		if(!document.getElementById('countdown').classList.contains('green')) {
			document.getElementById('countdown').classList.add('green');
			startAudio();
		}
		segno = "    ";
	} else {
		if(document.getElementById('countdown').classList.contains('green')) {
			document.getElementById('countdown').classList.remove('green');
		}
		segno = "-";
	}
	document.getElementById('countdown').value = segno + checkTime(hd) + ":" + checkTime(md) + ":" + checkTime(sd);
}

function startBPCountDown() {
	var goOutAt = document.getElementById('estBP').value;
	var segno = "";
	
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds(); 
	
	var goOutAtSpl = goOutAt.split(":");
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
		if(sd < 0)
			sd = sd * (-1);
		if(!document.getElementById('bpCountdown').classList.contains('green')) {
			document.getElementById('bpCountdown').classList.add('green');
			
			document.getElementById('bpOff').classList.remove('infoOn');
			document.getElementById('bpOff').classList.add('infoOff');
			document.getElementById('bpOn').classList.remove('infoOff');
			document.getElementById('bpOn').classList.add('infoOn');
		}
		segno = "    ";
	} else {
		if(document.getElementById('bpCountdown').classList.contains('green')) {
			document.getElementById('bpCountdown').classList.remove('green');
		}
		segno = "-";
	}
	document.getElementById('bpCountdown').value = segno + checkTime(hd) + ":" + checkTime(md) + ":" + checkTime(sd);
}

function checkTime(i) {
	if (i < 10) {i = "0" + i};  // Add zero in front of numbers < 10
	return i;
}

function startAudio() {
	if(canStartAudio == true && audioEnabled == true) {
		var audio = new Audio('./audio/message.mp3');
		
		var theme = getCookie("theme");
		if(theme != "" && theme != null) {
			var testThemeAudio = new Audio("./audio/themes/"+theme+"/message.mp3");
			testThemeAudio.onerror = function() {
				audio = new Audio('./audio/message.mp3');
				audio.play();
			};
			testThemeAudio.onloadeddata = function() {
				audio = new Audio("./audio/themes/"+theme+"/message.mp3");
				audio.play();
			};
		} else {
			audio.play();
		}
	}
	document.getElementById('confettiContainer').style.display='block';
	initConfetti();
	render();
}

function addTime() {
    timeId++; // Increment timeId to get a unique ID for the new element
	var html = 	'<tr><td colspan="2" class="spacer"><hr></td></tr>' +
				'<tr><td><img src="./images/icons/trash.png" class="icon" id="deleteTime-'+timeId+'" onclick=\'removeElementByButton("timeId-'+timeId+'", "deleteTime-'+(timeId-1)+'")\' title="Rimuovi entrata ed uscita selezionata"/> ' +
				         'Entrata '+timeId+'</td><td id="c_ent'+timeId+'" class="colTime"><input type="time" id="ent'+timeId+'" onfocusout="calcolaOrari()"/></td></tr>' +
				'<tr><td colspan="2" class="spacer"><hr></td></tr>' +
				'<tr><td>Uscita '+timeId+'</td><td id="c_usc'+timeId+'" class="colTime"><input type="time" id="usc'+timeId+'" onfocusout="calcolaOrari()"/></td></tr>';
    addElement('timeTable', 'tbody', 'timeId-' + timeId, 'deleteTime-' + (timeId-1), html);
}

function addElement(parentId, elementTag, elementId, previousElementId, html) {
    // Adds an element to the document
    var p = document.getElementById(parentId);
    var newElement = document.createElement(elementTag);
    newElement.setAttribute('id', elementId);
    newElement.innerHTML = html;
    p.appendChild(newElement);
	
	// You can delete only the last time section added
	if(document.getElementById(previousElementId) != null) {
		document.getElementById(previousElementId).classList.add('invisible');
	}
	
	var objDiv = document.getElementById("workingTime");
	objDiv.scrollTop = objDiv.scrollHeight;
}

function removeElementByButton(elementId, previousElementId) {
	removeElement(elementId, previousElementId)
	
	document.getElementById('tulipUrl').value = "";
	document.getElementById('tulipUrlMobile').value = "";
}

function removeElement(elementId, previousElementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
	
	timeId--;
	// If possible show the previous delete button
	if(document.getElementById(previousElementId) != null) {
		document.getElementById(previousElementId).classList.remove('invisible');
	}
	
	calcolaOrari();
}

function showInfo() {
	document.getElementById('infoContainer').classList.remove('infoOff');
	document.getElementById('infoContainer').classList.add('infoOn');
	document.getElementById('timeContainer').classList.add('infoOff');
}

function closeInfo() {
	document.getElementById('infoContainer').classList.remove('infoOn');
	document.getElementById('infoContainer').classList.add('infoOff');
	document.getElementById('timeContainer').classList.remove('infoOff');
}

function showSettings() {
	if(document.getElementById('saveOk').classList.contains('infoOn')) {;
		document.getElementById('saveOk').classList.remove('infoOn');
	document.getElementById('saveOk').classList.add('infoOff');
	}
	
	document.getElementById('settingsContainer').classList.remove('infoOff');
	document.getElementById('settingsContainer').classList.add('infoOn');
	document.getElementById('timeContainer').classList.add('infoOff');
	
	document.getElementById('customWorkingHours').value = workingHours;
	document.getElementById('customBPHours').value = bpHours;
}

function saveSettingsOnCache() {
	var customWH = document.getElementById('customWorkingHours').value;
	var customBPH = document.getElementById('customBPHours').value;
	
	workingHours = customWH;
	bpHours = customBPH;
	
	setCookie("customWorkingHours", customWH);
	setCookie("customBPHours", customBPH);
	
	document.getElementById('saveOk').classList.remove('infoOff');
	document.getElementById('saveOk').classList.add('infoOn');
	
	calcolaOrari();
}

function closeSettings() {
	document.getElementById('settingsContainer').classList.remove('infoOn');
	document.getElementById('settingsContainer').classList.add('infoOff');
	document.getElementById('timeContainer').classList.remove('infoOff');
}

function closeBp() {
	document.getElementById('bpContainer').classList.remove('infoOn');
	document.getElementById('bpContainer').classList.add('infoOff');
}

function disableAudio() {
	document.getElementById('audioOption').classList.remove('bgGreen');
	document.getElementById('audioOption').classList.add('bgRed');
	document.getElementById('audioOn').classList.add('invisible');
	document.getElementById('audioOff').classList.remove('invisible');
	audioEnabled = false;
	
	setCookie("audio", "OFF");
}

function enableAudio() {
	document.getElementById('audioOption').classList.add('bgGreen');
	document.getElementById('audioOption').classList.remove('bgRed');
	document.getElementById('audioOn').classList.remove('invisible');
	document.getElementById('audioOff').classList.add('invisible');
	audioEnabled = true;
	
	setCookie("audio", "");
}

function showThemeSelector() {
	if(document.getElementById('themeSelector').classList.contains('infoOff')) {
		document.getElementById('themeSelector').classList.remove('infoOff');
		document.getElementById('themeSelector').classList.add('infoOn');
		document.getElementById('themes').classList.remove('infoOn');
		document.getElementById('themes').classList.add('infoOff');
		document.getElementById('themesClose').classList.remove('infoOff');
		document.getElementById('themesClose').classList.add('infoOn');
		autoHideThemeSelector();
	} else {
		document.getElementById('themeSelector').classList.remove('infoOn');
		document.getElementById('themeSelector').classList.add('infoOff');
		document.getElementById('themesClose').classList.remove('infoOn');
		document.getElementById('themesClose').classList.add('infoOff');
		document.getElementById('themes').classList.remove('infoOff');
		document.getElementById('themes').classList.add('infoOn');
	}
}

function autoHideThemeSelector() {
	//DOPO 15 SECONDI CHIUDO AUTOMATICAMENTE IL THEME SELECTOR
	setTimeout(function(){
		if(document.getElementById('themeSelector').classList.contains('infoOn')) {
			showThemeSelector();
		} 
	},15000);
}

function setDefaultTheme() {
	document.body.style.backgroundImage = "url('./images/bg.jpeg')";
	
	document.getElementById('exitPrevision').style.backgroundImage = "url('./images/finish.png')";
	document.getElementById('permissions').style.backgroundImage = "url('./images/permission.png')";
	document.getElementById('workingTime').style.backgroundImage = "url('./images/work.png')";
	document.getElementById('travelTime').style.backgroundImage = "url('./images/street.png')";
	document.getElementById('otherInfo').style.backgroundImage = "url('./images/time.png')";
	
	document.getElementById('bpOff').src = "./images/bpOFF.png";
	document.getElementById('bpOn').src = "./images/bpON.png";
	
	document.getElementById('timeTable').className = "timeTable";
	document.getElementById('travelTimeTable').className = "timeTable";
	document.getElementById('otherInfoTable').className = "timeTable";
	document.getElementById('exitPrevision').className = "timeTable";
	document.getElementById('timeContainer').className = "";
	document.getElementById('pageBody').className = "";
	
	setCookie("theme", "");
}

function changeBackgroundImage(themeName) {
	//IMPOSTO SEMPRE L'IMMAGINE DI DEFAULT INIZIALMENTE
	document.body.style.backgroundImage = "url('./images/bg.jpeg')";
	
	var image = new Image();
	image.src = "./images/themes/" + themeName + "/bg.jpeg";
	image.onload = function() {
		document.body.style.backgroundImage = "url('./images/themes/" + themeName + "/bg.jpeg')"
        return;
    }
	image.onerror = function(){
		image.src = "./images/themes/" + themeName + "/bg.jpg";
		image.onload = function() {
			document.body.style.backgroundImage = "url('./images/themes/" + themeName + "/bg.jpg')"
			return;
		}
		image.onerror = function(){
			image.src = "./images/themes/" + themeName + "/bg.png";
			image.onload = function() {
				document.body.style.backgroundImage = "url('./images/themes/" + themeName + "/bg.png')"
				return;
			}
			image.onerror = function(){
				image.src = "./images/themes/" + themeName + "/bg.gif";
				image.onload = function() {
					document.body.style.backgroundImage = "url('./images/themes/" + themeName + "/bg.gif')"
					return;
				}
			}
		}
	}
}

function setTheme(themeName) {
	changeBackgroundImage(themeName);
	
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/finish.png", 'exitPrevision', 'finish.png', false);
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/permission.png", 'permissions', 'permission.png', false);
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/work.png", 'workingTime', 'work.png', false);
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/street.png", 'travelTime', 'street.png', false);
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/time.png", 'otherInfo', 'time.png', false);
	
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/bpOFF.png", 'bpOff', 'bpOFF.png', true);
	checkIfImageExistsAndSet("./images/themes/" + themeName + "/bpON.png", 'bpOn', 'bpON.png', true);
	
	setCustomCssClass("timeTable", themeName, "timeTable");
	setCustomCssClass("travelTimeTable", themeName, "timeTable");
	setCustomCssClass("otherInfoTable", themeName, "timeTable");
	setCustomCssClass("exitPrevision", themeName, "");
	
	setCustomCssClass("timeContainer", themeName, "");
	setCustomCssClass("pageBody", themeName, "");
	
	setCookie("theme", themeName);
}

function setCustomCssClass(elementId, themeClass, defaultClass) {
	document.getElementById(elementId).className = defaultClass;
	document.getElementById(elementId).classList.add(themeClass);
}	

function checkIfImageExistsAndSet(imagePath, elementId, imageName, isImage) {
	var image = new Image();
	image.src = imagePath;
	
	image.onerror = function(){
		if(isImage) {
			document.getElementById(elementId).src = "./images/"+imageName;
		} else {
			document.getElementById(elementId).style.backgroundImage = "url('./images/"+imageName+"')";
		}
	}
	
	image.onload = function(){
		if(isImage) {
			document.getElementById(elementId).src = imagePath;
		} else {
			document.getElementById(elementId).style.backgroundImage = "url('"+imagePath+"')";
		}
	}
}

function setCookie(name, value) {
    document.cookie = name + "=" + escape(value) + "; max-age=" + 30*24*60*60;
}

function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null;
}

function checkPreferencesCookie() {
	var theme = getCookie("theme");
	if(theme != "" && theme != null) {
		setTheme(theme);
	} else {
		setDefaultTheme();
	}
	
	var audio = getCookie("audio");
	if(audio != "" && audio != null && audio == "OFF") {
		disableAudio();
	}
	
	var cookieWorkingHours = getCookie("customWorkingHours");
	if(cookieWorkingHours != "" && cookieWorkingHours != null) {
		workingHours = cookieWorkingHours;
	} else {
		workingHours = defaultWorkingHours;
	}
	document.getElementById('customWorkingHours').value = workingHours;
	
	var cookieBPHours = getCookie("customBPHours");
	if(cookieBPHours != "" && cookieBPHours != null) {
		bpHours = cookieBPHours;
	} else {
		bpHours = defaultBPHours;
	}
	document.getElementById('customBPHours').value = bpHours;
}

function checkIfThemesAreAvailable() {
	var TODAY = new Date();
	let year = TODAY.getFullYear();
	
	var THEME_SCHEDULE = {
		'christmas': ['December 8 ' + year, 'January 7 ' + (year+1)],
		/*'carnival': ['January 15 ' + year, 'March 2 ' + (year+1)],
		'easter': ['March 3 ' + year, 'April 18 ' + (year+1)],*/
	};
	
	for (var camp_ in THEME_SCHEDULE) {
		if (TODAY < Date.parse(THEME_SCHEDULE[camp_][0]) || TODAY > Date.parse(THEME_SCHEDULE[camp_][1])) {
			document.getElementById(camp_).style.display = 'none';
			var theme = getCookie("theme");
			if(theme != "" && theme != null && theme == camp_) {
				setDefaultTheme();
			}
		}
	}
}

function checkMarks() {
	const queryString = window.location.search;
	var timbrature = queryString.substring(1);
	
	var check = timbrature.charAt(0);
	
	if(check.indexOf('E') >= 0) {
		var timbratureClean = timbrature.replace(/%20/g, " ");
		document.getElementById('tulipUrl').value = timbratureClean;
		caricaDaTulip();
	}
}