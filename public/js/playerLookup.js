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

var myTeamDT;


// Prevent the "Place Bid" button from opening a new page.
$("#bidForm").submit(function(e){
  e.preventDefault();
});

// Hide dialog boxes.
$("#dialogues").hide();


// Set up Data Tables.
$(document).ready(function() {
    $('#searchTable').DataTable( {
        scrollY:        '68vh',
        scrollCollapse: true,
        paging:         false,
        searching: false,
        ordering: false,
        bInfo: false,
        autoWidth: true
});
});

$(document).ready(function() {
  myTeamDT = $('#myTeamTable').DataTable( {
        scrollY: '88.25vh',
        scrollCollapse: true,
        paging: false,
        searching: false,
        aaSorting: [],
        bInfo: false,
        autoWidth: true,
        oLanguage: {
          sZeroRecords: "-"
        }
    });

/* COMMENTED OUT TO REMOVE THE NEED FOR THE ADMIN USER TO CLICK THE NEXT BUTTON TO ADVANCE THE DRAFT. HAS BEEN REPLACED WITH A SET TIMEOUT IN THE STARTCOUNTDOWN() FUNCTION.
    $("#next").on("click", function(){
      draft();
  })
 */

});


// Define global variables.

// Search and selected player variables.
var selectedPlayer;
var selectedPlayerName = document.getElementById("selectedName");
var selectedPlayerPosition = document.getElementById("selectedPosition");
var selectedPlayerPic = document.getElementById("selectedPic");
var selectedPlayerImgString;
var searchTable = document.getElementById("searchTable");
var searchTableRows = searchTable.getElementsByTagName("tr");
var watchlistFilter = document.getElementById("watchlistSearch");
watchlistFilter.checked = false;
var watchlistCheckboxes = searchTable.getElementsByTagName("input");
watchlistCheckboxes.checked = false;
var hideDrafted = document.getElementById("hideDrafted");
hideDrafted.checked = true;
var addToQueue = document.getElementById("addToQueue");

var playerData;
var sppRank = document.getElementById("rank");
var sppAve = document.getElementById("ave");
var sppPoints = document.getElementById("points");
var sppStdDev = document.getElementById("stdDev");
var sppGames = document.getElementById("games");
var sppAge = document.getElementById("age");
var sppPrice16 = document.getElementById("price16");
var sppPrice15 = document.getElementById("price15");
var sppPrice14 = document.getElementById("price14");
var selectedPlayerData;
var startValue = document.getElementById("startValue");
var startingBid;

// On the block variables.
var otbPlayer;
var otbName = document.getElementById("otbName");
var otbTeamPos = document.getElementById("otbTeamPos");
var otbPic = document.getElementById("otbPic");
var otbPlayer;
var draftID = document.getElementById("draftID").innerHTML;
var otbPlayerID;
var otbPos;
var currentOtbCoach;
var currentUser = document.getElementById("currentUser").innerHTML;
var otbAverage;
var demo = document.getElementById("demo");

// Bidding variables.
var currentBid = document.getElementById("currentBid");
var biddingTeam;
var otbBidValue;
var maxBid;
var playerCount;
var placeBidButton = document.getElementById("placeBid");

// Budgets Pane variables.
var budgetsTable = document.getElementById("budgetsTable");
var budgetsTableRows = budgetsTable.getElementsByTagName("tr");


// Drafted Players variables.
var dpFilter = document.getElementById("myTeamFilter");
var dpFilterOptions = dpFilter.getElementsByTagName("option");

var teamFilter = document.getElementById("myTeamFilter");
var posFilter = document.getElementById("myTeamPosFilter");


var myTeamTable = document.getElementById("myTeamTable");
var myTeamTableRows = myTeamTable.getElementsByTagName("tr");

var myTeamOrderSort = document.getElementById("myTeamOrderSort");
var myTeamPlayerSort = document.getElementById("myTeamPlayerSort");


// Define updateSearch() function used to filter the search pane.
function updateSearch() {
  // Declare variables 
  var input = document.getElementById("playerSearch");
  var filter = input.value.toUpperCase();
  var select = document.getElementById("positionSearch");
  var position = select.value.toUpperCase();

  // Loop through all table rows and hide those who don't match the search query.
  for (var i = 1; i < searchTableRows.length; i++) {
    var td = searchTableRows[i].getElementsByTagName("td")[1];
    var td2 = searchTableRows[i].getElementsByTagName("td")[2];
    var td3 = searchTableRows[i].getElementsByTagName("td")[6];
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
} // Close updateSearch().

// Define updateSPPTable() to update the stats in the SPP Table.
function updateSPPTable(name){

  selectedPlayerData = playerData.filter(function(e){
    return (e.name==name.innerHTML);
  })[0];

  sppRank.innerHTML = selectedPlayerData.rank;
  sppAve.innerHTML = selectedPlayerData.ave16;
  sppPoints.innerHTML = selectedPlayerData.points16;
  sppStdDev.innerHTML = selectedPlayerData.sd16;
  sppGames.innerHTML = selectedPlayerData.games16;
  sppAge.innerHTML = selectedPlayerData.age;
  sppPrice16.innerHTML = selectedPlayerData.draftPrice16;
  sppPrice15.innerHTML = selectedPlayerData.draftPrice15;
  sppPrice14.innerHTML = selectedPlayerData.draftPrice14;
}; // Close updateSPPTable() function.


// Define selectPlayer() function used to put a player from the search pane to the SPP.
function selectPlayer(){

  // Add event listeners to all table rows to update selectedPlayer variable on click.
  for (i=0; i < searchTableRows.length; i += 1){
    searchTableRows[i].addEventListener("click",function(){
      selectedPlayer = this;

      // Update top section with name, position and picture.
      selectedPlayerName.innerHTML = this.getElementsByTagName("td")[1].innerHTML;
      selectedPlayerPosition.innerHTML = this.getElementsByTagName("td")[2].innerHTML;
      selectedPlayerImgString = "./images/" + this.getElementsByTagName("td")[1].innerHTML.toUpperCase().replace(/\s+/g,"") + ".png";
      selectedPlayerPic.src = selectedPlayerImgString;
      otbPlayerID = this.getElementsByTagName("td")[1].innerHTML;
      otbPos = this.getElementsByTagName("td")[2].innerHTML;
      otbAverage = this.getElementsByTagName("td")[3].innerHTML;

      // Update bottom section with table stats.
      updateSPPTable(selectedPlayerName);

      updateSearch();
    });
  }
}; // Close selectPlayer().

// Call selectPlayer() function to assign click event listeners to table data.
selectPlayer();




// COUNTDOWN TIMER CODE.

var counter;
var distance;
var demo = document.getElementById("demo");
var countDownDate;
var now;


// Define startCountdown function to start the countdown clock.
var startCountdown = function(endTime){
  // Increase the font size back to normal size after it is reduced for 'On the block:' text.
  demo.style.fontSize = "3vmin";

  // Set the date we're counting down to
  countDownDate = endTime;

  // Clear any current timers.
  clearInterval(counter);

  // Update the count down every 1 second
  counter = setInterval(function() {

      // Get todays date and time
      now = new Date().getTime();
      
      // Find the distance between now and the count down date
      distance = countDownDate - now;
      
      // Time calculations for days, hours, minutes and seconds
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Output the result in an element with id="demo"
      demo.innerHTML = seconds + " secs";
      
      // If the count down is over, update the text in the clock pane and wait 5 seconds before putting the next coach on the block.
      if (distance < 0) {
          clearInterval(counter);
          placeBidButton.disabled = true;
          demo.innerHTML = "Sold for " + currentBid.innerHTML;
          placeBidButton.style.background = "grey";
          placeBidButton.innerHTML = "-";
          document.getElementById("next").disabled = false;

          // Waits 5 seconds before running the delayDraft() function, this replaces the admin user clicking the next button.
          // This function checks if the placeBidButton has a '-' which means that drafting has finished.
          // As it only checks the admins screen, we wait 5 seconds to ensure that drafting has completed for all coaches.
          function delayDraft(){
            if (placeBidButton.innerHTML === "-"){
             draft();
            }
          };

          if(currentUser === adminCoach){
            setTimeout(delayDraft, 5000);
          }

      }
  }, 10);
}; // Close startCountdown() function.

// Define autoSPP() function used to update the SPP with the top ranked undrafted player.
// This is used when the sppStartCountdown() function reaches 0 or when a drafted player is in the SPP for the OTB Coach.
function autoSPP(){
  var autoTD;

  for (var i = 1; i < searchTableRows.length; i++) {
      if(Boolean(searchTableRows[i].style.textDecoration === "")){
        // Update OTB data.
        autoTD = searchTableRows[i].getElementsByTagName("td");
        break;
      }
  }

        otbPlayerID = autoTD[1].innerHTML;
        otbPos = autoTD[2].innerHTML;
        otbAverage = autoTD[3].innerHTML;


        // Update SPP data only for the currentOtbCoach if they are logged in.
        if(currentUser === currentOtbCoach){
          selectedPlayerName.innerHTML = autoTD[1].innerHTML;
          selectedPlayerPosition.innerHTML = autoTD[2].innerHTML;
          selectedPlayerImgString = "./images/" + autoTD[1].innerHTML.toUpperCase().replace(/\s+/g,"") + ".png";
          selectedPlayerPic.src = selectedPlayerImgString;
          startValue.value = 1;
          updateSPPTable(autoTD[1]);
        }
}; // Close autoSPP function.


// Define sppStartCountdown function to start the countdown clock to put a player On The Block.
var sppCounter;
var sppDistance;
var sppCountDownDate;
var sppNow;

var sppStartCountdown = function(sppEndTime){

  // Set the date we're counting down to
  sppCountDownDate = sppEndTime;

  // Clear any current timers.
  clearInterval(sppCounter);

  // Update the count down every 1 second
  sppCounter = setInterval(function() {

      // Get todays date and time
      sppNow = new Date().getTime();
      
      // Find the distance between now and the count down date
      sppDistance = sppCountDownDate - sppNow;
      
      // Time calculations for days, hours, minutes and seconds
      var seconds = Math.floor((sppDistance % (1000 * 60)) / 1000);
      
      // Output the result in an element with id="demo"
      demo.innerHTML = seconds + " secs";
      
      // If the count down is over, write some text 
      if (sppDistance <= 0) {
          clearInterval(sppCounter);
          if(otbName.innerHTML === "-"){
          // Run autoSPP() to update the SPP for the current OTB Coach.
          // THIS CODE SHOULD POTENTIALLY BE UPDATED.
          // THE FACT THAT AUTOSPP() AND ADDTOBLOCK() ARE IN THE IF STATEMENTS MEANS THAT THEY ONLY EXECUTE IF THE CURRENT USER IS LOGGED IN.
          // THE USER CAN LOG IN AND ADD A PLAYER TO THE BLOCK, BUT IT MEANS THAT THE DRAFT IS FROZEN IF THE OTB USER IS LOGGED OUT.
          /* I'VE REMOVED THE IF STATEMENT FOR NOW SO THAT IT EXECUTES REGARDLESS OF WHETHER THE USER IS LOGGED IN. THE PROBLEM WITH THIS PREVIOUSLY
          IS THAT THE sppStartCountdown() function was executed for all users when the playerDrafted websockets was emitted. To fix this I've changed
          it so that only the coach that is on the block sees the SPP countdown timer. I will probably move this countdown into the existing otb clock
          pane as well. */

            autoSPP();
            addToBlock();

       }
      }
  }, 10);
}; // Close sppStartCountdown() function.


// Define highlightBidder() function to update the colour of the curent lead bidder to fluro green. 
// This may clash with the otb colouring when they are both turned on.
function highlightBidder(data){
  for (var i = 1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];

    if (td) {
    if (td.innerHTML === data) {
      budgetsTableRows[i].style.color = "yellow";
    } else {
        budgetsTableRows[i].style.color = "white";
    }
    } 
  }
}; // Close highlightBidder() function.


// Define highlightOtb() function to underline the coach currently on the block and disable Add To Queue for others.

function highlightOtb(data){

  // The data parameter above holds the pickCounter. As the pickCounter starts at 1 and loops between 0 and 9,
  // we need to manipulate it into the currentOtbIndex variable below so that when the pick counter is on 0, it is changed to 10 to highlight the last coach on the budgets pane.
  var currentOtbIndex;

  if(data===0){
    currentOtbIndex = 10;
  } else {
    currentOtbIndex = data;
  }

  // Clears underline on all team names in Budgets Table.
  for (var i = 1; i < budgetsTableRows.length; i++) {
    budgetsTableRows[i].style.textDecoration = "none";
  };

  // Adds an underline to the coach currently on the block as determined by the pick counter.
  budgetsTableRows[currentOtbIndex].style.textDecoration = "underline";

  // Updates the value of the currentOtbCoach based on the pick counter.
  currentOtbCoach = budgetsTableRows[currentOtbIndex].getElementsByTagName("td")[0].innerHTML;

    if(currentOtbCoach === currentUser){
      addToQueue.disabled = false;
      addToQueue.style.backgroundColor = "yellow";
    } else {
      addToQueue.disabled = true;
      addToQueue.style.backgroundColor = "#DCDCDC";
    };

    document.getElementById("next").disabled = true;
}; // Close highlightOtb() function.


// Define highlightSearch() function to grey out players once they have been drafted.
function highlightSearch(data){
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
}; // Close highlightSearch() function.


// Define lockBid() function to stop the leading bidder from placing a bid.
function lockBid(data, currentUser){

if(data === currentUser){
  placeBidButton.disabled = true;
  placeBidButton.style.background = "grey";
} else{
  placeBidButton.disabled = false;
  placeBidButton.style.background = "blue";
}
}; // Close lockBid() function.


function updateBudgets(data){
  for (var i = 1; i < budgetsTableRows.length; i++) {
    budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = "$" + (data[i-1].budget - (21 - data[i-1].numOfPlayers));
    budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = "$" + data[i-1].budget;
    budgetsTableRows[i].getElementsByTagName("td")[3].innerHTML = data[i-1].numOfPlayers + "/22";
  }

}; // Close updateBudgets() function.


// Define updateDPFilter() function to update the Drafted Players team filter based on the teams in the Budgets pane.
function updateDPFilter(){
  for (i=1; i < dpFilterOptions.length; i++){
  dpFilterOptions[i].value = budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML;
  dpFilterOptions[i].innerHTML = budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML;
};
}
// Call the updateDPFilter() function.
updateDPFilter();


function checkSPP(){
  if(currentUser === currentOtbCoach){
    var td;

    for(i=1; i < myTeamTableRows.length; i++){

      td = myTeamTableRows[i].getElementsByTagName("td")[1];

      if(selectedPlayerName.innerHTML === td.innerHTML){
        // Update SPP data.
        autoSPP();
      }
    }
  }
} // Close checkSPP() function.


  function setMaxBid(data){
    console.log(data);
  var budgetData = data.coaches.filter(function(e){
                      return (e.teamName2==currentUser);
                    })[0].budget;

  console.log(budgetData);

  playerCount = data.coaches.filter(function(e){
    return (e.teamName2==currentUser);
  })[0].numOfPlayers;

  maxBid = budgetData - (21 - playerCount);

  }; // Close setMaxBid() function.


// Define myTeam() function used to filter the My Team Pane.
function updateMyTeam() {
  var td;
  var tdPos;
  var team = teamFilter.value;
  var pos = posFilter.value;
  // Loop through all table rows and hide those who don't match the search query.
  for (var i = 1; i < myTeamTableRows.length; i++) {
    td = myTeamTableRows[i].getElementsByTagName("td")[3];
    tdPos = myTeamTableRows[i].getElementsByTagName("td")[2];

    if (td) {
      if (team === "All" && pos === "All"){
        myTeamTableRows[i].style.display = ""
      }
      else if (td.innerHTML === team && tdPos.innerHTML.indexOf(pos) > -1) {
        myTeamTableRows[i].style.display = ""
      }
      else if (team === "All" && tdPos.innerHTML.indexOf(pos) > -1){
        myTeamTableRows[i].style.display = ""
      }
      else if (td.innerHTML === team && pos === "All"){
        myTeamTableRows[i].style.display = ""
      }
      else {
        myTeamTableRows[i].style.display = "none";
      }
    } 
  }
} // Close updateMyTeam().


// WEBSOCKETS FUNCTIONS.

var socket = io.connect('/');

// Set the Websocket room ID.
var room = draftID;
console.log('Room:' + room);

socket.on('connect', function(){
  // Connected, let's sign up to receive messages for this room.
  socket.emit('room', room);
}); // Close socket.on('connect').

// The socket.on("joinedCoach") function updates the Team Names in the budgets pane for all users connected to the room every time a new coach joins the room.
socket.on("joinedCoach", function(data){
  console.log(data.joinedCoaches);
  console.log('Team Name 2: ' + data.joinedCoaches[0].teamName2);
  for (var i = 1; i < budgetsTableRows.length; i++) {
      var td = budgetsTableRows[i].getElementsByTagName("td")[0];
      td.innerHTML = data.joinedCoaches[i-1].teamName2
    }
});

var adminCoach;

// WebSockets pageLoad() function used to set up the page properly on page load.
var pageLoad = function(){
  socket.emit("pageLoad", {draftID: draftID});
  console.log('pageLoad emitted');
};

socket.on("pageLoaded", function(data){
  playerData = data.playerData;
  adminCoach = data.loadData.admin;

  highlightSearch(data.loadData.results);
  highlightOtb(data.loadData.pickCounter)
  highlightBidder(data.loadData.otbBidder)
  updateSearch();
  setMaxBid(data.loadData);
  placeBidButton.disabled = true;
  placeBidButton.style.background = "grey";

  document.getElementById("next").disabled = false;

  console.log('pageLoaded completed: ' + data.loadData.pickCounter);


  // Hide the "Next" button for all users except for the Admin user.
  if(currentUser !== data.loadData.admin){
    $("#next").hide()
  };


}); // Close socket.on() function.

// Comment out for development.

pageLoad();




// WebSockets draft() function below used to draft a player once bidding is complete.
var draft = function(){
  socket.emit('draft', { draftID: draftID, biddingTeam: biddingTeam, price: currentBid.innerHTML });
};

socket.on('playerDrafted', function(data) {
  currentBid.innerHTML = "-";
  otbName.innerHTML = "-";
  otbTeamPos.innerHTML = "-";
  otbPic.src = "./images/TBA.png";

  highlightSearch(data.dbData.results);

  // Call highlightOtb() function to underline the on the block coach.
  highlightOtb(data.dbData.pickCounter);

  // Code to change all team names back to white in the Budgets pane.
  for (var i = 1; i < budgetsTableRows.length; i++) {
    budgetsTableRows[i].style.color = "white";
  }

  // Add a row to the myTeamDT data table containing the details of the most recently drafted player.
  var index = data.dbData.results.length -1;
  myTeamDT.row.add([data.dbData.results.length, data.dbData.results[index].name, data.dbData.results[index].position, data.dbData.results[index].team, "$" + data.dbData.results[index].price]).draw(false);
  // Call updateBudgets() to update the Budgets pane.
  updateBudgets(data.dbData.coaches);

  updateSearch();

  // If the currentUser is logged into the room then the sppStartCountdown will start a 10 second countdown
  // after which it will select the top available player to be automatically put on the block.
  if(currentUser === currentOtbCoach){
    sppStartCountdown(data.dbData.otbEndTime);
  };

  // The absentOtbOverride waits 25 seconds (allowing a buffer for the 10 second timer to elapse) and then automatically puts a player
  // on the block in the event the otb coach isnt logged in.
  function absentOtbOverride(){
    if(otbName.innerHTML === "-"){
      autoSPP();
      addToBlock();
    }
  };
    // The below line sets teh absentOtbOverride function to be run after 25 seconds, 
    // allowing ample time for the 20 second countdown to elapse if the otb coach is logged in.
    setTimeout(absentOtbOverride, 25000);

  checkSPP();

  // Set the maxBid variable to the current users Max Bid as per the Budgets pane.
  setMaxBid(data.dbData);

  // Clicks the 'Player' and the '#' in the drafted players table header to sort the table and resize it after a player is drafted.
  // This still needs some work. Clicking in this order is a bit of a workaround and I don't believe that it will work for all cases.
  myTeamPlayerSort.click();
  myTeamOrderSort.click();
  myTeamOrderSort.click();

  // Updates the 'Sold for' text to say "Selection Pending...".
  demo.innerHTML = "On The Block: " + data.dbData.otbCoach;
  demo.style.fontSize = "2vmin";


}); // Close socket.on() function.


// WebSockets bid() function used to log a bid. Need to add an error function for bids under the otb bid price.
var bid = function(){

  otbBidValue = Number(currentBid.innerHTML.replace(/[^0-9\.]+/g,"")) + 1;

// If statements to send an alert if the bid value is greater than the current users max bid or if their team is full.
  if(otbBidValue <= maxBid && playerCount < 22){
    socket.emit('bid', { draftID: draftID, bidValue: otbBidValue, currentUser: currentUser });
    console.log('currentUser: ' + currentUser);
} else if(playerCount >= 22){
    // Code to show the jQuery UI Dialog.
    $(function(){
      $("#dialogFull").dialog({
          position: top
        });
    });
} else if (otbBidValue > maxBid){
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

}; // Close bid() function.


// Locks the bidding button, clears the countdown timer and displays 'Bid Pending' for all clients every time one user submits a bid.
socket.on('bidLock', function(){
  placeBidButton.disabled = true;
  clearInterval(counter);
  placeBidButton.innerHTML = 'Bid Pending...';
  placeBidButton.style.background = "grey";
  demo.innerHTML = "-";
});



socket.on('bidUpdate', function(data) {
  
  startCountdown(data.bidData.otbEndTime);

  highlightBidder(data.bidData.otbBidder);

  lockBid(data.bidData.otbBidder, currentUser);

  currentBid.innerHTML = "$" + data.bidData.otbBid;
  biddingTeam = data.bidData.otbBidder;
  // Updates the Place Bid button to have the current bid price plus 1.
  placeBidButton.innerHTML = "Bid $" + (Number(data.bidData.otbBid) + 1);

}); // Close socket.on() function.


// Websockets addToBlock() function.
var addToBlock = function(){

  // Checks if the starting bid price is greater than the maxBid for the current OTB coach.
  // If so, shows a dialog and sets the startValue.value back to 1.
  if(startValue.value > maxBid){
    $(function(){
      $("#dialogOTB").dialog({
          position: top
        })
    });
    startValue.value = 1;
  } else {
      console.log(otbPlayerID)
      console.log(otbAverage)
      socket.emit('addToBlock', { draftID: draftID, player: otbPlayerID, position: otbPos, average: otbAverage, currentUser: currentOtbCoach, startingBid: startValue.value});
  } // Close else{} statement.

}; // Close addToBlock() function.

socket.on('otbUpdate', function(data) {
  // Clears the current sppCountdownTimer for all users.
  clearInterval(sppCounter);
  addToQueue.disabled = true;
  placeBidButton.disabled = false;
  placeBidButton.style.background = "blue";

  startCountdown(data.updatedOtbData.otbEndTime);

  highlightBidder(data.updatedOtbData.otbBidder);

  lockBid(data.updatedOtbData.otbBidder, currentUser);

  currentBid.innerHTML = "$" + data.updatedOtbData.otbBid;
  otbPlayer = data.updatedOtbData.otbPlayer;
  otbName.innerHTML = otbPlayer;
  otbTeamPos.innerHTML = data.updatedOtbData.otbPos + " - " + data.updatedOtbData.otbAverage;
  otbPic.src = "./images/" + data.updatedOtbData.otbPlayer.toUpperCase().replace(/\s+/g,"") + ".png";;

  // Updates the Place Bid button to contain $1 more than the starting bid.
  document.getElementById("placeBid").innerHTML = "Bid $" + (Number(data.updatedOtbData.otbBid) + 1);

  // Updates the start value in the SPP back to $1 for all coaches after a player is added to the block.
  startValue.value = 1;

}); // Close socket.on("otbUpdate") function.



