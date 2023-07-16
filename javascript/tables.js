---
layout: blank
---
//Version {{ site.version_number }}
//{{ site.urllive }}

//Date Check Format dd/mm/yyyy - 01/01/0000 to 31/12/9999
const regExDate = /^(((0[1-9]|[12][0-9]|3[01])[/](0[13578]|1[02])|(0[1-9]|[12][0-9]|30)[/](0[469]|11)|(0[1-9]|1\d|2[0-8])[/]02)[/]\d{4}|29[/]02[/](\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00))$/;
//Currency Check Format £#.## with or without thousands seperator
const regExCurrency = /^(\£)([1-9]{1}[0-9]{0,2})(\,\d{3})*(\.\d{2}){1}$|^(\£)([1-9]{1}[0-9]{0,2})(\d{3})*(\.\d{2}){1}$/;
docReady(function () {
	tableCollapse(true);
});

function viewPopOutDetails(tableid, rowID){
	var table = JSON.parse(getLocal("localTable" + tableid))
	//row = table[rowID].forEach(c => removeContainer(c, containerRowData));
	var colTypes = JSON.parse(getContainerVal(table[0][0], containerColTypes)); 
	table[0][0] = removeContainer(removeContainer(table[0][0],containerColData),containerColTypes);
	var header = "Additional Information";
	var modalHTML = "";
	table[rowID].forEach((arrayItem, index, fullArray) => {
		modalHTML += arrayItem != "" ? table[0][index] + ": " + displayType(removeContainer(arrayItem, containerRowData),colTypes[index]) + "<hr/>" : "";
	})
	message(modalHTML, header);
}

function tableToArray(id) {
  rows = getElem(id).rows;
  tableArray = [];
  for (var i = 0; i < rows.length; i++) {
    cell = rows[i].children;
    rowArray = [];
    for (var j = 0; j < cell.length; j++) {
      rowArray.push(cell[j].innerText);
    }
    tableArray.push(rowArray);
  }
  return tableArray;
}

function tableCollapse(pageLoad, table){
	pageLoad = pageLoad || false;
	table = table || null;
	var tables = [];
	if(table != null){tables.push(table)} else{tables = getClass("break-table");}
	for (var i = 0; i < tables.length; i++) {
		var thead = getTags("THEAD", tables[i])[0];
		var headers = getTags("th", thead);
		var tbody = getTags("TBODY", tables[i])[0];
		var cellRows = getTags("tr", tbody);
		for (var j = 0; j < cellRows.length; j++) {
			var cells = getTags("td", cellRows[j]);
			for (var k = 0; k < cells.length; k++) {
				var cellContent  = "";
				if(pageLoad){cellContent = cells[k].innerHTML;} else{cellContent = getClass("tablerowcontent", cells[k])[0].innerHTML;}
				
				cells[k].innerHTML = "<b class='tablrowheader'>" + headers[k].innerHTML + "</b><span class='tablerowcontent'>" + cellContent + "</span><hr />";
			}
        }
		updateTableStriping(tables[i])
    }
}

function GetBetweenStrings(strSource, strStart, strEnd){
	strSource = strSource.toString();
	var Start, End;
	if (strSource.includes(strStart) && strSource.includes(strEnd))
	{
		Start = strSource.indexOf(strStart) + strStart.length;
		End = strSource.indexOf(strEnd);
		return strSource.substring(Start, End);
	}
	else
	{
		return "";
	}
}

function removeContainer(strSource, container) {
	var containerVal = getContainerVal(strSource, container);
	if (containerVal != "") {
		return strSource.replace("[" + container + "START{" + containerVal + "}" + container + "END]", "");
	}
	else {
		return strSource;
	}
}
function getContainerVal(strSource,container){
	 return GetBetweenStrings(strSource, "[" + container + "START{","}" + container + "END]")
}

function createContainer(txt, container) {
	return txt !== "" ? "[" + container + "START{" + txt + "}" + container + "END]" : "";
}

function editContainer(strSource,newtxt,  container) {
	strSource = removeContainer(strSource, container);
	return createContainer(newtxt, container) + strSource;
}

function createTableBody(data,tableid,page){
	page = page || 1;
page=page*1;
	var rows = getElem('perPage' + tableid).value *1;
	setLocal("localTable" + tableid, JSON.stringify(data));
	var hideCols = getContainerVal(data[0][0], containerColData);
	var colTypes = JSON.parse(getContainerVal(data[0][0], containerColTypes)); 
	data[0][0] = removeContainer(removeContainer(data[0][0], containerColData),containerColTypes);
	hideCols = hideCols == "" ? [] : hideCols.split("");
	var tablebodyinner = "<tbody>";	
	var rowsCount = 0;
	for(var i = 1; i < data.length; i++){
		var row = data[i];
		if(!(getContainerVal(row[0], containerRowData).includes("0"))){
			rowsCount++;
			if((rowsCount>(rows*(page-1))) && (rowsCount<=(rows*page))){
				tablebodyinner += "<tr>";
				if (hideCols.includes("0")) {
					row.push("<span onclick='viewPopOutDetails(\"" + tableid + "\"," + i + ")'>Click Here</span>");
					//hideCols.push("1");
				}
				for(var j = 0; j < row.length; j++){
					if(hideCols[j] == "1"){
						tablebodyinner += "<td><b class='tablrowheader'>" + data[0][j] + "</b><span class='tablerowcontent'>" + displayType(removeContainer(row[j],containerRowData),colTypes[j]) + "</span><hr /></td>";
					}
				}
				tablebodyinner += "</tr>";
			}
		}
	}
	tablebodyinner += "</tbody>";
	getTags("tbody", getElem(tableid))[0].outerHTML = tablebodyinner;
	pagingHTML(page, rows, rowsCount, "changePage(\"" + tableid + "\")",tableid)
}

const containerRowData = "rowData";
const containerColData = "colData";
const containerColTypes = "colType";
function filterTable(tableid, columnid, search, matchType, hideCols) {
	hideCols = hideCols || [];
	matchType = matchType || 0;
    var searchUpper, table, i;
    searchUpper = search.toUpperCase();
	table = JSON.parse(getLocal("localTable" + tableid));
	var matchStr = "";
    if (table[0].length + 1 > columnid) {
        for (i = 1; i < table.length; i++) {
			matchStr = getContainerVal(table[i][0],containerRowData);
			matchStr = matchStr == "" ? Array(table[0].length).fill(1) : matchStr.split("");
			if(columnid > -1){
					matchStr[columnid] = 1;
					if(search != ""){
						if (!(table[i][columnid].toUpperCase().indexOf(searchUpper) > -1 && ((matchType == 0) || (matchType == 1 && table[i][columnid] == search)))) {
							matchStr[columnid] = 0;
						}
					}
			} else if(columnid === -1){
				matchStr[table[0].length] = 1;
				if(!(table[i].filter(a => a.toUpperCase().indexOf(searchUpper) > -1)).length>0){
					matchStr[table[0].length] = 0;
				}
			}
			table[i][0] = editContainer(table[i][0], matchStr.join(""),containerRowData);
        }
    }
	createTableBody(table, tableid)
}

function updateTableStriping(table){//required for hiding rows
	tbody = getTags("tbody", table);
	if(tbody.length == 0){return;}
	trows = getTags("tr", tbody[0]);
	var visibleRows = 0;
	for (i = 0; i < trows.length; i++) {
		trows[i].classList.remove("treven");
        if (!(trows[i].style.display === "none")) {
			visibleRows++;
			var isEvenRow = visibleRows%2;
			if (visibleRows%2==0){
				trows[i].classList.add('treven');
			}	
		}	
	}	
}

//join columns: [{col1, col2, col3...},deliminator] i.e. [{"Home Team","Away Team"}," v "] => Home Team v Away Team
//filter types: "txt", "dropdown", "range" (number), "table" (no column name only text box allowed)
//settings input [{colName, filterType, hide,colType}]
//strarray hidecols match column header name

function createTable(data, id, settings){//add column hide and pop out code
	settings = settings || [];
	//hideCols = hideCols || [];
	var hideCols = settings.filter(e => e.hasOwnProperty('colName') && e.hide == 1).map(f=> f.colName.toLowerCase());
	var showCols = Array(data[0].length).fill("1");
	var colTypes = Array(data[0].length).fill("0");
	var tableinner = "";
	var row = data[0];
	var filtersFor = getElem("filtersFor" + id);
	filtersFor == null ? null : filtersFor.remove();
	var filterHTML = (settings.length > 0 && settings.filter(a => a.hasOwnProperty('filterType') ? a.filterType.toLowerCase() === "table" : false).length > 0) ? '<label class="fixed-quarter">Whole Table Filter</label><input class="fixed-three-quarter" value="" onkeyup="filterTable(\'' + id + '\',-1,this.value)" id="inpTableFilter' + id + '">':"";
	var filtersCount = filterHTML == "" ? 0 : 1;
	tableinner += "<thead>";
	tableinner += "<tr>";	
	for (var j = 0; j < row.length; j++){
		var colType = settings.filter(a =>a.hasOwnProperty('colType') ? a.colName.toLowerCase() === row[j].toLowerCase() : false);
		if(colType.length > 0){
			colTypes[j] = colType[0].colType;
		}
		if (hideCols.includes(row[j].toLowerCase())) {
			showCols[j] = "0";
		} else {
			var cellTag = "th onclick=\"sortTable('" + id + "', " + j + ")\"";
			tableinner += "<" + cellTag + ">" + row[j] + "</th>";
		}
		var isFilter = settings.filter(a =>a.hasOwnProperty('filterType')&&a.hasOwnProperty('colName') ? a.colName.toLowerCase() === row[j].toLowerCase() : false)
		if (isFilter.length > 0){
			filtersCount++;
			switch(isFilter[0].hasOwnProperty('filterType') ? isFilter[0].filterType.toLowerCase() : "txt") {
			  case "dropdown":
				filterHTML += '<hr/><label class="fixed-quarter">' + row[j] + '</label><select data-deselectable="1" id="slcFilter'+ id + j + '" class="fixed-three-quarter" value="" onchange="filterTable(\'' + id + '\',' + j + ',this.value,1)"><option selected="" disabled=""></option>';
				var uniqueColumnArr = [...new Set(data.map(a => a[j]))];
				for(var k = 1; k < uniqueColumnArr.length; k++){
					filterHTML += '<option value="' + uniqueColumnArr[k] + '">' + uniqueColumnArr[k] + '</option>';
				}
				filterHTML += '</select>';
				break;
			  case "range"://dependancy on slider code...html can be modified to use default input range
				var uniqueColumnArr = JSON.stringify([...new Set(data.shift().map(a => a[j]))]);
				filterHTML += '<hr/><div class="rangeContainer" data-values="' + uniqueColumnArr + '" data-outputelem="spnFilter'+ id + j + '" data-outputformelem="slcFilter'+ id + j + '" data-handles="1"></div><input style="display:none;" id="slcFilter'+ id + j + '" onchange="filterTable(\'' + id + '\',' + j + ',this.value,1)"><div id="spnFilter'+ id + j + '"></div>'
				break;
			  case "txt":
				filterHTML += '<hr/><label class="fixed-quarter">' + row[j] + '</label><input class="fixed-three-quarter" value="" onkeyup="filterTable(\'' + id + '\',' + j + ',this.value)" id="inpFilter' + id + j + '">';
			} 
		}
	}
	if (showCols.includes("0")) {
		tableinner += "<th>Extra Info</th>";
showCols.push("1");
	}
	tableinner += "</thead><tbody></tbody>";
	data[0][0] = createContainer(showCols.join(""), containerColData) + data[0][0];
	data[0][0] = createContainer(JSON.stringify(colTypes), containerColTypes) + data[0][0];
	var tableDOM = getElem(id);
	tableDOM.innerHTML = tableinner;
	filterHTML != "" ? tableDOM.insertAdjacentHTML("beforebegin", "<div id='filtersFor" + id + "'>" +filterHTML + "<hr/></div>") : null;
	tableDOM.insertAdjacentHTML("beforebegin", '<label class="fixed-quarter">Rows Per Page</label><select class="fixed-three-quarter" id="perPage' + id + '" onchange="changeRowsPerPage(\'' + id + '\')"><option value="20">20</option><option value="50">50</option><option value="250">250</option><option selected="selected" value="500">500</option><option value="1000">1000</option></select><hr/>');
	createTableBody(data, id)
	initiDropdowns();//dependancy on dropdown code
	reinitsliders();//dependancy on slider code
}

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
		case "image":
			href = txt.startsWith("http") ? txt : "https://"+txt;
			txt = "<img style='max-height: 50px;max-width: 50px;' src='" + href + "'>";
			break;
		case "weblink":
			href = txt.startsWith("http") ? txt : "https://"+txt;
			break;
		default:
			html = txt;
	} 
	return (html == "" && href != "") ? "<a target='_blank' href='" + href + "'>" + txt + "</a>" : html;
}


function sortTable(tableid, col, sortdir) {
	var e = e || window.event;
	e.preventDefault();
	var target = e.target;
	sortdir = sortdir || null;
	var table, rows, i, x, y, dir, arr = [];

	table = JSON.parse(getLocal("localTable" + tableid));
	
	dir = sortdir || 1; 
	target.setAttribute("onclick","sortTable(\"" + tableid + "\", " + col + ", " + dir * -1 + ")");
	table.sort(function(a,b){
		if (a !== table[0] && b !== table[0]) {
			sorta = a[col].toString().toLowerCase();
			sortb = b[col].toString().toLowerCase();
			if(regExCurrency.test(sorta)){sorta = StringReplaceAll(StringReplaceAll(sorta, "£", ""), ",","");}
			if(regExCurrency.test(sortb)){sortb = StringReplaceAll(StringReplaceAll(sortb, "£", ""), ",","");}
			if(!(isNaN(sorta))){sorta = sorta * 1;}
			if(!(isNaN(sortb))){sortb = sortb * 1;}
			if(regExDate.test(sorta)){var aDateParts = sorta.split("/"); sorta = new Date(aDateParts[2], aDateParts[1], aDateParts[0]).getTime();}
			if(regExDate.test(sortb)){var bDateParts = sortb.split("/"); sortb = new Date(bDateParts[2], bDateParts[1], bDateParts[0]).getTime();}
			if(sorta < sortb){ return -1 * dir;}
			if(sorta > sortb){ return 1 * dir;}
			return 0;
		}
	});
	createTableBody(table, tableid)
}

function showHideColumn(id, colArr, show) {
    var rows = getElem(id).rows;    
    for (var row = 0; row < rows.length; row++) {
        var cols = rows[row].cells;
		for (var col = 0; col < colArr.length; col++) {
			if (colArr[col] >= 0 && colArr[col] < cols.length) {
				cols[colArr[col]].style.display = show ? '' : 'none';
			}
		}
    }
}

function changeRowsPerPage(tableid){
	table = JSON.parse(getLocal("localTable" + tableid));
	createTableBody(table, tableid);
}

function changePage(tableid){
	var e = e || window.event;
	e.preventDefault();
	var target = e.target;
	var page = target.dataset.page;
	table = JSON.parse(getLocal("localTable" + tableid));
	createTableBody(table, tableid,page);
}

function pagingHTML(PageNumber, RowsPerPage, TotalRows, fnString,pagingItemID){
	PageNumber=PageNumber*1;
	RowsPerPage=RowsPerPage*1;
	TotalRows=TotalRows *1;
	var TotalPages = Math.ceil(TotalRows / RowsPerPage);
	var Page_MinusTwo = PageNumber - 2;
	var Page_MinusOne = PageNumber - 1;
	var Page_PlusOne = PageNumber + 1;
	var Page_PlusTwo = PageNumber + 2;
	if (TotalRows == 0) { PageNumber = 0; }
	var HTML = "<div id='paging"+pagingItemID+"' class='pagingControls'><span>Page " + PageNumber + " of " + TotalPages + "</span><div>";
	var onClick = "onclick='" + fnString + "'";
	if (PageNumber > 1)
	{
		HTML += "<a data-page='1'  " + onClick + "><<</a>"; // first
		HTML += "<a data-page='" + Page_MinusOne + "'  " + onClick + "><</a>"; // previous
		if (PageNumber >= 3 && TotalPages > 3)
		{
				HTML += "<span>...</span>"; //ellipsis
		}
		if (PageNumber == TotalPages && TotalPages > 2)
		{
			HTML += "<a data-page='" + Page_MinusTwo + "' " + onClick + ">" + Page_MinusTwo + "</a>"; // page -2
		}
		HTML += "<a data-page='" + Page_MinusOne + "' " + onClick + ">" + Page_MinusOne + "</a>"; // page -1
	}
	HTML += "<b>" + PageNumber + "</b>"; // page
	if (PageNumber < TotalPages)
	{
		HTML += "<a data-page='" + Page_PlusOne + "' " + onClick + ">" + Page_PlusOne + "</a>"; // page +1
	}
	if (PageNumber == 1 && TotalPages > 2)
	{
		HTML += "<a data-page='" + Page_PlusTwo + "' " + onClick + ">" + Page_PlusTwo + "</a>"; // page +2
	}
	if (TotalPages > 3 && PageNumber < (TotalPages - 1))
	{
		HTML += "<span>...</span>"; //ellipsis
	}
	if (PageNumber < TotalPages)
	{
		HTML += "<a data-page='" + Page_PlusOne + "' " + onClick + ">></a>"; // next
		HTML += "<a data-page='" + TotalPages + "' " + onClick + ">>></a>"; // last
	}
	HTML += "</div></div>";
	var Elem= getElem('paging'+pagingItemID);
	Elem !=null? Elem.remove():null;
	getElem(pagingItemID).insertAdjacentHTML("afterend", HTML);
	var Elem2= getElem('injectedStylePaging'+pagingItemID);
	if (Elem2 == null){
		var x = document.createElement("style");
		x.id = 'injectedStylePaging'+pagingItemID;
		x.innerHTML+=".pagingControls a{cursor:pointer;padding:10px; display:inline-block;}";
		document.getElementsByTagName("body")[0].appendChild(x);
	}
}