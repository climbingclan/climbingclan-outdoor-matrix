/**
 * Creates a new product based on an existing product's ID.
 *
 * @param {number} oldProductId - The ID of the existing product to use as a template.
 * @returns {(number|null)} - The ID of the newly created product, or null if the operation failed.
 */
function createNextWeek(oldProductId) {
  var meta_key = "event_next_week";
  
  var product = getProductById(Number(oldProductId));
  var existingProductId = getMetaValue(product, meta_key);
   
  if (Number(existingProductId) === Number(oldProductId)) {
    console.log("Product already exists with the same meta value:", existingProductId);
    return existingProductId;
  }
  
  var nextThursday = getNextThursdayAt6PM();
  var productName = "Outdoor Thursday Climbing Clan";
  var dateFormatted = formatDate(nextThursday);
  var newProductName = productName + " " + dateFormatted;
      var newProductDate = formatDateISO(nextThursday);

  
  // Check if an event with the same name already exists
  var existingProduct = getProductByName(newProductName);
  
  //console.log(JSON.stringify(existingProduct))
  if (existingProduct && existingProduct.sku && String(existingProduct.sku) === String(newProductDate + "-Outdoor")) {
    console.log("Event already exists with the name:", newProductName);
      console.log(JSON.stringify(existingProduct))
    return existingProduct.id;
  }

  var newProductId = duplicateProductInWordPress(outdoorTemplatePostID);
  console.log("old:" + oldProductId);
  console.log("new:" + newProductId);
  console.log(meta_key);

  if (newProductId) {
    var success = addMetaToProduct(product, meta_key, newProductId.toString());
        
    if (success) {
      console.log("New Event ID Noted:", success);
      return newProductId;
    }
  }
  
  return null;
}

function getProductByName(productName) {
  var encodedAuthInformation = Utilities.base64Encode(apiusername + ":" + apipassword);
  var headers = { "Authorization": "Basic " + encodedAuthInformation };
  var productUrl = "https://www." + apidomain + "/wp-json/wc/v3/products?search=" + encodeURIComponent(productName);
  var options = { 'headers': headers };
  var response = UrlFetchApp.fetch(productUrl, options);
  var products = JSON.parse(response.getContentText());
  
  if (products.length > 0) {
    return products[0];
  }
  
  return null;
}

function getProductBySKU(sku) {
  var encodedAuthInformation = Utilities.base64Encode(apiusername + ":" + apipassword);
  var headers = { "Authorization": "Basic " + encodedAuthInformation };
  var productUrl = "https://www." + apidomain + "/wp-json/wc/v3/products?sku=" + encodeURIComponent(sku);
  var options = { 'headers': headers };
  var response = UrlFetchApp.fetch(productUrl, options);
  var products = JSON.parse(response.getContentText());
  
  if (products.length > 0) {
    return products[0];
  }
  
  return null;
}

/**
 * Duplicates a product in WordPress based on a template.
 *
 * @param {number} templateFunction - The ID of the template product to use.
 * @returns {number} - The ID of the newly created product.
 */
function duplicateProductInWordPress(templateFunction) {
  var nextThursday = getNextThursdayAt6PM();
  var wednesdayNoon = getWednesdayNoon();
  var productName = "Outdoor Thursday Climbing Clan";
  var dateFormatted = formatDate(nextThursday);
  var newProductName = productName + " " + dateFormatted;
  var newProductDate = formatDateISO(nextThursday);
  
  var originalProduct = getProductById(templateFunction);
  var newProduct = createDuplicateProduct(originalProduct);
  
  updateProductFields(newProduct, newProductName, productName, newProductDate + "-Outdoor", nextThursday, wednesdayNoon);
  
  var newProductId = sendProductToWordPress(newProduct);
  
  return newProductId;
}

/**
 * Calculates the next Thursday at 6:00 PM.
 *
 * @returns {Date} - The next Thursday at 6:00 PM.
 */
function getNextThursdayAt6PM() {
  var nextThursday = new Date();
  var dayOfWeek = nextThursday.getDay();
  
  if (dayOfWeek >= 4) {
    nextThursday.setDate(nextThursday.getDate() + (11 - dayOfWeek));
  } else {
    nextThursday.setDate(nextThursday.getDate() + (4 - dayOfWeek));
  }
  
  nextThursday.setHours(19, 0, 0, 0);
  return nextThursday;
}

/**
 * Calculates the current Wednesday at 12:00 PM (noon).
 *
 * @returns {Date} - The current Wednesday at 12:00 PM (noon).
 */
function getWednesdayNoon() {
  var wednesdayNoon = new Date();
  wednesdayNoon.setDate(wednesdayNoon.getDate() + (3 + (7 - wednesdayNoon.getDay())) % 7);
  wednesdayNoon.setHours(12, 0, 0, 0);
  return wednesdayNoon;
}


/**
 * Formats a date in the format "MM/DD/YY".
 *
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date.
 */
function formatDate(date) {
  var day = ("0" + date.getDate()).slice(-2);
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear().toString().slice(-2);
  return month + "/" + day + "/" + year;
}

/**
 * Formats a date in the ISO 8601 format (YYYY-MM-DD).
 *
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date.
 */
function formatDateISO(date) {
  return date.toISOString().split("T")[0];
}



/**
 * Formats a date in the format "DD/MM/YYYY HH:mm".
 *
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date.
 */
function formatDateWithLowercaseMeridian(date) {
  var formattedHours = date.getHours().toString().padStart(2, "0");
  var formattedMinutes = date.getMinutes().toString().padStart(2, "0");
  return Utilities.formatDate(date, "GMT", "dd/MM/yyyy ") + formattedHours + ":" + formattedMinutes;
}



/**
 * Converts a string to a URL-friendly slug.
 *
 * @param {string} text - The text to convert to a slug.
 * @returns {string} - The slug.
 */
function slugify(text) {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "-");
}

/**
 * Updates the stock status of a product in WordPress.
 *
 * @param {number} productId - The ID of the product to update.
 * @param {boolean} isInStock - True if the product is in stock, false otherwise.
 */
function updateProductStockStatus(productId, isInStock) {
  if (productId !== null) {
    var product = getProductById(productId);
    if (product !== null) {
      var stockStatus = isInStock ? 'instock' : 'outofstock';
      product.stock_status = stockStatus;
      updateProductInWordPress(product);
    }
  }
}

/**
 * Marks a product as in stock.
 */
function markInStock() {
  var productId = setupCell("Dashboard","B5")
  var isInStock = true; // Set the stock status (true for in stock, false for out of stock)
  updateProductStockStatus(productId, isInStock);
}

/**
 * Marks a product as out of stock.
 */
function markOutOfStock() {
  var productId = setupCell("Dashboard","B5")
  var isInStock = false; // Set the stock status (true for in stock, false for out of stock)
  updateProductStockStatus(productId, isInStock);
}

