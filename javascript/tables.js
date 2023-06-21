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

function filterTable(tableid, columnid, search, matchType) {
	matchType = matchType || 0;
    var searchUpper, table, trows, i, j, txtValue, tbody, columnHeaders, thead, cell, cells, unmatchedRow;
    searchUpper = search.toUpperCase();
    table = getElem(tableid); 
    thead = getTags("thead", table)[0];
    columnHeaders = getTags("th", thead);
    if (columnHeaders.length + 1 > columnid) {
		tbody = getTags("tbody", table)[0];
        trows = getTags("tr", tbody);
        for (i = 0; i < trows.length; i++) {
            cells = getTags("td", trows[i]);
			if(columnid > -1){
				cell = cells[columnid];
				if (cell) {
					txtValue = getClass("tablerowcontent", cell)[0].innerHTML || cell.textContent || cell.innerText;
					var classesRemove = [ 'FilterMatch', 'UnFilter', 'FilterNoMatch' ];
					removeClasses(cell, classesRemove);
					if(search != ""){
						if (txtValue.toUpperCase().indexOf(searchUpper) > -1 && ((matchType == 0) || (matchType == 1 && txtValue.toUpperCase() == searchUpper))) {
							cell.className += " FilterMatch";
						} else {
							cell.className += " FilterNoMatch";
						}
					}
				}
				cell.className = cell.className.replace(/ +(?= )/g,'');
			} else if(columnid === -1){
				removeClasses(trows[i], ['rowNoMatch'])
				if(!(Array.from(getClass("tablerowcontent", trows[i])).filter(a => a.innerHTML.toUpperCase().indexOf(searchUpper) > -1)).length>0){
					trows[i].className += " rowNoMatch";
				}
			}
			unmatchedRow = trows[i].className.indexOf("rowNoMatch") > -1 ? 1 : 0;
            for (j = 0; j < cells.length; j++) {
                if (cells[j].className.indexOf("FilterNoMatch") > -1) {
                    unmatchedRow++;
                }
            }
            if (unmatchedRow > 0) {
                trows[i].style.display = "none";
            } else {
                trows[i].style.display = "";
            }
        }
    }
	updateTableStriping(table);
}

function updateTableStriping(table){
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
//filter input [{columnName, filterType}]

function createTable(data, id, filters){
	filters = filters || [];
	var tableinner = "";
	var row = data[0];
	var filtersFor = getElem("filtersFor" + id);
	filtersFor == null ? null : filtersFor.remove();
	var filterHTML = (filters.length > 0 && filters.filter(a => a.hasOwnProperty('filterType') ? a.filterType.toLowerCase() === "table" : false).length > 0) ? '<div id="filtersFor' + id + '"><label class="fixed-quarter">Whole Table Filter</label><input class="fixed-three-quarter" value="" onkeyup="filterTable(\'' + id + '\',-1,this.value)" id="inpTableFilter' + id + '">':"";
	var filtersCount = filterHTML == "" ? 0 : 1;
	tableinner += "<thead>";
	tableinner += "<tr>";	
	for(var j = 0; j < row.length; j++){
		var cellTag = "th onclick=\"sortTable('" + id + "', " + j + ")\"";
		tableinner += "<" + cellTag + ">" + row[j] + "</th>";
		var isFilter = filters.filter(a =>a.hasOwnProperty('colName') ? a.colName.toLowerCase() === row[j].toLowerCase() : false)
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
			  default:
				filterHTML += '<hr/><label class="fixed-quarter">' + row[j] + '</label><input class="fixed-three-quarter" value="" onkeyup="filterTable(\'' + id + '\',' + j + ',this.value)" id="inpFilter' + id + j + '">';
			} 
		}
	}
	tableinner += "</thead>";
	tableinner += createTableBody(data);
	getElem(id).innerHTML = tableinner;
	tableCollapse(true, getElem(id));
	filterHTML != "" ? getElem(id).insertAdjacentHTML("beforebegin", filterHTML + "<hr/></div>") : null;
	initiDropdowns();//dependancy on dropdown code
	reinitsliders();//dependancy on slider code
}

function createTableBody(data){
	var tablebodyinner = "";	
	for(var i = 1; i < data.length; i++){
		var row = data[i];
		if(i == 1){ tablebodyinner += "<tbody>"; }
		tablebodyinner += "<tr>";
		for(var j = 0; j < row.length; j++){
			var cellTag = "td";
			tablebodyinner += "<" + cellTag + ">" + row[j] + "</" + cellTag + ">";
		}
		tablebodyinner += "</tr>";
	}
	tablebodyinner += "</tbody>";
	return tablebodyinner;
}

function sortTable(tableid, col, sortdir) {
	var e = e || window.event;
	e.preventDefault();
	var target = e.target;
	sortdir = sortdir || null;

	dir = sortdir || 1; 
	target.setAttribute("onclick","sortTable(\"" + tableid + "\", " + col + ", " + dir * -1 + ")");
	var table, rows, i, x, y, dir, arr = [];
	table = document.getElementById(tableid);
  
    rows = table.rows;
	
	var x = table.getElementsByTagName("TBODY")[0];
    for (i = 1; i < rows.length ; i++) {
		var arrItem = {};
		arrItem.sort = rows[i].getElementsByTagName("TD")[col].getElementsByClassName('tablerowcontent')[0].innerHTML;
		arrItem.row = encodeURIComponent(rows[i].outerHTML);
		arr.push(arrItem);
    }
	arr.sort(function(a,b){
		sorta = a.sort.toLowerCase();
		sortb = b.sort.toLowerCase();
		if(regExCurrency.test(sorta)){sorta = StringReplaceAll(StringReplaceAll(sorta, "£", ""), ",","");}
		if(regExCurrency.test(sortb)){sortb = StringReplaceAll(StringReplaceAll(sortb, "£", ""), ",","");}
		if(!(isNaN(sorta))){sorta = sorta * 1;}
		if(!(isNaN(sortb))){sortb = sortb * 1;}
		if(regExDate.test(sorta)){var aDateParts = sorta.split("/"); sorta = new Date(aDateParts[2], aDateParts[1], aDateParts[0]).getTime();}
		if(regExDate.test(sortb)){var bDateParts = sortb.split("/"); sortb = new Date(bDateParts[2], bDateParts[1], bDateParts[0]).getTime();}
		if(sorta < sortb){ return -1 * dir;}
		if(sorta > sortb){ return 1 * dir;}
		return 0;
	});
	//arr.sort((a, b) => a.sort.localeCompare(b.sort))
	x.innerHTML = "";
    for (i = 0; i < arr.length ; i++) {
		var node = document.createElement("tbody");
		node.innerHTML = decodeURIComponent(arr[i].row);
			x.appendChild(node.children[0]);
		//x.innerHTML += decodeURIComponent(arr[i].row);
    }
	updateTableStriping(table);
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