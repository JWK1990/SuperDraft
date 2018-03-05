/* Player lookup.
var message = '';
var player;
var search = "";

function print(message) {
  var outputDiv = document.getElementById("output");
  outputDiv.innerHTML = message;
}
while (search === ""){
	search = prompt("Please enter a player name: ").toUpperCase();
}
for (var i = 0; i < players.length; i += 1) {
  player = players[i];

  if (player.name === search) {
  message += '<h2>Player: ' + player.name + '</h2>';
  message += '<p>Position: ' + player.position + '</p>';
  message += '<p>Average: ' + player.average + '</p>';
  message += '<p>Games (2016): ' + player.games2016 + '</p>';
  message += '<p>Team: ' + player.team + '</p>';
}
}

print(message);

console.log(players.length);
*/

// Set the myApp.playerData variable with the player data from the scPlayerData.json file if the leagueType is "Supercoach" or the dtPlayerData.json file if it isn't.
if(document.getElementById("leagueType").innerHTML == "Supercoach"){
  $.getJSON('./js/scPlayerData.json')
  .done(function (data){
    myApp.playerData = data;
  });
} else {
    $.getJSON('./js/dtPlayerData.json')
  .done(function (data){
    myApp.playerData = data;
  });
}

// Prevent the "Place Bid" button from opening a new page.
$("#bidForm").submit(function(e){
  e.preventDefault();
});


$(document).ready(function() {
  $('#searchTable').DataTable({
      // ScrollY effectively sets the height of the table. 72vh represents 72% of the height of the browser window.
      // Not sure why this isn't 70vh as the pane is 70% of the browser window, just used trial and error to get 72vh.
      // The rough guide for the vh seems to be 4% less than the height of the pane.
      // We need to update this if we're updating the height of the table.
      scrollY: '72vh',
      scrollCollapse: true,
      paging: false,
      searching: false,
      bInfo: false,
      autoWidth: true,
      "order": [[0, "asc" ]],
      columnDefs: [
        {orderable: false, targets: '_all'}
      ]
  })  // Close #searchTable DataTable function.

  myApp.myTeamDT = $('#myTeamTable').DataTable( {
        // ScrollY effectively sets the height of the table. 14vh represents 14% of the height of the browser window.
        // The rough guide for the vh seems to be 4% less than the height of the pane.
        // We need to update this if we're updating the height of the table.
        scrollY: '14vh',
        scrollCollapse: true,
        order: [[ 0, "desc" ]],
        paging: false,
        searching: false,
        aaSorting: [],
        bInfo: false,
        autoWidth: true,
        oLanguage: {
          sZeroRecords: "-"
        }
  }) // Close #myTeamTable DataTable function.
}); // Close $(document).ready() function.
setTimeout(function(){
  var draftBody = document.getElementById("draftBody");
  draftBody.style.visibility = "visible";
  draftBody.style.opacity = 1;
}, 1500);


var myApp = {
  //!!!!!!!!!!!!!!DEFINE VARIABLES!!!!!!!!!!!!!!!
  // Coaches variables.
  currentUserSocketID: {},
  connectedSocketsList: {},
  firstConnectedSocketID: {},
  numOfCoaches: {},
  rosterSize: {},
  totalRosterSpots: {},
  numOfPlayersDrafted: {},
  benchCount: {},
  otbBenchCount: {},
  addToBench: {},
  otbAddToBench: {},
  // Position validation variables.
  rosterSpotsArray: {},
  otbRosterSpotsArray: {},
  availablePosition: {},
  // Holds the total roster spots for each position from the database for the current draft.
  totalDefSpots: {},
  totalFwdSpots: {},
  totalRucSpots: {},
  totalMidSpots: {},
  totalBenSpots: {},
  // myRoster variables.
  draftedPlayersList: {},
  selectedCoachesPlayers: {},
  selectedCoachesDef: {},
  selectedCoachesFwd: {},
  selectedCoachesRuc: {},
  selectedCoachesMid: {},
  selectedCoachesBen: {},
  // Search and selected player variables.
  selectedPlayer: {},
  selectedPlayerName: document.getElementById("selectedName"),
  selectedPlayerPosition: document.getElementById("selectedPosition"),
  selectedPlayerPic: document.getElementById("selectedPic"),
  //selectedPlayerImgString: {},
  addToQueue: document.getElementById("addToQueue"),
  playerData: {},
  sppRank: document.getElementById("rank"),
  sppAve: document.getElementById("ave"),
  sppPoints: document.getElementById("points"),
  sppStdDev: document.getElementById("stdDev"),
  sppGames: document.getElementById("games"),
  sppAge: document.getElementById("age"),
  sppBye: document.getElementById("bye"),
  startValue: document.getElementById("startValue"),
  startingBid: {},
  topPlayer: {},
  // On the block variables.
  otbName: document.getElementById("otbName"),
  otbTeamPos: document.getElementById("otbTeamPos"),
  //otbPic: document.getElementById("otbPic"),
  draftID: document.getElementById("draftID").innerHTML,
  otbPlayerID: {},
  otbPos: {},
  currentOtbCoach: {},
  currentUser: document.getElementById("currentUser").innerHTML,
  otbAverage: {},
  demo: document.getElementById("demo"),
  // Bidding variables.
  currentBid: document.getElementById("currentBid"),
  biddingTeam: {},
  otbBidValue: {},
  maxBid: {},
  playerCount: {},
  placeBidButton: document.getElementById("placeBid"),
  // Budgets Pane variables.
  joinedUsers: [],
  // Drafted Players variables.
  teamFilter: document.getElementById("myRosterFilter"),
  posFilter: document.getElementById("myTeamPosFilter"),
  myTeamDT: {},
  // Bid countdown timer variables.
  counter: {},
  demo: document.getElementById("demo"),
  // SPP countdown timer variables.
  sppCounter: {},
  // Define the admin coach variable.
  admin: {},
  // Define the pauseDraftButton variable.
  pauseDraftButton: document.getElementById("pauseDraft"),
  // Define the allConnected variable to hold a true or false value depending on if all of the coaches are connected.
  allConnected: {},
  // Define the connectedUsers variable to hold a list of the connected users.
  connectedUsers: [],
  // Define the soldForTimeout variable to hold the current timeout for the "Sold for" text.
  soldForTimeout: {},

  //!!!!!!!!!!!!!!DEFINE FUNCTIONS!!!!!!!!!!!!!!!
    updateSearch: function(){
      var searchTable = document.getElementById("searchTable");
      var searchTableRows = searchTable.getElementsByTagName("tr");
      var watchlistFilter = document.getElementById("watchlistSearch");
      var watchlistCheckboxes = searchTable.getElementsByTagName("input");
      var hideDrafted = document.getElementById("hideDrafted");
      // Declare variables 
      var input = document.getElementById("playerSearch");
      var filter = input.value.toUpperCase();
      var select = document.getElementById("positionSearch");
      var position = select.value.toUpperCase();

      // Loop through all table rows and hide those who don't match the search query.
      for (var i = 1; i < searchTableRows.length; i++) {
        var td = searchTableRows[i].getElementsByTagName("td")[1];
        var td2 = searchTableRows[i].getElementsByTagName("td")[2];
        var td3 = searchTableRows[i].getElementsByTagName("td")[5];
        var watchlistChecked = td3.getElementsByTagName("input")[0].checked;
        var drafted = Boolean(searchTableRows[i].style.textDecoration === "line-through");

        if (td) {
          var nameCheck = Boolean(td.innerHTML.toUpperCase().indexOf(filter) > -1);
          var posCheck = Boolean(position === "ALL" || td2.innerHTML.toUpperCase().indexOf(position) > -1);

          if (nameCheck && posCheck && watchlistFilter.checked === false && hideDrafted.checked === false) {
            searchTableRows[i].style.display = "";
          } else if (nameCheck && posCheck && watchlistFilter.checked === false && hideDrafted.checked === true && drafted === false){
            searchTableRows[i].style.display = "";
          } else if (nameCheck && posCheck && watchlistFilter.checked === true && watchlistChecked === true && hideDrafted.checked === false){
            searchTableRows[i].style.display = "";
          } else if (nameCheck && posCheck && watchlistFilter.checked === true && watchlistChecked === true && hideDrafted.checked === true && drafted === false){
            searchTableRows[i].style.display = "";
          } else {
            searchTableRows[i].style.display = "none";
          }
        } 
      }
    }, // Close updateSearch() function.

    selectPlayer: function(){
      var searchTable = document.getElementById("searchTable");
      var searchTableRows = searchTable.getElementsByTagName("tr");
      // Add event listeners to all table rows to update selectedPlayer variable on click.
      for (i=0; i < searchTableRows.length; i += 1){
        searchTableRows[i].addEventListener("click",function(){
          myApp.selectedPlayer = this;
          // Update top section with name, position and picture.
          myApp.selectedPlayerName.innerHTML = this.getElementsByTagName("td")[1].innerHTML;
          myApp.selectedPlayerPosition.innerHTML = this.getElementsByTagName("td")[2].innerHTML;
          // myApp.selectedPlayerImgString = "./images/" + this.getElementsByTagName("td")[1].innerHTML.toUpperCase().replace(/\s+/g,"") + ".png";
          // myApp.selectedPlayerPic.src = myApp.selectedPlayerImgString;
          // Update the otb player details held in the client.
          myApp.otbPlayerID = this.getElementsByTagName("td")[1].innerHTML;
          myApp.otbPos = this.getElementsByTagName("td")[2].innerHTML;
          myApp.otbAverage = this.getElementsByTagName("td")[3].innerHTML;
          // Update bottom section with table stats.
          var selectedPlayerData = myApp.playerData.filter(function(e){
            return (e.name==myApp.selectedPlayerName.innerHTML);
          })[0];
          myApp.sppRank.innerHTML = selectedPlayerData.rank;
          myApp.sppAve.innerHTML = selectedPlayerData.ave;
          myApp.sppPoints.innerHTML = selectedPlayerData.points;
          myApp.sppStdDev.innerHTML = selectedPlayerData.stdDev;
          myApp.sppGames.innerHTML = selectedPlayerData.games;
          myApp.sppAge.innerHTML = selectedPlayerData.age;
          myApp.sppBye.innerHTML = selectedPlayerData.bye;
          // Update search details.
          myApp.updateSearch();
        });
      }
    }, // Close selectPlayer() function.


    startCountdown: function(endTime){
      // Clear the myApp.soldForTimeout variable so that we don't display the "Solf for" text.
      clearTimeout(myApp.soldForTimeout);
      // Increase the font size back to normal size after it is reduced for 'On the block:' text.
      myApp.demo.style.fontSize = "3vmin";
      // Set the date we're counting down to
      var countDownDate = Number(endTime);
      // Clear any current timers.
      clearInterval(myApp.counter);
      // Update the count down every 1 second
      myApp.counter = setInterval(function() {
          // Get todays date and time
          var now = new Date().getTime();
          // Find the distance between now and the count down date
          var distance = countDownDate - now;
          // Time calculations for days, hours, minutes and seconds
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          // Output the result in an element with id="demo"
          myApp.demo.innerHTML = seconds + " secs";
          // If the count down is over, update the text in the clock pane and wait 5 seconds before putting the next coach on the block.
          if (distance < 0) {
              clearInterval(myApp.counter);
              myApp.placeBidButton.disabled = true;
              myApp.demo.innerHTML = "";
              myApp.soldForTimeout = setTimeout(function(){myApp.demo.innerHTML = "Sold for " + myApp.currentBid.innerHTML}, 1000);
              myApp.placeBidButton.style.background = "grey";
              myApp.placeBidButton.innerHTML = "-";
          }
      }, 10);
    }, // Close startCountdown() function.

    getTopPlayer: function(){
    // Define getTopPlayer() used to get the top available valid player for the current user from the Player Search pane.
    // If there is an error it usually means that the coaches team is full therefore we assign the top undrafted player to the topPlayer variable.
      var searchTable = document.getElementById("searchTable");
      var searchTableRows = searchTable.getElementsByTagName("tr");
      try {
        for (var i = 1; i < searchTableRows.length; i++) {
            if(Boolean(searchTableRows[i].style.textDecoration === "")){

              // Looks through the avaialble players and performs a benchCheck.
              // benchCheck() then sets the addToBench variable to 0 or 1 based on whether the currentCoach has availability for that position.
              myApp.benchCheck(searchTableRows[i].getElementsByTagName("td")[2].innerHTML);

              // Update topPlayer variable if there is a spot available in the current coaches team for the current player in the loop.
              if(myApp.addToBench < 1 || myApp.benchCount < myApp.totalBenSpots){
                myApp.topPlayer = searchTableRows[i].getElementsByTagName("td");
                break;
              }
            } // Close if() statement.
        } // Close for() loop.
        console.log("TOP PLAYER(): " + myApp.topPlayer[1].innerHTML)
      } catch(err){
          for (var i = 1; i < searchTableRows.length; i++) {
            if(Boolean(searchTableRows[i].style.textDecoration === "")){
              myApp.topPlayer = searchTableRows[i].getElementsByTagName("td");
              break;
            }
          }
          console.log("Team is full. Top Player: " + myApp.topPlayer + ".");
      } // Close catch() statement.
    }, // Close getTopPlayer() function.

    updateSPP: function(data){
    // Define updateSPP() used to update the text in the Selected Player Pane.
      myApp.selectedPlayerName.innerHTML = data[1].innerHTML;
      myApp.selectedPlayerPosition.innerHTML = data[2].innerHTML;
      // myApp.selectedPlayerImgString = "./images/" + data[1].innerHTML.toUpperCase().replace(/\s+/g,"") + ".png";
      // myApp.selectedPlayerPic.src = myApp.selectedPlayerImgString;
      myApp.startValue.value = 1;
      // Update the SPP Table details.
      var selectedPlayerData = myApp.playerData.filter(function(e){
        return (e.name==myApp.selectedPlayerName.innerHTML);
      })[0];
      myApp.sppRank.innerHTML = selectedPlayerData.rank;
      myApp.sppAve.innerHTML = selectedPlayerData.ave;
      myApp.sppPoints.innerHTML = selectedPlayerData.points;
      myApp.sppStdDev.innerHTML = selectedPlayerData.stdDev;
      myApp.sppGames.innerHTML = selectedPlayerData.games;
      myApp.sppAge.innerHTML = selectedPlayerData.age;
      myApp.sppBye.innerHTML = selectedPlayerData.bye;
      // Update the OTB player details.
      /*
      myApp.otbPlayerID = data[1].innerHTML;
      myApp.otbPos = data[2].innerHTML;
      myApp.otbAverage = selectedPlayerData.ave16;
      */
    }, // Close updateSPP() function.

    sppStartCountdown: function(sppEndTime){
      // Set the date we're counting down to
      var sppCountDownDate = Number(sppEndTime);
      // Clear any current timers.
      clearInterval(myApp.sppCounter);
      // Update the count down every 1 second
      myApp.sppCounter = setInterval(function() {
          // Get todays date and time
          var sppNow = new Date().getTime();
          // Find the distance between now and the count down date
          var sppDistance = sppCountDownDate - sppNow;
          // Time calculations for days, hours, minutes and seconds
          var seconds = Math.floor((sppDistance % (1000 * 60)) / 1000);
          // Output the result in an element with id="demo"
          myApp.demo.innerHTML = seconds + " secs";
          // If the count down is over, write some text 
          if (sppDistance <= 0) {
              clearInterval(myApp.sppCounter);
              if(myApp.otbName.innerHTML === "-"){
              // Run updateSPP to update the SPP for the current OTB Coach.
              // THIS CODE SHOULD POTENTIALLY BE UPDATED.
              // THE FACT THAT AUTOSPP() AND ADDTOBLOCK() ARE IN THE IF STATEMENTS MEANS THAT THEY ONLY EXECUTE IF THE CURRENT USER IS LOGGED IN.
              // THE USER CAN LOG IN AND ADD A PLAYER TO THE BLOCK, BUT IT MEANS THAT THE DRAFT IS FROZEN IF THE OTB USER IS LOGGED OUT.
              /* I'VE REMOVED THE IF STATEMENT FOR NOW SO THAT IT EXECUTES REGARDLESS OF WHETHER THE USER IS LOGGED IN. THE PROBLEM WITH THIS PREVIOUSLY
              IS THAT THE sppStartCountdown() function was executed for all users when the playerDrafted websockets was emitted. To fix this I've changed
              it so that only the coach that is on the block sees the SPP countdown timer. I will probably move this countdown into the existing otb clock
              pane as well. */
                if(myApp.currentUser === myApp.currentOtbCoach){
                  myApp.updateSPP(myApp.topPlayer);
                } // Close if(currentUser === currentOtbCoach) statement.
              } // Close if(otbName.innerHTML === "-") statement.
          } // Close if(sppDistance <= 0) statement.
      }, 10) // Close sppCounter setInterval() function.
    }, // Close sppStartCountdown() function.

    highlightBidder: function(data){
    // Define highlightBidder() function to update the colour of the curent lead bidder to fluro green. 
    // This may clash with the otb colouring when they are both turned on.
      var budgetsTable = document.getElementById("budgetsTable");
      var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
      for (var i = 1; i < budgetsTableRows.length; i++) {
        var td = budgetsTableRows[i].getElementsByTagName("td")[0];

        if (td) {
        if (td.innerHTML === data) {
          budgetsTableRows[i].style.backgroundColor = "yellow";
          budgetsTableRows[i].style.color = "#4d4d4d";
        } else if(myApp.connectedUsers.indexOf(td.innerHTML) < 0){
            budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
            budgetsTableRows[i].style.color = "grey";
          } else {
              budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
              budgetsTableRows[i].style.color = "white";
          } // Close else{} statement.
        } // Close if(td) statement. 
      } // Close for() loop.
    }, // Close highlightBidder() function.

    highlightOtb: function(data){
    // The data parameter above holds the pickCounter. As the pickCounter starts at 1 and loops between 0 and 9,
    // we need to manipulate it into the currentOtbIndex variable below so that when the pick counter is on 0, it is changed to 10 to highlight the last coach on the budgets pane.
      var budgetsTable = document.getElementById("budgetsTable");
      var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
      var currentOtbIndex;
      if(data===0){
        myApp.currentOtbIndex = myApp.numOfCoaches;
      } else {
        myApp.currentOtbIndex = data;
      }
      // Clears underline on all team names in Budgets Table.
      for (var i = 1; i < budgetsTableRows.length; i++) {
        budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
        if(budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML === myApp.currentUser){
          budgetsTableRows[i].style.fontWeight = "bold";
          budgetsTableRows[i].style.fontSize = "1.7vmin";
        }
      };
      // Adds an underline to the coach currently on the block as determined by the pick counter.
      budgetsTableRows[myApp.currentOtbIndex].style.backgroundColor = "rgba(0,0,255,0.5)";
      // Updates the value of the currentOtbCoach based on the pick counter.
      myApp.currentOtbCoach = budgetsTableRows[myApp.currentOtbIndex].getElementsByTagName("td")[0].innerHTML;
        if(myApp.currentOtbCoach === myApp.currentUser){
          myApp.addToQueue.disabled = false;
          myApp.addToQueue.style.backgroundColor = "yellow";
        } else {
          myApp.addToQueue.disabled = true;
          myApp.addToQueue.style.backgroundColor = "#DCDCDC";
        };
    }, // Close highlightOtb() function.


    highlightSearch: function(data){
    var searchTable = document.getElementById("searchTable");
    var searchTableRows = searchTable.getElementsByTagName("tr");
    // Define highlightSearch() function to grey out players once they have been drafted.
      var pluck = _.pluck(data, "name");

      for (var i = 1; i < searchTableRows.length; i++) {
        var td = searchTableRows[i].getElementsByTagName("td")[1];

        if (td) {
          if (pluck.indexOf(td.innerHTML) > -1) {
            searchTableRows[i].style.backgroundColor = "#C0C0C0";
            searchTableRows[i].style.color = "#E5E4E2";
            searchTableRows[i].getElementsByTagName("td")[1].style.color = "#E5E4E2";
            searchTableRows[i].style.textDecoration = "line-through";
            var clone = searchTableRows[i].cloneNode(true);
            searchTableRows[i].parentNode.replaceChild(clone,searchTableRows[i]);
          }
        } 
      };
    }, // Close highlightSearch() function.


    lockBid: function(data, currentUser){
    // Define lockBid() function to stop the leading bidder from placing a bid.
      if(data === currentUser){
        myApp.placeBidButton.disabled = true;
        myApp.placeBidButton.style.background = "grey";
      } else{
        myApp.placeBidButton.disabled = false;
        myApp.placeBidButton.style.background = "blue";
      }
    }, // Close lockBid() function.

/*
    setDraftedPlayers: function(data){
      // Clear the current myTeam table.
      myApp.myTeamDT.clear();
      // Populate the myTeam table with the drafted players details.
      for(var i=0; i < data.length; i++){
        myApp.myTeamDT.row.add([i+1, data[i].name, data[i].position, data[i].team, "$" + data[i].price]).draw(false);
      } // Close for() loop.
    }, // Close setDraftedPlayers() function.
*/

    updateBudgets: function(data){
      var budgetsTable = document.getElementById("budgetsTable");
      var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
      for (var i = 1; i < budgetsTableRows.length; i++) {
        if(data[i-1].numOfPlayers < myApp.rosterSize){
          budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = "$" + (data[i-1].budget - (myApp.rosterSize -1 - data[i-1].numOfPlayers));
          budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = "$" + data[i-1].budget;
          budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML = data[i-1].numOfPlayers + "/" + myApp.rosterSize;
        } else {
            budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = "-";
            budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = "-";
            budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML = "Full";
            budgetsTableRows[i].style.color = "grey";
        }
      } // Close for() loop.
    }, // Close updateBudgets() function.


    checkSPP: function(data){
    // Define the checkSPP() function which checks the currently SPP players name against the results in the DB to see if they are already drafted.
    // If they have already been drafted we then update the SPP with the top available player.
      var latestResult = data[data.length-1].name;
      if(myApp.selectedPlayerName.innerHTML === latestResult){
        myApp.updateSPP(myApp.topPlayer)
      }
    }, // Close checkSPP() function.


    setMaxBid: function(data){
      var budgetData = data.coaches.filter(function(e){
                          return (e.teamName2==myApp.currentUser);
                        })[0].budget;
      myApp.playerCount = data.coaches.filter(function(e){
          return (e.teamName2==myApp.currentUser);
        })[0].numOfPlayers;
      myApp.maxBid = budgetData - (myApp.rosterSize -1 - myApp.playerCount);
    }, // Close setMaxBid() function.


    setBenchCount: function(data){
    // Define the setBenchCount() function to set the benchCount variable to the number of bench players for the current user from the database.
      myApp.benchCount = data.coaches.filter(function(e){
                        return (e.teamName2==myApp.currentUser);
                      })[0].benchCount;

    }, // Close setBenchCount() function.


    setRosterArray: function(data){
    // Define the setRosterArray() function to set the rosterSpotsArray variable to the rosterSpots array variable from the database.
      myApp.rosterSpotsArray = data.coaches.filter(function(e){
                        return (e.teamName2==myApp.currentUser);
                      })[0].rosterSpots;
    }, // Close setRosterArray() function.


    benchCheck: function(position){
    // Checks if there is a spot on the current users field for the position that is currently on the block.
    // data[0]=D, 1=F, 2=R, 3=M, 4=DF, 5=DR, 6=DM, 7=FR, 8=FM, 9=RM.
      myApp.addToBench = 0;
      if (position === "DEF" && myApp.rosterSpotsArray[0] === false){
        myApp.addToBench = 1;
      } else if (position === "FWD" && myApp.rosterSpotsArray[1] === false){
        myApp.addToBench = 1;
      } else if (position === "RUC" && myApp.rosterSpotsArray[2] === false){
        myApp.addToBench = 1;
      } else if (position === "MID" && myApp.rosterSpotsArray[3] === false){
        myApp.addToBench = 1;
      } else if (position === "DEF-FWD" && myApp.rosterSpotsArray[4] === false){
        myApp.addToBench = 1;
      } else if (position === "DEF-RUC" && myApp.rosterSpotsArray[5] === false){
        myApp.addToBench = 1;
      } else if (position === "DEF-MID" && myApp.rosterSpotsArray[6] === false){
        myApp.addToBench = 1;
      } else if (position === "FWD-RUC" && myApp.rosterSpotsArray[7] === false){
        myApp.addToBench = 1;
      } else if (position === "FWD-MID" && myApp.rosterSpotsArray[8] === false){
        myApp.addToBench = 1;
      } else if (position === "RUC-MID" && myApp.rosterSpotsArray[9] === false){
        myApp.addToBench = 1;
      };
    }, // Close benchCheck() function.


    filterRosterPane: function(){
      var myRosterTable = document.getElementById("myRosterTable");
      var myRosterTableRows = myRosterTable.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    // Define the filterRosterPane() function used to filter the roster pane with the currently selected coaches team.
      var selectedCoachIndex = myApp.teamFilter.selectedIndex;
      // Get a list of the currently selected coaches players and assign it to the selectedCoachesPlayers variable.
      var selectedCoachesPlayers = JSON.parse(JSON.stringify(myApp.draftedPlayersList[selectedCoachIndex]));
      // First we sort the selectedCoachesPlayers array alphabetically by position.
      selectedCoachesPlayers.sort(function (a, b) {
        return b.position < a.position;
      });
     // Then we sort the selectedCoachesPlayers array from highest average to lowest average.
      selectedCoachesPlayers.sort(function (a, b) {
        return b.average - a.average;
      });
      // Define the selectedCoaches position variables to hold the coaches players from each position.
      var selectedCoachesDef = [];
      var selectedCoachesFwd = [];
      var selectedCoachesRuc = [];
      var selectedCoachesMid = [];
      var selectedCoachesBen = [];
      var selectedCoachesDpp = [];
      // Loop through the selectedCoachesPlayers list and assign each player to a specific position.
      for(var i=0; i<selectedCoachesPlayers.length; i++){
        if(selectedCoachesPlayers[i].position == "DEF"){
          selectedCoachesDef.push(selectedCoachesPlayers[i])
        } else if(selectedCoachesPlayers[i].position == "FWD"){
            selectedCoachesFwd.push(selectedCoachesPlayers[i])
        } else if(selectedCoachesPlayers[i].position == "RUC"){
            selectedCoachesRuc.push(selectedCoachesPlayers[i])
        } else if (selectedCoachesPlayers[i].position == "MID"){
            selectedCoachesMid.push(selectedCoachesPlayers[i])
        } else if(selectedCoachesPlayers[i].position == "BEN"){
            var posAbbreviation;
            if(selectedCoachesPlayers[i].originalPosition.length === 3){
              posAbbreviation = selectedCoachesPlayers[i].originalPosition[0];
            } else {
              posAbbreviation = selectedCoachesPlayers[i].originalPosition[0] + "/" + selectedCoachesPlayers[i].originalPosition[4];
            }
            selectedCoachesPlayers[i].name = selectedCoachesPlayers[i].name + " (" + posAbbreviation + ")"
            selectedCoachesBen.push(selectedCoachesPlayers[i])
        } else {
            var posAbbreviation;
            if(selectedCoachesPlayers[i].position.length === 3){
              posAbbreviation = selectedCoachesPlayers[i].position[0];
            } else {
              posAbbreviation = selectedCoachesPlayers[i].position[0] + "/" + selectedCoachesPlayers[i].position[4];
            }
            selectedCoachesPlayers[i].name = selectedCoachesPlayers[i].name + " (" + posAbbreviation + ")"
            selectedCoachesDpp.push(selectedCoachesPlayers[i])
        }
      }; // Close for() loop.
      // CODE FOR DPP ALLOCATION.
      // We only run this code if the selected coach has players in their selectedCoachesDpp array.
      if(selectedCoachesDpp.length > 0){
        // Define required variables.
        var combos;
        var result = [];
        var testDppArray = [];
        var availableSpots = [myApp.totalDefSpots - selectedCoachesDef.length, myApp.totalFwdSpots - selectedCoachesFwd.length, myApp.totalRucSpots - selectedCoachesRuc.length, myApp.totalMidSpots - selectedCoachesMid.length];
        var successfulDppArray = [];

        // Define the binaryCombos() function used to generate an array of potential true/false combinations.
        function binaryCombos(n){
          for(y=0; y<Math.pow(2,n); y++){
              var combo = [];
              for(x=0; x<n; x++){
                  //shift bit and and it with 1
                  if((y >> x) & 1)
                      combo.push(true);
                   else 
                      combo.push(false);
              }
                result.push(combo);
          }
          combos = result;   
        }; // Close binaryCombos() function.
        // Run the binaryCombos() function to generate the array of potential true/false combinations for the amount of DPP players.
        binaryCombos(selectedCoachesDpp.length);
        // Generate an array of the coaches DPP positions in the following format [["FWD","MID"], ["DEF", "MID"]] etc.
        var dppPosList = [];
        for(var i=0; i<selectedCoachesDpp.length; i+=1){
          var dppChoice = [selectedCoachesDpp[i].position.substring(0,3), selectedCoachesDpp[i].position.substring(4,7)]
          dppPosList.push(dppChoice)
        }
        // Define the getSuccessfulDppArray() function used to find a DPP combination that fits into the available positions.
        // Loop through the combos array containing all the potential true/false combinations and use this to build a testDppArray.
        // Then check if this testDppArray fits into the available positions.
        // If it does, we assign it to the successfulDppArray variable and stop the for() loop. If it doesn't, we continue the loop.
        function getSuccessfulDppArray(){
          // Loop through the combos array at the highest level and the dppPosList at the lower level.
          // If combos array value is true, we pick the second DPP position, if false, we pick the first DPP positon (e.g. D/F - True=D, False=F).
          // We initially did this the other way around (e.g. true=first DPP position, false=second DPP position) but it seemed to follow the order of Mid, Ruc, Fwd, Def which we wanted to reverse.
          // i is the current array in the list of the combos array (e.g i=0 is the first sub array in the combos array e.g. [true, true, false, true]).
          // x is the current value within the current array (e.g. x=0 is the first true/false value in the array - e.g. true).
          // Once we have defined a testDppArray, we check if this array fits within the available positons and if it does we assign it to the successfulDppArray variable.
          for(var i = 0; i < combos.length; i++){
            // For each sub array in the dppPosList array.
            for(var x = 0; x < dppPosList.length; x++){
              // If x entry in i combos array is true.
              if(combos[i][x] == true){
                // Set x entry in the testDppArray to the second DPP value (e.g. D/F = D).
                testDppArray[x] = dppPosList[x][1];
              } else {
                // Else set x entry in the testDppArray to the first DPP value (e.g. D/F = F).
                testDppArray[x] = dppPosList[x][0];
              }
            }; // Close for(dppPosList.length) loop.
            // Count the number of each position in the testDppArray.
            var testDef = 0;
            var testFwd = 0;
            var testRuc = 0;
            var testMid = 0;
            for(var n = 0; n < testDppArray.length; n++){
                if(testDppArray[n] == "DEF"){
                    testDef += 1;
                } 
                else if(testDppArray[n] == "FWD"){
                    testFwd += 1;
                } 
                else if(testDppArray[n] == "RUC"){
                    testRuc += 1;
                } 
                else if(testDppArray[n] == "MID"){
                    testMid += 1;
                }
            }; // Close for() loop.
            // Compare the numer of each position in the testDppArray with the number of available spots in each position.
            // If the testDppArray fits into the avialable spots we then assign it to the successfulyDppArray variable and stop the for() loop.
            if(testDef <= availableSpots[0] && testFwd <= availableSpots[1] && testRuc <= availableSpots[2] && testMid <= availableSpots[3]){
              successfulDppArray = testDppArray;
              break;
            }
          }; // Close for(combos.length) loop.
        }; // Close getSuccessfulDppArray() function.
        // Run the getSuccessfulDppArray() function.
        getSuccessfulDppArray();
        // Loop through the selectedCoachesDpp array.
        // Update each players' position as per the successfulDppArray.
        // Push each player to the relevant position array.
        for(var i=0; i < selectedCoachesDpp.length; i++){
          selectedCoachesDpp[i].position = successfulDppArray[i];

          if(selectedCoachesDpp[i].position == "DEF"){
            selectedCoachesDef.push(selectedCoachesDpp[i]);
          }
          else if(selectedCoachesDpp[i].position == "FWD"){
            selectedCoachesFwd.push(selectedCoachesDpp[i]);
          }
          else if(selectedCoachesDpp[i].position == "RUC"){
            selectedCoachesRuc.push(selectedCoachesDpp[i]);
          }
          else if(selectedCoachesDpp[i].position == "MID"){
            selectedCoachesMid.push(selectedCoachesDpp[i]);
          }
        }; // Close for() loop.
    }; // Close if(selectedCoachesDpp.length) statement.

      // Define the updateMyRosterTable() function used to update the data in the rosterTable.
      function updateMyRosterTable(array, indexAdd, classAdd){
        for(var i=0; i < array.length; i++){
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[1].innerHTML = array[i].name;
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[2].innerHTML = array[i].average;
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[3].innerHTML = "$" + array[i].price;
              // Update the colouring of the roster pane for any filled positions.
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[0].classList.add(classAdd);
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[1].classList.add(classAdd);
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[2].classList.add(classAdd);
              myRosterTableRows[i+indexAdd].getElementsByTagName("td")[3].classList.add(classAdd);
        } // Close for() loop.
      }; // Close updateMyRosterTable() function.
      // Loop through the myRosterTable and clear out the current innerHTML from each table row.
      for(var i=0; i < myRosterTableRows.length; i++){
          myRosterTableRows[i].getElementsByTagName("td")[1].innerHTML = "";
          myRosterTableRows[i].getElementsByTagName("td")[2].innerHTML = "";
          myRosterTableRows[i].getElementsByTagName("td")[3].innerHTML = "";
          // Update the colouring of the roster pane for any filled positions.
          myRosterTableRows[i].getElementsByTagName("td")[0].classList.remove("filledDef", "filledMid", "filledRuc", "filledFwd", "filledBen");
          myRosterTableRows[i].getElementsByTagName("td")[1].classList.remove("filledDef", "filledMid", "filledRuc", "filledFwd", "filledBen");
          myRosterTableRows[i].getElementsByTagName("td")[2].classList.remove("filledDef", "filledMid", "filledRuc", "filledFwd", "filledBen");
          myRosterTableRows[i].getElementsByTagName("td")[3].classList.remove("filledDef", "filledMid", "filledRuc", "filledFwd", "filledBen");
      }
      // Run the updateMyRosterTable() function to update the data in the rosterTable.
      updateMyRosterTable(selectedCoachesDef, 0, "filledDef");
      updateMyRosterTable(selectedCoachesMid, myApp.totalDefSpots, "filledMid");
      updateMyRosterTable(selectedCoachesRuc, myApp.totalDefSpots + myApp.totalMidSpots, "filledRuc");
      updateMyRosterTable(selectedCoachesFwd, myApp.totalDefSpots + myApp.totalMidSpots + myApp.totalRucSpots, "filledFwd");
      updateMyRosterTable(selectedCoachesBen, myApp.totalDefSpots + myApp.totalMidSpots + myApp.totalRucSpots + myApp.totalFwdSpots, "filledBen");
    }, // Close filterRosterPane() function.


    addRosterFilterOption: function(data){
    // Define the addRosterFilterOption() function to add the coaches array do the roster filter drop down list.
      // Clear any current filter options.
      $('#myRosterFilter').html('');
      // Add in the required filter options.
      for(var i=0; i< data.length; i++){
        var option = document.createElement("option");
        option.text = data[i];
        myApp.teamFilter.add(option);
      }
    }, // Close addRosterFilterOption() function.


    // DEFINE WEBSOCKETS FUNCTIONS.
    bid: function(){
    // Define the WebSockets bid() function used to log a bid.
      myApp.otbBidValue = Number(myApp.currentBid.innerHTML.replace(/[^0-9\.]+/g,"")) + 1;
      // If statements to send an alert if the bid value is greater than the current users max bid or if their team is full.
      if(myApp.otbBidValue <= myApp.maxBid && myApp.playerCount < myApp.rosterSize){
        socket.emit('bid', {draftID: myApp.draftID, bidValue: myApp.otbBidValue, currentUser: myApp.currentUser});
      } else if(myApp.playerCount >= myApp.rosterSize){
          // Code to show the jQuery UI Dialog.
          $(function(){
            $("#dialogFull").dialog({
                position: top
              });
          });
        } else if (myApp.otbBidValue > myApp.maxBid){
            // Code to show the jQuery UI Dialog.
            $(function(){
              $("#dialogMax").dialog({
                  position: top
                });
            });
        } else {
            // Code to show the jQuery UI Dialog.
            $(function(){
              $("#dialogWait").dialog({
                  position: top
                });
            });
        }
    }, // Close bid() function.


    addToBlock: function(player, position, average){
      // If the draft hasn't been started and all users aren't connected then we send an alert, if not, we allow the draft to proceed.
      if(myApp.numOfPlayersDrafted == 0 && myApp.allConnected == false){
        alert("Please wait for all coaches to join before starting the draft!");
      } else{
        // We run the benchCheck() function to set the addToBench variable to 1 or 0.
        myApp.benchCheck(position);
        if(myApp.currentOtbCoach === myApp.currentUser && myApp.benchCount >= myApp.totalBenSpots && myApp.addToBench > 0){
          $(function(){
                $("#dialogRoster").dialog({
                    position: top
                  })
              });
        } else if(myApp.currentOtbCoach === myApp.currentUser && myApp.startValue.value > myApp.maxBid){
           $(function(){
                  $("#dialogOTB").dialog({
                      position: top
                    })
                });
                myApp.startValue.value = 1;
        } else {
           // Clears the current sppCountdownTimer for the current user.
          clearInterval(myApp.sppCounter);
          socket.emit('addToBlock', {draftID: myApp.draftID, player: player, position: position, average: average, currentUser: myApp.currentOtbCoach, startingBid: myApp.startValue.value});
        } // Close else{} statement relating to if(myApp.currentOtbCoach).
      } // Close else{} statement relating to if(myApp.numOfPlayersDrafted).
    }, // Close addToBlock() function.


    pauseDraft: function(){
      myApp.pauseDraftButton.disabled = true;
      myApp.pauseDraftButton.style.backgroundColor = "#DCDCDC";
      socket.emit('pauseDraft', myApp.draftID);
    } // Close pauseDraft() function.

}; // Close NS Namespace.

// COMMENTING OUT OTB POSITION VALIDATIONS AS THESE ARE NOW HANDLED ON THE BACKEND
/*
//OTB POSITION VALIDATIONS FOR OTB COACH.

// Define the setBenchCount() function to set the benchCount variable to the number of bench players for the current user from the database.
function otbSetBenchCount(data){
  otbBenchCount = data.coaches.filter(function(e){
                    return (e.teamName2==currentOtbCoach);
                  })[0].benchCount;

}; // Close setBenchCount() function.


// Define the setRosterArray() function to set the rosterSpotsArray variable to the rosterSpots array variable from the database.
function otbSetRosterArray(data){
  otbRosterSpotsArray = data.coaches.filter(function(e){
                    return (e.teamName2==currentOtbCoach);
                  })[0].rosterSpots;

}; // Close setRosterArray() function.

// Checks if there is a spot on the current users field for the position that is currently on the block.
// data[0]=D, 1=F, 2=R, 3=M, 4=DF, 5=DR, 6=DM, 7=FR, 8=FM, 9=RM.
function otbBenchCheck(position){
  otbAddToBench = 0;

  if (position === "DEF" && otbRosterSpotsArray[0] === false){
    otbAddToBench = 1;
  } else if (position === "FWD" && otbRosterSpotsArray[1] === false){
    otbAddToBench = 1;
  } else if (position === "RUC" && otbRosterSpotsArray[2] === false){
    otbAddToBench = 1;
  } else if (position === "MID" && otbRosterSpotsArray[3] === false){
    otbAddToBench = 1;
  } else if (position === "DEF-FWD" && otbRosterSpotsArray[4] === false){
    otbAddToBench = 1;
  } else if (position === "DEF-RUC" && otbRosterSpotsArray[5] === false){
    otbAddToBench = 1;
  } else if (position === "DEF-MID" && otbRosterSpotsArray[6] === false){
    otbAddToBench = 1;
  } else if (position === "FWD-RUC" && otbRosterSpotsArray[7] === false){
    otbAddToBench = 1;
  } else if (position === "FWD-MID" && otbRosterSpotsArray[8] === false){
    otbAddToBench = 1;
  } else if (position === "RUC-MID" && otbRosterSpotsArray[9] === false){
    otbAddToBench = 1;
  };

}; // Close benchCheck() function.

*/



//!!!!!!!!!!!!!!DEFINE WEBSOCKETS FUNCTIONS!!!!!!!!!!!!!!!
// May need to move the below variable out of the global scope.
var socket = io.connect('/');


socket.on('connect', function(){
  console.log("connect Started!");
  // Connected, let's sign up to receive messages for this room.
  socket.emit('pageLoad', myApp.draftID);
  console.log("connect Finished!");
}); // Close socket.on('connect').


socket.on("pageLoaded", function(data){
  setTimeout(function(){
    console.log("pageLoaded Started");3
    var watchlistFilter = document.getElementById("watchlistSearch");
    var watchlistCheckboxes = searchTable.getElementsByTagName("input");
    var hideDrafted = document.getElementById("hideDrafted");
    var budgetsTable = document.getElementById("budgetsTable");
    var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
    var updatedTeamNames = _.pluck(data.loadData.coaches, "teamName2");
    // Update the player search filters to the default values on the page load.
    watchlistFilter.checked = false;
    watchlistCheckboxes.checked = false;
    hideDrafted.checked = true;
    // Set the relevant variables.
    myApp.demo.style.fontSize = "2vmin";
    myApp.demo.innerHTML = "On The Block: " + data.loadData.otbCoach;
    myApp.numOfCoaches = data.loadData.numOfCoaches;
    myApp.rosterSize = data.loadData.rosterSize;
    myApp.totalRosterSpots = myApp.numOfCoaches * myApp.rosterSize;
    myApp.numOfPlayersDrafted = data.loadData.results.length;
    myApp.totalDefSpots = data.loadData.numOfDef;
    myApp.totalFwdSpots = data.loadData.numOfFwd;
    myApp.totalRucSpots = data.loadData.numOfRuc;
    myApp.totalMidSpots = data.loadData.numOfMid;
    myApp.totalBenSpots = data.loadData.numOfBen;
    myApp.admin = data.loadData.admin;
    // Add the coaches array to the roster filter drop down list.
    // Set the default filter value to the current user.
    myApp.addRosterFilterOption(updatedTeamNames);
    myApp.teamFilter.value = myApp.currentUser;
    // Update the draftedPlayers list with the updated results list from the DB.
    // We used ‘JSON.parse(JSON.stringify(data.loadData.results))’ to convert the data.loadData.resutls data into a string and then re-convert it into an object.
    // We do this because if we just assigned data.loadData.results directly to the draftedPlayersList variable then we are passing the value by reference and anything we do to the draftedPlayersList also updates the data.loadData.results variable.
    myApp.draftedPlayersList = JSON.parse(JSON.stringify(_.pluck(data.loadData.coaches, "players")));
    // Run the filterRosterPane() function to update the roster pane with the selected coaches team.
    myApp.filterRosterPane();
    // Run the relevant functions with the load data as an input.
    //myApp.setDraftedPlayers(data.loadData.results);
    myApp.updateBudgets(data.loadData.coaches);
    myApp.highlightSearch(data.loadData.results);
    myApp.highlightOtb(data.loadData.pickCounter);
    myApp.updateSearch();
    myApp.setMaxBid(data.loadData);
    myApp.placeBidButton.disabled = true;
    myApp.placeBidButton.style.background = "grey";
    // If the coaches team is full then we want to disable the addToQueue button.
    if(myApp.numOfPlayersDrafted >= myApp.totalRosterSpots){
      myApp.addToQueue.disabled = true;
      myApp.addToQueue.style.backgroundColor = "#DCDCDC";
      myApp.demo.innerHTML = "Draft Complete!";
      myApp.placeBidButton.style.background = "grey";
      myApp.placeBidButton.innerHTML = "";
      // Set budget table rows to grey if the draft is complete.
      for(var i = 1; i < budgetsTableRows.length; i++) {
        budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
        budgetsTableRows[i].style.color = "grey";
      } // Close for() loop.
    }; // Close if() statement.
    // Show the 'Pause Draft' button if the current user is the admin user.
    if(myApp.currentUser == myApp.admin){
      myApp.pauseDraftButton.style.display = "";
    };
    // Set the position validation variables.
    myApp.setBenchCount(data.loadData);
    // myApp.otbSetBenchCount(data.loadData);
    myApp.setRosterArray(data.loadData);
    // myApp.otbSetRosterArray(data.loadData);
    myApp.getTopPlayer();
    // Run the updateSPP() function to load the top available valid player for the current user.
    myApp.updateSPP(myApp.topPlayer);
    // Run the selectPlayer() function to add event listeners to the rows of the selected player pane.
    myApp.selectPlayer();
    // Hide and re-display the myTeamTable in an attempt to get it to show updated data if any is missing.
    $('#myTeamTable').hide().show(0);
    // Run socket.emit("joinRoom") to add the current coach to the draft room on the back end.
    socket.emit('joinRoom', {draftID: myApp.draftID, currentUser: myApp.currentUser});
    console.log("pageLoad Complete!");
  }, 1000);
}); // Close socket.on("pageLoaded") function.


// The socket.on("joinedCoach") function updates the Team Names in the budgets pane for all users connected to the room every time a new coach joins the room.
socket.on("joinedCoach", function(data){
  console.log("joinedCoach Started!");
  var budgetsTable = document.getElementById("budgetsTable");
  var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
  var joinedCoachesCount = 0;
  myApp.connectedUsers = [];

  // Updates all of the team names in the budgets pane.
  for (var i=1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];
    td.innerHTML = data.joinedCoaches[i-1];
    // For each budget table row loop through the socketList and see if we can find a matching team name and draftID.
    // If we can then the user has joined the draft and we colour their team details white.
    for(var j=0; j < data.socketList.length; j++){
      if(data.socketList[j].includes(td.innerHTML + "-" + myApp.draftID)){
        budgetsTableRows[i].style.color = "white";
        myApp.connectedUsers.push(td.innerHTML);
        break;
      } // Close if()statement.
    } // Close for(var j=0) loop.
  }; // Close for(var i=1) loop.
  // Loop through the socketList and count the number of sockets that are joined to the current draft.
  for(var i=0; i < data.socketList.length; i++){
    if(data.socketList[i].includes(myApp.draftID)){
        joinedCoachesCount += 1;
      } // Close if()statement.
  };
  // If all coaches have joined then we set the myApp.allConnected variable to true, if not, we set it to false.
  if(joinedCoachesCount == myApp.numOfCoaches){
    myApp.allConnected = true;
  } else {
    myApp.allConnected = false;
  }
  // Loop through all of the 
  // Re-run the addRosterFilterOption() function every time a new coach joins to update the text in the select options from an email to a team name.
  myApp.addRosterFilterOption(data.joinedCoaches);
  myApp.teamFilter.value = myApp.currentUser;
  console.log("joinedCoach Finished!");
}); // Close the socket.on("joinedCoach") function.


socket.on("draftPaused", function(){
  clearInterval(myApp.sppCounter);
  myApp.demo.innerHTML = "Paused - " + myApp.currentOtbCoach + " to restart"
});


socket.on('disconnectedCoach', function(data){
  console.log("Disconnection!");
  var budgetsTable = document.getElementById("budgetsTable");
  var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
  // We set the myApp.allConnected variable to false as if a coach has disconnected all coaches can't be connected.
  myApp.allConnected = false;
  // Updates all of the team names in the budgets pane.
  for (var i=1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];
    if(data.disconnectedSocket.includes(td.innerHTML + "-" + myApp.draftID)){
      budgetsTableRows[i].style.color = "grey";
    }
  }; // Close for(var i=1) loop.
  var disconnectedIndex = myApp.connectedUsers.indexOf(td.innerHTML);
  console.log(myApp.connectedUsers);
  console.log(disconnectedIndex);
  myApp.connectedUsers.splice(disconnectedIndex -1, 1);
}); // Close socket.on('disconnectedCoach').


socket.on('playerDrafted', function(data) {
  var budgetsTable = document.getElementById("budgetsTable");
  var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
  myApp.currentBid.innerHTML = "-";
  myApp.otbName.innerHTML = "-";
  myApp.otbTeamPos.innerHTML = "-";
  //myApp.otbPic.src = "./images/TBA.png";
  // Clear any current otb and spp countdown timers.
  clearInterval(myApp.counter);
  clearInterval(myApp.sppCounter);
  // Code to change all team names to white in the Budgets pane when a round of drafting completes except for those that aren't currently connected to the draft.
  for (var i = 1; i < budgetsTableRows.length; i++) {
    if(myApp.connectedUsers.indexOf(budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML) < 0){
      budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
      budgetsTableRows[i].style.color = "grey";
    } else {
        budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
        budgetsTableRows[i].style.color = "white";
    } // Close else{} statement.
  } // Close for() loop.

  // Highlight the player search pane with the completed results.
  myApp.highlightSearch(data.dbData.results);
  // Call updateBudgets() to update the Budgets pane.
  myApp.updateBudgets(data.dbData.coaches);
  // Update the player search pane to grey out any drafted players.
  myApp.updateSearch();
  // Add a row to the myTeamDT data table containing the details of the most recently drafted player.
  var index = data.dbData.results.length -1;
  var concatName;
  if(data.dbData.results[index].position.length < 4){
    concatName = data.dbData.results[index].name + " (" + data.dbData.results[index].position.substring(0,1) + ")";
  } else {
    concatName = data.dbData.results[index].name + " (" + data.dbData.results[index].position.substring(0,1) + "/" + data.dbData.results[index].position.substring(4,5) + ")";
    }; // Close if() statement.
  myApp.myTeamDT.row.add([data.dbData.results.length, concatName, data.dbData.results[index].team, "$" + data.dbData.results[index].price]).draw(false);
  // Update the draftedPlayersList with the updated results list from the DB.
  // We used ‘JSON.parse(JSON.stringify(data.dbData.results))’ to convert the data.dbData.resutls data into a string and then re-convert it into an object.
  // We do this because if we just assigned data.dbData.results directly to the draftedPlayersList variable then we are passing the value by reference and anything we do to the draftedPlayersList also updates the data.dbData.results variable.
  // Run the filterRosterPane() function to update the myRoster pane with the selected coaches data.
  myApp.draftedPlayersList = JSON.parse(JSON.stringify(_.pluck(data.dbData.coaches, "players")));
  myApp.filterRosterPane();
  // Update the total number of players drafted.
  myApp.numOfPlayersDrafted = data.dbData.results.length;
  // If the total number of players drafted is greater than or equal to the total amount of roster spots then the draft is complete.
  // In this case we issue an alert, if not we execute all of our normal playerDrafted functions to continue on the draft.
  // The functions above relate to updated details for the most recent draftee, so we want to run them regardless.
  if (myApp.numOfPlayersDrafted >= myApp.totalRosterSpots){
    alert("Congratulations! The draft is complete!");
    myApp.demo.style.fontSize = "2vmin";
    myApp.demo.innerHTML = "Draft Complete!";
    myApp.addToQueue.disabled = true;
    myApp.addToQueue.style.backgroundColor = "#DCDCDC";
    myApp.placeBidButton.style.background = "grey";
    myApp.placeBidButton.innerHTML = "";
    myApp.pauseDraftButton.disabled = true;
    myApp.pauseDraftButton.style.backgroundColor = "#DCDCDC";
    // Code to change all team names to grey in the Budgets pane when the draft is complete.
    for (var i = 1; i < budgetsTableRows.length; i++) {
      budgetsTableRows[i].style.color = "grey";
    }
  } else {
      // Call highlightOtb() function to underline the on the block coach.
      myApp.highlightOtb(data.dbData.pickCounter);
      // Set the position validation variables.
      myApp.setBenchCount(data.dbData);
      // myApp.otbSetBenchCount(data.dbData);
      myApp.setRosterArray(data.dbData);
      // myApp.otbSetRosterArray(data.dbData);
      myApp.getTopPlayer();
      // Check the SPP to see if it currently has a previously drafted player and update if required.
      myApp.checkSPP(data.dbData.results);
      // If the currentUser is logged into the room then the sppStartCountdown will start a 20 second countdown
      // after which it will select the top available player to be automatically put on the block.
      if(myApp.currentUser === myApp.currentOtbCoach){
        myApp.sppStartCountdown(data.sppEndTime);
      };
      // Set the maxBid variable to the current users Max Bid as per the Budgets pane.
      myApp.setMaxBid(data.dbData);
      // Updates the 'Sold for' text to say "Selection Pending...".
      myApp.demo.style.fontSize = "2vmin";
      myApp.demo.innerHTML = "On The Block: " + data.dbData.otbCoach;
      // Enable the 'Pause Draft' button if the current user is the admin user.
      if(myApp.currentUser == myApp.admin){
        myApp.pauseDraftButton.disabled = false;
        myApp.pauseDraftButton.style.backgroundColor = "orange";
      }; // Close if() statement.
    } // Close else statement.
}); // Close socket.on('playerDrafted') function.



// Locks the bidding button, clears the countdown timer and displays 'Bid Pending' for all clients every time one user submits a bid.
socket.on('bidLock', function(){
  myApp.placeBidButton.disabled = true;
  clearInterval(myApp.counter);
  myApp.placeBidButton.innerHTML = 'Bid Pending...';
  myApp.placeBidButton.style.background = "grey";
  myApp.demo.innerHTML = "-";
});



socket.on('bidUpdate', function(data) {
  myApp.startCountdown(data.otbEndTime);
  myApp.highlightBidder(data.bidData.otbBidder);
  myApp.lockBid(data.bidData.otbBidder, myApp.currentUser);
  myApp.currentBid.innerHTML = "$" + data.bidData.otbBid;
  myApp.biddingTeam = data.bidData.otbBidder;
  // Checks if the availablePosition variable is false (this is set upon the player being added to the block).
  // If the availablePosition is false then we disable the coach from bidding, if it is true then we run the normal bid code
  if(myApp.availablePosition === false){
    myApp.placeBidButton.innerHTML = "No " + data.bidData.otbPos + " Spots";
    myApp.placeBidButton.disabled = true;
    myApp.placeBidButton.style.background = "grey";
  } else if (myApp.currentUser === data.bidData.otbBidder){
      // Updates the Place Bid button to have the current bid price plus 1 or 'You Lead' text if the logged in coach leads the bidding.
      myApp.placeBidButton.innerHTML = "You Lead @ $" + (Number(data.bidData.otbBid));
  } else if (data.bidData.otbBid >= myApp.maxBid){
      // Disables the bid button if bidding exceeds the coaches max bid.
      myApp.placeBidButton.disabled = true;
      myApp.placeBidButton.innerHTML = "> Max Bid";
      myApp.placeBidButton.style.background = "grey";
    } else {
        myApp.placeBidButton.innerHTML = "Bid $" + (Number(data.bidData.otbBid) + 1);
      };
  // Checks if the otb pane is blank, if so a coach has re-entered the draft room mid way through a draft.
  // If this is the case then we want to update the otb pane with the otb player details for that coach but not for other other coaches that already have the details loaded.
  if (myApp.otbName.innerHTML === ""){
    myApp.otbName.innerHTML = data.bidData.otbPlayer;
    myApp.otbTeamPos.innerHTML = data.bidData.otbPos + " - " + data.bidData.otbAverage;
    //yApp.otbPic.src = "./images/" + data.bidData.otbPlayer.toUpperCase().replace(/\s+/g,"") + ".png";
  }
}); // Close socket.on("bidUpdate") function.




socket.on('otbUpdate', function(data) {
  clearInterval(myApp.sppCounter);
  myApp.addToQueue.disabled = true;
  myApp.placeBidButton.disabled = false;
  myApp.placeBidButton.style.background = "blue";
  myApp.startCountdown(data.otbEndTime);
  myApp.highlightBidder(data.updatedOtbData.otbBidder);
  myApp.lockBid(data.updatedOtbData.otbBidder, myApp.currentUser);
  myApp.currentBid.innerHTML = "$" + data.updatedOtbData.otbBid;
  myApp.otbName.innerHTML = data.updatedOtbData.otbPlayer;
  myApp.otbTeamPos.innerHTML = data.updatedOtbData.otbPos + " - " + data.updatedOtbData.otbAverage;
  //myApp.otbPic.src = "./images/" + data.updatedOtbData.otbPlayer.toUpperCase().replace(/\s+/g,"") + ".png";
  // We run the benchCheck() function with the current otb positon to set the addToBench variable.
  // If the coach has no roster spots available and their bench is full, we disable the bid button.
  // Else perform the normal bid button function.
  myApp.benchCheck(data.updatedOtbData.otbPos);
  if (myApp.benchCount >= myApp.totalBenSpots && myApp.addToBench > 0){
    myApp.placeBidButton.innerHTML = "No " + data.updatedOtbData.otbPos + " Spots";
    myApp.placeBidButton.disabled = true;
    myApp.placeBidButton.style.background = "grey";
    // Sets the available position variable to false to keep the coach locked out of bidding.
    myApp.availablePosition = false;
  } else {
      // Sets the available position variable to true to allow the coach to bid.
      myApp.availablePosition = true;
      // Updates the Place Bid button to contain $1 more than the starting bid.
      if (myApp.currentUser === data.updatedOtbData.otbBidder){
        myApp.placeBidButton.innerHTML = "You Lead @ $" + Number(data.updatedOtbData.otbBid);
      } else if (data.updatedOtbData.otbBid >= myApp.maxBid){
          // Disables the bid button if bidding exceeds the coaches max bid.
          myApp.placeBidButton.disabled = true;
          myApp.placeBidButton.innerHTML = "> Max Bid";
          myApp.placeBidButton.style.background = "grey";
      } else {
          myApp.placeBidButton.innerHTML = "Bid $" + (Number(data.updatedOtbData.otbBid) + 1);
        };
    }; // Close if(benchCount) else statement.
  // Updates the start value in the SPP back to $1 for all coaches after a player is added to the block.
  myApp.startValue.value = 1;
  // Disables the 'Pause Draft' button if the current user is the admin user.
  if(myApp.currentUser == myApp.admin){
    myApp.pauseDraftButton.disabled = true;
    myApp.pauseDraftButton.style.backgroundColor = "#DCDCDC";
  };
}); // Close socket.on("otbUpdate") function.





