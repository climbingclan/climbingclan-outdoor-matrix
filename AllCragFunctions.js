//      .addItem('Finalise Assignments', 'test')
// MarkAttended and Close
// https://woocommerce.github.io/woocommerce-rest-api-docs/#batch-update-orders

// Get all IDs
// SELECT order_id  FROM wp_order_product_customer_lookup where product_id=$id AND status='wc-processing' AND cc_attendance='pending'
// Make on hold

function runnerMe(){

  //let product_id = setupCell("Dashboard","B5")

//  var product_id = [16332]
  //  var product_id = sheet.getRange('B5').getValues();

    //  let nextWeekID = createNextWeek(Number(product_id[0][0]))

//  let nextWeekID = createNextWeek(Number(product_id))


  console.log(sendAllCragAssignments("close"))
}

/**
 * Processes and updates the status of orders and products related to a specific product ID.
 *
 * This function connects to a database, retrieves order information for a specified product ID, and updates the order and product status based on the provided action.
 *
 * The function supports the following actions:
 * - "close": Marks the order as "completed" and sets the "cc_attendance" meta field to "attended".
 * - "location": Marks the order as "on-hold" and sets the "cc_location_signed_off_by" and "cc_location_finalised_at" meta fields.
 * - Any other action: Logs a message indicating that all tasks are complete.
 *
 * If the "close" action is performed, the function also creates a new product for the next week by calling the `createNextWeek` function, and updates the original product's status to "private".
 *
 * @param {string} tellme - The action to perform ("close" or "location").
 * @returns {(number|undefined)} - If the "close" action is performed, the function returns the ID of the newly created product. Otherwise, it returns undefined.
 * @throws {Error} - If there is an error connecting to the database or executing the SQL query.
 */
function sendAllCragAssignments(tellme) {

  const action = tellme
  var sconn = Jdbc.getConnection(url, username, password);
  var sstmt = sconn.createStatement();

  let product_id = setupCell("Dashboard","B5")
  //var product_id = [[16332]]

  //var product_id = [[16069]];

  var order_results = sstmt.executeQuery('SELECT distinct order_id from wp_order_product_customer_lookup where product_id="' + product_id + '"AND status="wc-processing" AND cc_attendance="pending" LIMIT 99');
  let active_user = Session.getActiveUser().getEmail();
  let currentUnixTime = Date.now();
  //var order_results = sstmt.executeQuery('select "3575"');

  while (order_results.next()) {

    scores_arr = [];
    for (let col = 0; col < 1; col++) {
      scores_arr.push(order_results.getString(col + 1));
    }
    console.log(scores_arr);


    let order_id = scores_arr[0];


    if (action === "close") {

            var data = {
              "status": "completed",
              "meta_data": [
                {
                  "key": "cc_attendance_set_by",
                  "value": active_user
                },
                {
                  "key": "cc_attendance_set_at",
                  "value": currentUnixTime
                },
                {
                  "key": "cc_attendance",
                  "value": "attended"
                }

              ]
            }
         //   Logger.log(data);


            pokeToWordPressOrders(data, order_id);






    } else if (action === "location") {


            var data = {
              "id": order_id,
              "status": "on-hold",
              "meta_data": [
                {
                  "key": "cc_location_signed_off_by",
                  "value": active_user
                },
                {
                  "key": "cc_location_finalised_at",
                  "value": currentUnixTime
                }
              ]
            }

            Logger.log(data);


            pokeToWordPressOrders(data, order_id);
            markOutOfStock()

    } else {
      console.log("All done")
    }
    //conn.close();

    //console.log("done")
  }


  if (action === "close") {
console.log("Product ID type: " + typeof(product_id) + " " + product_id)
    let nextWeekID = createNextWeek(Number(product_id[0][0]))

    var data = {
      "status": "private",
      "meta_data": [
        {
          "key": "cc_post_set_private_set_by",
          "value": active_user
        },
        {
          "key": "cc_post_set_private_set_at",
          "value": currentUnixTime
        }

      ]

    }
    console.log("data");

    pokeToWordPressProducts(data, product_id);

    return nextWeekID

  } else {
    console.log("All done")
  }



}


//console.log(cell);

/**
 * Marks all pending orders for a specific product as "attended" and closes the event.
 *
 * This function performs the following steps:
 * 1. Displays a message box asking the user to confirm the action.
 * 2. Displays a message box reminding the user that this action should be performed on Thursday evening.
 * 3. Displays a message box warning the user that this action cannot be undone.
 * 4. Calls the `sendAllCragAssignments` function with the "close" action to update the order and product status.
 *
 * After the event is closed, the function does not perform any additional actions.
 *
 * @throws {Error} - If there is an error displaying the message boxes or calling the `sendAllCragAssignments` function.
 */
function markAttendedAndCloseEvent() {

        if (Browser.msgBox("This will mark all those who haven't been cancelled as ATTENDED and will close the event", Browser.Buttons.OK_CANCEL) == "ok") {
        if (Browser.msgBox("This should be done on Thursday evening", Browser.Buttons.OK_CANCEL) == "ok") {

          if (Browser.msgBox("This cannot be undone", Browser.Buttons.OK_CANCEL) == "ok") {



  sendAllCragAssignments("close");
  //markEventComplete;
  /// Close the event 
          }}}
}

/**
 * Finalizes the crag locations and emails everyone their locations.
 *
 * This function performs the following steps:
 * 1. Displays a message box asking the user to confirm the action.
 * 2. Displays a message box reminding the user that this action should be performed after 12:00 on Wednesday.
 * 3. Displays a message box warning the user that after this action, the locations cannot be changed.
 * 4. Calls the `sendAllCragAssignments` function with the "location" action to update the order status and mark the locations as finalized.
 *
 * After the locations are finalized, the function does not perform any additional actions.
 *
 * @throws {Error} - If there is an error displaying the message boxes or calling the `sendAllCragAssignments` function.
 */
function finaliseCragLocations() {

        if (Browser.msgBox("This will finalise the locations and email everyone their locations immediately", Browser.Buttons.OK_CANCEL) == "ok") {
        if (Browser.msgBox("This should be done after 12:00 on Wed", Browser.Buttons.OK_CANCEL) == "ok") {
          if (Browser.msgBox("After this, you cant change any locations", Browser.Buttons.OK_CANCEL) == "ok") {


  sendAllCragAssignments("location");

            }}}
}

