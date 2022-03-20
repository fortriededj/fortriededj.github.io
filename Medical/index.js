function userLoaded(){
 var myIframe = document.getElementById("medicineIframe");
 var myBody = myIframe.contentWindow.document.body;
 if(parseInt(window.screen.width) > 360){ 
	myIframe.style.width = "520px"; 
 } else {
	myIframe.style.width = "330px";
 }
 myIframe.style.height = parseInt(myBody.scrollHeight) + "px";
 fixPhones();
 doAges();
}

function getDOB(){				//Get the Date of Birth
 var x = document.querySelectorAll(".dob");
 var y = convertStringToDate(x[0].innerHTML);
 return y;
} 

function convertDateToString(x){		//Convert date value to string
 const Months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 var y = Months[x.getMonth()] + " " + x.getDate() + ", " + x.getFullYear();
 return y;
}
function convertStringToDate(x){		//Convert string date to date value
 var i;
 var y = x.split("/");
 for(i=0; i<3; i++){y[i]=parseInt(y[i]);}
 if(y[2]<100){y[2]+=2000;}
 return new Date(y[2],y[0]-1,y[1]);
}

function doAges(){				//Append yy/mm/dd string to all
 var DOB = getDOB();				//Date of Birth and Date values
 var today = new Date();
 var elements = document.querySelectorAll(".dob");
 // Calc how old patient is in yy/mm/dd
 addYMDspan(elements[0],today);
 var elements = document.querySelectorAll(".date");
 // Calc how old patient was on date
 for(i=0; i<elements.length; i++){ addYMDspan(elements[i],DOB); }
}

/* Add span class=age after element which has number of
   years/months/days from the given date */
function addYMDspan(e,fromDate){
  var k = convertStringToDate(e.innerHTML);
  e.innerHTML = convertDateToString(k);
  var l = calcDateDiff(fromDate,k);
  var node = document.createElement("span");
  var textnode = document.createTextNode(l);
  node.appendChild(textnode);
  e.appendChild(node);
  node.classList.add("age");
}

/* Calculate the difference between two dates. (Accurately!) */
function calcDateDiff(fromDate,toDate){
 if(fromDate > toDate){[toDate,fromDate]=[fromDate,toDate]}; //Order dates
 const dd1 = [];
 const dd2 = [];
 dd1["year"] = parseInt(toDate.getFullYear());
 dd1["month"] = parseInt(toDate.getMonth());
 dd1["day"] = parseInt(toDate.getDate());

 dd2["year"] = parseInt(fromDate.getFullYear());
 dd2["month"] = parseInt(fromDate.getMonth());
 dd2["day"] = parseInt(fromDate.getDate());

 var diffYears = dd1["year"]-dd2["year"];
 var diffMonths = dd1["month"]-dd2["month"];
 var diffDays = dd1["day"]-dd2["day"];
 if(diffMonths<0){ borrowYear();}	//If months < 0, borrow 12 months from year
 var diffDate = dd1["day"]-dd2["day"];
 if(diffDate<0){borrowMonth();}		//If days < 0, borrow last months days
 var z=diffYears +"y/"+diffMonths+"m/"+diffDate+"d"; //Construct xxy/xxm/xxd
 return z;				//Return

 function borrowYear(){diffMonths+=12; diffYears--;}
 function borrowMonth(){
  diffMonths--; if(diffMonths<0){borrowYear();}
  lastMonthDays = toDate-new Date(dd1["year"],dd1["month"]-1,dd1["day"]);
  lastMonthDays = parseInt(lastMonthDays/24/3600000);
  diffDate+=lastMonthDays;
 }
}  

function fixPhones(){			//Update all phone and phone2 values
					//To fixed format
 var elements = document.querySelectorAll(".phone, .phone2");
 for (var i=0; i<elements.length; i++) {
  j=(elements[i].innerHTML).trim();
  if(j.indexOf("-") == -1) {		//Dont change if hypen already there
   if(j.length == 7) {			//No area code
    elements[i].innerHTML = j.slice(0,3) + "-" + j.slice(3,7);
   }
   if(j.length == 10) {			//Area code and number
    elements[i].innerHTML = "(" + j.slice(0,3) + ")-" + j.slice(3,6) + "-" + j.slice(6,10);
   }
  }
  if(j.indexOf("tel") == -1) {		//Dont change if tel link already there
   elements[i].innerHTML = "<a href='tel:" + elements[i].innerHTML +
			"'>" + elements[i].innerHTML + "</a>";
  }
 }
}

//From here on is the chart stuff
//Global Values
var table, thead, tbody, numberOfPanels, svg, chartDiv;
var rowToggle=0, columnToggle=0;
var myDataSet=[];
var margin, width, height, xScale, yScale;
var ChartTitle, startPoint, MINY, MAXY;

// Calculate cutoff day -- we initially look back 2 years (ish)
var CutOffYears = 2; var CutOff = Date.now() - CutOffYears * 365*24*60*60*1000;

//Here when we deal with the labTable stuff
function loaded(){				//Used only for lab work page
 table = document.getElementById('labTable');	//after page loads
 thead = document.getElementsByTagName('thead');//The thead section
 tbody = document.getElementsByTagName('tbody');//One tbody for each PanelName
 numberOfPanels = tbody.length;			//Remember the count

 chartDiv = document.getElementById('chartDiv');
 margin = {top: 50, right: 20, bottom: 55, left: 50};
 width  = chartDiv.offsetWidth - margin.left - margin.right;
 height = chartDiv.offsetHeight - margin.top - margin.bottom;
 xScale = d3.scaleBand().range([0, width]);
 yScale = d3.scaleLinear().range([height, 0]);
 correctXScale = d => { return xScale(d.xValues) + width / n / 2; } 

 graphElems = document.querySelectorAll("[Chart]");//Build clickable span for each Chart attribute
 for(i=0; i<graphElems.length; i++){
  graphElems[i].innerHTML = "<span class='graph' onClick='showGraph(this);'>&#x1F4C8;</span>" + graphElems[i].innerHTML;
 }

 titleElems = document.querySelectorAll("[title]");//Same thing for any title
 for(i=0; i<titleElems.length; i++){
  titleElems[i].innerHTML = "<span class='showInfo' onClick='showInfo(this);'>&#x2754;</span>" + titleElems[i].innerHTML;
 }
}

function togglePanel(x){			//Toggle the tbody this
 x.parentElement.classList.toggle("hide");	//header row is a part of
}

function toggleRow(x){				//Show only those columns that
 if(rowToggle && rowToggle != x){		//If lastone is closed and not this one
  toggleRow(rowToggle);				//Then open last one first
 }
 var j = x.parentNode.children.length;		//Use parent because we clicked on TD not TR
 for(i=1; i<j; i++){				//have a value in this row
  if(! x.parentNode.children[i].innerHTML){	//This column cell is empty
   table.getElementsByTagName('col')[i].classList.toggle("narrow"); //Toggle column
  }
 }
 rowToggle = x.parentNode.children[0].classList.toggle("narrow") && x;//Update test name field and
						//remember if we closed or opened it
}

function toggleColumn(x){			//Show only those rows that have a
 if(columnToggle && columnToggle != x){		//value in this column
  toggleColumn(columnToggle);
 }
 var toggleFlag = false;
 for(i=0; i<numberOfPanels; i++){		//Start with first tbody
  var rows = tbody[i].children.length;		//Get number of rows in each tbody
  for(j=1; j<rows; j++){			//Start with first data row
   if(! tbody[i].children[j].children[x].innerHTML){;//If this row cell empty
    tbody[i].children[j].classList.toggle("hide");//Toggle row
   } else {toggleFlag = true;}			//Did we find any that we didn't toggle
  }
 }
 if(! toggleFlag){				//Didn't find anything in this column
  for(i=0; i<numberOfPanels; i++){		//Toggle back
   var rows = tbody[i].children.length;
   for(j=1; j<rows; j++){tbody[i].children[j].classList.toggle("hide");}
  }
  confirm("This column only indicates that event\n\t'" +
	thead[0].children[0].children[x].children[0].getAttribute('title') +
	"'\noccured on this date.\n\n" +
	"There was no blood test on this date.")
  return;
 }
 columnToggle = thead[0].children[0].children[x].classList.toggle("hide") && x;	//Update column header
						//remember if we closed or opened it
}

function showInfo(x){				//For those without mouse
 var e = this.event;				//If user clicks on icon
 e.stopPropagation();
 alert(x.parentNode.getAttribute("title"));	//Alert this element's title string
}

function showGraph(x){				//Show graph of this item
 var e= this.event;
 e.stopPropagation();				//Stop any other functions
 document.getElementById('showMore').classList.remove('toggled');
 var dates = thead[0].children[0].children;	//Get thead line with date values
 var values = x.parentNode.parentNode.children;	//Get this lines values
 /*d = new Date();
 var CutOffYear = d.getFullYear()%100 - CutOffYears;//Go back x years from here */
 startPoint = 0;
 myDataSet=[];					//Clear the dataSet
 for(i=1; i<values.length; i++){		//Loop through until we reach list length
  if(isNumeric(values[i].innerText)){		//Only use numbers
						//shift onto stack
   myDataSet.unshift({"xValues": dates[i].innerText, "yValues": values[i].innerText});
   if(!startPoint){				//Have we found a starting point yet
    x = Date.parse(dates[i].innerText);
    if(x<CutOff){ startPoint = myDataSet.length - 1;}//Found starting point
   }
  }
 } 
 if(myDataSet.length === 0){
  alert("Nothing to Graph");
  return;
 }
 if(startPoint){
  startPoint=myDataSet.length-startPoint;
 }

 ChartTitle = values[0].innerText.substring(2);
 myTitleString = values[0].getAttribute('title');
 ranges = [ null, null];
 if(myTitleString){
  rangeString = myTitleString.match(/-*\d*\.*\d+ - -*\d*\.*\d+/);
  if(rangeString){
   ranges = rangeString[0].split(" - ");
   MINY = ranges[0];
   MAXY = ranges[1];
  }
 }
 //Call with title, minus the 2 character graph icon at the beginning of the string
 createChart(ChartTitle,startPoint,MINY,MAXY);
}
function isNumeric(value){			//See if string is a number
 return /^-?\d*\.*\d+$/.test(value);		//And only a number
}

function createChart(myTitle,startAt,MINY,MAXY){//Create chart
 d3.selectAll('svg').remove();		//Remove existing svg, if any
 chartDiv.style.display="block";	//See the chart div
 chartDiv.style.left=240 + "px";	//Where to put it
 chartDiv.style.top=120 + "px";

 data = myDataSet.slice(startAt);	//Pull off only part we want
 n = data.length;			//Get length of the dataset
 x = parseInt((29+n)/30);
 tickFrequency = Math.max(1,x);
 dotSize = Math.max(3,6-x);

 yValues = [];				//Place to store so we can massage later
 data.forEach(function(d) {		//Massage the data
  d.xValues = d.xValues;
  d.yValues = +d.yValues;
  yValues.push(d.yValues);
 });

 /*  [low|high]Value = bottom and top of the defined range
     [min|max]Y = bottom and top of the y-axis */
 if(MINY === null){MINY = Math.min(...yValues);}	//If now lowvalue, use lowest we see
 if(MAXY === null){MAXY = Math.max(...yValues);}	//Same for high
 minY = Math.min(...yValues,MINY);				//Get yaxis min value
 maxY = Math.max(...yValues,MAXY);				//Get yaxis max value
 spread = maxY - minY;
 minY = Math.max(0,minY-spread * 0.10);				//Make yaxis slightly larger than needed
 maxY = maxY + spread * 0.10;
 spread = Math.max(1,(maxY - minY));				//Recalc yaxis spread
 stop2 = Math.round((maxY-MAXY)/spread*100);		//Must be at least 1 or
 stop4 = Math.round((maxY-MINY)/spread*100);		//you can't divide by zero
 stop3 = Math.round((stop4 - stop2)/2 + stop2);
 stop2 += '%';stop3 += '%';stop4 += '%';

 var valueline1 = d3.line()					//Build the line 
  .x(function(d) { return correctXScale(d); })
  .y(function(d) { return yScale(d.yValues); })
  .defined(function(d) {return (typeof d.yValues !== 'string'); });

 svg = d3.select("div#chartDiv").append("svg")	//Build the SVG container
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 var defs = svg.append('defs');		//Build the gradient
 plotAreaTop = defs.append('linearGradient')
  .attr('id','gradTop')
  .attr('x1', '0') .attr('y1', '0') .attr('x2', '0') .attr('y2', '1')

 plotAreaTop.append('stop')
  .attr('offset', '0%' ) .attr('stop-color', '#ff0000') .attr('stop-opacity', '0.6');
 plotAreaTop.append('stop','stop')
  .attr('offset', stop2) .attr('stop-color', '#ff0000') .attr('stop-opacity', '0.05');
 plotAreaTop.append('stop','stop','stop')
  .attr('offset', stop2) .attr('stop-color', '#ffffff') .attr('stop-opacity', '0');
 plotAreaTop.append('stop','stop','stop','stop')
  .attr('offset', stop4) .attr('stop-color', '#ffffff') .attr('stop-opacity', '0');
 plotAreaTop.append('stop','stop','stop','stop','stop')
  .attr('offset', stop4) .attr('stop-color', '#0000ff') .attr('stop-opacity', '0.05');
 plotAreaTop.append('stop','stop','stop','stop','stop','stop')
  .attr('offset','100%') .attr('stop-color', '#0000ff') .attr('stop-opacity', '0.6');

 svg.append("rect")			//Build a white backdrop box
  .attr("width", width)			//to cover the plot area
  .attr("height", height)		//This way the transparency goes
  .attr("x",0)				//against white instead of
  .attr("y",0)				//black
  .attr("fill", "white")
 svg.append("rect")			//Now build box that gets
  .attr("width", width)			//the gradient we defined above
  .attr("height", height)
  .attr("x",0)
  .attr("y",0)
  .attr("fill", "url(#gradTop)")

 xScale.domain(data.map(function(d) { return d.xValues;}));//Build x-axis values
 yScale.domain([minY, maxY]);		//And y-axis

 var lines = svg.attr('transform', function(d) {//Offset by margins
   return 'translate(' + margin.left + ', ' + margin.top + ')'; });

 var tool_tip = d3.tip()		//Routine to build
  .attr("class", "d3-tip")		//tool-tip contents
  .offset([-16, 0])
  .html(function(d) {return d.yValues + "<br>" + d.xValues; });

 svg.call(tool_tip);			//Call it as necessary

 lines.append("path")			//Build the line we
  .data([data])				//will be plotting
  .attr("class", "line")
  .attr("d",valueline1);

 svg.append("g")			//Add x-axis
  .attr("class", "xaxis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.
	axisBottom(xScale)
	.tickFormat((interval,i) => {
		return i%tickFrequency !== 0 ? " ": interval;
	}))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")

 svg.append("g")			//Add y-axis
  .attr("class", "yaxis")
  .call(d3
	.axisLeft(yScale)
	.ticks(5)
	.tickSize([-width]));

 svg.append("path")
  .datum(data)				//Bind data to the line 
  .attr("class", "line")		//Assign a class for styling 
  .attr("d", valueline1);		//Call the line generator 

 svg.selectAll(".dot")
  .data(data)
  .enter().append("circle")		//Uses the enter().append() method
  .attr("class", "dot")			//Assign a class for styling
  .attr("cx", function(d) { return correctXScale(d); })
  .attr("cy", function(d) { return yScale(d.yValues); })
  .attr("r", dotSize)			//Dot radius is 5
  .style('fill',function(d,i){		//Set color depending on value
	if(d.yValues < MINY){ 
		return 'blue';
	} else if(d.yValues <= MAXY) {
		return '#898';
	} else {
		return 'red';
	}
  })
  .on('mouseover', function(a,b,c){	//On mouseover show tool tip
	c[b].classList.toggle('focus');
	tool_tip.show(a);})
  .on('mouseout', function(a,b,c){	//On mouseout hide tool tip
	c[b].classList.toggle('focus');
	tool_tip.hide(a);})

 svg.append("text")			//Add title
  .attr("x", (width / 2))             
  .attr("y", 8 - (margin.top / 2))
  .attr("text-anchor", "middle")  
  .style("font-size", "16px") 
  .style("fill", "ivory")
  .text(myTitle);
}
function toggleMore(){
 if(document.getElementById('showMore').classList.toggle('toggled')){
  createChart(ChartTitle,0,MINY,MAXY);
 } else {
  createChart(ChartTitle,startPoint,MINY,MAXY);
 }
}
function closeIt(){
 d3.selectAll('svg').remove();
 chartDiv.style.display='none';
}
