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
var userid;
var fileContents;
function personLoad(){                          // This page load
	if(location.search === ""){                 // Must have a search
		alert("GO BACK");                       // i.e. ?USERID string
		return;
	}
	userid = location.search.substring(1);      // Get the USERID
                                                // Read the Master json file
                                                // And this User's json file and 
                                                // medicine list file
	__ReadFiles(
        'Master.json',
        userid + '.json',
        userid + '_Medicine_List.tsv',
        loadPage);
}
/* This is the MAIN function to populate the page
 * We get here when all files have been loaded */

function loadPage(filecontents) {
    fileContents = filecontents;                // Make returned object global in scope
	//A few preliminaries
    MasterArray = JSON.parse(filecontents["Master.json"]);
	HASH = JSON.parse(filecontents[userid+".json"]);
	DOC = document.getElementById('myspace');
	today = new Date();
	birthday = new Date(HASH.PERSON["birth"]);

	str = "<div id='main'>";

    /* This section reads the PageLayout info from the Master.json file
     * and displays the various Contacts, Tables, Lists and Links as
     * defined therein */
    PageLayout = MasterArray.PageLayout;
    for(p=0; p<PageLayout.length; p++){
        addSection(PageLayout[p].section[0],PageLayout[p].section[1],HASH[PageLayout[p].section[2]]);
    }
    // Add our menu area
	str = str + "</div>\n</section>\n<div id='menu'>\n";
	addQuickLinks();
	str = str + "</div>\n";
 
	//All Done - show off our work
	DOC.innerHTML = str;
}

/* Build a list (menu) of each section we've built on this page
 * and turn it into a clickable menu */
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
    /* Position the menu */
	str = str + "<style>div#menu{top: -" + offsetValue + "pt;}</style>\n";
}

/* This routine builds the <section> tag for each category */
function addSection(type,title,obj){
                                            /* First add the section */
	QuickLinks.push(title);                 // Store for menu
	if(previousSection){                    // Had we previously opened a section
		str = str + "</section>\n";         // Yes, close it
	}
    previousSection = true;                 // We have now
	str = str + "<section id='" + title + "'><h1>" + title + "</h1>\n";

    if(!Array.isArray(obj)){obj = [obj];}   // If not array, make it one

    switch(type){                           // Now handle various types of sections 
        case 'Contact':                     // Contact cards
            addContacts(obj,title);
            break;
        case 'List':                        // List format
            addListEntry(obj,title);
            break;
        case 'Link':                        // Labs = BloodTests
            addLink(obj,title);
            break;
        case 'Table':                       // Read file and convert to table
            addTable(obj,title);
            break;
        default:
            alert("Unknown section type " + type);
    }
}

function addLink(myObj,classid){            // Add a link
                                            // Link to destination URL
    str = str + "<a href='" + myObj[0].url + "'>";
    if(myObj[0].image !== undefined){       // If img, include
        str = str + "<img class='bloodtest' src='" + myObj[0].image + "'>";
    }
    if(myObj[0].text !== undefined){        // If text, include it
        str = str + myObj[0].text;
    }
    str = str + "</a>";
}

function addTable(myObj,classid){           // Create a table from a file
    str = str + "<table class='" + classid + "'>\n";
    let T = myObj[0];                       // For easier coding
    if(T.caption !== undefined){            // If caption, add it
        str = str + "\t<caption>DAN" + T.caption + "</caption>\n";
    }
    switch(T.type){                         // We know only certain types of files
        case 'tsv':                         // TSV (Tab Separated Values)
            mArr = fileContents[T.file].split("\n");
            console.log('Lines = ' + mArr.length);
            for(i=0; i<mArr.length-2; i++){ // For each row, split and rejoin
                str = str + '<tr><td>' +
                        mArr[i].split("\t").join("</td><td>") +
                        "</td></tr>\n";
            }
            break;
        default:                            // Might add other types later
            alert("Unknown format " + T.medicineType);
    }
    str = str + "</table>\n";
}
function addContacts(myObj,classid){        //Adds a contacts entry
	for(let i=0; i<myObj.length; i++){      //Do for each contact in array
                                            //BEFORE clause fixes field titles
		str = str + "<div class='" + classid+ "' BEFORE>\n";
		objSub = myObj[i];			        //For each contact entry
		if(objSub.picture !== undefined){   //Are there pictures to include
			myarr = objSub.picture;         //Add each on
            if(!Array.isArray(myarr)){myarr=[myarr];}
			for(let j=0; j<myarr.length; j++){
				addPictureIcon(myarr[j]);
			}
		}
		if(objSub.dob !== undefined){ objSub.age = "today"; }
		if(objSub.date !== undefined){ objSub.age = "birthday"; }

		MasterArray.ContactOrder.forEach(addContactElement);//Add ordered list of contact parms
		str = str + "</div>\n";
	}
	function addContactElement(x){          //Add this particular parm
		if(objSub[x] !== undefined){		//Only if defined (of course)
			arr = objSub[x];		        //Easier Reference
			if(x.picture !== undefined){
				myarr = x.picture;
                if(!Array.isArray(myarr)){myarr = [myarr];} //If not array, make it one
                for(let j=0; j<myarr.length; j++){
                    addPictureIcon(myarr[j]);
                }
			}
            if(!Array.isArray(arr)){arr = [arr];} //If not array, make it one
            classValue="";
            for(let i=0; i<arr.length; i++){//Handle special cases
                if(x === "Portrait" || x === "Image"){arr[i]=doPicture(arr[i],x);}
                if(x === "Date" || x === "Dob"){arr[i]=doDate(arr[i])};
                if(x === "Age"){arr[i]=doAge(arr[i]);}
                if(x === "Phone"){arr[i]=addPhoneLink(arr[i]);}
                str = str + "  <p class='" + x + classValue + "'>" + arr[i] + "</p>\n";
                classValue = "2";
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
		if(x.Picture !== undefined){
			arr = x.Picture;
            if(!Array.isArray(arr)){arr = [arr];}
            for(let j=1; j<arr.length; j++){
                addPictureIcon(arr[j]);
            }
		}
		str = str + "<ul>\n <li>" + x.Title + "\n";
		mydate = new Date(x.When);              //Convert date to mmm yy string
		if(x.What !== undefined){
		  arr = x.What;
		  if(Array.isArray(arr)) {		        //Is this an array, then show each element
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr[0] + "</span>\n";
			for(let j=1; j<arr.length; j++){
				str = str + "  <li><span></span><span>" + arr[j] + "</span>\n";
			}
		  } else {				                //Just show the first one
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span>" + arr + "</span>\n";
		  }
		} else {
                                                //Here when just a label, no data
			str = str + "  <li><span>" + dateMonthYear(mydate) + "</span><span></span>\n";
		}
		str = str + "</ul>\n";			        //Finish up
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
	const c1 = a.Title.toUpperCase();
	const c2 = b.Title.toUpperCase();
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
/* Format date to m/dd/yy */
function shortDate(x){
	let m = x.getMonth()+1;
	let d = x.getDate();
	if(d<10){d = "0" + d;}
	let y = x.getFullYear().toString().substring(2);
	return m + "/" + d + "/" + y;
}

/* Reformat telephone number */
function addPhoneLink(p){
	return '<a href="tel:' + p.substring(0,3) + "-" + 
		p.substring(3,6) + "-" + p.substring(6,10) +  '">(' + 
		p.substring(0,3) + ")-" + p.substring(3,6) + "-" + 
		p.substring(6,10) + '</a>';
}
/* Calculate how old someone was on a certain date, or
 * How long it has been since a specific date */
function doAge(base){
	if(base === "DOB" || base === "birthday"){base = birthday;}
	if(base === "today"){base = today;}
	let basex = calcDateDiff(base,lastDate);
	return basex;
}
/* Get today's date in sort format */
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
