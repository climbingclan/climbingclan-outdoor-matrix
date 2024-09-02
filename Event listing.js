function readEvents() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();
 


 // select distinct product_id, order_item_name from wp_wc_order_product_augmented where order_item_name LIKE "%Wednesday%" order by product_id desc;
 //Wednesday
 var spreadsheet = SpreadsheetApp.getActive();
 var sheet = spreadsheet.getSheetByName('Dashboard');
  var cell = sheet.getRange('B5').getValues();


// Event Listing
//

 var results = stmt.executeQuery('select distinct order_item_name, product_id from wp_order_product_customer_lookup where memberbot_order_category LIKE "%outdoor%"  AND cc_attendance="pending" order by product_id desc');
  //console.log(results);
 var metaData=results.getMetaData();
  var numCols = metaData.getColumnCount();
 var spreadsheet = SpreadsheetApp.getActive();
 var sheet = spreadsheet.getSheetByName('Event List');
 sheet.clearContents();
 var arr=[];
  for (var col = 0; col < numCols; col++) {
   arr.push(metaData.getColumnLabel(col + 1));
 }
 // https://stackoverflow.com/questions/10585029/parse-an-html-string-with-js 
  sheet.appendRow(arr);
 while (results.next()) {
 arr=[];
 for (var col = 0; col < numCols; col++) {
   arr.push(results.getString(col + 1));
 }
 sheet.appendRow(arr);
 }
sheet.autoResizeColumns(1, numCols+1);

//close SQL
results.close();
stmt.close();



// select distinct product_id, order_item_name from wp_order_product_customer_lookup where order_item_name LIKE "%Wednesday%" AND order_item_name LIKE "%Top%" order by product_id desc;


//end read data function
} 
