const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// Ordered list of Contact fields to be displayed
// Any (theoritically) can have multiple entries
var MasterArray;
var str;
var birthday;
var today;
var lastDate;
var QuickLinks = [];
var previousSection = false;
var thisUSER;
var userid;
var fileContents;
function personLoad(){
	x = location.search;
	if(location.search === ""){
		alert("GO BACK");
		return;
	}
	userid = location.search.substring(1);
	__ReadFiles('Master.json',MasterRead);
}
function MasterRead(MASTER){
	MasterArray = JSON.parse(MASTER["Master.json"]);
	mUSERS = MasterArray.USERS;
	/* Find entry for this user id */
	for(i=0; i<mUSERS.length; i++){
		if(userid == mUSERS[i].USERID){
            thisUSER = mUSERS[i];
            mFilesToLoad=[];
            mFilesToLoad.push(mUSERS[i].jsonFile);      // Always load jsonFile
            if(thisUSER.Tables !== undefined){          // Any files listed in tables
                for (j=0; j<thisUSER.Tables.length; j++){
                    mFilesToLoad.push(thisUSER.Tables[j].file);
                }
            }
			windowLoaded(mFilesToLoad);
			return;
		}
	}
	alert("Unable to find " + userid);
	window.location.replace("index.html");
}
function windowLoaded(...paths){	//After window is loaded
	__ReadFiles(...paths[0],loadPage);	//Read list of files
}					//Then go to loadPage

/* This is the MAIN function to populate the page
 * We get here when all files have been loaded */
function loadPage(filecontents) {
    fileContents = filecontents;                // Make returned object global in scope

	//A few preliminaries
	HASH = JSON.parse(filecontents[thisUSER.jsonFile]);
	DOC = document.getElementById('myspace');
	today = new Date();
	birthday = new Date(HASH.BIRTH);

	str = "<div id='main'>";

    //addSection(Section_Type,title,parm1[,parm2])
    addSection('Contact','Patient',HASH.ME);
    addSection('Contact','Emergency Contacts',HASH.ICE);
    addSection('Table','Prescriptions','Medicine');
    addSection('Contact','Phramacies',HASH.PHARMACY);
    addSection('List','Conditions',HASH.CONDITIONS);
    addSection('Lab','Labs',thisUSER);
    addSection('List','Immunizations',HASH.IMMUNIZATIONS);
    addSection('Contact','Hospitalizations',HASH.HOSPITALIZATIONS);
    addSection('Contact','Health Care Team',HASH.DOCTORS);
	//All Done - show off our work

	str = str + "</div>\n</section>\n<div id='menu'>\n";
	addQuickLinks();
	str = str + "</div>\n";

	DOC.innerHTML = str;
}

function addQuickLinks(){
	str = str + "<p><a href='#top'>Top of Page</a></p>\n";
	for(i = 0; i< QuickLinks.length; i++){
		str = str + '<p><a href="#' + QuickLinks[i] + '">'+ 
				QuickLinks[i] + '</a></p>\n';
	}
	str = str + "<p><a href='index.html'>\nAnother Patient</a></p>\n" +
		"<div><p>Menu</p></div>\n</div>\n";
	/* Initial menu offset = (line height in pt + top margin thickness in pt +
	 * bottom margin thickness in pt) times (*) number of menu items +
	 * 2 (for "Menu" entry) */
	offsetValue = (12 + 1 + 1)*(2 + QuickLinks.length)+2;
	str = str + "<style>div#menu{top: -" + offsetValue + "pt;}</style>\n";
}

function addSection(type,title,obj){
    /* First add the section */
	QuickLinks.push(title);                     // Store for menu
	if(previousSection){                    // Had we previously opened a section
		str = str + "</section>\n";         // Yes, close it
	}
    previousSection = true;                 // We have now
	str = str + "<section id='" + title + "'><h1>" + title + "</h1>\n";

    /* Now handle various types of sections */
    switch(type){
        case 'Contact':                     // Contact cards
            addContacts(obj,title);
            break;
        case 'List':                        // List format
            addListEntry(obj,title);
            break;
        case 'Lab':                         // Labs = BloodTests
            str = str + "<a href='Labs.html?" + obj.labsURL + 
                    "'><img class='bloodtest' src='/images/BloodTest.png'></a>";
            break;
        case 'Table':                       // Read file and convert to table
            str = str + "<table class='medicine'>\n";
            tArr = thisUSER.Tables;
            for(t=0; t<tArr.length; t++){
                if(tArr[t].title == obj){
                    if(tArr[t].caption){
                        str = str + "\t<caption>" + tArr[t].caption + "</caption>\n";
                    }
                    switch(tArr[t].type){
                        case 'tsv':
                            mArr = fileContents[tArr[t].file].split("\r");
                            for(i=0; i<mArr.length-2; i++){
                                str = str + '<tr><td>' + mArr[i].split("\t").join("</td><td>") + "</td></tr>\n";
                            }
                            str = str + '</table>\n';
                            break;
                        default:
                            alert("Unknown format " + obj.medicineType);
                    }
                }
            }
            str = str + "</table>\n";
            break;
    }
}

function addContacts(myObj,classid){			//Adds a contacts entry
	for(let i=0; i<myObj.length; i++){		    //Do for each contact in array
		str = str + "<div class='" + classid+ "'>\n";
		objSub = myObj[i];			            //For each contact entry
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

		MasterArray.ContactOrder.forEach(addContactElement);//Add ordered list of contact parms
		str = str + "</div>\n";
	}
	function addContactElement(x){			    //Add this particular parm
		if(objSub[x] !== undefined){		    //Only if defined (of course)
			arr = objSub[x];		            //Easier Reference
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
			if(Array.isArray(arr)) {	        //Is this parm an array
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
			} else {			                //No
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
	let obj = myObj.sort(titleSort);		    //Re-sort the data by title
	for(let i=0; i<obj.length; i++){		    //For each Event
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
		mydate = new Date(x.when);		    //Convert date to mmm yy string
		if(x.what !== undefined){
		  arr = x.what;
		  if(Array.isArray(arr)) {		    //Is this an array, then show each element
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr[0] + "</span>\n";
			for(let j=1; j<arr.length; j++){
				str = str + "  <li><span></span><span>" + arr[j] + "</span>\n";
			}
		  } else {				            //Just show the first one
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr + "</span>\n";
		  }
		} else {
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span></span>\n";
		}
		str = str + "</ul>\n";			    //Finish up
	}
	str = str + "</div>";
}

function doPicture(imgname,classid){
	var img = '<img class="' + classid + '" src="' + imgname + '">';
	if(classid === "image"){
		return '<a class="' + classid + '" href="' + imgname + 
			'">' + img + '</a>';
	} else {
		return img;
	}
}
function titleSort(a,b){				    //Sort by title string
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
 if(diffMonths<0){ borrowYear();}	                //If months < 0, borrow 12 months from year
 var diffDate = dd1["day"]-dd2["day"];
 if(diffDate<0){borrowMonth();}		                //If days < 0, borrow last months days
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
