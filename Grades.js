function readGrades() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Grades")
 
 var results = stmt.executeQuery('select distinct `cc_outdoor_location` "Venue", `nickname` "Facebook Name",`climbing-trad-grades` "Lead Trad",`climbing-sport-grades` "Sport Lead", `climbing-indoors-leading-grades` "Indoor Lead",`climbing-indoors-toproping-grades` "Indoor TR",`climbing-bouldering-indoors-grades`, `climbing-bouldering-outdoors-grades`,`admin-outdoors-requests-notes` "Requests and notes", pd.order_id from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by `cc_outdoor_location` ,`climbing-indoors-toproping-grades` desc,`climbing-indoors-leading-grades` desc,`order_created` Desc');
 appendToSheet(sheet, results);


results.close();
stmt.close();

} 