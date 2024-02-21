const displayTypes = ["phone","email","image-url","image-src","web-link","masked-url","object","date","time","date-time"];
function displayType(txt,type){
	type = type || "txt";
	var href = "";
	var html = "";
	switch(type.toLowerCase()) {
		case "phone":
			href = "tel:" + txt;
			break;
		case "email":
			href = "mailto:"+txt;
			break;
		case "image-url":
			href = txt.startsWith("http") ? txt : "https://"+txt;
		case "image-src":
			html = "<img style='max-height: 50px;max-width: 50px;' src='" + (href==""?txt:href) + "'>";
			break;
		case "web-link":
			href = txt.startsWith("http") ? txt : "https://"+txt;
			break;
		case "masked-url":
			href = txt.startsWith("http") ? txt : "https://"+txt;
			txt = "Click Here";
			break;
		case "object":
			html = arrDisplayList(txt);
			break;
		//do not use date or time displays for preformatted strings, requires iso format e.g. 2020-01-01T08:00:00.000-01:00
		case "date":
			var date = new Date(txt);
			html = date.toLocaleDateString();
			break;
		case "time":
			var date = new Date(txt);
			html = date.toLocaleTimeString();
			break;
		case "date-time":
			var date = new Date(txt);
			html = date.toLocaleDateString() + " " + date.toLocaleTimeString();
			break;
		default:
			html = txt;
	} 
	return (href != "") ? "<a target='_blank' href='" + href + "'>" + (html==""?txt:html) + "</a>" : html;
}
function changeURLQuery(obj){
	const urlParams = new URLSearchParams(window.location.search);
	var url = window.location.href.split('?')[0];
	for (const key in obj) {
	    urlParams.set(key, obj[key]);
	}
	window.history.replaceState({}, "",url + "?" + urlParams.toString());
}

function getURLQuery(param = ""){
	const urlParams = new URLSearchParams(window.location.search);
	return param === "" ? Object.fromEntries(urlParams.entries()): urlParams.get(param);
}
const filterModifyTypes = ["exact","contains","notcontain",">","<","between"];
function arrFilter(arr,filters){
	return Object.keys(filters).length > 0 ? arr.filter(obj => {
		var count = 0;		
		for (const key in filters) {
			if(count > 0 || (!obj.hasOwnProperty(key) && key.toLowerCase() != "_row-filter")){break;}// 
			var type = (filters[key].length > 1) ? filters[key][1] : "";
			switch (type){
				case "exact"://create or condition for multi select dropdown
					String(obj[key]) == String(filters[key][0]) ? null : count++;
					break;
				case "rowcontains":
					Object.values(obj).join("").toLowerCase().includes(String(filters[key][0]).toLowerCase()) ? null : count++;
					break;
				case "contains":
					String(obj[key]).toLowerCase().includes(String(filters[key][0]).toLowerCase()) ? null : count++;
					break;
				case "notcontain":
					String(obj[key]).toLowerCase().includes(String(filters[key][0]).toLowerCase()) ? count++ : null;
					break;
				case ">":
					obj[key] >= filters[key][0] ? null : count++;
					break;
				case "<": 
					obj[key] <= filters[key][0] ? null : count++;
					break;
				case "between": //seperate numbers with '|'
					var numSplit = filters[key][0].split("|");
					var num1 = numSplit[0];
					var num2 = numSplit[1];
					((obj[key] >= num1) && (obj[key] <= num2)) ? null : count++;
					break;
				default: 
					String(obj[key]).toLowerCase() == String(filters[key][0]).toLowerCase() ? null : count++;
			}
		}
		return count == 0
	}) : arr;
}
function arrSort(obj,props) {
	function dynamicSort(property) {
		var sortOrder = 1;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a,b) {
			var sorta = a[property] || null;
			var sortb = b[property] || null;
			sorta = isNaN(sorta) ? sorta.toString().toLowerCase() : Number(sorta);
			sortb = isNaN(sortb) ? sortb.toString().toLowerCase() : Number(sortb);
			var result = isNaN(sorta) ? (isNaN(sortb) ? sorta.localeCompare(sortb) : 1) : (isNaN(sortb) ? -1 : (sorta - sortb))
			return result * sortOrder;
		}
	}	
	return obj.sort(function(obj1,obj2){
        var i = 0, result = 0, numberOfProperties = props.length;
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
	});
}
function arrPaging(arr, paging=[0,0]){
	var start = 0+((paging[0]-1)*paging[1]);
	arr = paging[1] == 0 ? arr : arr.slice(start,(start+paging[1]))
	return arr.length == 0 ? [{errorData:"No Results"}] : arr;
}
function arrKeepKeys(array, keys){return array.map(o => Object.fromEntries(keys.map(k => [k, o[k]])))}

const filterTypes = ["txt","dropdown"];
async function arrAdjust(setting){
	var id = "";
	var arr = null;
	var filtersHTML = "";
	if(!setting.hasOwnProperty('getArrFunction')){return;}else{arr=await runFnByName(setting.getArrFunction);}//function must return an array of objects
	const clone = structuredClone(arr);
	if(!setting.hasOwnProperty('id')){return;}else{id=setting.id;}
	localStorage.setItem("arrSettings_"+id, JSON.stringify(setting));
	var filterDOM = document.getElementById("filtersFor" + id);
	//logic only do changed function e.g. if sorting don't do filter again, if paging don't filter or sort
	var currFilters = {};
	if(setting.hasOwnProperty('filter')){arr = arrFilter(arr,setting.filter);currFilters = setting.filter;}
	if(setting.hasOwnProperty('sort')){arr =  arrSort(arr,setting.sort);}
	if(setting.hasOwnProperty('page')){pagingHTML(setting.page[0],setting.page[1],arr.length,id);arr = arrPaging(arr,setting.page);}
	if(setting.hasOwnProperty('colData')){
		var colTypes = setting.colData.filter(p => p.hasOwnProperty("type"));
		var colFilters = setting.colData.filter(p => p.hasOwnProperty("filter"));
		var removeCols = setting.colData.filter(p => p.hasOwnProperty("hide") ? p.hide > 0 : false);
		if(colTypes.length > 0){
			for(const item of colTypes){
				for (const obj of arr) {
					if(obj.hasOwnProperty(item.col)){obj[item.col] = displayType(obj[item.col],item.type);}
				}			
			}
		}
		if(removeCols.length > 0){
			var keepArr = Object.keys(Object.assign({}, ...arr));
			const removeColNames = removeCols.map(p => p.col);
			const removeColMoreInfoNames = removeCols.filter(p => p.hide == 2).map(p => p.col);
			var keepArrDisplay = keepArr.filter(item => !removeColNames.includes(item));
			var keepArrMoreInfo = keepArr.filter(item => !removeColMoreInfoNames.includes(item));
			if(keepArrMoreInfo.length != keepArrDisplay.length) {
				localStorage.setItem("arrCurrPage_"+id, JSON.stringify(arrKeepKeys(arr,keepArrMoreInfo)));
				arr = arrKeepKeys(arr,keepArrDisplay);
				arr.forEach((item,i,array) => {item["More Info"] = "<span onclick='arrMoreInfo(\"" + id + "\"," + i + ")'>Click Here</span>";});
			}
		}
		if(filterDOM ==null){
			if(setting.colData.includes('settings')){
				filtersHTML += '<label onclick="showSettings(\''+ id +'\')"><span>Settings</span></label>';
			}//allow changeable settings
			if(setting.colData.includes('filter')){
				filtersHTML += '<label><span>Whole Table Filter</span><input value="' + (currFilters.hasOwnProperty('_row-filter') ? currFilters["_row-filter"][0] : "") + '" onkeyup="changeFiltering(\'' + id + '\',\'_row-filter\',this.value,\'rowcontains\')" id="inpTableFilter' + id + '"></label>';
			}//whole table filter
			if(colFilters.length > 0){
				for (const i in colFilters) {
					const item = colFilters[i];
					var tempStr = "";
					var currFilterVal = (currFilters.hasOwnProperty(item.col) ? currFilters[item.col][0] : "")
					switch(item.filter) {
						case "dropdown":
							tempStr += '<select data-deselectable="1" value="' + currFilterVal + '" onchange="changeFiltering(\'' + id + '\',\'' + item.col + '\',this.value,\'exact\')"><option ' + (currFilterVal == "" ? 'selected=""' : '') + ' disabled=""></option>';
							var uniqueArr = [...new Set(clone.map(a => a[item.col]))].sort();
							for(var j = 0; j < uniqueArr.length; j++){
								tempStr += '<option ' + (currFilterVal == uniqueArr[j] ? 'selected=""' : '') + ' value="' + uniqueArr[j] + '">' + uniqueArr[j] + '</option>';
							}
							tempStr += '</select>';
							break;
						case "txt":
							tempStr += '<input value="' + currFilterVal + '" onkeyup="changeFiltering(\'' + id + '\',\'' + item.col + '\',this.value,\'contains\')">';
					} 
					filtersHTML += tempStr == "" ? "" : '<label><span>' + item.col + '</span>' + tempStr + '</label>';
				}
			}//column filters
			if (filtersHTML != ""){filtersHTML += '<input onclick="changeFiltering(\'' + id + '\',\'-\',\'\',\'\',true)" type="button" value="Reset Filters">'}
		}
	}
	var displayElem = document.getElementById(id);
	displayElem == null ? null : displayElem.innerHTML = "";
	if(setting.hasOwnProperty('display')){
		switch(setting.display) {
			case "table":
				buildTable(id, arr, false)
				break;
			case "table-break":
				buildTable(id, arr, true)
				break;
		}
	}
	filtersHTML != "" ? document.getElementById(id).insertAdjacentHTML("beforebegin", "<div id='filtersFor" + id + "'>" +filtersHTML + "<hr/></div>") : null;
	return arr;
}
function arrMoreInfo(id, index){message(arrDisplayList(JSON.parse(localStorage.getItem("arrCurrPage_"+id))[index]),"More Info")}
function changeFiltering(id,key,val="",type="", resetAll = false){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	if(setting.hasOwnProperty('page')){setting.page[0] = 1;}
	if(!setting.hasOwnProperty('filter')){setting.filter = {};}
	if(val !== ""){
		setting.filter[key] = [val,type];
	} else{
		delete setting.filter[key]; 
	}
	if(resetAll){
		setting.filter = {};
		var filterDOM = document.getElementById("filtersFor" + id);
		filterDOM == null ? null : filterDOM.remove();
	}
	return arrAdjust(setting);
}
function changeSorting(id,key,resetAll = false){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	if(setting.hasOwnProperty('page')){setting.page[0] = 1;}
	if(!setting.hasOwnProperty('sort')){setting.sort = [];}
	var removed = ["-"];
	var i = 0;
	while (i < setting.sort.length) {
		if (setting.sort[i] == key || setting.sort[i] == "-"+key) {
			removed = setting.sort.splice(i, 1);
		} else {
			++i;
		}
	}
	setting.sort.unshift((removed[0].startsWith("-") ? "" : "-") + key)
	if(resetAll){setting.sort = [];}
	return arrAdjust(setting);
}

function changePage(id,page){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	if(setting.hasOwnProperty('page')){setting.page[0] = page;}
	return arrAdjust(setting);
}
function changePageRows(id,rows){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	if(setting.hasOwnProperty('page')){setting.page[1] = rows;setting.page[0] = 1;}
	return arrAdjust(setting);
}

function changeArrDisplay(id,displayType = ""){
	if(displayOptions.includes(displayType) || displayType == ""){
		var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
		setting.display = displayType;
		return arrAdjust(setting);
	}
}
function changeColData(id,colName,key,val = ""){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	if(!setting.hasOwnProperty("colData")){
		setting["colData"] = [];
	}
	setting["colData"].filter(item => item.hasOwnProperty("col") && item.col == colName).length > 0 ? null : setting["colData"].push({col:colName});
	setting["colData"].forEach((item, i) => { if (item.hasOwnProperty("col") && item.col == colName) {item[key] = val;} });
	var x = document.getElementById("filtersFor" + id); 
	x == null ? null : x.remove();
	localStorage.setItem("arrSettings_"+id, JSON.stringify(setting));
}

function buildTable(id, arr, breakTable, displayid = ""){
	var html = "";
	var keys = [...new Set(arr.flatMap(Object.keys))];
	html += "<table " + (breakTable ? "class='break-table'" : "") +"><thead><tr>";
	keys.forEach((item, i, array) => {html+="<th onclick='changeSorting(\"" + id + "\",\"" + item + "\")'>" + item + "</th>"});
	html += "</tr></thead><tbody>";
	arr.forEach((item,i,array) => {
		html += "<tr>";
		keys.forEach((itm, j, a) => {
			html+="<td><b class='tablrowheader'>" + itm + "</b><span class='tablerowcontent'>"+ (item?.[itm] ?? "-") +"</span><hr></td>"
		});
		html += "</tr>";
	});
	document.getElementById(displayid == "" ? id : displayid).innerHTML = html + "</tbody></table>"
}

function objectToTwoDArray(array) {
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
function CSVToObj(CSV_string, delimiter = ",",output="array") {
   var pattern = new RegExp(
     (
       "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
       "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +// Quoted fields.
       "([^\"\\" + delimiter + "\\r\\n]*))"// Standard fields.
     ), "gi"
   );
   var rows = [[]];
   var matches = false;
   while (matches = pattern.exec( CSV_string )) {
       var matched_delimiter = matches[1];
       if (matched_delimiter.length && matched_delimiter !== delimiter) {
         rows.push( [] );
       }
       var matched_value;
       if (matches[2]) {
        matched_value = matches[2].replace(
          new RegExp( "\"\"", "g" ), "\""
        );
       } else {
         matched_value = matches[3];
       }
       rows[rows.length - 1].push(matched_value);
   }
   var returnVal = null
   if(output == "object"){
	   returnVal = arrayToObject(rows[0],rows.slice(1));
   } else{
	   returnVal=  rows
   }
   return returnVal;
}
function arrayToObject(keys, values) {
	const returnVal = []

	values.forEach((element, index) => {
		const obj = {};
		keys.forEach((elem,i) =>{
			obj[elem] = element?.[i] ?? "";
		})
		returnVal.push(obj)
	});

	return returnVal;
}
function leftJoinObjects(obj1, obj2, idArrs, insertObj){
	return obj1.map(a => ({ ...obj2.find(b => (isMatch(a,b,idArrs))), ...a,...insertObj}));
}

function isMatch(a,b,idArrs){
  var c = 0; 
  idArrs.forEach(i => (!(a[i]===undefined || b[i]===undefined) && a[i] === b[i]) ? c++: null);
  return c === idArrs.length;
}
var pageRowOpts = [20,50,250];
function pagingHTML(currPage, pageRows, totRows, id){
	currPage=Number(currPage);
	pageRows=Number(pageRows);
	totRows=Number(totRows);
	pageRowOpts.includes(pageRows) ? null : pageRowOpts.push(pageRows);
	pageRowOpts.sort(function (a, b) {  return a - b;  });
	var pagesToShow = 2;
	var totPages = Math.ceil(totRows / pageRows);
	var lnkStart = "<a onclick='changePage(\"" + id + "\",";
	var minPage = (currPage - pagesToShow) >= 1 ? (currPage - pagesToShow) : 1;
	var maxPage = (currPage + pagesToShow) <= totPages ? (currPage + pagesToShow) : totPages;
	var html = "<select onchange='changePageRows(\"" + id + "\",this.value)'>"
	pageRowOpts.forEach((item,i,array) => {
		html += "<option value=\"" + item + "\" " + (pageRows == item ? "selected=\"selected\"" : "") + " >" + item + "</option>";
	});
	html += "</select>";
	html += "<hr>Page " + currPage + " of " + totPages + "<hr><div>";
	html += currPage > 1 ? ( lnkStart + "1)'><<</a>" + lnkStart + ( currPage - 1 ) + ")'><</a>" ) + (minPage > 1 ? "...":""): "";
	for(var p=minPage;(p<maxPage+1);p++){
		html += lnkStart + p + ")'>" + p + "</a>"
	}
	html += currPage < totPages ? (maxPage < totPages ? "...":"") + lnkStart + (currPage + 1) +")'>></a>" + lnkStart + totPages + ")'>>></a>" : "";
	html += "</div><hr/>";
	var elem = document.getElementById("paging-" + id)
	elem == null ? document.getElementById(id).insertAdjacentHTML("afterend", "<div class='paging' id='paging-" + id + "'>" +html + "</div>") : elem.innerHTML = html;
}

const hideTypes = [0,1,2];//0=unhidden,1=hidden but displayed on more info,2=always hidden.
const displayOptions = ["table","table-break"];
async function showSettings(id){//filter type, hide status, column display type
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	var colData = setting?.colData ?? [];
	if(!setting.hasOwnProperty('getArrFunction')){return;}else{arr=await runFnByName(setting.getArrFunction);}//function must return an array
	var keys = [...new Set(arr.flatMap(Object.keys))];
	var html = "";
	keys.forEach((item, i, array) => {
		var col = colData.filter(a => a?.col == item);
		var thisCol = col.length > 0 ? col[0] : {};
		var filter = thisCol?.filter ?? "-1";
		var hide = thisCol?.hide ?? "-1";
		var type = thisCol?.type ?? "-1";
		html+="Field: " + item + "<br>";
		html+="Filter Type: <select onchange='changeColData(\"" + id + "\",\""+item+"\",\"filter\",this.value)'><option value=''>none</option>";
		filterTypes.forEach((itm, j, arr) => {html+="<option value='" + itm + "' " + (itm == filter ? "selected=selected" : "") + ">" + itm + "</option>";});
		html+="</select><br>";
		html+="Field Hide Type: <select onchange='changeColData(\"" + id + "\",\""+item+"\",\"hide\",this.value)'><option value=''>none</option>";
		hideTypes.forEach((itm, j, arr) => {html+="<option value='" + itm + "' " + (itm == hide ? "selected=selected" : "") + ">" + itm + "</option>";});
		html+="</select><br>";
		html+="Display Type: <select onchange='changeColData(\"" + id + "\",\""+item+"\",\"type\",this.value)'><option value=''>none</option>";
		displayTypes.forEach((itm, j, arr) => {html+="<option value='" + itm + "' " + (itm == type ? "selected=selected" : "") + ">" + itm + "</option>";});
		html+="</select><hr>";
	});
	html+="<button onclick='hideSettings(\"" + id + "\")'>Close Settings</button>";
	var elem = document.getElementById("settings-" + id)
	elem == null ? document.getElementById(id).insertAdjacentHTML("beforebegin", "<div class='arrSettings' id='settings-" + id + "'>" +html + "</div>") : elem.innerHTML = html;
}
function hideSettings(id){
	var setting = JSON.parse(localStorage.getItem("arrSettings_"+id));
	document.getElementById("settings-" + id).remove();
	return arrAdjust(setting);
}

async function runFnByName(fnStr){
	var fn = window[fnStr];
	if (typeof fn === "function") return await fn();
}

function arrDisplayList(obj){
	var html = "";
	if (typeof obj != "object"){return "<li>"+obj+"</li>"}
	for (var k in obj)
	{
		if(typeof obj[k] == "function"){continue;}
		if (typeof obj[k] == "object" && obj[k] !== null){
			html +=  "<li>" + k + "<ul>"
			html += arrDisplayList(obj[k]) + "</ul></li>";
		}
		else{
			if(Array.isArray(obj)){
				html += "<li>" + obj[k] + "</li>"
			} else{
				html += "<li>" + k + " : " + obj[k] + "</li>"				
			}
		}
	}
	return html;
}

function leftJoinObjects(obj1, obj2, idArrs, insertObj){
	return obj1.map(a => ({ ...obj2.find(b => (isMatch(a,b,idArrs))), ...a,...insertObj}));
}

function isMatch(a,b,idArrs){
  var c = 0; 
  idArrs.forEach(i => (!(a[i]===undefined || b[i]===undefined) && a[i] === b[i]) ? c++: null);
  return c === idArrs.length;
}

async function fetchData(URL, dataType, storeDataName = "", expirySecs = (60*60*24*7)){
	var data = null;
	var useCache = true;
	if (storeDataName != ""){
		data = getLocal(storeDataName);
		if(data != null){
			if(new Date(UTCString(true)).getTime() - new Date(data).getTime() > 1000*expirySecs){
				delLocal(storeDataName); 
				useCache =false;
			}
		} else{
			delLocal(storeDataName); 
			useCache =false;			
		}
	}
	var cache = await caches.open("my-cache");
	var dl = useCache ? await cache.match(URL) : await fetch(URL);
	dl = (!dl?.ok ?? true) ? await fetch(URL) : dl;
	if(!dl.ok){return null;}
	cache.put(URL, dl.clone());
	var processedData = null;
	switch(dataType) {
		case "CSV":
			processedData = CSVToObj(await dl.text());
			break;
		case "OBJECT":
			processedData = CSVToObj(await dl.text(),",","object");
			break;
		case "TXT":
		default:
			processedData = await dl.text();
	}
	if (storeDataName != "" && !useCache){
		setLocal(storeDataName, UTCString(true));	
	}
	return processedData;
}

function getLocal(id){
	id = id || ""
	if (id != "" && localStorage.getItem(id) != null) {
		return localStorage.getItem(id);
	} else{
		var x = getElem("localStorage" + id)
		if(x != null){
			return x.dataset.localvalue;
		}else{
			return null;
		}
	}
}

function setLocal(id, value,forceHTMLStore = false){
	id = id || "";
	if(id == ""){
		return 0;
	} else{
		value = value || null;
		try{
			forceHTMLStore ? null : localStorage.setItem(id, value);
		} catch(e) {
			forceHTMLStore = true;
		}
		if (forceHTMLStore){
			delLocal(id);
			var x = document.createElement("div");
			x.id = "localStorage" + id;
			x.setAttribute("style", "display:none !important;");
			x.dataset.localvalue = value;
			document.getElementsByTagName("body")[0].appendChild(x);			
		}
		return 1;
	}
}

function delLocal(id){
	localStorage.removeItem(id);
	var x = getElem("localStorage" + id);
	x != null ? x.remove() : null;
}