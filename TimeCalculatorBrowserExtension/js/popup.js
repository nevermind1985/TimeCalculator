$(document).ready(function () {	
	// Save it using the Chrome extension storage API.
	chrome.storage.sync.get("workingTime", function (obj) {
		if(obj.workingTime) {
			document.getElementById('f_wtime').value = obj.workingTime;
		} else {
			var defaultTime = {}, key = "workingTime";
			defaultTime[key] = '08:00';
			chrome.storage.sync.set(defaultTime);
			
			document.getElementById('f_wtime').value = '08:00';
		}
	});
	
	chrome.storage.sync.get("workingTime1", function (obj) {
		if(obj.workingTime1) {
			document.getElementById('f_wtime_1').value = obj.workingTime1;
		}
	});
	
	chrome.storage.sync.get("workingTime2", function (obj) {
		if(obj.workingTime2) {
			document.getElementById('f_wtime_2').value = obj.workingTime2;
		}
	});
	
	chrome.storage.sync.get("workingTime3", function (obj) {
		if(obj.workingTime3) {
			document.getElementById('f_wtime_3').value = obj.workingTime3;
		}
	});
	
	chrome.storage.sync.get("workingTime4", function (obj) {
		if(obj.workingTime4) {
			document.getElementById('f_wtime_4').value = obj.workingTime4;
		}
	});
	
	chrome.storage.sync.get("workingTime5", function (obj) {
		if(obj.workingTime5) {
			document.getElementById('f_wtime_5').value = obj.workingTime5;
		}
	});
	
	chrome.storage.sync.get("popupEnabled_a", function (obj) {
		if (obj.popupEnabled_a !== undefined && obj.popupEnabled_a !== null) {
			document.getElementById('f_spop_a').checked = obj.popupEnabled_a;
		} else {
			var defaultPopup_a = {}, key = "popupEnabled_a";
			defaultPopup_a[key] = true;
			chrome.storage.sync.set(defaultPopup_a);
			
			document.getElementById('f_spop_a').checked = true;
		}
	});
	
	chrome.storage.sync.get("popupEnabled_t", function (obj) {
		if (obj.popupEnabled_t !== undefined && obj.popupEnabled_t !== null) {
			document.getElementById('f_spop_t').checked = obj.popupEnabled_t;
		} else {
			var defaultPopup_t = {}, key = "popupEnabled_t";
			defaultPopup_t[key] = true;
			chrome.storage.sync.set(defaultPopup_t);
			
			document.getElementById('f_spop_t').checked = true;
		}
	});
});

function salvaDati() {
	var popupValueSetted_a = document.getElementById('f_spop_a').checked;
	var defaultPopup_a = {}, key = "popupEnabled_a";
	defaultPopup_a[key] = popupValueSetted_a;
	chrome.storage.sync.set(defaultPopup_a);
	
	var popupValueSetted_t = document.getElementById('f_spop_t').checked;
	var defaultPopup_t = {}, key = "popupEnabled_t";
	defaultPopup_t[key] = popupValueSetted_t;
	chrome.storage.sync.set(defaultPopup_t);
	
	var workingTimeValueSetted = document.getElementById('f_wtime').value;
	var defaultTime = {}, key = "workingTime";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	var workingTimeValueSetted = document.getElementById('f_wtime_1').value;
	var defaultTime = {}, key = "workingTime1";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	var workingTimeValueSetted = document.getElementById('f_wtime_2').value;
	var defaultTime = {}, key = "workingTime2";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	var workingTimeValueSetted = document.getElementById('f_wtime_3').value;
	var defaultTime = {}, key = "workingTime3";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	var workingTimeValueSetted = document.getElementById('f_wtime_4').value;
	var defaultTime = {}, key = "workingTime4";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	var workingTimeValueSetted = document.getElementById('f_wtime_5').value;
	var defaultTime = {}, key = "workingTime5";
	defaultTime[key] = workingTimeValueSetted;
	chrome.storage.sync.set(defaultTime);
	
	window.close();
}