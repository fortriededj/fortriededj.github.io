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

function loaded(){				//After window is loaded
	//alert(window.innerWidth + " X " + window.innerHeight);
	__ReadFiles('./DKF_Labs.json',pageLoaded);	//Read list of files
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
	str = str + "</colgroup>\n<thead>\n\t<tr>\n\t\t<th>Daniel Fortriede</th>\n";
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
			str = str + "\t<tr id='row_" +
				rows + "'><th onclick='toggleRow(" +
				rows + ")'>" + T +
				"<span><i class='fa fa-filter'></i></span></th>\n";
			/*console.log("\t"+T);
			console.log("\t\t"+Data[P][T].Graphable);
			console.log("\t\t"+Data[P][T].Info);
			console.log("\t\t"+Data[P][T].Range);
			console.log("\t\t"+Data[P][T].Low);
			console.log("\t\t"+Data[P][T].High);*/
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
					rows + "," + d + ")'>" + 
					V + "</td>\n";
			}
			str = str + "\t</tr>\n";
			rows++;
		}
		str = str + "</tbody>\n";
	}

	str = str + "</table></html>";
	myDoc.innerHTML = str;

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
}
function formatDate(x){
	y = new Date(x*1000);
	a = y.getFullYear().toString();
	z = y.getDate() + '<br>' + 
		Months[y.getMonth()] + '<br>' +
		a.substring(2,4) + '<br>' +
		'<span><li class="fa fa-filter"></li></span>';
	return z;
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
