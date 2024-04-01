//Global Values
var thead, tbody, numberOfPanels, svg, chartDiv;
var rowToggle=0, columnToggle=0;
var myDataSet=[];
var margin, width, height, xScale, yScale;
var ChartTitle, startPoint, MINY, MAXY;
var toolTip;
var lastToolTip;
var chartDivLeft=40, chartDivTop=20;

// Calculate cutoff day -- we initially look back 2 years (ish)
var CutOffYears = 2; var CutOff = Date.now() - CutOffYears * 365*24*60*60*1000;

//Here when we deal with the labTable stuff

function addChartDiv(){				//Used only for lab work page
 chartDiv = document.getElementById('chartDiv');
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

 margin = {top: 35, right: 14, bottom: 70, left: 45};
 width  = chartDiv.offsetWidth - margin.left - margin.right;
	console.log(chartDiv.offsetWidth + " " + margin.left + " " + margin.right + " " + width);
 height = chartDiv.offsetHeight - margin.top - margin.bottom;
 xScale = d3.scaleBand().range([0, width]);
 yScale = d3.scaleLinear().range([height, 0]);
 correctXScale = d => { return xScale(d.xValues) + width / n / 2; } 
}

function showGraph(row,miny,maxy){
 this.event.stopPropagation();
 MINY = miny;
 MAXY = maxy;
 rowno = row.parentNode.parentNode.getAttribute('id').substring(4);
 ChartTitle = row.parentNode.parentNode.children[0].innerText;
 chartDiv.children[0].classList.remove('toggled');
 startPoint = 0;
 myDataSet=[];					//Clear the dataSet
 for(i = 0; i< DATES.length; i++){
  dv = Dates[i]*1000;
  d = dateNumberToString(new Date(dv));
  v = CELLS[rowno][i].innerText;
  if(isNumeric(v)){
   myDataSet.unshift({"xValues": d, "yValues": v, "notes": ""});
   if(!startPoint){				//Have we found a starting point yet
    if(dv<CutOff){ startPoint = myDataSet.length - 1;}//Found starting point
   }
  }
 }
 if(startPoint){ startPoint=myDataSet.length-startPoint; }
 if(myDataSet.length === 0){
  alert("Nothing to Graph");
  return;
 }

 createChart(ChartTitle,startPoint,MINY,MAXY);
}

function isNumeric(value){		//See if string is a number
 return /^-?\d*\.*\d+$/.test(value);	//And only a number
}

function createChart(myTitle,startAt,MINY,MAXY){//Create chart
 d3.select('svg').remove();		//Remove existing svg, if any
 chartDiv.style.visibility="visible";	//See the chart div
 data = myDataSet.slice(startAt);	//Pull off only part we want
 n = data.length;			//Get length of the dataset
 dataWidth = width/n;			//How wide is each data point on x axis
 lastToolTip = null;			//Forget last tooltip we saw
 tickFrequency = Math.max(1,Math.round(n/width*20));
 dotSize = 3;

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
 chartDiv.style.visibility='hidden';
}
