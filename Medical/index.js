// Global Values
var UPARROW = "\u25B2";
var DOWNARROW = "\u25BC";
var RIGHTARROW = "\u25B6";
var LEFTARROW = "\u25C0";
var last_h_Toggle = 0;
var last_v_Toggle = 0;

function userLoaded(){
 var myIframe = document.getElementById("medicineIframe");
 var myBody = myIframe.contentWindow.document.body;
 alert(window.screen.width);
 if(parseInt(window.screen.width) > 360){ 
	myIframe.style.width = "508px"; 
 } else {
	myIframe.style.width = "330px";
 }
 myIframe.style.height = parseInt(myBody.scrollHeight) + "px";
 fixPhones();
 ageDOB();
}

function ageDOB(){
 var elements = document.querySelectorAll(".dob");
 for (var i=0; i<elements.length; i++){
  var j = elements[i].innerHTML;
  var a = j.split("/");
  var x = new Date(a[2],a[0]-1,a[1]);
  var y = new Date();
  years = parseInt((y - x)/(1000*60*60*24*365.2425));
  elements[i].innerHTML = elements[i].innerHTML + 
	" <i>(" + years + ")</i>";
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
