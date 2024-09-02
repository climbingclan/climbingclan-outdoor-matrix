function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Mark an Attendance')

      .addItem('Mark Cancelled', 'markCancelled')
      .addItem('Mark Late Bail', 'markLateBail')
      .addItem('Mark No Show', 'markNoShow')
      .addSeparator()
      .addItem('Mark Bad Weather Cancel', 'markBadWeatherCancelled')
      .addItem('Mark ClanCancelled', 'markClanCancelled')

      .addItem('Mark Duplicate', 'markDuplicate')
      .addSeparator()
//      .addItem('Mark Attended', 'markAttended')
     // .addItem('NOT WORKING - Did not Register but showed', 'markNoRegisterShow')
     .addItem('Mark ALL Attended', 'markAttendedAndCloseEvent')


      .addToUi();

   // create menu for dispatch  functions
  ui.createMenu('Assign a Role')

      .addItem('Crag Coordinator', 'assignCragCoordinator')
      .addItem('Assistant Crag Coordinator', 'assignAssistantCragCoordinator')
      .addItem('Crag Reporter', 'assignCragReporter')
      .addSeparator()
      .addItem('Message Maker', 'assignMessageLord')
      .addItem('Group Creator', 'assignGroupCreator')
      .addItem('Event Director', 'assignWeekDirector')
      .addSeparator()

//      .addSeparator()
//      .addItem('SundayPromo1', 'assignSundayPromo1')
//      .addItem('SundayPromo2', 'assignSundayPromo2')
      .addItem('MondayPromo', 'assignMondayPromo1')
      .addItem('SundayPromo', 'assignSundayPromo1')
      .addSeparator()


      .addItem('Unassign Role', 'markVolunteerClear')

      .addToUi();   

      



  ui.createMenu('Send to Crag ')
      .addItem('Wilton 3', 'sendWilton3')
      .addItem('Castle Cadshaw Rocks', 'sendCadshaw')
      .addItem('Wilton 1', 'sendWilton1')
      .addItem('Wilton 2', 'sendWilton2')
      .addItem('Wilton 4', 'sendWilton4')
      .addItem('Egerton Quarry', 'sendEgerton')
      .addItem('Anglezarke Quarry', 'sendAnglezarke')
      .addItem('Denham Hill Quarry', 'sendDenham')
            .addItem('Cheeseden Lumb Mill', 'sendCheesden')

      .addSeparator()
      .addItem('Pule Hill Rocks', 'sendPuleHill')
      .addItem('Running Hill Pitts', 'sendRunningHill')
      .addItem('Cows Mouth Quarry','sendCowsMouthQuarry')
      .addItem('Heptonstall Rocks', 'sendHeptonstall')
      

      .addItem('Hobson Moor Quarry', 'sendHobsonMoor')
      .addSeparator()
      .addItem('Windgather', 'sendWindgather')
      .addItem('Castle Naze', 'sendCastleNaze')
      .addSeparator()
      .addItem('Horsethief Quarry', 'sendHorsethief')
      .addItem('Harpur Hill Quarry', 'sendkHarpurHill')
      .addItem('Horseshoe Quarry', 'sendHorseshoe')
      .addSeparator()
      .addItem('Stanage Popular', 'sendStanagePopular')
      .addItem('Froggatt Edge', 'sendFroggatt')
      .addItem('Bamford Edge', 'sendBamford')
      .addItem('The Roaches', 'sendRoaches')
      .addSeparator()
            .addItem('Summit Up Climbing Centre', 'sendSummitUp')
            .addItem('Rockover Climbing Centre', 'sendRockover')

      .addSeparator()

      .addItem('Finalise ALL Assignments', 'finaliseCragLocations')

      .addToUi();   

  ui.createMenu('Refresh Matrix')
      .addItem('Refresh All', 'readData')
      .addSeparator()
      .addItem('Refresh Crags', 'readCragsData')
      .addItem('Refresh Volunteering', 'volunteerData')
      .addSeparator()
      .addItem('Refresh Transport', 'readLifts')
      .addItem('Refresh Trad Skills', 'readTradSkills')
      .addItem('Refresh Gear', 'readGear')
      .addItem('Refresh Trad Skillshare', 'readTradSkillShare')
      .addItem('Refresh Grades', 'readGrades')

      .addToUi();   

        ui.createMenu('Update Product')
      .addItem('Reopen Event for Signup', 'markInStock')
      
      .addItem('Close Signup', 'markOutOfStock')

      .addToUi();   

}