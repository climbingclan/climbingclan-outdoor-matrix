
function getLatLngFromPostcode(postcode) {
  var baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  
  // Encode the postcode to ensure it is URL-safe
  var encodedPostcode = encodeURIComponent(postcode);
  
  // Construct the full URL for the Geocoding API request
  var requestUrl = baseUrl + '?address=' + encodedPostcode + '&key=' + apiKey;
  
  try {
    // Make the request to the Geocoding API
    var response = UrlFetchApp.fetch(requestUrl);
    var json = JSON.parse(response.getContentText());
    
    // Check if the request was successful
    if (json.status === 'OK') {
      // Extract the latitude and longitude from the response
      var location = json.results[0].geometry.location;
      return location; // This is an object with 'lat' and 'lng' properties
    } else {
      // Handle the case where the Geocoding API did not return a successful response
      Logger.log('Geocoding API request failed with status: ' + json.status);
      return null;
    }
  } catch (e) {
    // Log and rethrow any errors that occur during the request or parsing stages
    Logger.log('Error during Geocoding API request: ' + e.toString());
    throw e;
  }
}


/**
 * Processes the route matrix response from the Google Maps Distance Matrix API to group results by origin,
 * including nested destination details. Each origin group includes transport preferences and nested destination
 * details such as location reach, condition, legacy ID, duration in minutes, and distance in kilometers.
 * 
 * The function constructs a payload with origins and destinations, makes a POST request to the API,
 * and processes the response to organize the data by origin ID. It converts distances from meters to kilometers
 * and durations from seconds to minutes, rounding both to two decimal places. It also calculates the total
 * time to travel from the origin to each destination, including the time to reach from parking.
 *
 * @param {Object} data - The data object containing arrays of origins and destinations. Each origin and destination
 *                        includes latitude (lat), longitude (lng), and a unique identifier (order_id for origins,
 *                        destination_id for destinations). Origins also include transport preferences
 *                        (transport_need_lift, transport_can_give_lift), and destinations include
 *                        location_reach_from_parking.
 * @param {string} apiKey - The API key for accessing the Google Maps Distance Matrix API.
 * @returns {Object} An object with origin IDs as keys. Each key maps to an object containing transport preferences
 *                   and a nested 'destinations' object. Each destination within this nested object includes
 *                   location_reach_from_parking, condition, legacy_id, duration (in minutes), distanceKilometres,
 *                   and location_total_time_to_travel.
 *
 * @example
 * // Input data example
 * let data = {
 *   origins: [
 *     { lat: 53.480759, lng: -2.242631, order_id: "8094", transport_need_lift: "No", transport_can_give_lift: "Yes" }
 *   ],
 *   destinations: [
 *     { lat: 53.300818, lng: -2.009995, destination_id: "Windgather Rocks", location_reach_from_parking: "8" },
 *     { lat: 53.616944, lng: -2.459222, destination_id: "Castle Naze", location_reach_from_parking: "10" }
 *   ]
 * };
 * let apiKey = 'YOUR_API_KEY';
 *
 * // Example output
 * let output = computeRouteMatrix(data, apiKey);
 * console.log(output);
 * // Output structure:
 * {
 *   "8094": {
 *     transport_need_lift: "No",
 *     transport_can_give_lift: "Yes",
 *     destinations: {
 *       "Windgather Rocks": {
 *         location_reach_from_parking: 8,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15483",
 *         duration: 171.55,
 *         distanceKilometres: 29.63,
 *         location_total_time_to_travel: 179.55
 *       },
 *       "Castle Naze": {
 *         location_reach_from_parking: 10,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15484",
 *         duration: 160.57,
 *         distanceKilometres: 32.07,
 *         location_total_time_to_travel: 170.57
 *       }
 *     }
 *   }
 * }
 */
function computeRouteMatrix(data) {
  var apiUrl = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
  // Construct the request payload using the provided data object
  var payload = {
    origins: data.origins.map(function(origin) {
      return {
        waypoint: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng
            }
          }
        },
        routeModifiers: { avoid_ferries: true }
      };
    }),
    destinations: data.destinations.map(function(destination) {
      return {
        waypoint: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng
            }
          }
        }
      };
    }),
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    departureTime: getNextThursdayAt5PM(),

  };

  // Set options for the POST request
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,condition'
    },
    payload: JSON.stringify(payload)
  };

  // Make the POST request
  var response = UrlFetchApp.fetch(apiUrl, options);
  var jsonResponse = JSON.parse(response.getContentText());
  // Initialize an object to hold the grouped results
  var groupedResults = {};

// Iterate over each route in the jsonResponse
jsonResponse.forEach(function(route) {
  var origin = data.origins[route.originIndex];
  var destination = data.destinations[route.destinationIndex];

  // If this origin_id doesn't exist in groupedResults, initialize it
  if (!groupedResults[origin.order_id]) {
    groupedResults[origin.order_id] = {
      transport_need_lift: origin.transport_need_lift,
      transport_can_give_lift: origin.transport_can_give_lift,
      destinations: {}
    };
  }

  // Convert distance from meters to kilometers and round to two decimal places
  var distanceKilometres = parseFloat((route.distanceMeters / 1000).toFixed(2));

  // Clean duration's value from seconds to minutes, ensure it's a number, and round to two decimal places
  var durationInMinutes = parseFloat((parseFloat(route.duration.replace('s', '')) / 60).toFixed(2));

  // Ensure location_reach_from_parking is a number and round to two decimal places if necessary
  var locationReachFromParking = parseFloat(parseFloat(destination.location_reach_from_parking).toFixed(2));

  // Calculate total time to travel and round to two decimal places
  var locationTotalTimeToTravel = parseFloat((durationInMinutes + locationReachFromParking).toFixed(2));

  // Add destination details under this origin
  groupedResults[origin.order_id].destinations[destination.destination_id] = {
    location_reach_from_parking: locationReachFromParking,
    condition: route.condition,
    legacy_id: destination.legacy_id,
    duration: durationInMinutes, // Updated to be in minutes and rounded
    distanceKilometres: distanceKilometres, // Updated to show distance in kilometers and rounded
    location_total_time_to_travel: locationTotalTimeToTravel // New property, rounded
  };
});


  // Log the grouped results
  //Logger.log(groupedResults);

  // Return the grouped results
  return groupedResults;
}

/**
 * Fetches origin data for a given event, including order IDs, geocoded postcodes, and transport preferences.
 * The data is retrieved based on the event ID and structured into an 'origins' array suitable for routing calculations.
 *
 * @param {number|string} eventId The unique identifier of the event for which to fetch origin data.
 * @returns {Object[]} An array of origin objects, each containing latitude, longitude, order ID, and transport preferences.
 */
function getOrigins(eventId) {
  var conn = Jdbc.getConnection(url, username, password);
  var stmt = conn.createStatement();


  var query = 'SELECT pd.order_id, db.climbing_outdoor_leaving_postcode_geocoded, db.`transport-need-lift`, db.`transport-will-you-give-lift`,first_name,last_name ' +
              'FROM wp_member_db db ' +
              'LEFT JOIN wp_order_product_customer_lookup pd ON pd.user_id = db.id ' +
              'WHERE product_id = ' + eventId[0][0] + ' AND ' +
              'db.climbing_outdoor_leaving_postcode_geocoded IS NOT NULL AND ' +
              'db.climbing_outdoor_leaving_postcode_geocoded <> "" ';// + 
        //      'AND status IN ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance = "pending"';

  var results = stmt.executeQuery(query);
  var origins = [];

  while (results.next()) {
    var latLng = results.getString("climbing_outdoor_leaving_postcode_geocoded").split(", ");
    origins.push({
      lat: parseFloat(latLng[0]),
      lng: parseFloat(latLng[1]),
      order_id: results.getString("order_id"),
      transport_need_lift: results.getString("transport-need-lift"),
      transport_can_give_lift: results.getString("transport-will-you-give-lift"),
      first_name:results.getString("first_name"),
      last_name: results.getString("last_name"),
    });
  }

  stmt.close();
  conn.close();

  return origins;
}

/**
 * Fetches destination data from the 'wp_acf_post_view', including parking locations and associated post information.
 * The data is structured into a 'destinations' array suitable for routing calculations, with each destination
 * including latitude, longitude, a unique destination identifier, and a legacy identifier.
 *
 * @returns {Object[]} An array of destination objects, each containing latitude, longitude, destination ID, and legacy ID.
 */
function getDestinations() {
  var conn = Jdbc.getConnection(url, username, password);
  var stmt = conn.createStatement();

  
var query = 'SELECT crag_id, crag_name, location_parking, location_reach_from_parking, location_must_lead, location_must_tr,location_trad_sport_bouldering ' +
            'FROM wp_clan_crags ' +
            'WHERE location_parking IS NOT NULL AND location_parking <> "" AND location_trad_sport_bouldering <> "Indoor"';


  var results = stmt.executeQuery(query);
  var destinations = [];

while (results.next()) {
  var locationParking = results.getString("location_parking");
  // Regular expression to match latitude and longitude in the string
  var latLngMatch = locationParking.match(/([-\d\.]+),\s*([-\d\.]+)/);
  
  if (latLngMatch) {

    destinations.push({
      lat: parseFloat(latLngMatch[1]), // Latitude is the first capturing group
      lng: parseFloat(latLngMatch[2]), // Longitude is the second capturing group
      destination_id: results.getString("crag_name"),
      legacy_id: results.getString("crag_id"),
      location_reach_from_parking: results.getString("location_reach_from_parking"),
      location_must_lead: results.getString("location_must_lead"),
      location_must_tr: results.getString("location_must_tr"),
      location_trad_sport_bouldering: results.getString("location_trad_sport_bouldering")
    });
  } else {
    console.log("Could not parse location_parking for record: " + locationParking);
    // Handle the case where the location_parking format does not match the expected pattern
  }
}


  stmt.close();
  conn.close();

  return destinations;
}



/**
 * Combines the outputs of getOrigins and getDestinations to create a data object for computeRouteMatrix.
 * Then, it computes the route matrix for the given origins and destinations and logs the output.
 */
function prepareAndComputeMatrix() {
  let event_id = setupCell("Dashboard", "B5"); // Returns event_id
console.log("computing routes for event", event_id)
  // Fetch origins and destinations data
  let origins = getOrigins(event_id); 
  let destinations = getDestinations();
  /*MailApp.sendEmail({
    to: "td@tdobson.net",
    subject: "destinations",
    body: JSON.stringify(destinations, null, 2)
  });*/
  
  // Construct the data object for computeRouteMatrix
  let data = {
    origins: origins,
    destinations: destinations
  };


  // Compute the route matrix and log the output
  let matrixOutput = computeRouteMatrix(data);
  let routeMatrixData = augmentRouteMatrixData(matrixOutput) //augments the data
  let shrunkData = shrinkAugmentedData(routeMatrixData)
  // shrink the data
  // query chat gpt
  // make suggestions to API
//Logger.log(JSON.stringify(shrunkData))
return shrunkData;

}


function getNextThursdayAt5PM() {
    var now = new Date();

    // Calculate the number of days to add to get to the next Thursday
    var daysToAdd = 0;
    var dayOfWeek = now.getDay(); // Day of the week: 0 (Sunday) - 6 (Saturday)
    var hour = now.getHours(); // Current hour

    if (dayOfWeek < 4) { // If today is before Thursday
        daysToAdd = 4 - dayOfWeek; // Move to the next Thursday
    } else if (dayOfWeek > 4) { // If today is after Thursday
        daysToAdd = 11 - dayOfWeek; // Move to the next Thursday
    } else if (hour >= 17) { // If today is Thursday and it's 5 PM or later
        daysToAdd = 7; // Move to the next Thursday
    }
    // If today is Thursday and it's before 5 PM, daysToAdd remains 0

    // Set the date to the next Thursday (or today if it's Thursday before 5 PM)
    var nextThursday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd);

    // Set the time to 5 PM
    nextThursday.setHours(17, 0, 0, 0); // 17:00:00.000

    // Format the date and time in the desired format
    var departureTime = nextThursday.toISOString();

    // Return the formatted departure time
    return departureTime;
}

/**
 * Augments the given route matrix data with additional information fetched from an SQL query. The function matches entries by `order_id` and adds new properties to each matched entry based on the SQL query results. The additional properties include personal and climbing-related information for each participant, such as first name, nickname, climbing preferences, and skills.
 *
 * @param {Object} routeMatrixData - The initial route matrix data object to be augmented. This object is structured with `order_id` as keys, each mapping to an object that includes transport preferences and a nested 'destinations' object with details for each destination.
 * @returns {Object} The augmented route matrix data object. Each `order_id` entry is enhanced with additional properties fetched from the database, such as first name, climbing preferences, and skills.
 *
 * @example
 * // Input routeMatrixData example
 * let routeMatrixData = {
 *   "8094": {
 *     transport_need_lift: "No",
 *     transport_can_give_lift: "Yes",
 *     destinations: {
 *       "Windgather Rocks": {
 *         location_reach_from_parking: 8,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15483",
 *         duration: 171.55,
 *         distanceKilometres: 29.63,
 *         location_total_time_to_travel: 179.55
 *       }
 *     }
 *   }
 * };
 *
 * // Example of augmented routeMatrixData after running augmentRouteMatrixData
 * let augmentedData = augmentRouteMatrixData(routeMatrixData);
 * console.log(augmentedData);
 * // Output structure example:
 * {
 *   "8094": {
 *     transport_need_lift: "No",
 *     transport_can_give_lift: "Yes",
 *     first_name: "John",
 *     nickname: "Johnny",
 *     admin_first_timer_outdoor: "yes",
 *     climbing_discipline_preference: "Trad",
 *     skills_trad_climbing: "trad leader",
 *     destinations: {
 *       "Windgather Rocks": {
 *         location_reach_from_parking: 8,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15483",
 *         duration: 171.55,
 *         distanceKilometres: 29.63,
 *         location_total_time_to_travel: 179.55
 *       }
 *     }
 *   }
 * }
 *
 * Note: The actual output will include more properties and destinations based on the SQL query results and the initial routeMatrixData.
 */
function augmentRouteMatrixData(routeMatrixData) {
  var conn = Jdbc.getConnection(url, username, password);
  var stmt = conn.createStatement();
  let cell = setupCell("Dashboard", "B5"); // Assuming setupCell returns the required event/product ID

  var results = stmt.executeQuery('SELECT DISTINCT  `nickname`, `admin-first-timer-outdoor`, `climbing-discipline-preference`, `skills-trad-climbing`, `skills-sport-climbing`, gear_bringing_rack, gear_bringing_rope, `climbing-indoors-toproping-grades`,  `transport-leaving-location`, `admin-outdoors-requests-notes`, climbing_outdoor_crag_location_preference, scores_attendance_reliability_score_cached, `skills-belaying`, pd.order_id FROM wp_member_db db LEFT JOIN wp_order_product_customer_lookup pd ON pd.user_id = db.id JOIN wp_member_db_gear gr ON pd.user_id = gr.id JOIN wp_member_db_skills sk ON pd.user_id = sk.id WHERE product_id = ' + cell ); //+ ' AND status IN ("wc-processing", "wc-onhold", "wc-on-hold") AND cc_attendance = "pending" ORDER BY FIELD(`cc_outdoor_location`, "none", "", "bamford_edge", "harpurhill", "wilton1", "wilton2", "wilton3", "wilton4", "cadshaw", "windgather") ASC, `cc_outdoor_location`, pd.cc_volunteer DESC, gear_bringing_rack DESC, skills_belaying_lead DESC, `skills-trad-climbing` ASC, `skills-sport-climbing` ASC, `climbing-indoors-toproping-grades` DESC');
  
  while (results.next()) {
    var orderId = results.getString("order_id");

    // Check if this order_id exists in the routeMatrixData
    if (routeMatrixData[orderId]) {
      // Iterate over each column name and value from the SQL result
      var metaData = results.getMetaData();
      var columnCount = metaData.getColumnCount();
      for (var i = 1; i <= columnCount; i++) {
        var columnName = metaData.getColumnName(i).replace(/-/g, '_'); // Replace hyphens with underscores
        var value = results.getString(metaData.getColumnName(i)); // would this work?

        // Add the sanitized property name and its value to the routeMatrixData
        routeMatrixData[orderId][columnName] = value;
      }
    }
  }

  stmt.close();
  conn.close();

  return routeMatrixData;
}


/**
 * Processes augmented route matrix data to remove specified properties from each destination.
 * Retains only the 'location_total_time_to_travel' property within each destination object.
 *
 * @param {Object} augmentedData - The augmented route matrix data object.
 * @returns {Object} The processed data object with unwanted destination properties removed.
 *
 * @example
 * // Input augmentedData example
 * let augmentedData = {
 *   "8094": {
 *     transport_need_lift: "No",
 *     transport_can_give_lift: "Yes",
 *     scores_attendance_reliability_score_cached: "10",
 *     skills_trad_climbing: "trad leader",
 *     destinations: {
 *       "Windgather Rocks": {
 *         location_reach_from_parking: 8,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15483",
 *         duration: 171.55,
 *         distanceKilometres: 29.63,
 *         location_total_time_to_travel: 179.55
 *       },
 *       "Castle Naze": {
 *         location_reach_from_parking: 10,
 *         condition: "ROUTE_EXISTS",
 *         legacy_id: "15484",
 *         duration: 160.57,
 *         distanceKilometres: 32.07,
 *         location_total_time_to_travel: 170.57
 *       }
 *     },
 *     admin_first_timer_outdoor: "yes",
 *     climbing_discipline_preference: "Trad"
 *   }
 * };
 *
 * // Example of processed data after running shrinkAugmentedData
 * let processedData = shrinkAugmentedData(augmentedData);
 * console.log(processedData);
 * // Output structure example:
 * {
 *   "8094": {
 *     transport_need_lift: "No",
 *     transport_can_give_lift: "Yes",
 *     scores_attendance_reliability_score_cached: "10",
 *     skills_trad_climbing: "trad leader",
 *     destinations: {
 *       "Windgather Rocks": {
 *         location_total_time_to_travel: 179.55
 *       },
 *       "Castle Naze": {
 *         location_total_time_to_travel: 170.57
 *       }
 *     },
 *     admin_first_timer_outdoor: "yes",
 *     climbing_discipline_preference: "Trad"
 *   }
 * }
 */
function shrinkAugmentedData(augmentedData) {
  // Iterate over each order_id in the augmented data
  for (let orderId in augmentedData) {
    if (augmentedData.hasOwnProperty(orderId)) {
      let orderData = augmentedData[orderId];

      // Check if destinations exist in the order data
      if (orderData.destinations) {
        // Iterate over each destination within the order
        for (let destinationName in orderData.destinations) {
          if (orderData.destinations.hasOwnProperty(destinationName)) {
            let destinationData = orderData.destinations[destinationName];

            // Keep only the 'location_total_time_to_travel' property
            orderData.destinations[destinationName] = {
              location_total_time_to_travel: destinationData.location_total_time_to_travel
            };
          }
        }
      }
    }
  }

  return augmentedData;
}
