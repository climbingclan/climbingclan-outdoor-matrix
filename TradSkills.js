function readTradSkills() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Trad Skills")
 
 var results = stmt.executeQuery('select distinct  `cc_outdoor_location` as `Venue`,`nickname` AS "Facebook Name",skills_trad_leading "Lead Trad",skills_trad_multipitch_anchors "Multipitch Trad", skills_trad_toprope "Trad Toprope",skills_belaying_halfropes "twin belay",skills_trad_abseiling "Abseiling for trad", skills_trad_retrievable_abseils "Retrvl abseils",  skills_trad_belay_escape "Trad Escape",`climbing-trad-grades` "Trad Grades",`climbing-indoors-toproping-grades` "Indoor TR",`climbing-indoors-leading-grades` "Indoor Lead", pd.order_id "Order ID" from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id JOIN wp_member_db_skills sk on pd.user_id = sk.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by cc_outdoor_location,`skills_trad_leading` desc,skills_trad_multipitch_anchors desc,`skills_belaying_lead`  desc, `climbing-trad-grades` asc,`climbing-indoors-toproping-grades` desc,  `order_created` Desc');
setTextFormat(sheet,"C2:V","No","#a9a9a9")

appendToSheet(sheet, results);

results.close();
stmt.close();

} 