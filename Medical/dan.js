const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Ordered list of Contact fields to be displayed
// Any (theoritically) can have multiple entries
const ContactOrder = [
	"name", "procedure", "dob", "date", "age", "surgeon", "specialty",
	"condition",
	"phone", "address", "location", "anesthesia", "sex", "race",
	"status", "preferred", "phonetic", "relation", "critical", "note" ];
var str;
var birthday;
var today;
var lastDate;

function windowLoaded(x){
	x = x + "?" + Math.random;				//Force reload
	readJSON(x, loadPage);
}

function readJSON(path, success, error) {			//Get the JSON file
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText));			//Do the actual page creation
      }
      else {
        error(xhr);
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.send();
}

/* This is the MAIN function to populate the page */
function loadPage(HASH) {
	//A few preliminaries
	DOC = document.getElementById('myspace');
	today = new Date();
	birthday = new Date(HASH.BIRTH);

	str = "";
	//Patient = HASH.ME;
	addSectionHeader("Patient");
	addContacts(HASH.ME,"patient");

	//Now ready for Emergency Contact
	addSectionHeader("Emergency Contacts");
	addContacts(HASH.ICE,"ice");			//Add each contact in ICE
							//Call with array and class value

	//Now list Current Medical Conditions
	addSectionHeader("Current Medical Conditions");
	addListEntry(HASH.CONDITIONS,'Conditions');	//Add each list

	//Immunizations
	addSectionHeader("Immunizations");
	addListEntry(HASH.IMMUNIZATIONS,'Immunizations');

	//Hospitalizations
	addSectionHeader("Hospitalizations, Surgeries, etc.");
	addContacts(HASH.HOSPITALIZATIONS,"Hospitalizations");

	//Doctors
	addSectionHeader("Health Care Team");
	addContacts(HASH.DOCTORS,"Doctors");
	//All Done - show off our work
	DOC.innerHTML = str;
	//console.log(str);
}

function addSectionHeader(x){
	str = str + "<h1>" + x + "</h1>\n";
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
				if(x === "date" || x === "dob"){arr[0]=doDate(arr[0]); };
				if(x === "phone"){arr[0]=addPhoneLink(arr[0]);}
				if(x === "age"){arr[0]=doAge(arr[0]);}
				str = str + "  <p class='" + x + "'>" + arr[0] + "</p>\n";
				for(let i=1; i<arr.length; i++){
					if(x === "date" || x === "dob"){arr[i]=doDate(arr[i])};
					if(x === "age"){arr[i]=doAge(arr[i]);}
					if(x === "phone"){arr[i]=addPhoneLink(arr[i]);}
					str = str + "  <p class='" + x + "2'>" + arr[i] + "</p>\n";
				}
			} else {			//No
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

function addPictureIcon(imgname){
	str = str + '<a href="/IMAGES/' + imgname + 
			'" title="Click to view more information">' +
			'<img src="/IMAGES/' +
			imgname + '" class="icon"></a>';
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

/*function addAgetoDate(d){
	let x = new Date(d);
	return shortDate(x) + "&emsp;Age:" + calcDateDiff(x,birthday);
}

function addAgetoDOB(d){
	let x = new Date(d);
	return shortDate(x) + "&emsp;Age:" + calcDateDiff(x,today);
}*/

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
