var express = require('express');
var app = express();
var appPort = (process.env.PORT || 8080);
var mongoose = require("mongoose");
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var assert = require("assert");
var http = require("http");
var _ = require('underscore');
var fs = require('fs');
var User = require("./models/user");
var Draft = require("./models/draftData");
var path = require("path");

// Load the configAuth for Dev.
// var configAuth = require('../credentials/credentials');

// Load the configAuth for Prod.
var configAuth = require('../../../../home/bitnami/credentials/credentials');

// mongodb connection. Update the "connectionString" or "localMongoString" parameter below to use the Dev or Prod DB.
mongoose.connect(configAuth.connectionString);
var db = mongoose.connection;
// mongo error 
db.on("error", console.error.bind(console, "connection error:"));
mongoose.set('debug', true);

// Pass passport for configuration.
require('./config/passport')(passport);

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//use sessions for tracking logins
app.use(session({
	secret: "SuperDraft",
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}));
// Use passport.
app.use(passport.initialize());
app.use(passport.session());
// Use connected-flash for flash messages stored in session.
app.use(flash());

// make user ID available in templates.
app.use(function(req, res, next){
  if(req.user){
    res.locals.currentUser = req.user;
  }
  next();
});


require('./routes/index.js')(app, passport);

// Testing WebSocket Connection.
var server = http.createServer(app);
var io = require('socket.io')(server);

var mySrv = {
  // Define the clientList variable to hold a list of all connected clients.
  clientList: [],
  // Define the rosterSpotsArray variabe to hold the available field positions for the current coach.
  rosterSpotsArray: {},
  // Define the addToBench variable, which is set to 0 if the drafted player can fit on the field or 1 if they should be added to the bench.
  addToBench: {},
  // Define the draftPlayerTimeout variable which keeps the timing for when the draftPlayer() function should be run to draft a player when they are sold.
  // This is an object that holds key value pairs for every draft and its corresponding draftPlayerTimeout value.
  draftPlayerTimeout: {},
  // Define the scPlayerList variable to hold the list of all players from the scPlayerData.json file in our Sublime files.
  scPlayerList: JSON.parse(fs.readFileSync('./public/js/scPlayerData.json', 'utf8')),
  // Define the dtPlayerList variable to hold the list of all players from the dtPlayerData.json file in our Sublime files.
  dtPlayerList: JSON.parse(fs.readFileSync('./public/js/dtPlayerData.json', 'utf8')),
  // Define the absentOtbOverrideTimeout variable which keeps the timing for when the absentOtbOverride() function should be run to automatically add a player to the block.
  absentOtbOverrideTimeout: {},
  // Define the totalBenSpots variable to hold the total number of bench spots for the current draft.
  totalBenSpots: {},
  // Define the otbBenchCount variable to hold the number of bench players on the otb coaches' team.
  otbBenchCount: {},
  // Define the totalRosterSpots variable to define the total number of available roster spots across all teams for the current draft.
  totalRosterSpots: {},
  // Define the selectCountdown variable to hold the selected SPP Countdown time for each draft.
  selectCountdown: {},
  // Define the bidCountdown variable to hold the selected Bid Countdown time for each draft.
  bidCountdown: {},
  // Define the leagueType variable to hold whether the draft is for Supercoach or Fantasy.
  leagueType: {},
  // Define the biddingUnderway variable to hold true or false depending on whether there is current a player on the block.
  biddingUnderway: {},
  // Define the latencyArray to hold a list of latencies for all connected clients so that we can factor this into countdown timers.
  // latencyArray: {},
  // Define the chatColours array to hold the potential chat colours that a coach can be assigned.
  // We hold 20 colours (for the max number of coaches in a draft).
  // There are 12 unique colours. The last 8 double up. We assign these based on the index of the coach in coaches array.
  chatColours: ['#FF6EFF'/*Pink*/, '#FDFF00'/*Yellow*/, '#50BFE6' /*Blue*/, '#FF6037'/*Orange*/, '#44D7A8' /*Aqua*/, '#00ffff'/*Cyan*/, '#e5e5e5' /*Silver*/, '#ffb6c1' /*Light Pink*/, '#ffd700' /*Gold*/, '#ffa528' /*Light Orange*/, '#FF6EFF'/*Pink*/, '#FDFF00'/*Yellow*/, '#50BFE6' /*Blue*/, '#FF6037'/*Orange*/, '#44D7A8' /*Aqua*/, '#00ffff'/*Cyan*/, '#e5e5e5' /*Silver*/, '#ffb6c1' /*Light Pink*/, '#ffd700' /*Gold*/, '#ffa528' /*Light Orange*/],
  // We then hold an assignedColours array that holds the current assigned colour for each coach.
  assignedColours: {},
  // Define the playersArray variable to hold a list of each coaches full player data which is used to generate the fun facts.
  playersArray: {},
  // Define the funFactCounter variable to hold the fun fact count for the current room.
  funFactCounter: 0,

  positionCount: function(data, coach, currentRoom){
    // Position validation variables.
    // Hold the number of players in each position on the current coaches team.
    var numOfDef;
    var numOfFwd;
    var numOfRuc;
    var numOfMid;
    var numOfDF;
    var numOfDR;
    var numOfDM;
    var numOfFR;
    var numOfFM;
    var numOfRM;
    var numOfBen;
    var draftedPlayers = [];
    // Hold the individual rules for different position combinations.
    var defRule;
    var fwdRule;
    var rucRule;
    var midRule;
    var dfRule;
    var drRule;
    var dmRule;
    var frRule;
    var fmRule;
    var rmRule;
    // Use the individual rules above to determine whether there is a spot on the field on the current coaches team for each different position.
    var defSpot;
    var fwdSpot;
    var rucSpot;
    var midSpot;
    var dfSpot;
    var drSpot;
    var dmSpot;
    var frSpot;
    var fmSpot;
    var rmSpot;
    // Get a list of all of the current coaches drafted players.
    try{
      draftedPlayers = data.coaches.filter(function(e){
      return e.teamName2 === data[coach];
    })[0]
    } catch (err){
        console.log("Error: No Player Drafted Yet");
    };
    // If the coaches' team is full then we set the rosterSpotsArray to false.
    if(draftedPlayers.length >= mySrv.totalRosterSpots){
      mySrv.rosterSpotsArray[currentRoom] = [];
      mySrv.rosterSpotsArray[currentRoom] = [false, false, false, false, false, false, false, false, false, false];
    } else {
        // Get the number of players drafted at each position by the current otb coach.
        // If the count exceeds the available bench spots for that position we limit it to the number of avaialble field spots. This is required for the benchCheck() function to work.
        try {
          numOfDef = draftedPlayers.players.filter(function(e){
            return e.position == "DEF"
          }).length;
          if(numOfDef > data.numOfDef){
            numOfDef = data.numOfDef;
          }
        } catch(err){
            console.log("Error: No Def Drafted Yet")
        };
        try {
          numOfFwd = draftedPlayers.players.filter(function(e){
            return e.position == "FWD"
          }).length;
          if(numOfFwd > data.numOfFwd){
            numOfFwd = data.numOfFwd;
          }
        } catch(err){
            console.log("Error: No Fwd Drafted Yet")
        };
        try {
          numOfRuc = draftedPlayers.players.filter(function(e){
            return e.position == "RUC"
          }).length;
          if(numOfRuc > data.numOfRuc){
            numOfRuc = data.numOfRuc;
          }
        } catch(err){
            console.log("Error: No Ruc Drafted Yet")
        };
        try {
          numOfMid = draftedPlayers.players.filter(function(e){
            return e.position == "MID"
          }).length;
          if(numOfMid > data.numOfMid){
            numOfMid = data.numOfMid;
          }
        } catch(err){
            console.log("Error: No Mid Drafted Yet")
        };
        try {
          numOfDF = draftedPlayers.players.filter(function(e){
            return e.position == "DEF-FWD"
          }).length;
          if(numOfDF > data.numOfDef + data.numOfFwd){
            numOfDF = data.numOfDef + data.numOfFwd;
          }
        } catch(err){
            console.log("Error: No DF Drafted Yet")
        };
        try {
          numOfDR = draftedPlayers.players.filter(function(e){
            return e.position == "DEF-RUC"
          }).length;
          if(numOfDR > data.numOfDef + data.numOfRuc){
            numOfDR = data.numOfDef + data.numOfRuc;
          }
        } catch(err){
            console.log("Error: No DR Drafted Yet")
        };
        try {
          numOfDM = draftedPlayers.players.filter(function(e){
            return e.position == "DEF-MID"
          }).length;
          if(numOfDM > data.numOfDef + data.numOfMid){
            numOfDM = data.numOfDef + data.numOfMid;
          }
        } catch(err){
            console.log("Error: No DM Drafted Yet")
        };
        try {
          numOfFR = draftedPlayers.players.filter(function(e){
            return e.position == "FWD-RUC"
          }).length;
          if(numOfFR > data.numOfFwd + data.numOfRuc){
            numOfFR = data.numOfFwd + data.numOfRuc;
          }
        } catch(err){
            console.log("Error: No FR Drafted Yet")
        };
        try {
          numOfFM = draftedPlayers.players.filter(function(e){
            return e.position == "FWD-MID"
          }).length;
          if(numOfFM > data.numOfFwd + data.numOfMid){
            numOfFM = data.numOfFwd + data.numOfMid;
          }
        } catch(err){
            console.log("Error: No FM Drafted Yet")
        };
        try {
          numOfRM = draftedPlayers.players.filter(function(e){
            return e.position == "RUC-MID"
          }).length;
          if(numOfRM > data.numOfRuc + data.numOfMid){
            numOfRM = data.numOfRuc + data.numOfMid;
          }
        } catch(err){
            console.log("Error: No RM Drafted Yet")
        };
        try {
          numOfBen = draftedPlayers.players.filter(function(e){
            return e.position == "BEN"
          }).length;
        } catch(err){
            console.log("Error: No Ben Drafted Yet")
        };
        // Define variables to hold some of the number counts that we use multiple times.
        var numOfDFR = numOfDef + numOfFwd + numOfRuc;
        var numOfDFM = numOfDef + numOfFwd + numOfMid;
        var numOfFRM = numOfFwd + numOfRuc + numOfMid;
        var numOfDRM = numOfDef + numOfRuc + numOfMid;
        var availableDFR = data.numOfDef + data.numOfFwd + data.numOfRuc;
        var availableDFM = data.numOfDef + data.numOfFwd + data.numOfMid;
        var availableDRM = data.numOfDef + data.numOfRuc + data.numOfMid;
        var availableFRM = data.numOfFwd + data.numOfRuc + data.numOfMid;
        // Define position validation rules which are used in the code below.
        dRule = numOfDef < data.numOfDef;
        fRule = numOfFwd < data.numOfFwd;
        rRule = numOfRuc < data.numOfRuc;
        mRule = numOfMid < data.numOfMid;
        dfRule = numOfDef + numOfFwd + numOfDF < data.numOfDef + data.numOfFwd;
        drRule = numOfDef + numOfRuc + numOfDR < data.numOfDef + data.numOfRuc;
        dmRule = numOfDef + numOfMid + numOfDM < data.numOfDef + data.numOfMid;
        frRule = numOfFwd + numOfRuc + numOfFR < data.numOfFwd + data.numOfRuc;
        fmRule = numOfFwd + numOfMid + numOfFM < data.numOfFwd + data.numOfMid;
        rmRule = numOfRuc + numOfMid + numOfRM < data.numOfRuc + data.numOfMid;
        dfdrRule = numOfDFR + numOfDF + numOfDR < availableDFR;
        dfdmRule = numOfDFM + numOfDF + numOfDM < availableDFM;
        dmdrRule = numOfDRM + numOfDM + numOfDR < availableDRM;
        frfmRule = numOfFRM + numOfFR + numOfFM < availableFRM;
        dffrRule = numOfDFR + numOfDF + numOfFR < availableDFR;
        dffmRule = numOfDFM + numOfDF + numOfFM < availableDFM;
        dmfmRule = numOfDFM + numOfDM + numOfFM < availableDFM;
        dmrmRule = numOfDRM + numOfDM + numOfRM < availableDRM;
        drfrRule = numOfDFR + numOfDR + numOfFR < availableDFR;
        drrmRule = numOfDRM + numOfDR + numOfRM < availableDRM;
        frrmRule = numOfFRM + numOfFR + numOfRM < availableFRM;
        fmrmRule = numOfFRM + numOfFM + numOfRM < availableFRM;
        dfdmfmRule = numOfDFM + numOfDF + numOfDM + numOfFM < availableDFM;
        dfdrfrRule = numOfDFR + numOfDF + numOfDR + numOfFR < availableDFR;
        dmdrrmRule = numOfDRM + numOfDM + numOfDR + numOfRM < availableDRM;
        frfmrmRule = numOfFRM + numOfFR + numOfFM + numOfRM < availableFRM;
        // Check if a spot is available on the field for each different position for the current coach.
        defSpot = dRule===true && dfRule===true && drRule===true && dmRule===true && dfdrRule===true && dfdmRule===true && dmdrRule===true && dffrRule===true && dffmRule===true && dmfmRule===true && dmrmRule===true && drfrRule===true && drrmRule===true && dfdmfmRule===true && dfdrfrRule===true && dmdrrmRule===true;
        fwdSpot = fRule===true && dfRule===true && frRule===true && fmRule===true && dfdrRule===true && dfdmRule===true && frfmRule===true && dffrRule===true && dffmRule===true && dmfmRule===true && drfrRule===true && frrmRule===true && fmrmRule===true && dfdmfmRule===true && dfdrfrRule===true && frfmrmRule===true;
        rucSpot = rRule===true && drRule===true && frRule===true && rmRule===true && dfdrRule===true && dmdrRule===true && frfmRule===true && dffrRule===true && dmrmRule===true && drfrRule===true && drrmRule===true && frrmRule===true && fmrmRule===true && dfdrfrRule===true && dmdrrmRule===true && frfmrmRule===true;
        midSpot = mRule===true && dmRule===true && fmRule===true && rmRule===true && dfdmRule===true && dmdrRule===true && frfmRule===true && dffmRule===true && dmfmRule===true && dmrmRule===true && drrmRule===true && frrmRule===true && fmrmRule===true && dfdmfmRule===true && dmdrrmRule===true && frfmrmRule===true;
        dfSpot = defSpot===true || fwdSpot===true;
        drSpot = defSpot===true || rucSpot===true;
        dmSpot = defSpot===true || midSpot===true;
        frSpot = fwdSpot===true || rucSpot===true;
        fmSpot = fwdSpot===true || midSpot===true;
        rmSpot = rucSpot===true || midSpot===true;
        // Define rosterSpotsArray variable.
        mySrv.rosterSpotsArray[currentRoom] = [];
        mySrv.rosterSpotsArray[currentRoom] = [defSpot, fwdSpot, rucSpot, midSpot, dfSpot, drSpot, dmSpot, frSpot, fmSpot, rmSpot];
      } // Close else{} statement.
  }, // Close positionCount() function.

  benchCheck: function(data, currentRoom){
  // Define the benchCheck() function that checks if there is a spot on the current users field for the position that is currently on the block.
  // data[0]=D, 1=F, 2=R, 3=M, 4=DF, 5=DR, 6=DM, 7=FR, 8=FM, 9=RM.
    mySrv.addToBench[currentRoom] = 0;
    if (data === "DEF" && mySrv.rosterSpotsArray[currentRoom][0] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "FWD" && mySrv.rosterSpotsArray[currentRoom][1] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "RUC" && mySrv.rosterSpotsArray[currentRoom][2] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "MID" && mySrv.rosterSpotsArray[currentRoom][3] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "DEF-FWD" && mySrv.rosterSpotsArray[currentRoom][4] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "DEF-RUC" && mySrv.rosterSpotsArray[currentRoom][5] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "DEF-MID" && mySrv.rosterSpotsArray[currentRoom][6] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "FWD-RUC" && mySrv.rosterSpotsArray[currentRoom][7] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "FWD-MID" && mySrv.rosterSpotsArray[currentRoom][8] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else if (data === "RUC-MID" && mySrv.rosterSpotsArray[currentRoom][9] === false){
      mySrv.addToBench[currentRoom] = 1;
    } else {
      console.log("No add to bench!");
    }
  } // Close benchCheck() function.
}; // Close NS Namespace.


io.on('connection', function(socket) {
  // Define a currentRoom variable within the connection.
  var currentRoom;

  // Socket.on("pageLoad") function for setting up the page correctly on load.
  socket.on("pageLoad", function(socketData){
    // Update the currentRoom variable to be the draftID passed from the client side.
    // We set this in the pageLoad function rather than in the room function as the pageLoad function is run first.
    currentRoom = socketData;
    Draft.findById(currentRoom, function(err, data){
      if(data.results.length < data.rosterSize * data.numOfCoaches){
        mySrv.leagueType[currentRoom] = data.leagueType;
        mySrv.totalBenSpots[currentRoom] = data.numOfBen;
        mySrv.totalRosterSpots[currentRoom] = data.rosterSize * data.numOfCoaches;
        mySrv.selectCountdown[currentRoom] = data.selectCountdown;
        mySrv.bidCountdown[currentRoom] = data.bidCountdown;
      }

      socket.emit("pageLoaded", {loadData: data, biddingUnderway: mySrv.biddingUnderway[currentRoom]});
    }) // Close Draft.findById() function.
  }); // Close io.on("pageLoad") function.

  socket.on('joinRoom', function(data){
    // We add the user that has joined to the current room.
    socket.join(currentRoom);
    mySrv.clientList.push(data.currentUser + "-" + currentRoom + "-" + socket.id);
    var currentUser = String(data.currentUser);
    // Define the joinedCoaches list to hold a list of updated teamName2s that are in the currentRoom.
    Draft.findById(currentRoom, function(err, draftData){
      var joinedCoaches = _.pluck(draftData.coaches, "teamName2");
      var joinedCoachBudget = _.pluck(draftData.coaches, "budget");
      var joinedCoachRoster = _.pluck(draftData.coaches, "numOfPlayers");

      var chatColourIndex = joinedCoaches.indexOf(currentUser);
      console.log("Chat colour index: " + chatColourIndex);

      // If an assignedColours array already exists for the current room then update it.
      // If not, then create one and update it.
      if(mySrv.assignedColours[currentRoom]){
        mySrv.assignedColours[currentRoom][data.currentUser] = mySrv.chatColours[chatColourIndex];
      } else {
        mySrv.assignedColours[currentRoom] = [];
        mySrv.assignedColours[currentRoom][data.currentUser] = mySrv.chatColours[chatColourIndex];
      }

      console.log(mySrv.assignedColours[currentRoom]);

      // We send the updated data to all clients that are connected to the room.
      io.in(currentRoom).emit("joinedCoach", {joinedCoaches: joinedCoaches, socketList: mySrv.clientList, joinedCoachBudgets: joinedCoachBudget, joinedCoachRosterCounts: joinedCoachRoster, newCoach: data.currentUser, color: mySrv.assignedColours[currentRoom][data.currentUser]});
      // We send a successfullyJoined event to the coach that has joined.
      socket.emit("successfullyJoined", {biddingUnderway: mySrv.biddingUnderway[currentRoom], otbCoach: draftData.otbCoach});
    }); // Close Draft.findById(currentRoom) function.
    console.log("Sockets List");
    console.log(mySrv.clientList);
  }); // Close socket.on('joinRoom') function.


  socket.on('pauseDraft', function(draftID){
    clearTimeout(mySrv.absentOtbOverrideTimeout[currentRoom]);
    io.in(currentRoom).emit("draftPaused");
  }); // Close socket.on('pauseDraft') function.


  // Socket.on('disconnect') removes the disconnected client from the clientList variable.
  socket.on('disconnect', function(){
    // Define the disconnectedIndex variable and loop through the clientList array to find the matching user.
    var disconnectedIndex;
    for(var i=0; i < mySrv.clientList.length; i++){
      if(mySrv.clientList[i].endsWith(socket.id)){
        disconnectedIndex = i;
        break;
      } // Close if() statement.
    } // Close for() loop.
    var disconnectedCoach = mySrv.clientList[disconnectedIndex];
    mySrv.clientList.splice(disconnectedIndex, 1);

    io.in(currentRoom).emit("disconnectedCoach", {disconnectedSocket: disconnectedCoach});
  }); // Close socket.on('disconnect') function.


  socket.on('sendChat', function(data){
    var colour = mySrv.assignedColours[currentRoom][data.user];
    io.in(currentRoom).emit("broadcastChat", {text: data.text, user: data.user, color: colour});
  }); // Close socket.on('sendChat') function.


  function draftPlayer(){
    // Define the resultsList variable to hold the list of drafted players.
    var resultsList;
    // Define the currentOtbCoach variable to hold the current otbCoach.
    var currentOtbCoach;
    // Find the current draft in the database.
    Draft.findById(currentRoom, function(err, data){
      // The newResult variable defines the player details to be added to the results array.
      var newResult = {name:data.otbPlayer, position: data.otbPos, price: data.otbBid, team: data.otbBidder, average: data.otbAverage};
      // Add the newResult to the results array in the DB.
      data.results.push(newResult);
      // Save the data in the DB.
      data.save();
      // Check if a playersArray already exists for the current room.
      // If so, continue on.
      // If not, then create one.
      if(mySrv.playersArray[currentRoom]){
        console.log("Array already exists");
      } else {
        mySrv.playersArray[currentRoom] = [];
      }
      // Get the full player data for the most recently drafted player.
      if(mySrv.leagueType[currentRoom] == "Supercoach"){
        var fullPlayerData = mySrv.scPlayerList.filter(function(e){
                  return e.name == data.otbPlayer;
                })[0];
      }; // Close if(mySrv.leagueType[currentRoom]) statement.
      // Check if there is an existing playersArray for the current coach in the current room.
      // If so, push the player data to it.
      // If not, create one and push the player data to it.
      if(mySrv.playersArray[currentRoom][data.otbBidder]){
        mySrv.playersArray[currentRoom][data.otbBidder].push(fullPlayerData);
      } else {
        mySrv.playersArray[currentRoom][data.otbBidder] = [];
        mySrv.playersArray[currentRoom][data.otbBidder].push(fullPlayerData);
      } // Close else{} statement.
      console.log(mySrv.playersArray[currentRoom]);
      // Try and get fun facts. If this doesn't work then console.log() a message.
      try{
        getFunFacts(mySrv.playersArray[currentRoom][data.otbBidder][mySrv.playersArray[currentRoom][data.otbBidder].length - 1], data.otbBid);
      } catch(err){
        getFunFacts(mySrv.playersArray[currentRoom][data.otbBidder][mySrv.playersArray[currentRoom][data.otbBidder].length - 1], data.otbBid);
        console.log("No Price Analysis Was Generated.");
        }
      // If a funFactCounter exists for the current room then update it.
      // If not, create one and then update it.

        // Increment if we are below the number of funFacts.
        // If not then we add 1.
          if (mySrv.funFactCounter === 11){
             mySrv.funFactCounter = 0;
          } else {
              mySrv.funFactCounter += 1;
          }

      console.log("FUN FACT COUNTER!!!!!!!");
      console.log(mySrv.funFactCounter);
      // Run the positionCount() function to generate the rosterSpotsArray which is then assigned to the winning coaches rosterSpots variable.
      // This contains an array with 8 true/false values that determine whether the coach can fit a player from each position onto their field.
      // We need to run this in 2 phases. 
      // We run it the first time prior to adding the player being drafted to determine whether this player should be added to the field or the bench (according to the benchCount() function).
      // We then run it a second time after adding the player to the coaches array so that we can get an updated rosterSpotsArray (including the newly drafted player) in the database to pass to the front end.
      mySrv.positionCount(data, "otbBidder", currentRoom);
      // We run the benchCheck() function to compare the position of the drafted player with the winning coaches available roster spots in that position.
      // If there are no field positions, the addToBench variable = 1, if there are positions the addToBench variable = 0.
      // We then add this addToBench variable on to the coaches benchCount variable in the database (if it equals 0 then nothing is added).
      mySrv.benchCheck(data.otbPos, currentRoom);
      // The newPlayer variable defines the player details to be added to the relevant coaches players array below.
      var newPlayer = {name: data.otbPlayer, position: data.otbPos, price: data.otbBid, average: data.otbAverage, originalPosition: data.otbPos};
      // If the addToBench variable is 1 then the player should be added to the winning coaches bench.
      // Therefore we update the position in the coaches players array to be "BEN".
      // This ensures that this player isn't counted in the positionCount() function as we don't want to include them in the field count otherwise this causes issues for our benchCheck() function.
      if(mySrv.addToBench[currentRoom] > 0){
        newPlayer.position = "BEN";
      }
      // The update $inc function incremenents the budget and numOfPlayers fields by the provided number.
      Draft.update({"_id": currentRoom, "coaches.teamName2": data.otbBidder}, {"$inc":{
        "coaches.$.budget" : -data.otbBid,
        "coaches.$.numOfPlayers": 1,
        "coaches.$.benchCount" : mySrv.addToBench[currentRoom]
      }}, function(err, result){
            if(err) throw err
            // The update $push function adds the newPlayer variable defined above to the relevant coaches players array.
            Draft.update({"_id": currentRoom, "coaches.teamName2": data.otbBidder}, {"$push":{
              "coaches.$.players" : newPlayer
            }}, function(err, result){
                  if(err) throw err
                  // We re-run Draft.findById() to get the coaches updated player array (including the new player added above).
                  // We then re-run the positionCount() function to re-count the number of players the coach has in each position and update the rosterSpotsArray.
                  // We then update the coaches.rosterSpots array variable in the database with this updated rosterSpotsArray.
                  Draft.findById(currentRoom, function(err, data){
                    mySrv.positionCount(data, "otbBidder", currentRoom);
                    // The findOneAndUpdate() function.
                    Draft.update({"_id": currentRoom, "coaches.teamName2": data.otbBidder}, {"$set":{
                      // Adds the updated rosterSpotsArray to the rosterSpots variable in the database.
                      "coaches.$.rosterSpots" : mySrv.rosterSpotsArray[currentRoom]
                    }}, function(err,result){
                    // Returns the relevant draft based on the dID parameter provided in the URL.
                    Draft.findById(currentRoom, function(err, data){
                      var currentCoach;
                      // The below code manages the pick counter which is used to put the next coach on the block.
                      // If we hit the last coach on the list, then we need to take the pickCounter back to 0.
                      // If the next coaches team is full then we need to skip them.
                      for(i=0; i < data.coaches.length; i++){
                        data.coaches[0].numOfPlayers;
                        if(data.coaches[data.pickCounter].numOfPlayers === data.rosterSize){
                          if (data.pickCounter === (data.numOfCoaches - 1)){
                             data.pickCounter = 0;
                          } else {
                              data.pickCounter += 1;
                          }
                        } else {
                            data.otbCoach = data.coaches[data.pickCounter].teamName2;
                            if (data.pickCounter === (data.numOfCoaches - 1)){
                               data.pickCounter = 0;
                            } else {
                                data.pickCounter += 1;
                            }
                            break;
                        }
                      }; // Close for() loops.
                      // Save the updated data in the database.
                      data.save();

                      // Code to get the timer to countdown from 20 seconds for the next coach to select the next player on the block.
                      var nowSPP = new Date();
                      nowSPP.setSeconds(nowSPP.getSeconds() + mySrv.selectCountdown[currentRoom]);
                      var endTimeSPP = nowSPP.getTime();
                      // The below variables are used in the absentOtbOverride() function.
                      // Update the global currentOtbCoach with the updated otbCoach (the next otb coach after the player has been drafted).
                      currentOtbCoach = data.otbCoach;
                      // Update the global resultsList variable with the updated results list.
                      resultsList = _.pluck(data.results, "name");
                      // Update the global otbBenchCount variable with the bench count of the updated otb coach.
                      mySrv.otbBenchCount[currentRoom] = data.coaches.filter(function(e){
                        return (e.teamName2==currentOtbCoach);
                      })[0].benchCount;
                      // Update the global rosterSpotsArray variable to contain the updated otb coaches' rosterSpotsArray by running the positionCount function with the "otbCoach" as an input.
                      mySrv.positionCount(data, "otbCoach", currentRoom);
                      // Update the biddingUnderway variable to true for the current room.
                      mySrv.biddingUnderway[currentRoom] = false;
                      // We emit the "playerDrafted" event to all connected clients in the current room.
                      io.in(currentRoom).emit('playerDrafted', { dbData: data, rosterSpotsData: mySrv.rosterSpotsArray[currentRoom], sppEndTime: endTimeSPP});
                    }) // Close Draft.findById(socketData) function.
                }) // Close Draft.Update() - rosterSpots.
            }) // Close Draft.findByID() - positionCount. 
        }) // Close Draft.Update() - newPlayer.
      }) // Close Draft.Update() - coaches array.
    }) // Close Draft.findById() function.


    // Define the absentOtbOverride() function. We do this inside the draftPlayer() function so that we don't have to make common variables global.
    function absentOtbOverride(){
      console.log("LEAGUE TYPE");
      console.log(mySrv.leagueType[currentRoom]);
      // If there are still remaining roster spots across any of the teams then we add the otbTopPlayer to the block.
      if(resultsList.length < mySrv.totalRosterSpots[currentRoom]){
        var otbTopPlayer;
        // If the leagueType of the current room is "Supercoach" then loop through the scPlayerList.
        if(mySrv.leagueType[currentRoom] == "Supercoach"){
          // Loop through the playerList and try and find them in the resultsList.
          for(var i=0; i < mySrv.scPlayerList.length; i++){
            console.log(mySrv.scPlayerList[i]);
            // If we find a player that isn't in the results list, then we perform a bench check for their position.
            if(resultsList.indexOf(mySrv.scPlayerList[i].name) < 0){
              mySrv.benchCheck(mySrv.scPlayerList[i].position, currentRoom);
              // If the player would fit on the otb coaches' field or if they have room on their bench, then we set this player as the otbTopPlayer.
              if(mySrv.addToBench[currentRoom] < 1 || mySrv.otbBenchCount[currentRoom] < mySrv.totalBenSpots[currentRoom]){
                otbTopPlayer = mySrv.scPlayerList[i];
                break;
              } // Close if(addToBench) statement.
            } // Close if(resultsList) statement.
          } // Close for() loop.
        } else {
          // If the leagueType for the current room in Fantasy then we loop through the dtPlayerList and try and find them in the resultsList.
          for(var i=0; i < mySrv.dtPlayerList.length; i++){
            // If we find a player that isn't in the results list, then we perform a bench check for their position.
            if(resultsList.indexOf(mySrv.dtPlayerList[i].name) < 0){
              mySrv.benchCheck(mySrv.dtPlayerList[i].position, currentRoom);
              // If the player would fit on the otb coaches' field or if they have room on their bench, then we set this player as the otbTopPlayer.
              if(mySrv.addToBench[currentRoom] < 1 || mySrv.otbBenchCount[currentRoom] < mySrv.totalBenSpots[currentRoom]){
                otbTopPlayer = mySrv.dtPlayerList[i];
                break;
              } // Close if(addToBench) statement.
            } // Close if(resultsList) statement.
          } // Close for() loop.
        }
        // Run the addPlayerToBlock() function passing in the otbTopPlayer details.
        addPlayerToBlock(currentRoom, otbTopPlayer.name, otbTopPlayer.position, otbTopPlayer.ave, 1, currentOtbCoach);
      } else {
          console.log("The Draft Is Complete!");
          // Clear the current variables held in the mySrv Namespace for the completed draft.
          delete mySrv.rosterSpotsArray[currentRoom];
          delete mySrv.addToBench[currentRoom];
          delete mySrv.draftPlayerTimeout[currentRoom];
          delete mySrv.absentOtbOverrideTimeout[currentRoom];
          delete mySrv.totalBenSpots[currentRoom];
          delete mySrv.otbBenchCount[currentRoom];
          delete mySrv.totalRosterSpots[currentRoom];
          delete mySrv.selectCountdown[currentRoom];
          delete mySrv.bidCountdown[currentRoom];
          delete mySrv.leagueType[currentRoom];
      } // Close else{} statement.
    }; // Close absentOtbOverride() function.
    // If there are still roster spots available on any team then we run the absentOtbOverride() function in 20 seconds plus 1 extra second for some buffer to allow the timer on the front end to reach 0 seconds.
    // If the otb coach adds a player to the block within this 20 seconds, then the absentOtbOverrideTimeout will be cleared and the absentOtbOverride() function will not run.
     mySrv.absentOtbOverrideTimeout[currentRoom] = setTimeout(absentOtbOverride, mySrv.selectCountdown[currentRoom] * 1000);
  }; // Close draftPlayer() function.


  // Socket.on("bid") function used to log a bid on a player.
  socket.on('bid', function(bidData) {
    // Clear the draftPlayerTimeout timeout counter.
    clearTimeout(mySrv.draftPlayerTimeout[currentRoom]);
    // Immediately emit a bidLock to disable the bidding buttons for all users when there is a bid.
    function bidLock(){
      // Was working but removed to try and send simultaneously to all and replaced with the below code.
      // socket.emit('bidLock');
      // socket.broadcast.to(currentRoom).emit('bidLock');
      io.in(currentRoom).emit('bidLock');
    };

    function bidUpdate(){
     Draft.findById(bidData.draftID, function(err, data){
      if(err) return next(err);
        data.otbBid = bidData.bidValue;
        data.otbBidder = bidData.currentUser;
        // data.otbBidder = req.session.teamName2;
        data.save();

        // Code to add 10 seconds to the current end time.
        var nowBid = new Date();
        nowBid.setSeconds(nowBid.getSeconds() + mySrv.bidCountdown[currentRoom]);
        var endTimeBid = nowBid.getTime();

        io.in(currentRoom).emit('bidUpdate', {bidData: data, otbEndTime: endTimeBid});
      }) // Close Draft.findById() function.
    };
 // Lock bidding.
 bidLock();
 // Unlock bidding and update bid after 0.5 seconds.
 setTimeout(bidUpdate, 500);
 // Run the draftPlayer() function to draft the player after the countdown timer expires plus 5 seconds.
 mySrv.draftPlayerTimeout[currentRoom] = setTimeout(draftPlayer, mySrv.bidCountdown[currentRoom] * 1000 + 5000);
}); // Close socket.on("bid") function.


  // Define the addPlayerToBlock function that adds the relevant player details to the block and emite the otbUpdate event.
  function addPlayerToBlock(draftID, name, position, average, startingBid, coach){
    // Clear the draftPlayerTimeout timeout counter.
    clearTimeout(mySrv.draftPlayerTimeout[currentRoom]);
    // Clear the absentOtbOverrideTimeout timeout counter.
    clearTimeout(mySrv.absentOtbOverrideTimeout[currentRoom]);
    // Find the current draft in the database.
    Draft.findById(draftID, function(err, data){
      // If the coaches array isn't full we send a message to the client that clicked the "Add To Block" button.
      if(data.coaches.length < data.numOfCoaches){
        socket.emit("waitingOnCoaches", {message: "Please wait for all coaches before starting!"});
      // Else we add the player to the block and emit an "otbUpdate" to all clients.
      } else {

        if(err) return next(err);
        data.otbPlayer = name;
        data.otbPos = position;
        data.otbBid = startingBid;
        data.otbBidder = coach;
        data.otbAverage = average;
        // Save the updated data in the database.
        data.save();

        // Update the countdown timer time.
        var nowAdd = new Date();
        nowAdd.setSeconds(nowAdd.getSeconds() + mySrv.bidCountdown[currentRoom]);
        var endTimeAdd = nowAdd.getTime();

        // Define the sendTime, we'll use this to calculate the latency for each client.
        // var sendTime = new Date().getTime();

        // Update the biddingUnderway variable to true for the current room.
        mySrv.biddingUnderway[currentRoom] = true;

        io.in(currentRoom).emit('otbUpdate', {updatedOtbData: data, otbEndTime: endTimeAdd/*, sendTime: sendTime*/});
        // Run the draftPlayer() function after the countdown timer expires plus 5 seconds.
        mySrv.draftPlayerTimeout[currentRoom] = setTimeout(draftPlayer, mySrv.bidCountdown[currentRoom] * 1000 + 5000);
    }

    }) // Close Draft.findById() function.
  }; // Close addPlayerToBlock() function.


  // On the 'addToBlock' event caused by a user clicking 'Add To Block' on the front-end we run the addPlayerToBlock function and pass in the selected players details.
  socket.on('addToBlock', function(otbData) {
    addPlayerToBlock(otbData.draftID, otbData.player, otbData.position, otbData.average, otbData.startingBid, otbData.currentUser);
  }); // Close socket.on("addToBlock") function.


  function getFunFacts(player, price){
    console.log("Player", player);
    console.log("Price: ", price);
    var vwaEstimatedPrice = player.vwa;
    var oversUnders = price - vwaEstimatedPrice;
    console.log("oversUnders", oversUnders);

    var text = "Cost Analysis Generation Underway!"
    if(oversUnders < 0) {
      console.log("Unders", oversUnders);
      text = "Uuunders! " + player + " has been heisted at " + Math.round((((oversUnders * -1)/vwaEstimatedPrice)*100)) + "% unders!";
    } else if(oversUnders > 0) {
      console.log("Overs", oversUnders);
      text = "Oooovers! " + player + " is on an inflated pay packet at " + Math.round((((oversUnders)/vwaEstimatedPrice)*100)) + "% overs!";
    } else {
      text = "Spot On! " + player + " has gone for exactly what he's worth!";
    }

    io.in(currentRoom).emit("broadcastFunFact", text);

  };

}); //Close io.on() connection function.





// Listen on appPort which is either port 3000 or Production port.
// The below 3 lines should be kept even if the WebSocket connection is removed.
server.listen(appPort, function () {
    console.log('Express server listening on port:' + appPort);
    console.log("MongoDB server listening on port:" + configAuth.connectionString);
});