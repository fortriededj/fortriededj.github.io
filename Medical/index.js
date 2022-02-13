// Global Values
var UPARROW = "\u25B2";
var DOWNARROW = "\u25BC";
var RIGHTARROW = "\u25B6";
var LEFTARROW = "\u25C0";
var last_h_Toggle = 0;
var last_v_Toggle = 0;

function showInfo(event){
 alert("Here is the info I promised");
 event.stopPropagation();
}
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

function getDOB(){
 var x = document.querySelectorAll(".dob");
 var y = convertStringToDate(x[0].innerHTML);
 return y;
} 

function convertDateToString(x){
 const Months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 var y = Months[x.getMonth()] + " " + x.getDate() + ", " + x.getFullYear();
 return y;
}
function convertStringToDate(x){
 var i;
 var y = x.split("/");
 for(i=0; i<3; i++){y[i]=parseInt(y[i]);}
 if(y[2]<100){y[2]+=2000;}
 return new Date(y[2],y[0]-1,y[1]);
}

function doAges(){
 var DOB = getDOB();
 var today = new Date();
 var elements = document.querySelectorAll(".dob");
 // Calc how old patient is in yy/mm/dd
 addYMDspan(elements[0],today);
 var elements = document.querySelectorAll(".date");
 // Calc how old patient was on date
 for(i=0; i<elements.length; i++){ addYMDspan(elements[i],DOB); }
}

/* Add span class=age after element which has number of years/months/days
   from the given date */
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

function fixPhones(){
 var elements = document.querySelectorAll(".phone, .phone2");
 for (var i=0; i<elements.length; i++) {
  j=(elements[i].innerHTML).trim();
  if(j.indexOf("-") == -1) {	//Dont change if hypen already there
   if(j.length == 7) {		//No area code
    elements[i].innerHTML = j.slice(0,3) + "-" + j.slice(3,7);
   }
   if(j.length == 10) {		//Area code and number
    elements[i].innerHTML = "(" + j.slice(0,3) + ")-" + j.slice(3,6) + "-" + j.slice(6,10);
   }
  }
  if(j.indexOf("tel") == -1) {	//Dont change if tel link already there
   elements[i].innerHTML = "<a href='tel:" + elements[i].innerHTML +
			"'>" + elements[i].innerHTML + "</a>";
  }
 }
}

/* hToggle(testname,counter)
   Toggle columns that are blank for a specific test */

function hToggle2(myElement,which){
 myEvent=this.event;
 alert('Showing information');
 myEvent.stopPropagation();
}

function hToggle(myElement,which){
 var whichOne = parseInt(which) - 1;
 var myStyle = document.styleSheets[1];	//Second style sheet
 var myRow= document.getElementById('labTable').
	children[1].children[whichOne].children;//Get testname

 /* If setting a different one, reset old one first */
 if(last_h_Toggle && last_h_Toggle != myElement){	//If last different than this
  for(var i=1; i<myRow.length; i++){		//Loop through labtable style
   myStyle.cssRules[i].style.display="table-cell";//turn back on
  }
  last_h_Toggle.children[0].innerHTML = LEFTARROW;	//Reset icon
  last_h_Toggle.children[0].style.color = 'black';	//and color
 }

 /* Now toggle this one. On or off */
 var n = myElement.children[0].innerHTML;	//Find this row of values
 if(n == RIGHTARROW){				//If off
  for(var i=1; i<myRow.length; i++){
   myStyle.cssRules[i].style.display="table-cell";//Turn on
  }
  myElement.children[0].innerHTML = LEFTARROW;//Set icon
  myElement.children[0].style.color = 'black';	//and color
 } else {
  for(var i=1; i<myRow.length; i++){		//Check each row value
   if(myRow[i].innerHTML == ""){		//If blank
    myStyle.cssRules[i].style.display="none";	//Change cooresponding class
   } else {					//to None
    myStyle.cssRules[i].style.display="table-cell";//or turn on
   }
  }
  myElement.children[0].innerHTML = RIGHTARROW;//Set icon
  myElement.children[0].style.color = 'blue';	//and color
 }  
 last_h_Toggle = myElement;			//Remember the one we just did
}

function vToggle(myElement,which){
 var whichOne = parseInt(which);
 var myRows = document.getElementById('labTable').
	children[1].children;
 if(last_v_Toggle && last_v_Toggle != myElement){
  last_v_Toggle.children[0].innerHTML = RIGHTARROW;
  last_v_Toggle.children[0].style.color = "black";
  for(i=0; i<myRows.length; i++){
   myRows[i].parentElement.children[i].style.display='table-row';
  }
 } 

 if(myElement.children[0].innerHTML == RIGHTARROW){
  newstyle = "none";
  myElement.children[0].innerHTML = LEFTARROW;
  myElement.children[0].style.color = "blue";
 } else {
  newstyle = "table-row";
  myElement.children[0].innerHTML = RIGHTARROW;
  myElement.children[0].style.color = "black";
 }
 for(i=0; i<myRows.length; i++){
  if(myRows[i].innerHTML.indexOf('panelName') == -1){
   if(myRows[i].children[whichOne].innerHTML){
    myRows[i].parentElement.children[i].style.display='table-row';
   } else {
    myRows[i].parentElement.children[i].style.display=newstyle;
   }
  }
 }
 last_v_Toggle = myElement;
} 
function panelToggle(myElement,which){
 if(myElement.children[0].innerHTML == UPARROW){
  d="none";
  myElement.children[0].innerHTML = DOWNARROW;
 } else {
  d="table-row";
  myElement.children[0].innerHTML = UPARROW;
 }
 var myRows = document.querySelectorAll("#pg"+which);
 for(i=0; i<myRows.length; i++){ myRows[i].style.display=d;}
} 
