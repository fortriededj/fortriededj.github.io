const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Ordered list of Contact fields to be displayed
// Any (theoritically) can have multiple entries
const ContactOrder = [
	"image","portrait","name", "procedure", "dob", "date", "age", "height", "weight",
	"surgeon", "specialty", "condition", "phone", "address", "location", "anesthesia",
	"sex", "race", "status", "preferred", "phonetic", "relation", "critical", 
	"insurance","note"];
var str;
var birthday;
var today;
var lastDate;
var filestoread=0;
var filecontents = new Array();
var QuickLinks = [];

function readfile(path, rindex) {				//File and counter
  var xhr = new XMLHttpRequest();				//to store it in
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
	filestoread--;						//Mark that we read another one
	filecontents[rindex]=xhr.responseText;			//Store the results
      }
      else {
        alert(xhr);						//OOPS
      }
    }
  }
  xhr.open('GET', path, true);					//Async get
  xhr.send();
}

async function windowLoaded(paths){	//After window is loaded
	filestoread=paths.length;	//Called with array of files to fetch
	for(i=0; i<filestoread; i++){	//For each, log and then
		paths[i] = paths[i] + "?" + Math.random();
		readfile(paths[i],i);	//asynchronously read file
	}
	let maxtime=Date.now();		//Get current time
	maxtime = maxtime + 5000;	//5 Seconds from now
	do {
		await new Promise(resolve => setTimeout(resolve, 100)) .then(() => {});
	} while(filestoread > 0 && Date.now() < maxtime);
	if(filestoread > 0){		//Didn't get all the files
		alert("Unable to retrieve all files in timeframe > " + filestoread);
		return;
	}
	loadPage();			//call the loadPage file;
}

/* This is the MAIN function to populate the page
 * We get here when all files have been loaded */
function loadPage() {
	// File 0 is our json file
	// File 1 is our medicine tsv file

	//A few preliminaries
	HASH = JSON.parse(filecontents[0]);
	DOC = document.getElementById('myspace');
	today = new Date();
	birthday = new Date(HASH.BIRTH);

	str = "<div id='main'>";
	//Patient = HASH.ME;
	addSectionHeader("Patient");
	addContacts(HASH.ME,"patient");

	//Now ready for Emergency Contact
	addSectionHeader("Emergency Contacts");
	addContacts(HASH.ICE,"ice");			//Add each contact in ICE
							//Call with array and class value
	addSectionHeader("Prescriptions");
	addMedicine(filecontents[1]);

	addSectionHeader("Pharmacies");
	addContacts(HASH.PHARMACY,"Pharm");

	//Now list Current Medical Conditions
	addSectionHeader("Medical Conditions");
	addListEntry(HASH.CONDITIONS,'Conditions');	//Add each list

	addSectionHeader("Blood Test Results");
	str = str + "<a href='/Medical/" + 
		BLOODTESTFILE + 
		"'><img class='bloodtest' src='/images/BloodTest.png'></a>";

	//Immunizations
	addSectionHeader("Immunizations");
	addListEntry(HASH.IMMUNIZATIONS,'Immunizations');

	//Hospitalizations
	addSectionHeader("Hospitalizations");
	addContacts(HASH.HOSPITALIZATIONS,"Hospitalizations");

	//Doctors
	addSectionHeader("Health Care Team");
	addContacts(HASH.DOCTORS,"Doctors");
	//All Done - show off our work

	str = str + "</div>\n<div id='menu'>\n";
	addQuickLinks();
	str = str + "</div>\n";

	DOC.innerHTML = str;
}

function addQuickLinks(){
	str = str + "<div>\n";
	for(i = 0; i< QuickLinks.length; i++){
		str = str + '<p><a href="#' + QuickLinks[i] + '">'+ 
				QuickLinks[i] + '</a></p>\n';
	}
	str = str + "</div>\n<div><p>Menu</p></div>\n</div>\n";
	/* Initial menu offset = (line height in pt + top margin thickness in pt +
	 * bottom margin thickness in pt) times (*) number of menu items +
	 * 2 (for "Menu" entry) */
	offsetValue = (12 + 1 + 1)*QuickLinks.length+2;
	str = str + "<style>div#menu{top: -" + offsetValue + "pt;}</style>\n";
}

function addMedicine(x){
	str = str + "<table class='medicine'>\n \
		<caption>ES = Express-Scripts<br>CVS = CVS in Target on Barr street</caption>\n";
	mArr = x.split("\n");
	const hArr = mArr.shift();
	mArr = mArr.sort(drugSort);
	str=str + " <tr><td>" + hArr.split("\t").join("</td><td>") + "</td></tr>\n";
	for(i=0; i<mArr.length-2; i++){
		str = str + " <tr><td>" + 
			mArr[i].split("\t").join("</td><td>") + 
		"</td></tr>\n";
	}
	str = str + "</table>";
}
function addSectionHeader(x){
	QuickLinks.push(x);
	str = str + "<h1 id='" + x + "'>" + x + "</h1>\n";
}

function addContacts(myObj,classid){			//Adds a contacts entry
	for(let i=0; i<myObj.length; i++){		//Do for each contact in array
		str = str + "<div class='" + classid+ "'>\n";
		objSub = myObj[i];			//For each contact entry
		if(objSub.picture !== undefined){
			myarr = objSub.picture;
			if(Array.isArray(myarr)){
				addPictureIcon(myarr[0]);
				for(let j=1; j<myarr.length; j++){
					addPictureIcon(myarr[j]);
				}
			} else {
				addPictureIcon(myarr);
			}
		}
		if(objSub.dob !== undefined){ objSub.age = "today"; }
		if(objSub.date !== undefined){ objSub.age = "birthday"; }

		ContactOrder.forEach(addContactElement);//Add ordered list of contact parms
		str = str + "</div>\n";
	}
	function addContactElement(x){			//Add this particular parm
		if(objSub[x] !== undefined){		//Only if defined (of course)
			arr = objSub[x];		//Easier Reference
			if(x.picture !== undefined){
				myarr = x.picture;
				if(Array.isArray(myarr)){
					addPictureIcon(myarr[0]);
					for(let j=1; j<myarr.length; j++){
						addPictureIcon(myarr[j]);
					}
				} else {
					addPictureIcon(myarr);
				}
			}
			if(Array.isArray(arr)) {	//Is this parm an array
				if(x === "portrait" || x === "image"){arr[0]=doPicture(arr[0],x);}
				if(x === "date" || x === "dob"){arr[0]=doDate(arr[0]); };
				if(x === "phone"){arr[0]=addPhoneLink(arr[0]);}
				if(x === "age"){arr[0]=doAge(arr[0]);}
				str = str + "  <p class='" + x + "'>" + arr[0] + "</p>\n";
				for(let i=1; i<arr.length; i++){
					if(x === "portrait" || x === "image"){arr[i]=doPicture(arr[i],x);}
					if(x === "date" || x === "dob"){arr[i]=doDate(arr[i])};
					if(x === "age"){arr[i]=doAge(arr[i]);}
					if(x === "phone"){arr[i]=addPhoneLink(arr[i]);}
					str = str + "  <p class='" + x + "2'>" + arr[i] + "</p>\n";
				}
			} else {			//No
				if(x === "portrait" || x === "image"){arr=doPicture(arr,x);}
				if(x === "date" || x === "dob"){arr=doDate(arr)};
				if(x === "age"){arr=doAge(arr);}
				if(x === "phone"){arr=addPhoneLink(arr);}
				str = str + "  <p class='" + x + "'>" + arr + "</p>\n";
			}
		}
	}
}

function addListEntry(myObj,classid){			//Add Entry - Here everything fits in outer div
							//title and when all have to be defined in JSON
							//for each entry
	str = str + "<div class='"+classid+"'>\n";
	let obj = myObj.sort(titleSort);		//Re-sort the data by title
	for(let i=0; i<obj.length; i++){		//For each Event
		x = obj[i];
		if(x.picture !== undefined){
			arr = x.picture;
			if(Array.isArray(arr)){
				addPictureIcon(arr[0]);
				for(let j=1; j<arr.length; j++){
					addPictureIcon(arr[j]);
				}
			} else {
				addPictureIcon(arr);
			}
		}
		str = str + "<ul>\n <li>" + x.title + "\n";
		mydate = new Date(x.when);		//Convert date to mmm yy string
		if(x.what !== undefined){
		  arr = x.what;
		  if(Array.isArray(arr)) {		//Is this an array, then show each element
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr[0] + "</span>\n";
			for(let j=1; j<arr.length; j++){
				str = str + "  <li><span></span><span>" + arr[j] + "</span>\n";
			}
		  } else {				//Just show the first one
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr + "</span>\n";
		  }
		} else {
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span></span>\n";
		}
		str = str + "</ul>\n";			//Finish up
	}
	str = str + "</div>";
}

function doPicture(imgname,classid){
	var img = '<img class="' + classid + '" src="/images/' + imgname + '">';
	if(classid === "image"){
		return '<a class="' + classid + '" href="/images/' + imgname + 
			'">' + img + '</a>';
	} else {
		return img;
	}
}
function drugSort(a,b){
	if(a[0] > b[0]) {return 1;} else {return -1;}
}
function titleSort(a,b){				//Sort by title string
	const c1 = a.title.toUpperCase();
	const c2 = b.title.toUpperCase();
	let retval = 0;
	if(c1 > c2) {
		retval = 1;
	} else if (c1 < c2) {
		retval = -1;
	}
	return retval;
}

/* Format date to mmm yy */
function dateMonthYear(x){ return MONTHS[x.getMonth()] + " '" + x.getFullYear().toString().substring(2); }
function shortDate(x){
	let m = x.getMonth()+1;
	let d = x.getDate();
	if(d<10){d = "0" + d;}
	let y = x.getFullYear().toString().substring(2);
	return m + "/" + d + "/" + y;
}

function addPhoneLink(p){
	return '<a href="tel:' + p.substring(0,3) + "-" + 
		p.substring(3,6) + "-" + p.substring(6,10) +  '">(' + 
		p.substring(0,3) + ")-" + p.substring(3,6) + "-" + 
		p.substring(6,10) + '</a>';
}
function doAge(base){
	if(base === "DOB" || base === "birthday"){base = birthday;}
	if(base === "today"){base = today;}
	let basex = calcDateDiff(base,lastDate);
	return basex;
}
function doDate(d){
	let x = new Date(d);
	lastDate=x;
	return shortDate(x);
}

/* Calculate the difference between two dates. (Accurately!) */
function calcDateDiff(fromDate,toDate){
 if(fromDate > toDate){[toDate,fromDate]=[fromDate,toDate]}; //Order dates
 const dd1 = [];
 const dd2 = [];
 dd2["year"] = parseInt(fromDate.getFullYear());
 dd2["month"] = parseInt(fromDate.getMonth());
 dd2["day"] = parseInt(fromDate.getDate());

 dd1["year"] = parseInt(toDate.getFullYear());
 dd1["month"] = parseInt(toDate.getMonth());
 dd1["day"] = parseInt(toDate.getDate());

 var diffYears = dd1["year"]-dd2["year"];
 var diffMonths = dd1["month"]-dd2["month"];
 var diffDays = dd1["day"]-dd2["day"];
 if(diffMonths<0){ borrowYear();}	//If months < 0, borrow 12 months from year
 var diffDate = dd1["day"]-dd2["day"];
 if(diffDate<0){borrowMonth();}		//If days < 0, borrow last months days
 const z = [];
 if(diffYears){z.push(diffYears + "y");}
 if(diffMonths){z.push(diffMonths + "m");}
 if(diffDate){z.push(diffDate + "d");}
 return z.join("/");

 function borrowYear(){diffMonths+=12; diffYears--;}
 function borrowMonth(){
  diffMonths--; if(diffMonths<0){borrowYear();}
  lastMonthDays = toDate-new Date(dd1["year"],dd1["month"]-1,dd1["day"]);
  lastMonthDays = parseInt(lastMonthDays/24/3600000);
  diffDate+=lastMonthDays;
 }
}  
