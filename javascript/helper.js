---
layout: blank
---
//Version {{ site.version_number }}
//{{ site.urllive }}

function docReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
    return;
  }
  document.addEventListener('DOMContentLoaded', fn);
}

function getElem(id) {
	return document.getElementById(id) || null;
}

function getClass(id, parent){
	parent = parent || document;
    return parent.getElementsByClassName(id) || null;
}

function getTags(id, parent){
	parent = parent || document;
	id = id.toUpperCase();
	return parent.getElementsByTagName(id) || null;
}

function elemClickByID(id) {
    var y = getElem(id);
    y != null ? y.click() : null;
}

function displayBlockByID(id) {
    var x = getElem(id);
    x != null ? x.style.display = 'block' : null;
}

function displayNoneByID(id) {
    var x = getElem(id);
    x != null ? x.style.display = 'none' : null;
}

function toggleDisplayByID(id) {
    var x = document.getElementById(id);
    if (x != null) {
        x.style.display == 'block' ? x.style.display = 'none' : x.style.display = 'block';
    }
}

function setElemValueByID(id, val) {
    var x = getElem(id);
    (x != null) ? x.value = val : null;
}

function hasClass(el, name){
	return (el && "classList" in el)? el.classList.contains(name): false;
}

function addClasses(elem, classes){
    for (i = 0; i < classes.length; i++) {
        elem.classList.add(classes[i]);
    }
}

function removeClasses(elem, classes){
	for (i = 0; i < classes.length; i++) {
		elem.classList.remove(classes[i]);
	}	
}

function roundTo(val, decimals, dir){
	dir = dir || 0;
	decimals = decimals || 0;	
	val = val * (10 ** decimals);
	switch(dir) {
		case -1:
            val = Math.floor(val);
			break;
		case 1:
            val = Math.ceil(val);
			break;
		case 0:
			val = Math.round(val);
			break;
		default:
			return;
	} 
	
	return val / (10 ** decimals);
}

function printDivByID(id) {
    var printDiv = getElem(id);
    if (printDiv != null) {
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printDiv.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
    }
}

function IsElem(o) {
    return (o instanceof Element);
}

function getTextWidth(text, font) {
	font = font || "bold 12pt arial";
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function getComputedStylePropertyByElem(elem, property, output){
	output = output || null;
	//var elem = getElem(id);
	var theCSSprop = window.getComputedStyle(elem, null).getPropertyValue(property);
	if(output != null){getElem(output).innerHTML = theCSSprop;}
	return theCSSprop;
}

function getComputedStyleProperty(id, property, output){
	output = output || null;
	var elem = getElem(id);
	var theCSSprop = window.getComputedStyle(elem, null).getPropertyValue(property);
	if(output != null){getElem(output).innerHTML = theCSSprop;}
	return theCSSprop;
}

function objectToTwodArray(array) {
    let keys = Object.keys(Object.assign({}, ...array));
    var result = [];
	result.push(keys);
    array.forEach(function (obj) {
        let item = [];
		keys.map((k) => {
			var tmp = "";
            if (obj[k]) {tmp = obj[k];}
            return item.push(tmp)
        });
        result.push(item);
	});
    return result;
}

var GBPFormatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
});

var iconDownArrow = "<path d='M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z'/>";
var iconUpArrow = "<path d='M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z'/>";
var iconCross = "<path d='M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z'></path>";
function wrapPath(path, tags) {
    tags = tags || "";
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' " + tags + " >" + path + "</svg>"
}

function StringReplaceAll(str, search, replacement) {
	str = str.toString();
    return str.replace(new RegExp(search, 'g'), replacement);
}



function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function randSeed(seed,iteration=0){	
	if(iteration > 50000){return null;}
	// Create cyrb128 state:
	var seed = cyrb128(seed);
	// Four 32-bit component hashes provide the seed for sfc32.
	var rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
	for (var j=0;j<iteration;j++){ rand();}
	return rand();
}

function itemFromObjDateSeed(obj){
	if(obj.length > 0){
		var objNumber = Math.floor(randSeed(UTCString()) * (obj.length + 1));
		return obj[objNumber];
	}
}

function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function UTCString(incTime){
	incTime = incTime || false;
	const d = new Date();
	return (d.getUTCFullYear()+"-"+addLeadingZeros(d.getUTCMonth()+1,2)+"-"+addLeadingZeros(d.getUTCDate(),2)) + "T"  + (incTime ? (addLeadingZeros(d.getUTCHours(),2) + ":" + addLeadingZeros(d.getUTCMinutes(),2) + ":" + addLeadingZeros(d.getUTCSeconds(),2)) : "00:00:00") + "Z";
}

function addLeadingZeros(num, totalLength) {
  if (num < 0) {
    const withoutMinus = String(num).slice(1);
    return '-' + withoutMinus.padStart(totalLength, '0');
  }
  return String(num).padStart(totalLength, '0');
}

function msToTime(duration) {
	var x = "-";
	var milliseconds = Math.floor((duration % 1000) / 100),
	seconds = Math.floor((duration / 1000) % 60),
	minutes = Math.floor((duration / (1000 * 60)) % 60),
	hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
	days = Math.floor((duration / (1000 * 60 * 60 * 24)));
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	x = seconds > 0 ? (seconds + "s") : x;
	x = minutes > 0 ? (minutes + "m" + seconds + "s") : x;
	x = hours > 0 ? (hours + "h" + minutes + "m" + seconds + "s") : x;
	x = days > 0 ? (days + "d" + hours + "h" + minutes + "m" + seconds + "s") : x;
	return x;
}



function reduceArayByKeys(arr, keysToKeep){ 
	return arr.map(o => keysToKeep.reduce((acc, curr) => {
	  acc[curr] = o[curr];
	  return acc;
	}, {}));
}

async function getWords(len, uCase){
	uCase = uCase || "1";
	len = len || -1;
	var data = await fetchData('https://jovialbadger.co.uk/javascript/words.txt', "TXT", "Words");
	if(data != null){
		data = data.split("\n");
		var a = [];
		for (var i = 0; i < data.length; i++){
			if(!data[i].startsWith("//")){
				if(!(data[i].length in a)){a[data[i].length] = [];}		
				a[data[i].length].push(uCase == 1 ? data[i].toUpperCase() : data[i].toLowerCase())
			}
		}
		return len == -1 ? a : a[len];
			
	} else{
		return null;
	}
}

async function isWord(word){
	var x = await getWords(word.length);
	return x.filter(function (item) {return item == word.toUpperCase();}).length > 0;
}

var showErrors = false;
window.onerror = function (msg, url, lineNo, columnNo, error) {
	showErrors = getLocal("ShowErrors") ? getLocal("ShowErrors") : showErrors;
	if(showErrors){
		var line = lineNo > -1 ? lineNo : null;
		var lineTxt = line == null ? "" : ("<br /><br />Line: " + line);
		var col = columnNo > -1 ? columnNo : null;
		var colTxt = col == null ? "" : ("<br /><br />Col: " + col);
		var errString = msg + "<br /><br />" + url + lineTxt + colTxt + "<br><br> UA: " + navigator.userAgent + "<hr>" + (error?.stack ?? "");
		toastyMake('<p onclick="message(\'' + errString.replace(/["']/g, "_") + '\')">Error click here to view more details</p>',0 , 30000,"#f00","#fff");
    }
	return false;
}

var setErrorsToggle = 0;
function setShowErrorsToggle(){
	setErrorsToggle++;
	if(setErrorsToggle == 9){
		toastyMake("Click Again To Toggle Show Errors");
	}
	if(setErrorsToggle > 9){
		showErrors = showErrors ? false : true;
		setLocal("ShowErrors",  showErrors);
		setErrorsToggle = 0;
	}
}

function toastyMake(txt, close, timeClose, bgColour, txtColour) {
	close = close || false;
	bgColour = bgColour || "";
	txtColour = txtColour || "";
	timeClose = timeClose || 0;
	txt = txt || "";
	if(txt != ""){
		var x = document.getElementById("toastyContainer");
		var toast = document.createElement("div");
		toast.innerHTML = "<span class='toastyText' style='" + (txtColour != "" ? "color:" + txtColour + ";" : "") +  (close ? "padding-right:50px;" : "") + "'>" + txt + "</span>" + (close ? "<span class='toastyClose' onclick='this.parentNode.remove()'>&#10005;</span>" : "");
		toast.className = "toasty";
		bgColour != "" ? toast.style.background = bgColour : "";
		close ? null : toast.setAttribute("onclick","this.remove()");
		x.appendChild(toast);
		setTimeout(function(){ toast.remove(); }, (timeClose == 0 ? (close ? 10000 : 3000) : timeClose));
	}
}