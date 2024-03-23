/* Fetches url(s) and returns array of each response to CallBack routine
 *
 * Call with:
 * 	__ReadFiles(file1,file2,...,callbackRoutine)
 *
 * Optionally set __ReadFilesTimeout to value in milliseconds to override
 * default of 5000 (5 seconds)
 *
 */

async function __ReadFiles(...paths){
  callback = paths.pop();			//First is callback routine
  if(typeof callback != "function"){
	  alert("Last parameter " + callback + " is not a callback function.");
  }

  __myResponse = new Array();			//A place for the responses
  if(typeof __ReadFilesTimeout == "undefined"){	//Did user set this variable
    __ReadFilesTimeout = 5000;			//Then use it, else our value
  }
  if(Array.isArray(paths)){			//Called with array
      __myARR = paths;				//Copy it
  } else {
      __myARR = [ paths ];			//Called with single, make it array
  }
  __FileCount=__myARR.length;			//Set to number of files we are to fetch
  for(i=0; i<__FileCount; i++){			//For each item
     __myResponse[i] = 
  	__readfile(__myARR[i] + "?" + Math.random(),i)	//Fix URL to force read
  }
  let __maxtime=Date.now();			//Get current time
  __maxtime = __maxtime + 5000;			//5 Seconds from now
  do {
    await new Promise(resolve => setTimeout(resolve, 100)) .then(() => {});
  } while(__FileCount > 0 && Date.now() < __maxtime);

  if(__FileCount > 0){				//Didn't get all the files
    alert("Unable to retrieve all files in timeframe > ");
    return;
  }
  callback(__myResponse);			//Call callback with response array

  function __readfile(path, rindex) {				//File and counter
    var xhr = new XMLHttpRequest();				//to store it in
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
	  __FileCount--;					//Mark that we read another one
	  __myResponse[rindex]=xhr.responseText;		//Store the results
        }
        else {
          alert(xhr);						//OOPS
        }
      }
    }
    xhr.open('GET', path, true);					//Async get
    xhr.send();
  }
}
