function readSportSkills() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Sport Skills")
 
 var results = stmt.executeQuery('select distinct  `cc_outdoor_location` as `Venue`,`nickname` AS "Facebook Name",skills_sport_leading_outside "Lead Outdoors",skills_sport_stripping "Clean Anchors",skills_sport_setting_up_top_rope "Top Rope", skills_sport_leading_clipstick "Use Clipstick",`climbing-sport-grades` "Sport Grades",`climbing-indoors-toproping-grades` "Indoor TR",`climbing-indoors-leading-grades` "Indoor Lead", pd.order_id "Order ID" from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id JOIN wp_member_db_skills sk on pd.user_id = sk.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by cc_outdoor_location,`skills_sport_leading_outside` desc,skills_sport_stripping desc,`skills_belaying_lead` desc,`skills_belaying_lead` desc,`skills_trad_leading` desc,`skills_trad_leading` desc,skills_sport_leading_outside desc, `climbing-sport-grades` desc, `climbing-indoors-toproping-grades` desc, `order_created` Desc');

setTextFormat(sheet,"C2:V","No","#a9a9a9")

appendToSheet(sheet, results);




results.close();
stmt.close();

} 