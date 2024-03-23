var userid;
var BLOODTESTFILE;
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
	MasterArray = JSON.parse(MASTER[0]);
	mUSERS = MasterArray.USERS;
	/* Find entry for this user id */
	for(i=0; i<mUSERS.length; i++){
		if(userid == mUSERS[i].USERID){
			BLOODTESTFILE = "Labs.html?" + mUSERS[i].labsURL;
			windowLoaded(mUSERS[i].jsonFile,mUSERS[i].medicineFile);
			return;
		}
	}
	alert("Unable to find " + userid);
	window.location.replace("index.html");
}
