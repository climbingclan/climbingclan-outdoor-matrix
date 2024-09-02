function readGear(){
 var conn = Jdbc.getConnection(url, username, password);
 var stmt = conn.createStatement();

 //Gear
let cell = setupCell("Dashboard","B5")
let sheet = setupSheet("Gear")
 
 var results = stmt.executeQuery('select distinct `cc_outdoor_location` "Venue",`nickname` "FB Name", gear_bringing_rack AS `Rack?`,gear_bringing_rope AS `Rope?`,gear_bringing_quickdraws AS `Quickdraws?`,gear_bringing_personal_gear AS `Personal Gear?`,   gear_bringing_firstaidkit "First Aid Kit",gear_bringing_guidebook "Guidebook"  from wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd on pd.user_id = db.id JOIN wp_member_db_gear ge on db.id = ge.id where product_id=' + cell + '  AND status="wc-processing" order by cc_outdoor_location,gear_bringing_rack desc,gear_bringing_rope desc, `skills-trad-climbing` ASC');
setColoursFormat(sheet,"f2:F","No","#ffd898")
setTextFormat(sheet,"c2:e","No","#a9a9a9")
setTextFormat(sheet,"g2:h","No","#a9a9a9")

 appendToSheet(sheet, results);
results.close();
stmt.close();
}