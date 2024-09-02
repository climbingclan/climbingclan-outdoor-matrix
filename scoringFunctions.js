function scoreGroupConfiguration(group) {
    // Placeholder scoring logic: Generate a random score between 1 and 10 for the group
    let score = Math.floor(Math.random() * 10) + 1; // Generates a random integer between 1 and 10

    // You can expand this function to include more sophisticated scoring logic based on group characteristics

    return score;
}

function scoreGroupCragCombination(group) {
    // Placeholder scoring logic: Generate a random score between 1 and 10 for the group
    let score = Math.floor(Math.random() * 10) + 1; // Generates a random integer between 1 and 10

    // You can expand this function to include more sophisticated scoring logic based on group characteristics

    return score;
}

function scoreGroupWithCrags(group, crags) {
  let scores = crags.map(crag => {
    let score = scoreGroupCragCombination(group, crag);
    return { cragId: crag.destination_id, score };
  });

  // Sort by score and keep the top 3
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3);
}

/**
 * Calculates the convenience score for a single crag based on the climber's travel time to that crag.
 * The convenience score is scaled from 1 (most convenient) to 10 (least convenient) using a linear scale.
 * @param {number} travelTime - The travel time to the crag.
 * @param {number} minTravelTime - The minimum travel time among all crags for the climber.
 * @param {number} maxTravelTime - The maximum travel time among all crags for the climber.
 * @returns {number} - The convenience score for the crag.
 */
function calculateSingleCragConvenienceScore(travelTime, minTravelTime, maxTravelTime) {
  // Directly use a linear scale transformation within this function
  return ((travelTime - minTravelTime) / (maxTravelTime - minTravelTime)) * (10 - 1) + 1;
}
/**
 * Calculates a difficulty score for sport climbing based on the climber's ability and crag requirement.
 * Returns a default score if climber's grade or crag's required grade is missing or undefined.
 * @param {Object} climber - The climber's information including their sport climbing grade.
 * @param {Object} crag - The crag's information including the required lead grade.
 * @returns {number} - The calculated score based on the categories or a default score for missing data.
 */
function calculateSportDifficultyScore(climber, crag) {
  // Mapping climber's sport grades to numeric values
  const climberGradeMap = {
    "3s and 4s": 1,
    "5a-6a": 2,
    "6b-7a": 3
  };

  // Mapping crag's required lead grades to numeric values
  const cragGradeMap = {
    "f3": 1,
    "f5": 2,
    "f6a": 3 // Assuming for the sake of the example
  };

  // Handle missing or undefined grades by returning a default score
  if (!climber['climbing-sport-grades'] || !crag.location_must_lead || climber['climbing-sport-grades'].length === 0 || typeof cragGradeMap[crag.location_must_lead] === 'undefined' || cragGradeMap[crag.location_must_lead] === 'Trad') {
    return 4; // Default score for missing data
  }

  // Get the numeric value for the climber's max grade and the crag's required grade
  const climberMaxGrade = climberGradeMap[climber['climbing-sport-grades']];
  const cragRequiredGrade = cragGradeMap[crag.location_must_lead];

  // Calculate the difference in grades
  const gradeDifference = climberMaxGrade - cragRequiredGrade;

  // Determine the score based on the grade difference
  if (gradeDifference <= -2) return 8; // Well below requirements
  if (gradeDifference === -1) return 5; // Below requirements
  if (gradeDifference >= 0 && gradeDifference <= 1) return 1; // Around the requirements
  if (gradeDifference === 2) return 3; // Above the requirements
  if (gradeDifference >= 3) return 4; // Lots above the requirements
}


/**
 * Calculates a difficulty score for trad climbing based on the climber's ability and crag requirement.
 * Returns a default score if the climber's trad grades or crag's required lead grade is missing or undefined.
 * Categories: a) well below, b) below, c) round about, d) above, e) lots above the requirements.
 * @param {Object} climber - The climber's information including their trad climbing grades.
 * @param {Object} crag - The crag's information including the required lead grade for trad climbing.
 * @returns {number} - The calculated score based on the categories or a default score for missing data.
 */
function calculateTradDifficultyScore(climber, crag) {
  // Mapping trad grades to an ordered scale for comparison
  const gradeOrder = ["Mod", "Diff", "VDiff", "Severe", "Very Severe", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"];

  // Handle missing or undefined trad grades by returning a default score
  if (!climber['climbing-trad-grades'] || !crag.location_must_lead ||
      climber['climbing-trad-grades'].length === 0 || crag.location_must_lead.trim().length === 0 || cragGradeMap[crag.location_must_lead] === 'Sport') {
    return 4; // Default score for missing data
  }

  // Find the highest grade the climber can lead
  const climberMaxGradeIndex = Math.max(...climber['climbing-trad-grades'].split('-').map(grade => gradeOrder.indexOf(grade.trim())));

  // Find the index of the crag's requirement in the ordered scale
  const cragRequiredGradeIndex = gradeOrder.indexOf(crag.location_must_lead.trim());

  // Calculate the difference in grade levels between the climber and the crag
  const gradeDifference = climberMaxGradeIndex - cragRequiredGradeIndex;

  // Determine the category based on the grade difference
  if (gradeDifference <= -2) return 8; // Well below requirements
  if (gradeDifference === -1) return 5; // Below requirements
  if (gradeDifference === 0 || gradeDifference === 1) return 1; // Round about the requirements
  if (gradeDifference === 2 || gradeDifference === 3) return 3; // Above the requirements
  if (gradeDifference >= 4) return 4; // Lots above the requirements
}

/**
 * Calculates a score based on the match between climber's climbing discipline preference and crag's discipline.
 * @param {string} climberPreference - The climber's discipline preference.
 * @param {string} cragDiscipline - The discipline of the crag ("Trad" or "Sport").
 * @returns {number} - The calculated score based on the preference match.
 */
function calculateDisciplinePreferenceScore(climberPreference, cragDiscipline) {
  // Handle missing or undefined preferences by returning a default score
  if (!climberPreference || climberPreference.trim().length === 0) {
    return 3; // Default score for missing data
  }

  // Handle "No Preference"
  if (climberPreference === "No Preference") {
    return 1; // Ideal match score
  }

  // Specific matches
  if (climberPreference.includes(cragDiscipline)) {
    return 1; // Good match
  }

  // Happy to do the other discipline but not preferred
  if ((climberPreference === "Sport but happy to trad" && cragDiscipline === "Trad") ||
      (climberPreference === "Trad but happy to sport" && cragDiscipline === "Sport")) {
    return 3; // Acceptable but not ideal
  }

  // Direct mismatches
  if ((climberPreference === "Sport" && cragDiscipline === "Trad") ||
      (climberPreference === "Trad" && cragDiscipline === "Sport")) {
    return 10; // Poor match
  }

  // Catch-all for any other cases
  return 3; // Default score for unspecified cases
}

/**
 * Calculates a difficulty score for indoor top-roping based on the climber's ability and the crag's requirement.
 * Returns a default score if the climber's indoor top-roping grades or crag's required top-roping grade is missing or undefined.
 * Categories: a) well below, b) below, c) round about, d) above, e) lots above the requirements.
 * @param {Object} climber - The climber's information including their indoor top-roping grades.
 * @param {Object} crag - The crag's information including the required top-roping grade.
 * @returns {number} - The calculated score based on the categories or a default score for missing data.
 */
function calculateIndoorDifficultyScore(climber, crag) {
  const indoorGradeMap = {
    "3 to 4": 1,
    "5 to 5+": 2,
    "6a": 3,
    "6b-6c": 4,
    "7a-7b": 5,
    "7c-8a": 6
};

const locationMustTRMap = {
    "3": 1,
    "4": 2,
    "5": 3,
    "6a": 4
};

    // Handle missing or undefined indoor top-roping grades by returning a default score
    if (!climber['climbing-indoors-toproping-grades'] || climber['climbing-indoors-toproping-grades'] === "I don't climb ropes indoors" ||
        !crag.location_must_tr || climber['climbing-indoors-toproping-grades'].length === 0 || crag.location_must_tr.trim().length === 0) {
        return 3; // Default score for missing data
    }

    // Map the climber's maximum indoor grade to a numeric value
    let climberMaxGrade = 0;
    climber['climbing-indoors-toproping-grades'].split('-').forEach(grade => {
        climberMaxGrade = Math.max(climberMaxGrade, indoorGradeMap[grade.trim()] || 0);
    });

    // Map the crag's required top-roping grade to a numeric value
    const cragRequiredGrade = locationMustTRMap[crag.location_must_tr.trim()] || 0;

    // Calculate the difference in grade levels between the climber and the crag
    const gradeDifference = climberMaxGrade - cragRequiredGrade;

    // Determine the category based on the grade difference
    if (gradeDifference <= -2) return 8; // Well below requirements
    if (gradeDifference === -1) return 5; // Below requirements
    if (gradeDifference >= 0 && gradeDifference <= 1) return 1; // Round about the requirements
    if (gradeDifference >= 2) return 3; // Above the requirements
}





