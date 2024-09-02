function readSportSkillShare() {
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

 let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Sport SkillShare")
 
 var results = stmt.executeQuery('select distinct `cc_outdoor_location` as `Venue`,`nickname` as "Facebook Name",  skillshare_climbing_sport_seconding_outside as "Sport Seconding Outside",  skillshare_climbing_sport_lead_climbing as "Sport Lead Climbing",  skillshare_climbing_sport_stripping_route as "Cleaning Anchor",  skillshare_climbing_sport_setting_up_top_rope as "Setting Up Top Rope",    pd.order_id from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id JOIN wp_member_db_skillshare sks on db.id = sks.id where product_id=' + cell + ' AND status in ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance="pending" order by cc_outdoor_location,`skillshare_climbing_sport_lead_climbing` desc,`skillshare_climbing_sport_stripping_route` desc,`skillshare_climbing_sport_setting_up_top_rope` Desc, skillshare_climbing_sport_seconding_outside desc');
setTextFormat(sheet,"C2:V","No","#a9a9a9")

appendToSheet(sheet, results);


results.close();
stmt.close();

} 