var MonthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var theadCounter=1;
var tbodyCounter=1;
var ColumnCount=0;
var myTbl;
function windowIsLoaded(){
	myTbl = document.getElementById('myTable');
	doAddColumnIDs();
	fixColumnDates();
	doPanelToggleSetUp();
}
/* Fix column date to mm/<br>dd/<br>yy format */
function fixColumnDates(){
	e = myTbl.getElementsByTagName('thead');
	ds = e[0].children[0].children;
	for(let i=1; i<ds.length; i++){
		let arr = ds[i].innerHTML.split('/');
		ds[i].innerHTML = [arr[1],MonthNames[arr[0]-1],arr[2]].join('<br>') +
			"<br><span><i class='fa fa-filter'></i></span>";
	}
}
/* Add col_x to each col */
function doAddColumnIDs(){
	mCOLS = myTbl.getElementsByTagName('col');
	ColumnCount=mCOLS.length;
	for(let i=1; i<mCOLS.length; i++){
		mCOLS[i].id='col_' + i;
	}
}
/* Add onclick to each panel name to toggle panel contents */
function doPanelToggleSetUp(){
	tHeads = myTbl.getElementsByTagName('thead');
	/* &#128269; */
	for(let i=1; i<tHeads.length; i++){
		tHeads[i].innerHTML =	'\n<tr colspan="' + ColumnCount + 
					'" onclick="togglePanel(' + 
					theadCounter + ')"><th>' +
					'<span>&#128269;-</span>' + 
					tHeads[i].children[0].innerText + '</th>' + 
					'<th></th>'.repeat(ColumnCount-1) + '</tr>\n';
		theadCounter++;
	}
	tBodys = myTbl.getElementsByTagName('tbody');
	for(let i=0; i<tBodys.length; i++){
		tBodys[i].id='tbody_' + tbodyCounter;	//Add tbody ids
		tHeads[i].id='thead_' + tbodyCounter;
		tHeads[i].children[0].data = theadCounter;
		tbodyCounter++;
		doColumnHighlightSetUp(tBodys[i]);
	}
}
/* Add mouseover/mouseout for each td in tbody */
function doColumnHighlightSetUp(e){
	for(let i=0; i<e.children.length; i++){
		tds = e.children[i].children;
		for(let j=1; j<tds.length; j++){
			tds[j].x=j;
			tds[j].addEventListener('mouseover',addMouseOverTD,false);
			tds[j].addEventListener('mouseout',addMouseOutTD,false);
		}
	}
}
function addMouseOverTD(e){ mouseOverTD(e.currentTarget.x);}
function addMouseOutTD(e){ mouseOutTD(e.currentTarget.x);}
/* Toggle given panel */
function togglePanel(x){
	e = document.getElementById('tbody_' + x);
	if(e.style.visibility === 'collapse'){
		e.style.visibility = 'visible';
		} else {
		e.style.visibility = 'collapse';
	}
	y = x + 1;
	/* Reference thead>tr>th>span */
	e = document.getElementById('thead_' + y).children[0].children[0].children[0];
	if(e.innerHTML.includes('-')){
		e.innerHTML = '&#128270;+';
	} else {
		e.innerHTML = '&#128269-';
	}
}
function mouseOverTD(x){
	e = document.getElementById('col_' + x);
	e.style.backgroundColor='rgba(0,255,0,.25)';
}
function mouseOutTD(x){
	e = document.getElementById('col_' + x);
	e.style.backgroundColor='transparent';
}
