// Global Values
var table;
var thead;
var tbody;
var numberOfPanels;
var rowToggle=0;
var rowToggleFlag=false;
var columnToggle=0;
var columnToggleFlag=false;

function showInfo(string){
 myEvent=this.event;
 alert(string);
 myEvent.stopPropagation();
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

function loaded(){				//Get items we'll use
 table = document.getElementById('labTable');	//after page loads
 thead = document.getElementsByTagName('thead');
 tbody = document.getElementsByTagName('tbody');
 numberOfPanels = tbody.length;
}

function togglePanel(x){			//Toggle the tbody this
 x.parentElement.classList.toggle("hide");	//header row is a part of
}

function toggleRow(x){				//Show only those columns that
 if(rowToggleFlag && rowToggle != x){		//If lastone is closed and not this one
  toggleRow(rowToggle);				//Then open last one first
 }
 var j = x.children.length - 1;
 for(i=1; i<j; i++){				//have a value in this row
  if(! x.children[i].innerHTML){		//This column is empty
   table.getElementsByTagName('col')[i].classList.toggle("narrow"); //Get this column
  }
 }
 rowToggleFlag = x.children[0].classList.toggle("narrow");//Update test name field
 rowToggle = x;
}

function toggleColumn(x){			//Show only those rows that have a
						//value in this column
 if(columnToggleFlag && columnToggle != x){
  toggleColumn(columnToggle);
 }
 for(i=0; i<numberOfPanels; i++){		//Start with first tbody
  var rows = tbody[i].children.length;		//Get number of rows in each tbody
  for(j=1; j<rows; j++){			//Start with first data row
   value = tbody[i].children[j].children[x].innerHTML; //Get value
   if(!value){
    tbody[i].children[j].classList.toggle("hide");
   }
  }
 }
 columnToggleFlag = thead[0].children[0].children[x].classList.toggle("hide");	//Update column header
 columnToggle = x;
}
function showInfo(x){				//For phones
 var e = this.event;				//If user clicks on icon
 var elem = x.parentNode.parentNode.children[0];//Fetch the title string
 var titleString = elem.getAttribute("title");	//and display it for the
 alert(titleString);				//User
 e.stopPropagation();
}

