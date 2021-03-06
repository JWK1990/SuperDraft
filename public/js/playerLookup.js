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

  // The below code is used to track changes to watchlist checkboxes and repopulate any chcked watchlist checkboxes on a page reload.
  // Add event listeners to all of the watchlist checkboxes to update the local storage every time one is changed.
  myApp.$checkboxes.on("change", function(){
    myApp.updateStorage();
  }); // Close #checkboxes.on("change") function.
  // On page load we recheck any checkboxes that were previously checked according to the JSON array in local storage.
  $.each(myApp.formValues, function(key, value) {
    $("#" + key).prop('checked', value);
  }); // Close $.each(myApp.formValues) function.


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
  otbCoach: {},
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
  currentUser: document.getElementById("currentUser").firstChild.nodeValue,
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
  // myTeamDT: {},
  // Bid countdown timer variables.
  counter: {},
  demo: document.getElementById("demo"),
  // SPP countdown timer variables.
  sppCounter: {},
  // Define the admin coach variable.
  admin: {},
  // Define the pauseDraftButton variable.
  pauseDraftButton: document.getElementById("pauseDraft"),
  // Define the connectedUsers variable to hold a list of the connected users.
  connectedUsers: [],
  // Define the soldForTimeout variable to hold the current timeout for the "Sold for" text.
  soldForTimeout: {},
  // Define the latencyList variable to hold a list of the average latencies for each client.
  // latencyList: [],
  // Define the chatTable variables.
  chatTable: document.getElementById("chatTable"),
  chatTableBody: document.getElementById("chatTableBody"),
  chatTableRows: chatTableBody.getElementsByTagName("tr"),
  chatInput: document.getElementById("chatInput"),
  chatButton: document.getElementById("chatButton"),
  // Define the chatColours array to hold the potential chat colours that a coach can be assigned.
  // We hold 20 colours (for the max number of coaches in a draft).
  // There are 12 unique colours. The last 8 double up. We use these to colour the message in the broadcastChat() function based on the index of the coach in coaches array.
  //#FF6EFF = Shocking Pink (pink), #66FF66 = Screaming Green (green) , #FDFF00 = Lemon Glacier (yellow), #50BFE6 = Blizzard Blue (blue), #FD5B78 = Wild Watermelon (red), #FF6037 = Outragous Orange (orange), #FFD3F8 = Bubblegum (light pink), #4F86F7 = Blueberry (medium blue), #44D7A8 = Eucalyptus (aqua), #FFFF31 = Daffodil (yellow), #FFFFFF = white, #AAF0D1 = Magic Mint (light green).
  chatColours: ['#FF6EFF', '#66FF66', '#FDFF00',  '#50BFE6', '#FD5B78', '#FF6037', '#FFD3F8', '#4F86F7', '#44D7A8', '#FFFF31', '#FFFFFF', '#AAF0D1', '#FF6EFF', '#66FF66', '#FDFF00',  '#50BFE6', '#FD5B78', '#FF6037', '#FFD3F8', '#4F86F7'],
  // Define the formValues variable to hold our persistent list of checked watchlist checkboxes.
  formValues: JSON.parse(localStorage.getItem('formValues')) || {},
  // Define the $checkboxes variable to hold a list of all of the watchlist checkboxes.
  $checkboxes: $("#playerSearchBody :checkbox"),


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

      // Clear the myApp.soldForTimeout variable so that we don't display the "Sold for" text.
      clearTimeout(myApp.soldForTimeout);
      // Clear any current myApp.counter timers for any existing bid timers.
      clearInterval(myApp.counter);

      // Set the demo pane at the start of the countdown.
      // Set the serverTime variable using the ServerDate object created by our ServerDate script on page load.
      var serverTime = ServerDate;

      // Set the client time.
      var clientTime = new Date();
      clientTime.setTime(clientTime.getTime());
      // Calculate the timeLeft in the countdown by subtracting the serverTime from the endTime.
      var timeLeft = endTime - serverTime;
      var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      myApp.demo.innerHTML = seconds + " secs";

      // After initially updating the demo pane, we then run a setInterval to update it every 1 second.
      // The code to update the demo pane is the same as above, except now we update the variable instead of creating it.
      myApp.counter = setInterval(function() {

        // Update the serverTime by getting an updated ServerDate.
        serverTime = ServerDate;
        // Update the client time by getting an updated time.
        clientTime = new Date();
        clientTime.setTime(clientTime.getTime());
        // Update the time left and the seconds left.
        timeLeft = endTime - serverTime;
        seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // If the amount of timeLeft is less than 0, then we stop the countdown and update the demo pane to say "Sold for" after 1 second.
        if (timeLeft < 0) {
          clearInterval(myApp.counter);
          myApp.placeBidButton.disabled = true;
          myApp.demo.innerHTML = "";
          myApp.soldForTimeout = setTimeout(function(){myApp.demo.innerHTML = "Sold for " + myApp.currentBid.innerHTML; myApp.demo.style.color = "#2CFC0E"}, 1000);
          myApp.placeBidButton.style.background = "grey";
          myApp.placeBidButton.innerHTML = "-";
        } else {
          // Update the demo pane with the number of seconds left in the countdown.
          myApp.demo.innerHTML = seconds + " secs";
        }

      }, 1000); // 1000 ms = timer may be off by 500ms.

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
      } catch(err){
          for (var i = 1; i < searchTableRows.length; i++) {
            if(Boolean(searchTableRows[i].style.textDecoration === "")){
              myApp.topPlayer = searchTableRows[i].getElementsByTagName("td");
              break;
            }
          }
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

    }, // Close updateSPP() function.

    sppStartCountdown: function(sppEndTime){
      // Clear any current spp countdown timers.
      clearInterval(myApp.sppCounter);
      // Clear any current bid counters as well.
      // This line may not be required but it is in as an extra safeguard.
      clearInterval(myApp.counter);
      // Set the demo pane at the start of the countdown.
      // Set the serverTime variable using the ServerDate object created by our ServerDate script on page load.
      var serverTime = ServerDate;
      // Set the client time.
      var clientTime = new Date();
      clientTime.setTime(clientTime.getTime());
      // Calculate the timeLeft in the countdown by subtracting the serverTime from the endTime.
      var timeLeft = sppEndTime - serverTime;
      var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      myApp.demo.innerHTML = "OTB: " + myApp.otbCoach + " <br>(" + seconds + " secs)";
      // After initially updating the demo pane, we then run a setInterval to update it every 1 second.
      // The code to update the demo pane is the same as above, except now we update the variable instead of creating it.
      myApp.sppCounter = setInterval(function() {
        // Update the serverTime by getting an updated ServerDate.
        serverTime = ServerDate;
        // Update the client time by getting an updated time.
        clientTime = new Date();
        clientTime.setTime(clientTime.getTime());
        // Update the time left and the seconds left.
        timeLeft = sppEndTime - serverTime;
        seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        // If timeLeft is less than 0 then stop the countdown and clear the text in the demo pane.
        // Also if the currentUser is the currentOtbCoach then update the selected player pane with the topPlayer (who will have been automatically put on the block for them by the back end).
        if (timeLeft < 0) {
            clearInterval(myApp.sppCounter);
            myApp.demo.innerHTML = "";
            if(myApp.currentUser === myApp.currentOtbCoach){
              myApp.updateSPP(myApp.topPlayer);
            } // Close if(currentUser === currentOtbCoach) statement.
        } else {
            // Update the text in the demo pane to contain an updated spp countdown timer.
            myApp.demo.innerHTML = "OTB: " + myApp.otbCoach + " <br>(" + seconds + " secs)";
        }

      }, 1000); // 1000 ms = timer may be off by 500ms.

    }, // Close sppStartCountdown() function.

    highlightBidder: function(data){
    // Define highlightBidder() function to update the colour of the curent lead bidder to fluro green. 
    // This may clash with the otb colouring when they are both turned on.
      var budgetsTable = document.getElementById("budgetsTable");
      var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
      for (var i = 1; i < budgetsTableRows.length; i++) {
        var td = budgetsTableRows[i].getElementsByTagName("td")[0];
        var tdRoster = budgetsTableRows[i].getElementsByTagName("td")[3];

        if (td) {
        if (td.firstChild.nodeValue === data) {
          budgetsTableRows[i].style.backgroundColor = "#2CFC0E";
          budgetsTableRows[i].style.color = "black";
        } else if(myApp.connectedUsers.indexOf(td.firstChild.nodeValue) < 0 || tdRoster.firstChild.nodeValue == "Full"){
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
      // Sets styling on all team names in Budgets Table back to default.
      for (var i = 1; i < budgetsTableRows.length; i++) {
        budgetsTableRows[i].style.backgroundColor = "#4d4d4d";
        budgetsTableRows[i].getElementsByTagName("td")[0].style.textDecoration = "";
        if(budgetsTableRows[i].getElementsByTagName("td")[0].firstChild.nodeValue === myApp.currentUser){
          budgetsTableRows[i].style.fontWeight = "bold";
          budgetsTableRows[i].style.fontSize = "1.7vmin";
        }
      };
      // Adds an underline and a blue background color to the coach currently on the block as determined by the pick counter.
      budgetsTableRows[myApp.currentOtbIndex].style.backgroundColor = "rgba(0,0,255,0.5)";
      budgetsTableRows[myApp.currentOtbIndex].getElementsByTagName("td")[0].style.textDecoration = "underline";
      // Updates the value of the currentOtbCoach based on the pick counter.
      myApp.currentOtbCoach = budgetsTableRows[myApp.currentOtbIndex].getElementsByTagName("td")[0].firstChild.nodeValue;
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


    updateBudgets: function(data, teams, budgets, playerCount){
      var budgetsTable = document.getElementById("budgetsTable");
      var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
      if(data){
        for (var i = 1; i <= data.length; i++) {
          if(data[i-1].numOfPlayers < myApp.rosterSize){
            budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML =data[i-1].teamName2;
            budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML ="$" + (data[i-1].budget - (myApp.rosterSize -1 - data[i-1].numOfPlayers));
            budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML ="$" + data[i-1].budget;
            budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML =data[i-1].numOfPlayers + "/" + myApp.rosterSize;
          } else {
              budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML =data[i-1].teamName2;
              budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML ="-";
              budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML ="-";
              budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML ="Full";
              budgetsTableRows[i].style.color = "grey";
          }
        } // Close for() loop.

      } else {
          for (var i = 1; i <= teams.length; i++) {
            if(playerCount[i-1] < myApp.rosterSize){
              budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML = teams[i-1];
              budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = "$" + (budgets[i-1] - (myApp.rosterSize -1 - playerCount[i-1]));
              budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = "$" + budgets[i-1];
              budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML = playerCount[i-1] + "/" + myApp.rosterSize;
            } else {
                budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML = teams[i-1];
                budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = "-";
                budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = "-";
                budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML = "Full";
                budgetsTableRows[i].style.color = "grey";
            }
          } // Close for() loop.
      }

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

      // Once all players have been assigned to their relevant position arrays, sort the array by average from highest to lowest.
      function averageSort(ascending){
        return function(a,b){
          if(a.average == "-"){
            return 1;
          }
          else if(b.average == "-"){
            return -1;
          }
          else if(Number(a.average) == Number(b.average)){
            return 0;
          }
          else if(ascending) {
            return Number(a.average) < Number(b.average) ? -1 : 1;
          }
          else if(!ascending) {
            return Number(a.average) < Number(b.average) ? 1 : -1;
          }
        }; // Close return.
      }; // Close averageSort() function.
      // Run the average sort function on each position array to sort them from highest to lowest.
      selectedCoachesDef.sort(averageSort(false));
      selectedCoachesFwd.sort(averageSort(false));
      selectedCoachesRuc.sort(averageSort(false));
      selectedCoachesMid.sort(averageSort(false));
      selectedCoachesBen.sort(averageSort(false));

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
    // Define the addRosterFilterOption() function to add the coaches array to the roster filter drop down list.
      var rosterFilter = document.getElementById("myRosterFilter");
      var rosterFilterOptions = rosterFilter.getElementsByTagName("option");
      // If the roster filter options are incomplete then we update them and select the current OTB coach.
      // The options will be incomplete when all coaches haven't opened the draft page.
      // We run this function:
        // On pageLoad (will always update the options as they will be empty).
        // On joinedCoach (will only update the options if the options are incomplete).
        // On otbUpdate if no players have been drafted (will update the options when the first player is added to the block).
      // As players cannot be added to the block until all coaches have joined, the function run on otbUpdate will ensure that the roster options are completed for all connected coaches.
      // As a result, the function run on joinedCoach will no longer run as the roster options will be complete.
      // After the draft has started, the options will only be updated when a coach opens the draft page as part of the pageLoad function.
      // The joinedCoach portion won't run for that coach as by the time we get to joinedCoach function the options are already complete due to the pageLoad function).
      // If they aren't incomplete, then we leave them as they are.
      if(rosterFilterOptions.length < myApp.numOfCoaches){
        // Clear any current filter options.
        $('#myRosterFilter').html('');
        // Add in the required filter options.
        for(var i=0; i< data.length; i++){
          var option = document.createElement("option");
          option.text = data[i];
          myApp.teamFilter.add(option);
        } // Close for() loop.
        myApp.teamFilter.value = myApp.currentUser;
      } // Close if() statement.

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
    }, // Close addToBlock() function.


    pauseDraft: function(){
      myApp.pauseDraftButton.disabled = true;
      myApp.pauseDraftButton.style.backgroundColor = "#DCDCDC";
      socket.emit('pauseDraft', myApp.draftID);
    }, // Close pauseDraft() function.


    sendChat: function(currentUser){
      // Get the vaue of the chat input.
      var text = myApp.chatInput.value;
      // Clear the chatInput.
      myApp.chatInput.value = "";
      // Send the chat input to the back end to be broadcast to all clients in the current room.
      socket.emit('sendChat', {text: text, user: myApp.currentUser});
    }, // Close sendChat() function.


    addChat: function(text, user, color, secondaryColor){
      // Add a new chat line to the chatPane showing the broadcast text.
      if(myApp.chatTableBody)
      var newRow = myApp.chatTableBody.insertRow(myApp.chatTableBody.length);
      var newData = document.createElement("td");
      newData.innerHTML = "<strong style='color: " + color + "'>" + user + ": </strong>" + text;
      newRow.appendChild(newData);
      if(secondaryColor){
        newRow.style.color = secondaryColor;
        newRow.style.fontStyle = "italic";
      }
    }, // Close the addChat() function.

    // Add an event listener to the chat input so that we run the sendChat message when a user hits the enter key while in the input.
    addChatEventListener: function(){
      myApp.chatInput.addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            myApp.chatButton.click();
        }
      }); // Close addEventListener("keyup") function.
    }, // Close the addChatEventListener() function.

      updateStorage: function(){
      myApp.$checkboxes.each(function(){
        myApp.formValues[this.id] = this.checked;
      });
      localStorage.setItem("formValues", JSON.stringify(myApp.formValues));
    } // Close updateStorage() function.

}; // Close NS Namespace.


//!!!!!!!!!!!!!!DEFINE WEBSOCKETS FUNCTIONS!!!!!!!!!!!!!!!
// May need to move the below variable out of the global scope.
var socket = io.connect('/');

socket.on('connect', function(){
  // Connected, let's sign up to receive messages for this room.
  socket.emit('pageLoad', myApp.draftID);
}); // Close socket.on('connect').


socket.on("pageLoaded", function(data){
  setTimeout(function(){
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
    myApp.demo.innerHTML = "On The Block: <br>" + data.loadData.otbCoach;
    myApp.otbCoach = data.loadData.otbCoach;
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
        budgetsTableRows[i].getElementsByTagName("td")[0].style.textDecoration = "";
      } // Close for() loop.
    } else if (data.biddingUnderway == true){
      // If the current draft isnt finished but there is bidding underway then we disable the addToQueue button.
      // This stops a coach from refrehsing the page and putting another player on the block to replace one already on there.
      myApp.addToQueue.disabled = true;
      myApp.addToQueue.style.backgroundColor = "#DCDCDC";
      myApp.demo.innerHTML = "Reconnecting: <br> Waiting for next round!";
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
    // Run the addChatEventListener() function to add an event listener to the chatInput field for the user pressing the Enter key.
    myApp.addChatEventListener();
    // Run socket.emit("joinRoom") to add the current coach to the draft room on the back end.
    socket.emit('joinRoom', {draftID: myApp.draftID, currentUser: myApp.currentUser});
  }, 1000);
}); // Close socket.on("pageLoaded") function.


// The socket.on("joinedCoach") function updates the Team Names in the budgets pane for all users connected to the room every time a new coach joins the room.
socket.on("joinedCoach", function(data){
  var budgetsTable = document.getElementById("budgetsTable");
  var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
  var budgetsNeedUpdating;
  myApp.connectedUsers = [];
  // Loop through each row of the budgets table and check if the team name field contains "Waiting for coach...".
  // If we find this, then we need to update the budgets table rows, so we set the budgets need updating variable to true.
  // If not, then we set the budgetsNeedUpdating variable to false to save us from unneccessarily updating the text in the budgets pane.
  for(var i=1; i < budgetsTableRows.length; i++){
    var teamName = budgetsTableRows[i].getElementsByTagName("td")[0].firstChild.nodeValue;
    if (teamName == "Waiting for coach..."){
      budgetsNeedUpdating = true;
    } else {
      budgetsNeedUpdating = false;
    }
  };
  // If the budgetsNeedUpdating variable is true then we loop through the budgets table and update the names.
  // We also update the colouring if the coach is currently connected to the room.
  if(budgetsNeedUpdating == true){
    // Updates all of the team names in the budgets pane.
    for (var i=1; i < budgetsTableRows.length; i++) {
      var td = budgetsTableRows[i].getElementsByTagName("td")[0];
      var tdRoster = budgetsTableRows[i].getElementsByTagName("td")[3].firstChild.nodeValue;
      if(data.joinedCoaches[i-1] == null){
        td.innerHTML = "Waiting for coach...";
      } else {
        td.innerHTML = data.joinedCoaches[i-1];
      }
      // For each budget table row loop through the socketList and see if we can find a matching team name and draftID.
      // If we can then the user has joined the draft and we colour their team details white.
      for(var j=0; j < data.socketList.length; j++){
        if(data.socketList[j].includes(td.firstChild.nodeValue + "-" + myApp.draftID) && tdRoster != "Full"){
          budgetsTableRows[i].style.color = "white";
          myApp.connectedUsers.push(td.firstChild.nodeValue);
          break;
        } // Close if()statement.
      } // Close for(var j=0) loop.
    }; // Close for(var i=1) loop.
    myApp.updateBudgets(null, data.joinedCoaches, data.joinedCoachBudgets, data.joinedCoachRosterCounts);
  } else {
    // If the budgetsNeedUpdating variable is false, we just update the colouring without updating the text.
    for (var i=1; i < budgetsTableRows.length; i++) {
      // For each budget table row loop through the socketList and see if we can find a matching team name and draftID.
      // If we can then the user has joined the draft and we colour their team details white.
      var td = budgetsTableRows[i].getElementsByTagName("td")[0];
      var tdRoster = budgetsTableRows[i].getElementsByTagName("td")[3].firstChild.nodeValue;
      for(var j=0; j < data.socketList.length; j++){
        if(data.socketList[j].includes(td.firstChild.nodeValue + "-" + myApp.draftID) && tdRoster != "Full"){
          budgetsTableRows[i].style.color = "white";
          myApp.connectedUsers.push(td.firstChild.nodeValue);
          break;
        } // Close if()statement.
      } // Close for(var j=0) loop.
    }; // Close for(var i=1) loop.
  }; // Close else{} statement.
  // Re-run the addRosterFilterOption() function every time a new coach joins.
  // If the filter roster options are less than the total number of coaches we will update the roster options to include the joined coach.
  // If the filter roster options are already complete, then we will leave them as is.
  myApp.addRosterFilterOption(data.joinedCoaches);
  // Add a new line to the chat pane to show that the coach has joined.
  myApp.addChat("has joined the draft!", data.newCoach, data.color, "#2CFC0E")

}); // Close the socket.on("joinedCoach") function.


socket.on("successfullyJoined", function(data){
  // If bidding is currently underway then we clear any existing intervals, update the otb text and hide and reshow the draftBody.
  // If the draft isn't already underway then we don't need to do anything here and we will leave the data as it was after the pageLoad() function.
  if(myApp.numOfPlayersDrafted > 0){
    // Clear any existing countdown timer intervals.
    clearInterval(myApp.counter);
    clearInterval(myApp.sppCounter);
    // Disable the bid button.
    myApp.placeBidButton.disabled = true;
    // Clear the text in the OTB pane.
    myApp.otbName.innerHTML = "";
    myApp.otbTeamPos.innerHTML = "";
    myApp.placeBidButton.style.background = "grey";
    myApp.placeBidButton.innerHTML = "-";
    myApp.currentBid.innerHTML = "";
    // If bidding is underway then display the "Reconnecting: Waiting for next round text".
    if(data.biddingUnderway == true){
      myApp.demo.innerHTML = "Reconnecting: <br>Waiting for next round!";
      myApp.demo.style.color = "yellow";
    } else if(myApp.numOfPlayersDrafted < myApp.totalRosterSpots){
      // Else if the draft is underway but bidding isn't display the "On The Block" text.
      myApp.demo.innerHTML = "On The Block: <br>" + data.otbCoach;
      myApp.demo.style.color = "yellow";
    } else if(myApp.numOfPlayersDrafted >= myApp.totalRosterSpots){
      // Else if the draft is complete display the "Draft Complete" text.
      myApp.demo.innerHTML = "Draft Complete!";
      myApp.demo.style.color = "yellow";
    }
    // Hide and redisplay the draft body to try and update any outdated elements.
    document.getElementById("draftBody").style.display = "none";
    document.getElementById("draftBody").style.display = "";
  }
}); // Close the socket.on("successfullyJoined").


socket.on("draftPaused", function(){
  clearInterval(myApp.sppCounter);
  myApp.demo.innerHTML = "";
  myApp.demo.style.color = "orange";
  myApp.demo.innerHTML = "Paused:" + "<br> " + myApp.currentOtbCoach + " to restart"
});


socket.on('disconnectedCoach', function(data){
  var budgetsTable = document.getElementById("budgetsTable");
  var budgetsTableRows = budgetsTable.getElementsByTagName("tr");
  // Updates all of the team names in the budgets pane.
  for (var i=1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];
    if(data.disconnectedSocket.includes(td.firstChild.nodeValue + "-" + myApp.draftID)){
      budgetsTableRows[i].style.color = "grey";
    }
  }; // Close for(var i=1) loop.
  var disconnectedIndex = myApp.connectedUsers.indexOf(td.firstChild.nodeValue);
  myApp.connectedUsers.splice(disconnectedIndex -1, 1);

  // Get the disconnectedTeamName.
  var disconnectedTeamName = data.disconnectedSocket.slice(0, data.disconnectedSocket.indexOf("-"));
  // Add a new line to the chat pane to show that the coach has joined.
  myApp.addChat(" has left the draft!", disconnectedTeamName, "pink", "pink");

}); // Close socket.on('disconnectedCoach').


socket.on('broadcastChat', function(data){
  myApp.addChat(data.text, data.user, data.color);
}); // Close socket.on('broadcastChat') function.


socket.on('broadcastFunFact', function(data){
  // Add a new chat line to the chatPane showing the fun fact text.
  var newRow = myApp.chatTableBody.insertRow(myApp.chatTableBody.length);
  var newData = document.createElement("td");
  newData.innerHTML = data;
  newRow.appendChild(newData);
  newRow.style.color = "yellow";
}); // Close socket.on('broadcastChat') function.


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
    if(myApp.connectedUsers.indexOf(budgetsTableRows[i].getElementsByTagName("td")[0].firstChild.nodeValue) < 0){
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
      budgetsTableRows[i].getElementsByTagName("td")[0].style.textDecoration = "";
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
      // The sppStartCountdown will start a 20 second countdown after which it will select the top available player to be automatically put on the block.
      // We first clear the innerHTML and make the font size 2vmin. 
      myApp.demo.innerHTML = "";
      myApp.demo.style.fontSize = "2vmin";
      myApp.demo.style.color = "yellow"; 
      myApp.otbCoach = data.dbData.otbCoach;
      myApp.sppStartCountdown(data.sppEndTime);
      // Set the maxBid variable to the current users Max Bid as per the Budgets pane.
      myApp.setMaxBid(data.dbData);
      // Enable the 'Pause Draft' button if the current user is the admin user.
      if(myApp.currentUser == myApp.admin){
        myApp.pauseDraftButton.disabled = false;
        myApp.pauseDraftButton.style.backgroundColor = "orange";
      }; // Close if() statement.
    } // Close else statement.
  // Update the latencyList with the most recent latencyArray sent from the server as part of the "playerDrafted" event.
  // myApp.latencyList = [];
  // myApp.latencyList = data.latencyArray;
  // console.log(myApp.latencyList);
  
  // Add a row to the myTeamDT data table containing the details of the most recently drafted player.
  var index = data.dbData.results.length -1;
  var concatName;
  if(data.dbData.results[index].position.length < 4){
    concatName = data.dbData.results[index].name + " (" + data.dbData.results[index].position.substring(0,1) + ")";
  } else {
      concatName = data.dbData.results[index].name + " (" + data.dbData.results[index].position.substring(0,1) + "/" + data.dbData.results[index].position.substring(4,5) + ")";
    }; // Close if() statement.
  // myApp.myTeamDT.row.add([data.dbData.results.length, concatName, data.dbData.results[index].team, "$" + data.dbData.results[index].price]).draw(false);

  // Add a new chat line to the chatPane showing the broadcast text.
  var newRow = myApp.chatTableBody.insertRow(myApp.chatTableBody.length);
  var newData = document.createElement("td");
  newData.innerHTML = "<strong style='color: white'>" + concatName + ": </strong>" + "Sold to " + data.dbData.results[index].team + " for $" + data.dbData.results[index].price;
  newRow.appendChild(newData);
  newRow.style.color = "white";

}); // Close socket.on('playerDrafted') function.



// Locks the bidding button, clears the countdown timer and displays 'Bid Pending' for all clients every time one user submits a bid.
socket.on('bidLock', function(){
  clearInterval(myApp.counter);
  myApp.placeBidButton.disabled = true;
  myApp.placeBidButton.innerHTML = 'Bid Pending...';
  myApp.placeBidButton.style.background = "grey";
  myApp.demo.innerHTML = "";
});



socket.on('bidUpdate', function(data) {
  myApp.demo.innerHTML = "";
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


// If a waitingOnCoaches message is received, the coaches array isn't full so we issue an alert asking the coach that clicked the "Add To Block" button to wait until all coaches have joined.
socket.on("waitingOnCoaches", function(data){
  alert(data.message);
}); // Close socket.on("waitingOnCoaches");


socket.on('otbUpdate', function(data) {
  clearInterval(myApp.sppCounter);
  // Send back a latencyResponse which will be used to calculate the latency for each client.
  // socket.emit("latencyResponse", {currentUser: myApp.currentUser, sendTime: data.sendTime});
  // If this is the first player on the block, we update the roster filter pane options.
  // They may be inaccurate as we may have a coach that has joined the draft but hasn't yet opened the draft page.
  // If the admin coach starts the draft when this is the case, we update the roster filter options to add the coach that has not yet opened the draft.
  if(data.updatedOtbData.results.length == 0){
    var updatedTeamNames = _.pluck(data.updatedOtbData.coaches, "teamName2");
    myApp.addRosterFilterOption(updatedTeamNames);
    myApp.updateBudgets(data.updatedOtbData.coaches);
  }
  myApp.addToQueue.disabled = true;
  myApp.placeBidButton.disabled = false;
  myApp.placeBidButton.style.background = "blue";
  myApp.demo.innerHTML = "";
  myApp.demo.style.color = "yellow";
  // Increase the font size back to normal size after it is reduced for 'On the block:' text.
  myApp.demo.style.fontSize = "3vmin";
  myApp.startCountdown(data.otbEndTime);
  myApp.highlightBidder(data.updatedOtbData.otbBidder);
  myApp.lockBid(data.updatedOtbData.otbBidder, myApp.currentUser);
  myApp.currentBid.innerHTML = "$" + data.updatedOtbData.otbBid;
  // If the player's name is longer than 18 characters we shorted it and add "...".
  // If not, we just use the player's full name.
  if(data.updatedOtbData.otbPlayer.length > 20){
    myApp.otbName.innerHTML = data.updatedOtbData.otbPlayer.substring(0,17) + "...";
  } else {
    myApp.otbName.innerHTML = data.updatedOtbData.otbPlayer
  }
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




