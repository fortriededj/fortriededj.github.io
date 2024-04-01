var Months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var COLUMNS=[];
var DATES=[];
var PANELHEADERS=[];
var PANELS=[];
var ROWS=[];
var CELLS=[];
var lastFilteredCol=-1;
var lastFilteredRow=-1;
var rows = 0;
var cols = 0;
var Dates;
var xchartDiv;

function loaded(){				//After window is loaded
	//alert(window.innerWidth + " X " + window.innerHeight);
	whichOne = window.location.search.substring(1);
	__ReadFiles(whichOne,pageLoaded);	//Read file
}						//Then go to loadPage

function pageLoaded(fileContentsArray) {
	// File 0 is our json file
	myDoc = document.getElementById('myBody');
	str = "";
	arr = JSON.parse(fileContentsArray[0]);

	// Get array of dates
	Dates = arr.Dates.reverse();
	cols = Dates.length;

	// Start table and add colgroup
	str = str + "<table id='myTable'>\n<colgroup><col>\n";
	// One <col> per User and Dates
	for(let i = 0; i<cols; i++){
		str = str + "\t<col id='Col_" + i + "'>\n";
	}
	// Add user and dates
	str = str + "</colgroup>\n<thead>\n\t<tr>\n\t\t" +
		"<th>Click <u>Row</u> or <u>Column</u> heading to filter, <u>Panel</u> name to collapse.</th>\n";
	for(let i = 0; i<cols; i++){
		str = str + "\t\t<th id='Date_" +
			i + "' onclick='toggleColumn(" +
			i + ")'>" + formatDate(Dates[i]) + 
			"</th>\n";
	}
	str = str + "\t</tr>\n";
	str = str + "</thead></tr>";


	// Get PanelNames
	Data = arr.DATA;
	rows=0;
	PanelNames = Data.PanelOrder;
	for(p=0; p<PanelNames.length; p++){
		P = PanelNames[p];
		str = str + "<thead id='thead_" +
			p + "' onclick='togglePanel(" + 
			p + ")'>\n\t<tr colspan='" + 
			(cols + 1) + "'>" + 
			"\t\t<th>" + 
			P + 
			"</th>" + '<th> </th>'.repeat(cols) +
			"</tr>\n</thead>\n<tbody id='tbody_" + 
			p + "'>\n";
		TestNames = Data["PanelOrder_" + P];
		for(t=0; t<TestNames.length; t++){
			T = TestNames[t];
			Graphable = Data[P][T].Graphable;
			Info = Data[P][T].Info;
			Low = Data[P][T].Low;
			High = Data[P][T].High;
			Range = Data[P][T].Range;
			str = str + "\t<tr id='row_" +
				rows + "'><th onclick='toggleRow(" +
				rows + ")'" + 
				createTitle(Info,Range) + '>' + T;
			if(Info || Range){
				str = str + '<span class="titleinfo" ' + 
					'onclick="showTitle(this);"> </span>';
			}
			if(Graphable == 'True'){
				str = str + '<span class="graphable" ' +
					'onclick="showGraph(this,' +
					Low + ',' + High + ');"> </span>';
			}
			str = str + "</th>\n";
			for(d=0; d<Dates.length; d++){
				D=Dates[d];
				if(Data[P][T][D] == null){
					V=" ";
				} else {
					V=Data[P][T][D]['Value'];
				}
				str = str + "\t\t<td id='R" +
					rows + 'C' + d + "#' " +
					"onMouseover='toggleHighlight(" + 
					rows + "," + d + ")' " + 
					"onMouseout='toggleHighlight(" + 
					rows + "," + d + ")' class='" +
					classify(Graphable,Low,High,V) + "'>" + 
					V + "</td>\n";
			}
			str = str + "\t</tr>\n";
			rows++;
		}
		str = str + "</tbody>\n";
	}

	str = str + "</table><div id='chartDiv'></div></html>";
	document.body.innerHTML = str;

	/* Now build arrays of things we'll need later
	   Columns 		Array of Col_x		<col>
	   ColumnHeaders	Array of Date_x		<Column Header>
	   PanelHeaders		Array of Thead_x	<Panel Name>
	   Panels		Array of Tbody_x	<Panel Content>
	   Rows			Array of Tests
	   Cells		Array of Individual Cells (RxCy#) */
	for(i=0; i<cols; i++){
		COLUMNS.push(document.getElementById('Col_' + i));
		DATES.push(document.getElementById('Date_' + i));
	}
	for(i=0; i<PanelNames.length; i++){
		PANELHEADERS.push(document.getElementById('thead_' + i));
		PANELS.push(document.getElementById('tbody_' + i));
	}
	for(i=0; i<rows; i++){
		ROWS.push(document.getElementById('row_' + i));
	}
	for(row=0; row<rows; row++){
		CELLS[row]=[];
		for(col=0; col<cols; col++){
			b="R" + row + "C" + col + "#";
			CELLS[row][col]=document.getElementById(b);
		}
	}
	addChartDiv();
}
function createTitle(info,range){
	tArr = [];
	tStr = "";
	if(info !== undefined){ tArr.push(info);}
	if(range !== undefined){ tArr.push('Range: ' + range);}
	if(tArr.length >0){
		tStr = " title='" + tArr.join('&#013;&#010;') + "'";
	}
	return tStr;
}
function classify(Test,Low,High,V){
	if(Test){
		if(V<Low){return 'Low';}
		if(V>High){return 'High';}
	}
	return 'Norm';
}
function formatDate(x){
	y = new Date(x*1000);
	a = y.getFullYear().toString();
	z = y.getDate() + '<br>' + 
		Months[y.getMonth()] + '<br>' +
		a.substring(2,4);
	return z;
}
function dateNumberToString(x){
	return (x.getMonth()+1) + '/' + x.getDate() + '/' + x.getFullYear().toString().substring(2,4);
}

function togglePanel(x){
	PANELHEADERS[x].children[0].children[0].classList.toggle('filtered');
	PANELS[x].classList.toggle('collapsed');
}
function toggleColumn(col){
	for(row=0; row < rows; row++){
		ROWS[row].classList.remove('collapsed');
	}
	if(lastFilteredCol>-1){
		DATES[lastFilteredCol].classList.remove('filtered');
	}

	if(lastFilteredCol === col){
		lastFilteredCol = -1;
	} else {
		for(row = 0; row < rows; row++){
			if(CELLS[row][col].innerText == ""){
				ROWS[row].classList.toggle('collapsed');
			}
		}
		DATES[col].classList.toggle('filtered');
		lastFilteredCol=col;
	}
}
function toggleRow(row){
	for(col=0; col < cols; col++){
		COLUMNS[col].classList.remove('collapsed');
	}
	if(lastFilteredRow>-1){
		ROWS[lastFilteredRow].children[0].classList.remove('filtered');
	}
	if(lastFilteredRow === row){
		lastFilteredRow = -1;
	} else {
		for(col=0; col < cols; col++){
			if(CELLS[row][col].innerText == ""){
				COLUMNS[col].classList.toggle('collapsed');
			}
		}
		ROWS[row].children[0].classList.toggle('filtered');
		lastFilteredRow = row;
	}
}
function toggleHighlight(row,col){
	COLUMNS[col].classList.toggle('highlighted');
	CELLS[row][col].classList.toggle('highlighted');
	DATES[col].classList.toggle('highlighted');
}

function showTitle(x){
	this.event.stopPropagation();
	alert(x.parentNode.parentNode.children[0].getAttribute('title'));
}
function MinMax(mArr){
	let minValue = Infinity;
	let maxValue = -Infinity;
	for (let item of mArr){
		x = parseFloat(item.innerText);
		if(x !== ""){
			if(x < minValue){minValue = item.innerText;}
			if(x > maxValue){maxValue = item.innerText;}
		}
	}
	return [minValue,maxValue];
}
