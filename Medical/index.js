var timers = new Array();
var timeOut = 300;		//Delay before executing fixBoxes
var timeDiff = 5*1000;		//Max age of person page 30 seconds

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

function userLoaded(){
 var myIframe = document.getElementById("medicineIframe");
 var myBody = myIframe.contentWindow.document.body;
 if(parseInt(window.screen.width) > 360){ 
	myIframe.style.width = "570px"; 
 } else {
	myIframe.style.width = "330px";
 }
 myIframe.style.height = parseInt(myBody.scrollHeight) + "px";
 fixPhones();
 ageDOB();
}
