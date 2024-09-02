function readTradSkillShare() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

 let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Trad SkillShare")
 
 var results = stmt.executeQuery('select distinct `cc_outdoor_location` as `Venue`,`nickname` as "Facebook Name", skillshare_climbing_trad_seconding as "Trad Seconding",skillshare_climbing_trad_belaying_half_ropes as "Belaying Half Ropes",  skillshare_climbing_trad_leading_trad as "Leading Trad",  skillshare_climbing_trad_setting_up_top_rope as "Setting Up Top Rope",   skillshare_climbing_trad_abseiling as "Abseiling",  skillshare_climbing_trad_retrievable_abseils as "Retrievable Abseils",   skillshare_climbing_trad_belay_escape as "Belay Escape",   pd.order_id from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id JOIN wp_member_db_skillshare sks on db.id = sks.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by cc_outdoor_location,`skillshare_climbing_trad_leading_trad` desc,`skillshare_climbing_trad_multipitch_anchors` desc,`skillshare_climbing_trad_abseiling` Desc, skillshare_climbing_trad_seconding desc');
setTextFormat(sheet,"C2:V","No","#a9a9a9")

appendToSheet(sheet, results);


results.close();
stmt.close();

} 