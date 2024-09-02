/**
 * Checks if an event configuration is valid based on certain criteria.
 * Validity criteria include:
 * - Each climber is included exactly once.
 * - No crag is used more than once.
 * 
 * @param {Object} eventConfig - The event configuration to validate.
 * @returns {boolean} True if the event configuration is valid, false otherwise.
 */
function isValidEvent(eventConfig) {
    let climberUsage = {};
    let cragUsage = {};

    for (let group of eventConfig.groups) {
        for (let climberId of group.climbers) {
            if (climberUsage[climberId]) {
                // Climber is used more than once
                return false;
            }
            climberUsage[climberId] = true;
        }

        if (cragUsage[group.crag]) {
            // Crag is used more than once
            return false;
        }
        cragUsage[group.crag] = true;
    }

    // Check if all climbers are used
    if (Object.keys(climberUsage).length !== Object.keys(eventConfig.climbers).length) {
        return false;
    }

    // The event configuration passes all checks
    return true;
}

/**
 * Checks if a specified group of climbers meets the criteria to form a valid group, including size restrictions.
 * 
 * @param {Array} group - An array of climber objects representing the members of a potential group.
 * @returns {boolean} True if the group meets all criteria, including size constraints, otherwise false.
 */
function isValidGroup(group) {
    // Check the group size is within the specified range
    if (group.length <= 2 || group.length >= 18) {
        return false;
    }

    const hasLeader = group.some(climber => climber.skills_trad_climbing === "lead trad" || climber.skills_sport_climbing === "Lead Outdoors");
    const hasEquipment = group.some(climber => climber.gear_bringing_rack === "✅" || climber.gear_bringing_rope === "✅");
    const hasDriver = group.some(climber => climber.transport_can_give_lift === "Yes");
    const needsLift = group.every(climber => climber.transport_need_lift === "Yes");

    return hasLeader && hasEquipment && (hasDriver || !needsLift);
}


    /**
 * Retrieves data from the cache or generates it if not present.
 * 
 * @param {string} key The key to retrieve from the cache (e.g., "climbers" or "crags").
 * @param {function} dataGeneratorFunction A function that generates the data if it's not in the cache.
 * @returns {Object|Array} The data from the cache or the newly generated data.
 */
function getCachedData(key, dataGeneratorFunction) {
  var cache = CacheService.getScriptCache(); // Use the script-level cache

  // Attempt to retrieve the data from the cache
  var cachedData = cache.get(key);

  if (cachedData != null) { //  != null 
    // If data is found in the cache, parse it from the JSON string and return
    Logger.log("Using cached data for: " + key);
    return JSON.parse(cachedData);
  } else {
    // If data is not found in the cache, generate it using the provided function
    var data = dataGeneratorFunction();
    // Cache the data for future use, converting it to a JSON string
    cache.put(key, JSON.stringify(data), 21600); // Cache for 6 hours (21600 seconds)
    Logger.log("Generated and cached data for: " + key);
    return data;
  }
}


/**
 * Validates an array of event configurations to ensure they have the correct structure for scoring.
 * Checks for the presence of required subobjects (groups, climbers, possibleCrags) and validates their structure.
 * Throws an error if any part of the event configurations is invalid, otherwise, it completes successfully.
 *
 * @param {Array} eventConfigurations - An array of event configuration objects to be validated.
 * @throws {Error} If the structure of event configurations, groups, climbers, or possibleCrags is invalid.
 */
function validateEventConfigurations(eventConfigurations) {
    if (!Array.isArray(eventConfigurations)) {
        throw new Error("Event configurations must be an array.");
    }

    eventConfigurations.forEach((eventConfig, eventIndex) => {
        if (!Array.isArray(eventConfig.groups)) {
            throw new Error(`Event configuration at index ${eventIndex} must have a 'groups' array.`);
        }

        eventConfig.groups.forEach((group, groupIndex) => {
            if (typeof group.climbers !== 'object' || Array.isArray(group.climbers)) {
                throw new Error(`Group at index ${groupIndex} in event configuration ${eventIndex} must have a 'climbers' object.`);
            }

            if (typeof group.possibleCrags !== 'object' || Array.isArray(group.possibleCrags)) {
                throw new Error(`Group at index ${groupIndex} in event configuration ${eventIndex} must have a 'possibleCrags' object.`);
            }

            Object.keys(group.climbers).forEach(climberId => {
                const climber = group.climbers[climberId];
                if (typeof climber !== 'object' || climber === null) {
                    throw new Error(`Climber with ID ${climberId} in group ${groupIndex} of event configuration ${eventIndex} is not a valid object.`);
                }
                // Further validations for climber object can be added here if necessary
            });

            Object.keys(group.possibleCrags).forEach(cragId => {
                const crag = group.possibleCrags[cragId];
                if (typeof crag !== 'object' || crag === null) {
                    throw new Error(`Crag with ID ${cragId} in group ${groupIndex} of event configuration ${eventIndex} is not a valid object.`);
                }
                // Further validations for crag object can be added here if necessary
            });
        });
    });

    // If the function reaches this point, the event configurations are considered valid
}
