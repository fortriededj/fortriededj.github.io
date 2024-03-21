//Global Values
var table, thead, tbody, numberOfPanels, svg, chartDiv;
var rowToggle=0, columnToggle=0;
var myDataSet=[];
var margin, width, height, xScale, yScale;
var ChartTitle, startPoint, MINY, MAXY;
var toolTip;
var lastToolTip;
var chartDivLeft=300, chartDivTop=50;

// Calculate cutoff day -- we initially look back 2 years (ish)
var CutOffYears = 2; var CutOff = Date.now() - CutOffYears * 365*24*60*60*1000;

//Here when we deal with the labTable stuff
function loaded(){				//Used only for lab work page
 table = document.getElementById('labTable');	//after page loads
 thead = document.getElementsByTagName('thead');//The thead section
 tbody = document.getElementsByTagName('tbody');//One tbody for each PanelName
 numberOfPanels = tbody.length;			//Remember the count

 chartDiv = document.createElement('div');	//Add the chartDiv division
 chartDiv.setAttribute('id','chartDiv');
 d = document.createElement('div');
 d.setAttribute('id','showMore');
 d.addEventListener('click',toggleMore);
 chartDiv.appendChild(d);
 d = document.createElement('div');
 d.setAttribute('id','closer');
 d.addEventListener('click',closeIt);
 chartDiv.appendChild(d);
 toolTip = document.createElement('span');
 toolTip.setAttribute('id','tooltip');
 chartDiv.appendChild(toolTip);
 document.body.appendChild(chartDiv);
 
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

 titleElems = document.querySelectorAll("[questionafter]");//Same thing for any title
 for(i=0; i<titleElems.length; i++){
  titleElems[i].innerHTML = titleElems[i].innerHTML + "<span class='showInfo' onClick='showInfo(this);'>&#x2754;</span>";
 }
 titleElems = document.querySelectorAll("[questionbefore]");//Same thing for any title
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
 startPoint = 0;
 myDataSet=[];					//Clear the dataSet
 for(i=1; i<values.length; i++){		//Loop through until we reach list length
  if(isNumeric(values[i].innerText)){		//Only use numbers
   d = dates[i].innerText;
   v = values[i].innerText;
   n = dates[i].children[0].getAttribute('title');
   myDataSet.unshift({"xValues": d, "yValues": v, "notes": n});
						//shift onto stack
   if(!startPoint){				//Have we found a starting point yet
    x = Date.parse(dates[i].innerText);
    if(x<CutOff){ startPoint = myDataSet.length - 1;}//Found starting point
   }
  }
 } 
 if(startPoint){ startPoint=myDataSet.length-startPoint; }
 if(myDataSet.length === 0){
  alert("Nothing to Graph");
  return;
 }

 ChartTitle = values[0].innerText.substring(2);
 myTitleString = values[0].getAttribute('title');//Elements title string hold range values
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
function isNumeric(value){		//See if string is a number
 return /^-?\d*\.*\d+$/.test(value);	//And only a number
}

function createChart(myTitle,startAt,MINY,MAXY){//Create chart
 d3.select('svg').remove();		//Remove existing svg, if any
 chartDiv.style.display="block";	//See the chart div
 chartDiv.style.left=chartDivLeft + "px";	//Where to put it
 chartDiv.style.top=chartDivTop + "px";

 data = myDataSet.slice(startAt);	//Pull off only part we want
 n = data.length;			//Get length of the dataset
 dataWidth = width/n;			//How wide is each data point on x axis
 lastToolTip = null;			//Forget last tooltip we saw
 x = parseInt((n+29)/30);
 tickFrequency = Math.max(1,x);//How many ticks do we want
 dotSize = Math.max(3,6-x);		//How big is the dot

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
 minY = Math.min(...yValues,MINY);			//Get yaxis min value
 maxY = Math.max(...yValues,MAXY);			//Get yaxis max value
 spread = maxY - minY;
 minY = Math.max(0,minY-spread * 0.10);			//Make yaxis slightly larger than needed
 maxY = maxY + spread * 0.10;
 spread = Math.max(1,(maxY - minY));			//Recalc yaxis spread
 stop2 = Math.round((maxY-MAXY)/spread*100);		//Must be at least 1 or
 stop4 = Math.round((maxY-MINY)/spread*100);		//you can't divide by zero
 stop3 = Math.round((stop4 - stop2)/2 + stop2);
 stop2 += '%';stop3 += '%';stop4 += '%';

 var valueline1 = d3.line()				//Build the line 
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


 lines.append("path")			//Build the line we
  .data([data])				//will be plotting
  .attr("class", "line")
  .attr("d",valueline1);

 svg.append("g")			//Add x-axis
  .attr("class", "xaxis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale)
	.tickFormat((interval,i) => {
		return i%tickFrequency !== 0 ? " ": interval;
	}))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")

 svg.append("g")			//Add y-axis
  .attr("class", "yaxis")
  .call(d3.axisLeft(yScale)
	.ticks(5)
	.tickSize([-width]));

 svg.append("path")
  .datum(data)				//Bind data to the line 
  .attr("class", "line")		//Assign a class for styling 
  .attr("d", valueline1);		//Call the line generator 

 svg.selectAll(".dot")
  .data(data)
  .enter().append("circle")		//Uses the enter().append() method
  .attr("cx", function(d) { return correctXScale(d); })
  .attr("cy", function(d) { return yScale(d.yValues); })
  .attr("r", dotSize)			//Dot radius is 5
  .attr('class',function(d,i){		//Set color depending on value
        if(d.notes){
		return 'dot_note';
	} else if(d.yValues < MINY){ 
		return 'dot_low';
	} else if(d.yValues <= MAXY) {
		return 'dot_norm';
	} else {
		return 'dot_high';
	}
  })

 svg.append("rect")			//Build a transparent overlay box
  .attr("width", width)			//to cover the plot area
  .attr("height", height)		//that we do our mouseover from
  .attr("x",0)
  .attr("y",0)
  .attr("fill", "transparent")
  .attr("zIndex", 20)
  .on('mouseover', function(){toolTip.style.display='inline';})//Show tooltip
  .on('mouseout', function(){toolTip.style.display='none';})//Hide tooltip
  .on('mousemove', function(){
    //Get which slot we are hovering over
    d = Math.max(0,Math.round((d3.mouse(this)[0]-dataWidth/2)/dataWidth));
    if(d == lastToolTip){return}	//If same as last, skip
    //Update the contents of the tooltip
    toolTip.innerHTML = data[d].yValues + 
	"<br>" + data[d].xValues +
	(data[d].notes ? "<br><i>" + data[d].notes + "</i>" : "");
    //Now set the x and y coordinates (based partially on the NEW tooltip size)
    toolTip.style.left = (d+.5)*dataWidth + margin.left - toolTip.offsetWidth/2 + "px";
    toolTip.style.top = (1-(data[d].yValues - minY)/spread) * height + 
		margin.top - toolTip.offsetHeight - 10 + "px";
    lastToolTip = d;
   });

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
 d3.select('svg').remove();
 chartDiv.style.display='none';
}
function doFilter(){
 var d = document.getElementById('labTable');
 var f = document.getElementById('FILTER');
 d.setAttribute('class',f.value);
}
