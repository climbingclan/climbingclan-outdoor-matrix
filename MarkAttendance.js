var apidomain="climbingclan.com"
var apiusername="ck_3f8cd172e7aed36533d434e04e8c0b2affe19075"
var apipassword="cs_817f3cd22ae28bc33fa716a6fdfd707188c0409b"



function markAttended(){

var attendancetype = "Attended"
var attendanceshow = "Attended"
var metakey = "cc_attendance"
var orderstatus= "completed"
var metavalue = "attended"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

   //   .addItem('Mark Bad Weather Cancel', 'markBadWeatherCancelled')
   //   .addItem('Mark ClanCancelled', 'markClanCancelled')

function markClanCancelled(){

var attendancetype = "Cancel"
var attendanceshow = "Cancelled"
var metakey = "cc_attendance"
var orderstatus= "completed"
var metavalue = "cancelled by the Clan"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markBadWeatherCancelled(){

var attendancetype = "Cancel"
var attendanceshow = "Cancelled"
var metakey = "cc_attendance"
var orderstatus= "completed"
var metavalue = "cancelled due to bad weather"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}


function markCancelled(){

var attendancetype = "Cancel"
var attendanceshow = "Cancelled"
var metakey = "cc_attendance"
var orderstatus= "completed"
var metavalue = "cancelled"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markNoShow(){

var attendancetype = "NoShow"
var attendanceshow = "NoShow"
var orderstatus= "completed"
var metakey = "cc_attendance"
var metavalue = "noshow"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markDuplicate(){
var attendancetype = "Duplicate"
var attendanceshow = "Duplicated"
var orderstatus= "completed"
var metakey = "cc_attendance"
var metavalue = "duplicate"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markLateBail(){
var attendancetype = "Late Bail"
var attendanceshow = "Late Bail"
var orderstatus= "completed"
var metakey = "cc_attendance"
var metavalue = "late-bail"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markNoRegisterShow(){
var attendancetype = "No Register Show"
var attendanceshow = "No Register Show"
var orderstatus= "completed"
var metakey = "cc_attendance"
var metavalue = "noregistershow"

markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue)
}

function markAttendance(attendancetype, attendanceshow, orderstatus, metakey, metavalue ) {

 var spreadsheet = SpreadsheetApp.getActive();
 var sheet = spreadsheet.getSheetByName('Crags');
 
  var active_range = sheet.getActiveRange();
  var currentRow = active_range.getRowIndex();
  //var currentRow = "14";
  console.log(currentRow);


  if(currentRow <=1){Browser.msgBox('Select an actual signup', Browser.Buttons.OK); return;}
    if(currentRow >=200){Browser.msgBox('Select an actual signup', Browser.Buttons.OK); return;}


  var order_id = sheet.getRange(currentRow, 18,1,1).getValue();  /// get submission ID 1 BV ( was 67)
  var first_name = sheet.getRange(currentRow, 3,1,1).getValue();  /// get submission ID 1 BV ( was 67)

  console.log(order_id);
  
if(order_id === ""){Browser.msgBox('No Order ID Found', Browser.Buttons.OK); return;} 

  if (Browser.msgBox("Mark " + attendancetype + " on " +first_name + "'s place? \n Order " + order_id, Browser.Buttons.OK_CANCEL) == "ok") { 



var cc_attendance_setter =  Session.getActiveUser().getEmail();

var data = {"meta_data": [
    {"key": metakey,
    "value": metavalue}, 
    {"key": "cc_attendance_set_by",
    "value": cc_attendance_setter }
  ], 
   "status": orderstatus
};
console.log(orderstatus);

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


//remove old data

  
var blankArray =[[attendanceshow,order_id]];  /// set a blank variable to delete row (45 values)
sheet.getRange(currentRow, 1,1,2).setValues(blankArray);   // paste the blank variables into the cells to delete contents
}

}


