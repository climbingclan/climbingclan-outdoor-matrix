function sendWindgather(){
let crag = "Windgather"
let metavalue = "windgather"

sendtoCrag(crag, metavalue)
}


function sendSummitUp(){
let crag = "Summit Up Climbing Centre"
let metavalue = "Summit Up Climbing Centre"

sendtoCrag(crag, metavalue)
}

function sendCowsMouthQuarry(){
let crag = "Cow's Mouth Quarry"
let metavalue = "Cows Mouth Quarry"

sendtoCrag(crag, metavalue)
}

function sendRockover(){
let crag = "Rockover Climbing Centre"
let metavalue = "Rockover Climbing Centre"

sendtoCrag(crag, metavalue)
}

function sendCastleNaze(){
let crag = "Castle Naze"
let metavalue = "castlenaze"

sendtoCrag(crag, metavalue)
}

function sendWilton3(){
let crag = "Wilton 3"
let metavalue = "wilton3"

sendtoCrag(crag, metavalue)
}

function sendCadshaw(){
let crag = "Castle Cadshaw Rocks"
let metavalue = "cadshaw"

sendtoCrag(crag, metavalue)
}

function sendWilton1(){
let crag = "Wilton 1"
let metavalue = "wilton1"

sendtoCrag(crag, metavalue)
}

function sendWilton2(){
let crag = "Wilton 2"
let metavalue = "wilton2"

sendtoCrag(crag, metavalue)
}

function sendWilton4(){
let crag = "Wilton 4"
let metavalue = "wilton4"

sendtoCrag(crag, metavalue)
}

function sendEgerton(){
let crag = "Egerton Quarry"
let metavalue = "egerton"

sendtoCrag(crag, metavalue)
}

function sendAnglezarke(){
let crag = "Anglezarke Quarry"
let metavalue = "anglezarke"

sendtoCrag(crag, metavalue)
}

function sendDenham(){
let crag = "Denham Quarry"
let metavalue = "denham"

sendtoCrag(crag, metavalue)
}

function sendHorsethief(){
let crag = "Horsethief Quarry"
let metavalue = "horsethief"

sendtoCrag(crag, metavalue)
}

function sendkHarpurHill(){
let crag = "Harpur Hill"
let metavalue = "harpurhill"

sendtoCrag(crag, metavalue)
}

function sendHorseshoe(){
let crag = "Horseshoe Quarry"
let metavalue = "horseshoe"

sendtoCrag(crag, metavalue)
}

function sendPuleHill(){
let crag = "Pule Hill Rocks"
let metavalue = "pule_hill"

sendtoCrag(crag, metavalue)
}

function sendRunningHill(){
let crag = "Running Hill Pitts"
let metavalue = "Running Hill Pitts"

sendtoCrag(crag, metavalue)
}

function sendHobsonMoor(){
let crag = "Hobson Moor Quarry"
let metavalue = "hobsonmoor"

sendtoCrag(crag, metavalue)
}

// Western Grit far


function sendStanagePopular(){
let crag = "Stanage Popular"
let metavalue = "stanage_popular"

sendtoCrag(crag, metavalue)
}

function sendBamford(){
let crag = "Bamford Edge"
let metavalue = "bamford_edge"

sendtoCrag(crag, metavalue)
}

function sendFroggatt(){
let crag = "Froggatt Edge"
let metavalue = "froggatt"

sendtoCrag(crag, metavalue)
}

function sendRoaches(){
let crag = "The Roaches"
let metavalue = "roaches"

sendtoCrag(crag, metavalue)
}

function sendHeptonstall(){
let crag = "Heptonstall Rocks"
let metavalue = "heptonstall"

sendtoCrag(crag, metavalue)
}

function sendCheesden(){
let crag = "Cheesden Lumb Mill"
let metavalue = "Cheesden Lumb Mill"

sendtoCrag(crag, metavalue)
}


function sendtoCrag(crag, metavalue ) {

 var spreadsheet = SpreadsheetApp.getActive();
 var sheet = spreadsheet.getSheetByName('Crags');
  var active_range = sheet.getActiveRange();
  var currentRow = active_range.getRowIndex();
  //var currentRow = "5";
  console.log(currentRow);


  if(currentRow <=1){Browser.msgBox('Select an actual signup', Browser.Buttons.OK); return;}
    if(currentRow >=100){Browser.msgBox('Select an actual signup', Browser.Buttons.OK); return;}


  var order_id = sheet.getRange(currentRow, 18,1,1).getValue();  /// get submission ID 1 BV ( was 67)
  var first_name = sheet.getRange(currentRow, 3,1,1).getValue();  /// get submission ID 1 BV ( was 67)

  console.log(order_id);
  
if(order_id === "" || order_id ===  "order_id"){Browser.msgBox('No Order ID Found', Browser.Buttons.OK); return;} 

/**
  var encodedAuthInformation = Utilities.base64Encode(apiusername+ ":" + apipassword);
  var headers = {"Authorization" : "Basic " + encodedAuthInformation};
  var options = {
  'method' : 'get',
  'contentType': 'application/json',
    'headers': headers,  // Convert the JavaScript object to a JSON string.
  'payload' : JSON.stringify(data)
};
url="https://www."+ apidomain + "/wp-json/wc/v3/orders/" + order_id

var response = UrlFetchApp.fetch(url, options);
  console.log(response);
 */


//  if (Browser.msgBox("Send " +first_name + " to " + crag + "? \n Order " + order_id, Browser.Buttons.OK_CANCEL) == "ok") { 



var cc_outdoor_assigner =  Session.getActiveUser().getEmail();

var data = {"meta_data": [
    {"key": "cc_outdoor_location",
    "value": metavalue}, 
    {"key": "cc_outdoor_location_assigned_by",
    "value": cc_outdoor_assigner }
  ], 
   "status": "processing"
};
//console.log(orderstatus);

  var encodedAuthInformation = Utilities.base64Encode(apiusername+ ":" + apipassword);
  var headers = {"Authorization" : "Basic " + encodedAuthInformation};
  var options = {
  'method' : 'post',
  'contentType': 'application/json',
    'headers': headers,  // Convert the JavaScript object to a JSON string.
  'payload' : JSON.stringify(data)
};
url="https://www."+ apidomain + "/wp-json/wc/v3/orders/" + order_id

var response = UrlFetchApp.fetch(url, options);
  console.log(response);



  
let venue =[[metavalue]];  
sheet.getRange(currentRow, 1,1,1).setValues(venue);   
//}

}


