function readLifts() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();


// https://docs.traveltime.com/api/overview/introduction
// https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#maps_http_distancematrix_latlng-sh

let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Lifts")
 
 var results = stmt.executeQuery('select distinct `cc_outdoor_location` "Venue", `nickname` "Facebook Name",`transport-need-lift` "Need lift", `transport-will-you-give-lift` "Can give lift", `transport-leaving-location` "Location",climbing_outdoor_leaving_postcode "post code",`admin-outdoors-requests-notes` "Requests and notes", pd.order_id from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by `cc_outdoor_location` ,`transport-need-lift` desc,`transport-will-you-give-lift` desc,`order_created` Desc');
setTextFormat(sheet,"C2:D","No","#a9a9a9")
setColoursFormat(sheet,"C2:D","Yes","#ffd898")
 appendToSheet(sheet, results);


results.close();
stmt.close();

} 