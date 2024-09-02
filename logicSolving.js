// https://chat.openai.com/c/c754bdee-4e58-420b-995a-6b5b099cbd44
// https://docs.google.com/document/d/1oT6115RrVbawkJn3gYPBzT1T-a89MfUeOqxFi42dECg/edit

/**
 * The main function that orchestrates the entire process of generating event configurations,
 * scoring them, and selecting the best one based on the total event score.
 *
 * @param {Object} climbers - An object containing climber details keyed by climber ID.
 * @param {Array} crags - An array of objects, each representing a crag with its details.
 * @returns {Object|null} The best event configuration based on the total event score, or null if no configuration is generated.
 */
function mainLogicSolver() {
  
var climbers = getCachedData("climbers", prepareAndComputeMatrix);
var crags = getCachedData("crags", getDestinations);
var climberIds = Object.keys(climbers);

// Log all climber IDs
console.log("climber ids", climberIds)

    // Step 1: Augment climbers with crag scores based on their preferences and abilities
    const augmentedClimbers = augmentClimbersWithCragScores(climbers, crags);
console.log("defo completed step 1");
//console.log(JSON.stringify(augmentedClimbers))


    // Step 2: Generate all possible event configurations with groups of climbers
    const eventConfigurations = generateAndScoreGroupCombinations(augmentedClimbers); //todo probs doesn't generate all crag combos and it needs to.
console.log("the best config", JSON.stringify(eventConfigurations))
return ;
validateEventConfigurations(eventConfigurations)
    // Step 3: Score each event configuration and their respective group configurations
 
    // Step 4: Select the best event configuration based on the total event score
    const bestEventConfiguration = selectBestEventConfiguration(scoredEventConfigurations);

    // Log the best event configuration to the console for review
    console.log("Best Event Configuration:", JSON.stringify(bestEventConfiguration, null, 2));

    // Return the best event configuration
    return bestEventConfiguration;
}

/**
 * Augments each climber in the climbers object with scores for each crag in their destinations. This function assesses and assigns
 * scores based on convenience (travel time), and difficulty compatibility (trad, sport, and indoor top-roping) between the climber's
 * abilities and the crag's requirements. Each destination within a climber's profile is updated with individual scores for trad, sport,
 * and indoor climbing difficulties, a convenience score based on travel time, and a combined score reflecting an overall assessment.
 *
 * @param {Object} climbers - An object with keys as climber IDs and values as climber objects, each containing destinations with crag details.
 * @param {Array} crags - An array of crag objects, each with details necessary for scoring, such as required grades and type of climbing.
 * @returns {Object} The augmented climbers object with updated destinations, now including scores for each crag based on the climber's profile and crag requirements.
 *
 * Each climber's destination is augmented with the following scores:
 * - tradDifficultyScore: Score based on the climber's trad climbing ability relative to the crag's requirements.
 * - sportDifficultyScore: Score based on the climber's sport climbing ability relative to the crag's requirements.
 * - indoorDifficultyScore: Score based on the climber's indoor top-roping ability relative to the crag's requirements, if applicable.
 * - convenienceScore: Score based on the travel time to the crag, with shorter times being more favorable.
 * - combinedScore: A cumulative score that considers all the above factors to represent the overall suitability of the crag for the climber.
 *
 * Note: This function relies on `calculateTradDifficultyScore`, `calculateSportDifficultyScore`, `calculateIndoorDifficultyScore`, and
 * `calculateSingleCragConvenienceScore` to compute the respective scores. Ensure these functions are implemented and available in the scope.
 */
function augmentClimbersWithCragScores(climbers, crags) {
  Object.values(climbers).forEach(climber => {
    // Pre-calculate min and max travel times for efficiency
    const travelTimes = Object.values(climber.destinations).map(dest => dest.location_total_time_to_travel);
    const minTravelTime = Math.min(...travelTimes);
    const maxTravelTime = Math.max(...travelTimes);

    Object.entries(climber.destinations).forEach(([destinationId, destination]) => {
      const crag = crags.find(crag => crag.destination_id === destinationId);

      // Calculate difficulty score based on climber's climbing skills and crag requirements
      destination.tradDifficultyScore = calculateTradDifficultyScore(climber, crag) 
      destination.sportDifficultyScore =  calculateSportDifficultyScore(climber, crag);

      // Calculate convenience score for this destination
      destination.convenienceScore = calculateSingleCragConvenienceScore(destination.location_total_time_to_travel, minTravelTime, maxTravelTime);

      destination.indoorDifficultyScore = calculateIndoorDifficultyScore(climber,crag)

      // Combine convenience and difficulty scores for the personal crag preference
      destination.combinedScore = destination.convenienceScore + destination.difficultyScore+ destination.convenienceScore+destination.indoorDifficultyScore;
    });
  });
//console.log(JSON.stringify(climbers))
  return climbers;
}





/**
 * Dynamically generates and scores climber groups, ensuring each climber is included in a minimum number of top-scoring groups. 
 * It iterates over all possible climber combinations, assessing each group based on predefined criteria to determine its score. 
 * The function ensures broad participation by maintaining a list of top groups for each climber and compiling a unique set of these groups for the event.
 *
 * @param {Object} climbers - An object containing climbers' details, indexed by climber IDs.
 * @returns {Array} An array of event configurations, each containing group details with climber IDs and group scores.
 */
function generateAndScoreGroupCombinations(climbers) {
  const climberIds = Object.keys(climbers); // Extract climber IDs
  let indexArray = []; // Tracks the current combination of climber indices
  let done = false; // Indicates if all combinations have been explored
  const climberGroupMap = {}; // Tracks top groups for each climber
  const minGroupsPerClimber = 3; // Minimum top groups to keep for each climber

  // Initialize the climberGroupMap
  climberIds.forEach(id => {
    climberGroupMap[id] = [];
  });

  // Adds a group to a climber's list of top groups, ensuring only top scores are kept
  function addGroupToClimberTopGroups(climberId, group, score) {
    let topGroups = climberGroupMap[climberId];
    topGroups.push({ climbers: group, score });
    // Keep only the top scoring groups for this climber
    topGroups.sort((a, b) => b.score - a.score);
    if (topGroups.length > minGroupsPerClimber) {
      topGroups.length = minGroupsPerClimber;
    }
  }

  // Initialize indexArray for the first group combination
  function initializeIndexArray() {
    indexArray = Array.from({ length: Math.min(2, climberIds.length) }, (_, i) => i);
  }

  // Increment indexArray to the next group combination
  function incrementIndexArray() {
    let i = indexArray.length - 1;
    while (i >= 0) {
      if (indexArray[i] < climberIds.length - (indexArray.length - i)) {
        indexArray[i]++;
        for (let j = i + 1; j < indexArray.length; j++) {
          indexArray[j] = indexArray[j - 1] + 1;
        }
        return true;
      }
      i--;
    }

    // Increase group size or mark as done
    if (indexArray.length < 18 && indexArray.length < climberIds.length) {
      indexArray = Array.from({ length: indexArray.length + 1 }, (_, k) => k);
      return true;
    }

    done = true;
    return false; // No more combinations possible
  }

  initializeIndexArray();

  while (!done) {
    let group = indexArray.map(index => climberIds[index]);
    let groupClimbers = group.map(id => climbers[id]);

    if (isValidGroup(groupClimbers)) {
      let score = scoreGroupConfiguration(groupClimbers); // Assuming this function scores the group

      // Update each climber's top groups
      group.forEach(climberId => {
        addGroupToClimberTopGroups(climberId, group, score);
      });
    }

    if (!incrementIndexArray()) break; // If no more combinations, exit loop
  }

  // Compile unique top groups from all climbers
  const uniqueTopGroups = {};
  for (let climberId in climberGroupMap) {
    climberGroupMap[climberId].forEach(groupInfo => {
      const groupId = groupInfo.climbers.join('-'); // Unique identifier for the group
      if (!uniqueTopGroups[groupId]) {
        uniqueTopGroups[groupId] = groupInfo;
      }
    });
  }

  // Convert the unique top groups into the desired output format
  const finalGroups = Object.values(uniqueTopGroups).map(groupInfo => ({
    climbers: groupInfo.climbers.reduce((acc, id) => ({ ...acc, [id]: climbers[id] }), {}),
    groupScore: { score: groupInfo.score }
  }));

  return [{ groups: finalGroups }]; // Wrap in an array to match the desired output format
}

