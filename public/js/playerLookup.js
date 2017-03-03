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



// Prevent the "Place Bid" button from opening a new page.
$("#bidForm").submit(function(e){
  e.preventDefault();
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

// Bidding variables.
var currentBid = document.getElementById("currentBid");
var otbEndTime;
var biddingTeam;
var otbBidValue;
var maxBid;
var playerCount;

// Budgets Pane variables.
var budgetsTable = document.getElementById("budgetsTable");
var budgetsTableRows = budgetsTable.getElementsByTagName("tr");


// Drafted Players variables.
var dpFilter = document.getElementById("myTeamFilter");
var dpFilterOptions = dpFilter.getElementsByTagName("option");


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

    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1 && position === "ALL" && watchlistFilter.checked === false) {
        searchTableRows[i].style.display = "";
      } else if (td.innerHTML.toUpperCase().indexOf(filter) > -1 && td2.innerHTML.toUpperCase().indexOf(position) > -1 && watchlistFilter.checked === false){
        searchTableRows[i].style.display = "";
      } else if (td.innerHTML.toUpperCase().indexOf(filter) > -1 && position === "ALL" && watchlistFilter.checked === true && watchlistChecked === true){
        searchTableRows[i].style.display = "";
      } else if (td.innerHTML.toUpperCase().indexOf(filter) > -1 && td2.innerHTML.toUpperCase().indexOf(position) > -1 && watchlistFilter.checked === true && watchlistChecked === true){
        searchTableRows[i].style.display = "";
      }
      else {
        searchTableRows[i].style.display = "none";
      }
    } 
  }
} // Close updateSearch().




// Define selectPlayer() function used to put a player from the search pane to the SPP.
function selectPlayer(){

  // Add event listeners to all table rows to update selectedPlayer variable on click.
  for (i=0; i < searchTableRows.length; i += 1){
    searchTableRows[i].addEventListener("click",function(){
      selectedPlayer = this;
      console.log(selectedPlayer);

      // Update top section with name, position and picture.
      selectedPlayerName.innerHTML = this.getElementsByTagName("td")[1].innerHTML;
      selectedPlayerPosition.innerHTML = this.getElementsByTagName("td")[2].innerHTML;
      selectedPlayerImgString = "./images/" + this.getElementsByTagName("td")[1].innerHTML.toUpperCase().replace(/\s+/g,"") + ".png";
      selectedPlayerPic.src = selectedPlayerImgString;
      otbPlayerID = this.getElementsByTagName("td")[1].innerHTML;
      otbPos = this.getElementsByTagName("td")[2].innerHTML;
      otbAverage = this.getElementsByTagName("td")[3].innerHTML;

      // Update bottom section with table stats.
      selectedPlayerData = playerData.filter(function(e){
        return (e.name==selectedPlayerName.innerHTML);
      })[0];

      sppRank.innerHTML = selectedPlayerData.rank;
      sppAve.innerHTML = selectedPlayerData.ave16;
      sppPoints.innerHTML = selectedPlayerData.points16;
      sppStdDev.innerHTML = selectedPlayerData.sd16;
      sppGames.innerHTML = selectedPlayerData.games16;
      sppAge.innerHTML = selectedPlayerData.age;
      sppPrice16.innerHTML = "$" + selectedPlayerData.draftPrice16;
      sppPrice15.innerHTML = "$" + selectedPlayerData.draftPrice15;
      sppPrice14.innerHTML = "$" + selectedPlayerData.draftPrice14;

      updateSearch();
    });
  }
}; // Close selectPlayer().

// Call selectPlayer() function to assign click event listeners to table data.
selectPlayer();




// COUNTDOWN TIMER CODE.

var counter;
var distance;


// Define startCountdown function to start the countdown clock.
var startCountdown = function(endTime){

  // Clear any current timers.
  clearInterval(counter);
  document.getElementById("placeBid").disabled = false;
  document.getElementById("addToQueue").disabled = true;

  // Set the date we're counting down to
  var countDownDate = endTime;

  // Update the count down every 1 second
  counter = setInterval(function() {

      // Get todays date and time
      var now = new Date().getTime();
      
      // Find the distance between now and the count down date
      distance = countDownDate - now;
      
      // Time calculations for days, hours, minutes and seconds
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Output the result in an element with id="demo"
      document.getElementById("demo").innerHTML = seconds + " secs";
      
      // If the count down is over, write some text 
      if (distance < 0) {
          clearInterval(counter);
          document.getElementById("demo").innerHTML = "SOLD";
          document.getElementById("placeBid").disabled = true;
          document.getElementById("bidValue").value = 1;
          document.getElementById("next").disabled = false;
      }
  }, 1000);
}; // Close startCountdown() function.


// Define highlightBidder() function to update the colour of the curent lead bidder to pink. 
// This may clash with the otb colouring when they are both turned on.
function highlightBidder(data){
  for (var i = 1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];

    if (td) {
    if (td.innerHTML === data) {
      budgetsTableRows[i].style.color = "pink";
    } else {
        budgetsTableRows[i].style.color = "black";
    }
    } 
  }
}; // Close highlightBidder() function.


// Define highlightOtb() function to underline the coach currently on the block and disable Add To Queue for others.
function highlightOtb(data){
  for (var i = 1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];

    if (td) {
      if (td.innerHTML === data) {
        budgetsTableRows[i].style.textDecoration = "underline";
      } else {
        budgetsTableRows[i].style.textDecoration = "none";
      }
    } 
  };
  currentOtbCoach = data;

    if(currentOtbCoach === currentUser){
      document.getElementById("addToQueue").disabled = false;
    } else {
      document.getElementById("addToQueue").disabled = true;
    };

    document.getElementById("next").disabled = true;
}; // Close highlightOtb() function.


// Define highlightSearch() function to grey out players once they have been drafted.
function highlightSearch(data){
var pluck = _.pluck(data, "name");
console.log(pluck);

for (var i = 1; i < searchTableRows.length; i++) {
    var td = searchTableRows[i].getElementsByTagName("td")[1];


    if (td) {
      if (pluck.indexOf(td.innerHTML) > -1) {
        searchTableRows[i].style.backgroundColor = "#4d4d4d";
        searchTableRows[i].style.color = "#333333";
        var clone = searchTableRows[i].cloneNode(true);
        searchTableRows[i].parentNode.replaceChild(clone,searchTableRows[i]);
      }
    } 
  };
}; // Close highlightSearch() function.


// Define lockBid() function to stop the leading bidder from placing a bid.
function lockBid(data, currentUser){
var placeBidButton = document.getElementById("placeBid");

if(data === currentUser){
  placeBidButton.disabled = true;
  placeBidButton.style.background = "grey";
} else{
  placeBidButton.disabled = false;
  placeBidButton.style.background = "blue";
}
}; // Close lockBid() function.


// Code for addRow() function used to add the newly drafted player to the Drafted Players list.
function addRow(data){
  var table = document.getElementById("myTeamTable");

   var row = table.insertRow(1);
   var index = data.length -1;

   console.log(index);

    row.insertCell(0).innerHTML = data[index].team;
    row.insertCell(1).innerHTML = data[index].position;
    row.insertCell(2).innerHTML = data[index].name;
    row.insertCell(3).innerHTML = data[index].price;
};


function updateBudgets(data){
  for (var i = 1; i < budgetsTableRows.length; i++) {
    console.log(data[i-1].budget)
    budgetsTableRows[i].getElementsByTagName("td")[1].innerHTML = data[i-1].budget
    budgetsTableRows[i].getElementsByTagName("td")[2].innerHTML = data[i-1].numOfPlayers + "/22"
  }

}; // Close updateBudgets() function.


// Define updateDPFilter() function to update the Drafted Players team filter based on the teams in the Budgets pane.
function updateDPFilter(){
  for (i=1; i < dpFilterOptions.length; i++){
  dpFilterOptions[i].value = budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML
  document.getElementById("myTeamFilter").options[i].innerHTML = budgetsTableRows[i].getElementsByTagName("td")[0].innerHTML
};
}
// Call the updateDPFilter() function.
updateDPFilter();





// WEBSOCKETS FUNCTIONS.

var socket = io.connect('/');

// WebSockets pageLoad() function used to set up the page properly on page load.
var pageLoad = function(){
  socket.emit("pageLoad", {draftID: draftID});
};

socket.on("pageLoaded", function(data){
  highlightSearch(data.loadData.results);
  highlightOtb(data.loadData.otbCoach)
  highlightBidder(data.loadData.otbBidder)

  playerData = data.playerData;
  console.log(playerData);
}); // Close socket.on() function.


pageLoad();




// WebSockets draft() function below used to draft a player once bidding is complete.
var draft = function(){
  socket.emit('draft', { draftID: draftID, biddingTeam: biddingTeam, price: currentBid.innerHTML });
};

socket.on('playerDrafted', function(data) {
  console.log('Got data:', data.dbData);
  currentBid.innerHTML = "-";
  otbName.innerHTML = "-";
  otbTeamPos.innerHTML = "-";
  otbPic.src = "./images/TBA.png";

  highlightSearch(data.dbData.results);

  // Call highlightOtb() function to under the on the block coach.
  highlightOtb(data.dbData.otbCoach);

  // Code to change all team names back to black in the Budgets pane.
  for (var i = 1; i < budgetsTableRows.length; i++) {
    budgetsTableRows[i].style.color = "black";
  }

  // Call addRow() to update the Drafted Players list.
  addRow(data.dbData.results);
  // Call updateBudgets() to update the Budgets pane.
  updateBudgets(data.dbData.coaches);

  console.log(data.dbData.coaches);

}); // Close socket.on() function.


// WebSockets bid() function used to log a bid. Need to add an error function for bids under the otb bid price.
var bid = function(){

  otbBidValue = document.getElementById("bidValue").value;

// If statements to send an alert if the bid value is greater than the current users max bid or if their team is full.
  if(otbBidValue <= maxBid && playerCount < 22){
    socket.emit('bid', { draftID: draftID, bidValue: otbBidValue, currentUser: currentUser });
} else if(playerCount >= 22){
    alert("Your team is full!");
} else if (otbBidValue > maxBid){
    alert("That bid is above your max bid!");
} else{
    alert("Sorry, you've been locked out of this round of bidding!");
}

}; // Close bid() function.

socket.on('bidUpdate', function(data) {

  console.log('New Bid Data:', data.bidData.otbBid);
  currentBid.innerHTML = "$" + data.bidData.otbBid;
  biddingTeam = data.bidData.otbBidder;
  otbEndTime = data.bidData.otbEndTime;
  // Updates the bid value input to be the current bid price plus 1.
  document.getElementById("bidValue").value = data.bidData.otbBid + 1;
  console.log(biddingTeam);
  console.log(otbEndTime);

  highlightBidder(data.bidData.otbBidder);

  if (distance < 10000 && distance > 0){
   startCountdown(otbEndTime);
  };

  lockBid(data.bidData.otbBidder, currentUser);

}); // Close socket.on() function.


// Websockets addToBlock() function.
var addToBlock = function(){

  socket.emit('addToBlock', { draftID: draftID, player: otbPlayerID, position: otbPos, average: otbAverage, currentUser: currentUser});
};

socket.on('otbUpdate', function(data) {
  currentBid.innerHTML = "$" + data.updatedOtbData.otbBid;
  otbPlayer = data.updatedOtbData.otbPlayer;
  otbName.innerHTML = otbPlayer;
  otbEndTime = data.updatedOtbData.otbEndTime;
  otbTeamPos.innerHTML = data.updatedOtbData.otbPos + " - " + data.updatedOtbData.otbAverage;
  otbPic.src = "./images/" + data.updatedOtbData.otbPlayer.toUpperCase().replace(/\s+/g,"") + ".png";;

  // Updates the default bid value to be $2 as it starts at $1.
  document.getElementById("bidValue").value = data.updatedOtbData.otbBid + 1;

  highlightBidder(data.updatedOtbData.otbBidder);

  startCountdown(otbEndTime);

  lockBid(data.updatedOtbData.otbBidder, currentUser);

  // Set the maxBid variable to the current users Max Bid as per the Budgets pane.
  maxBid = data.updatedOtbData.coaches.filter(function(e){
    return (e.email==currentUser);
  })[0].budget;

  playerCount = data.updatedOtbData.coaches.filter(function(e){
    return (e.email==currentUser);
  })[0].numOfPlayers;

}); // Close socket.on("otbUpdate") function.




// Define draftPlayer() function to draft a player to a team when the timer runs out.
var draftPlayer = function(){

  jQuery.ajax({
    url:"/draftData/" + draftID + "/coaches",
    type: "PUT",

    contentType: "application/json; charset=utf-8",
    success: function(resultData){
    console.log(resultData);

/* The below code enables/disables buttons so that only the otbCoach can put players on the block.
     for (var i = 1; i < budgetsTableRows.length; i++) {
    var td = budgetsTableRows[i].getElementsByTagName("td")[0];

    if (td) {
      if (td.innerHTML.toUpperCase() === resultData.otbCoach.toUpperCase()) {
        budgetsTableRows[i].style.textDecoration = "underline";
      } else {
        budgetsTableRows[i].style.textDecoration = "none";
      }
    } 
  };

  currentOtbCoach = resultData.otbCoach.toUpperCase();
  currentUser = document.getElementById("currentUser").innerHTML.toUpperCase();

    if(currentOtbCoach === currentUser){
      document.getElementById("addToQueue").disabled = false;
    } else {
      document.getElementById("addToQueue").disabled = true;
    };

    document.getElementById("next").disabled = true;

*/
    // The below single line of code can be removed when the block above is re-enabled.
    // These should be the only two changes required for the otb button changes to work.
     document.getElementById("addToQueue").disabled = false;

    },
    error: function(jqXHR, textStatus, errorThrown){
    },
    timeout: 120000,
  });
}; // Close draftPlayer() function.


//ADDING A PLAYER FROM THE SEARCH PANE TO THE BLOCK.

// Define updateOtbPlayer function to update the otbPlayer in the DB.
var updateOtbPlayer = function(){
  // Included the draftPlayer() function here to add the previously drafted player to the DB.
  // We do this when the next player is added to the queue so that the DB is only updated once.
  // This is as opposed to linking with countdown where everyone browser would trigger when the countdown expires.

  jQuery.ajax({
    url:"/draftData/" + draftID + "/otbPlayer/" + otbPlayerID + "/" + otbPos,
    type: "PUT",

    contentType: "application/json; charset=utf-8",
    success: function(resultData){
      otbPlayer = resultData.otbPlayer;
      otbName.innerHTML = otbPlayer;
      otbEndTime = resultData.otbEndTime;
      otbPos = resultData.otbPos;

      startCountdown(otbEndTime);
    },
    error: function(jqXHR, textStatus, errorThrown){
    },
    timeout: 120000,
  });

  otbPic.src = selectedPlayerImgString;

}; // Close updateOtbPlayer function.


// Define addToBlock() function to put a player from the SPP to the block.
// Not sure whether this is require or not as its mostly covered in teh updateOtbPlayer() function.
// function addToBlock(){

  // var selectedPlayerTeam = selectedPlayer.getElementsByTagName("td")[3].innerHTML;

//}; // Close addToBlock().




//BIDDING ON A PLAYER.

// Define logBid() function to update the otbBid in the DB.
var logBid = function(){

otbBidValue = document.getElementById("bidValue").value;

    jQuery.ajax({
      url:"/draftData/" + draftID + "/otbBid/" + otbBidValue,
      type: "PUT",

      contentType: "application/json; charset=utf-8",
      success: function(resultData){
        currentBid.innerHTML = "$" + resultData.otbBid;
        biddingTeam = resultData.otbBidder;
        otbEndTime = resultData.otbEndTime;
        console.log(biddingTeam);
        console.log(otbEndTime);


        if (distance < 10000 && distance > 0){
         startCountdown(otbEndTime);
        };
      },
      // Displays an error if the bid value is less than the current bid.
      error: function(error){
        if(error.responseText = "showAlert")
          alert("Bid value must be greater than current bid!");
      },
      timeout: 120000,
    });


  }; // Close logBid() function.



// Define myTeam() function used to filter the My Team Pane.
function updateMyTeam() {
  // Declare variables 
  var filterValue = document.getElementById("myTeamFilter");
  var team = filterValue.value.toUpperCase();

  var posFilterValue = document.getElementById("myTeamPosFilter");
  var pos = posFilterValue.value.toUpperCase();


  var myTeamTable = document.getElementById("myTeamTable");
  var myTeamTableRows = myTeamTable.getElementsByTagName("tr");

  // Loop through all table rows and hide those who don't match the search query.
  for (var i = 1; i < myTeamTableRows.length; i++) {
    var td = myTeamTableRows[i].getElementsByTagName("td")[0];
    var tdPos = myTeamTableRows[i].getElementsByTagName("td")[1];

    if (td) {
      if (team === "ALL" && pos === "ALL"){
        myTeamTableRows[i].style.display = ""
      }
      else if (td.innerHTML.toUpperCase() === team && tdPos.innerHTML.toUpperCase().indexOf(pos) > -1) {
        myTeamTableRows[i].style.display = ""
      }
      else if (team === "ALL" && tdPos.innerHTML.toUpperCase().indexOf(pos) > -1){
        myTeamTableRows[i].style.display = ""
      }
      else if (td.innerHTML.toUpperCase() === team && pos === "ALL"){
        myTeamTableRows[i].style.display = ""
      }
      else {
        myTeamTableRows[i].style.display = "none";
      }
    } 
  }
} // Close updateMyTeam().



$(document).ready(function() {
    $('#searchTable').DataTable( {
        scrollY:        '70.5vh',
        scrollCollapse: true,
        paging:         false,
        searching: false,
        ordering: false,
        bInfo: false

    } );
} );

$(document).ready(function() {
    $('#myTeamTable').DataTable( {
        scrollY:        '90vh',
        scrollCollapse: true,
        paging:         false,
        searching: false,
        ordering: false,
        bInfo: false

    } );
} );





/* Example of how to iterate through the draftData array and the coaches object within this array.

  jQuery.ajax({
    url:"/draftData/" + draftID + "/coaches/" + "TBP@gmail.com",
    type: "PUT",

    contentType: "application/json; charset=utf-8",
    success: function(resultData){

    var coaches = resultData[0].coaches;

    console.log(coaches);

    var coach = coaches.filter(function( obj ) {
    return obj.email == "TBP@gmail.com";
  });

   console.log(coach);

    var budget = coach[0].budget;
    console.log(budget);

    var players = coach[0].players;

    console.log(players);

    var player = players.filter(function( obj ) {
    return obj.name == "Sam Mitchell";
  });
    console.log(player);

    var playerName = player[0].name;

    console.log(playerName);

*/








