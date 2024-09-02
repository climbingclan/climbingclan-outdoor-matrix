var server = '18.168.242.164';
var port = 3306;
var dbName = 'bitnami_wordpress';
var username = 'gsheets';
var password = 'eyai4yohF4uX8eeP7phoob';
var url = 'jdbc:mysql://'+server+':'+port+'/'+dbName;
var outdoorTemplatePostID = "15510";
var volunteeringOrderID = 15
var volunteeringName = 3
var volunteeringVolunteerRole = 4
var apiKey = "AIzaSyD9x5EXE-c6G79MvG259pDeL7NhLwXT_kI" // "AIzaSyBhtGJEly6oyJ5hhhsIoRv3gMcK38aWYxc"
var openAiKey = "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"

function readData() {

readCragsData();
readLifts();
volunteerData();
readTradSkills();

readSportSkills();
readGear();
readGrades();

readTradSkillShare();
readSportSkillShare();
onOpen();

} 


function appendToSheet(sheet, results) {
     sheet.clearContents();

  let metaData = results.getMetaData();
  let numCols = metaData.getColumnCount();
  const rows = [];

  // First row with column labels
  const colLabels = [];
  for (let col = 0; col < numCols; col++) {
    colLabels.push(metaData.getColumnLabel(col + 1));
  }
  rows.push(colLabels);

  // Remaining rows with results
  while (results.next()) {
    const row = [];
    for (let col = 0; col < numCols; col++) {
      row.push(results.getString(col + 1));
    }
    rows.push(row);
  }

  // Find the last row containing a value
  const lastRow = sheet.getDataRange().getLastRow();

  // Set the values of the rows starting from the row below the last row containing a value
  // or the top row if it is empty
  let startRow = lastRow + 1;
  const topRowValues = sheet.getRange(1, 1, 1, numCols).getValues();
  if (topRowValues[0].every(value => value === "")) {
    startRow = 1;
  }



 sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);

   // Set the font size of the rows with column labels to 18
  sheet.getRange(1, 1, 1, numCols).setFontSize(14);
  sheet.autoResizeColumns(1, numCols + 1);

}




  function setColoursFormat(sheet,cellrange,search, colour) { 
  // Adds a conditional format rule to a sheet that causes all cells in range A1:B3 to turn red
  // if they contain a number between 1 and 10.

  let range = sheet.getRange(cellrange);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(search)
    .setBackground(colour)
   // .setTextStyle(0, 5, bold)
    .setRanges([range])
    .build()
  var rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
  }

//setColoursFormatLessThanOrEqualTo(sheet, "O3:O1000",">=","30","#e0ffff")
  function setColoursFormatLessThanOrEqualTo(sheet,cellrange, search, colour) { 
  // Adds a conditional format rule to a sheet that causes all cells in range A1:B3 to turn red
  // if they contain a number between 1 and 10.
search = Number(search);
  let range = sheet.getRange(cellrange);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThanOrEqualTo(search)
    .setBackground(colour)
   // .setTextStyle(0, 5, bold)
    .setRanges([range])
    .build()
  var rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
  }


//setNumberFormat(sheet, "O3:O1000", "Rule")
  function setNumberFormat(sheet,cellrange, format) { 

  let range = sheet.getRange(cellrange);
  range.setNumberFormat(format);
  
  }



    function setTextFormat(sheet,cellrange,search, colour) { 
  // Adds a conditional format rule to a sheet that causes all cells in range A1:B3 to turn red
  // if they contain a number between 1 and 10.

  let range = sheet.getRange(cellrange);
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(search)
  //  .setBackground(colour)
    .setFontColor(colour)
    .setRanges([range])
    .build()
  var rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
  }

    function setWrapped(sheet,cellrange) { 
  var cellrange = sheet.getRange(cellrange);
  cellrange.setWrap(true);
    }
    
function getIP() {
  var url = "http://api.ipify.org";
  var json = UrlFetchApp.fetch(url);
  Logger.log(json);

  
}

function setupSheet(name){
// let sheet = setupSheet("Volunteering")
var spreadsheet = SpreadsheetApp.getActive();
var sheet = spreadsheet.getSheetByName(name);

   sheet.clearFormats();
return sheet
}

function setupCell(name,range){
// let cell = setupCell("Dashboard","B5")
  var spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(name);
  return sheet.getRange(range).getValues();
}



function searchEmailsSheet(ccVolunteerOld) {
  var sheetName = 'Roles';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var numRows = dataRange.getNumRows();
  var numCols = dataRange.getNumColumns();
  var returnObj = {};
  for (var i = 1; i < numRows; i++) {
    if (values[i][0] == 'cc_volunteer_old') {
      var foundColumn = -1;
      for (var j = 1; j < numCols; j++) {
        if (values[i][j] == ccVolunteerOld) {
          foundColumn = j;
          break;
        }
      }
      if (foundColumn == -1) {
        throw new Error('Column not found');
      }
      for (var k = 1; k < numRows; k++) {
        returnObj[values[k][0]] = values[k][foundColumn];
      }
      break;
    }
  }
  return returnObj;
}


