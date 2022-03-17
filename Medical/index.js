// Global Values
var maxDataSetSize = 30;
var table;
var thead;
var tbody;
var numberOfPanels;
var rowToggle=0;
var columnToggle=0;
var myDataSet=[];
var chartDiv;
var margin;
var width;
var height;
var xScale;
var yScale;
var mouseX;
var mouseY;
var svg;

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

function loaded(){				//Used only for lab work page
 table = document.getElementById('labTable');	//after page loads
 chartDiv = document.getElementById('chartDiv');
 margin = {top: 50, right: 20, bottom: 55, left: 50};
 width  = chartDiv.offsetWidth - margin.left - margin.right;
 height = chartDiv.offsetHeight - margin.top - margin.bottom;
 xScale = d3.scaleBand().range([0, width]);
 yScale = d3.scaleLinear().range([height, 0]);
 correctXScale = d => { return xScale(d.xValues) + width / n / 2; } 

 thead = document.getElementsByTagName('thead');//The thead section
 tbody = document.getElementsByTagName('tbody');//One tbody for each PanelName
 numberOfPanels = tbody.length;			//Remember the count

 graphElems = document.querySelectorAll("[Chart]");
 for(i=0; i<graphElems.length; i++){
  graphElems[i].innerHTML = "<span class='graph' onClick='showGraph(this);'>&#x1F4C8;</span>" + graphElems[i].innerHTML;
 }

 titleElems = document.querySelectorAll("[title]");
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
  if(! x.parentNode.children[i].innerHTML){		//This column cell is empty
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
 for(i=0; i<numberOfPanels; i++){		//Start with first tbody
  var rows = tbody[i].children.length;		//Get number of rows in each tbody
  for(j=1; j<rows; j++){			//Start with first data row
   if(! tbody[i].children[j].children[x].innerHTML){;//If this row cell empty
    tbody[i].children[j].classList.toggle("hide");//Toggle row
   }
  }
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
 mouseX = e.pageX-e.clientX + 200;
 mouseY = e.pageY-e.clientY + 100;
 var dates = thead[0].children[0].children;	//Get thead line with date values
 var values = x.parentNode.parentNode.children;	//Get this lines values
 myDataSet=[];					//Clear the dataSet
 for(i=1; i<values.length; i++){		//Loop through until we reach list length
  if(isNumeric(values[i].innerText)){		//Only use numbers
   myDataSet.unshift({"xValues": dates[i].innerText, "yValues": values[i].innerText});
   if(myDataSet.length === maxDataSetSize){break;}//Stop processing if limit reached
  }
 } 
 if(myDataSet.length === 0){
  alert("Nothing to Graph");
  return;
 }
 ChartTitle = values[0].innerText.substring(2);
 myTitleString = values[0].getAttribute('title');
 ranges = [ null, null];
 if(myTitleString){
  rangeString = myTitleString.match(/-*\d*\.*\d+ - -*\d*\.*\d+/);
  if(rangeString){
   ranges = rangeString[0].split(" - ");
  }
 }
 //Call with title, minus the 2 character graph icon at the beginning of the string
 createChart(ChartTitle,myDataSet,ranges[0],ranges[1]);
}
function isNumeric(value){			//See if string is a number
 return /^-?\d*\.*\d+$/.test(value);		//And only a number
}

function createChart(myTitle,data,lowValue,highValue){	//Create chart
 d3.selectAll('svg').remove();
 chartDiv.style.display="block";
 chartDiv.style.left=mouseX + 20 + "px";
 chartDiv.style.top=mouseY + 20 + "px";
 n = data.length;			//Get length of the data

 yValues = [];
 data.forEach(function(d) {		//Massage the data
  d.xValues = d.xValues;
  d.yValues = +d.yValues;
  yValues.push(d.yValues);
 });
 if(lowValue === null){lowValue = Math.min(...yValues);}
 if(highValue === null){highValue = Math.max(...yValues);}
 minY = Math.min(...yValues,lowValue);
 maxY = Math.max(...yValues,highValue);
 spread = maxY - minY + 1;
 minY = Math.max(0,minY-spread * 0.10);
 maxY = maxY + spread * 0.10;

 var valueline1 = d3.line()		//Build the line 
  .x(function(d) { return correctXScale(d); })
  .y(function(d) { return yScale(d.yValues); })
  .defined(function(d) { return (typeof d.yValues !== 'string'); });

 svg = d3.select("div#chartDiv").append("svg")	//Build the SVG container
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 /*svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "plotArea")*/

 xScale.domain(data.map(function(d) { return d.xValues;}));//Build x-axis values
 /*yScale.domain([d3.min(data, function(d) {		//Build the y-axis values
	return Math.max(Math.min(d.yValues)-5,0);}),//Bottom end
	d3.max(data, function(d) {
	return Math.max(d.yValues);})]);	//Top end of y-axis */
 yScale.domain([minY, maxY]);

 var lines = svg.attr('transform', function(d) {	//Offset by margins
   return 'translate(' + margin.left + ', ' + margin.top + ')'; });

 var tool_tip = d3.tip()				//Routine to build
  .attr("class", "d3-tip")				//tool-tip contents
  .offset([-16, 0])
  .html(function(d) {return d.yValues + "<br>" + d.xValues; });

 svg.call(tool_tip);					//Call it as necessary

 lines.append("path")					//Build the lines we
  .data([data])						//will be plotting
  .attr("class", "line")
  .attr("d",valueline1);

 d3.line()
  .x(function(d) { return correctXScale(d); })
  .y(function(d) { return yScale(d.yValues); })
  //.curve(d3.curveMonotoneX)				//apply smoothing to the line

 svg.append("g")					//Add x-axis
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")

 svg.append("g")					//Add y-axis
  .attr("class", "yaxis")
  .call(d3.axisLeft(yScale).ticks(6).tickSize([-width]));

 svg.append("path")
  .datum(data)						//Bind data to the line 
  .attr("class", "line")				//Assign a class for styling 
  .attr("d", valueline1);				//Call the line generator 

 svg.selectAll(".dot")
  .data(data)
  .enter().append("circle") // Uses the enter().append() method
  .attr("class", "dot") // Assign a class for styling
  .attr("cx", function(d) { return correctXScale(d); })
  .attr("cy", function(d) { return yScale(d.yValues); })
  .attr("r", 5)
  .style('fill',function(d,i){
	if(d.yValues < lowValue){ 
			return 'blue';
		} else if(d.yValues <= highValue) {
			return 'white';
		} else {
			return 'red';
		}
	})
  .on('mouseover', function(a,b,c){
	c[b].classList.toggle('focus');
	tool_tip.show(a);})
  .on('mouseout', function(a,b,c){
	c[b].classList.toggle('focus');
	tool_tip.hide(a);})

 svg.append("text")	//Add title
  .attr("x", (width / 2))             
  .attr("y", 8 - (margin.top / 2))
  .attr("text-anchor", "middle")  
  .style("font-size", "16px") 
  .style("fill", "ivory")
  .text(myTitle);
}
function closeIt(){
 d3.selectAll('svg').remove();
 chartDiv.style.display='none';
}
