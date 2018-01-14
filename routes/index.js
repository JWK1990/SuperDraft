var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Player = require("../models/playerData");
var Draft = require("../models/draftData");
var mid = require("../middleware");
var path = require("path");
// Require nodemailer to send automated emails to signed up users.
var nodemailer = require("nodemailer");

// Sets up nodemailer for sending emails to users.
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'jwkumm@gmail.com',
		pass: 'hollyisho1'
	}
});




// GET /profile
router.get("/profile", mid.requiresLogin, function(req, res, next){
	User.findById(req.session.userId)
		.exec(function (error, user){
			if (error){
				return next(error);
			} else {
				return res.render("profile", {title: "My Profile", name: user.name, teamName: user.teamName});
			}
		});
});

// GET /logout.
router.get("/logout", function(req, res, next){
	if (req.session){
		// delete session object.
		req.session.destroy(function(err){
			if (err){
				return next(err);
			} else {
				return res.redirect("/");
			}
		});
	}
});


// GET /login
router.get("/login", mid.loggedOut, function(req, res, next){
	return res.render("login", {title: "Log In"});
});

// POST /login
router.post("/login", function(req, res, next){
	if (req.body.email && req.body.password){
		User.authenticate(req.body.email, req.body.password, function(error, user){
			if (error || !user){
				var err = new Error("Wrong email or password.");
				err.status = 401;
				return next(err);
			} else {
				req.session.userId = user._id;
				req.session.name = user.name;
				req.session.teamName = user.teamName;
				req.session.email = user.email;
				return res.redirect ("/myDrafts");
			}
		});
	} else {
		var err = new Error("Email and password are required.");
		err.status = 401;
		return next(err);
	}
});

// GET /register
router.get("/register", mid.loggedOut, function(req, res, next){
	return res.render("register", {title: "Sign Up"});
});

// POST /register
router.post("/register", function(req, res, next){
	if (req.body.email &&
		req.body.name &&
		req.body.teamName &&
		req.body.password &&
		req.body.confirmPassword){

			// confirm that the user typed same password twice.
			if (req.body.password !== req.body.confirmPassword){
				var err = new Error("Passwords do not match.");
				err.status = 400;
				return next(err);
			}

			// create object with form input
			var userData = {
				email: req.body.email,
				name: req.body.name,
				teamName: req.body.teamName,
				password: req.body.password
			};

			// use schema's 'create' method to insert document into Mongo.
			User.create(userData, function (error, user){
				if (error){
					return next(error);
				} else {
					req.session.userId = user._id;
					req.session.name = user.name;
					req.session.teamName = user.teamName;
					req.session.email = user.email;
					return res.redirect("/myDrafts");
				}
			});

	} else {
		var err = new Error("All fields required.");
		err.status = 400;
		return next(err);
}});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /draft
router.get("/draft", function(req, res, next){
	User.find({}, function(err, users){
			Player.find({}, function(err, players){
				Draft.find({"_id":req.query.draft}, function(err, drafts){
				if(!err){
					var currentUser = req.session.teamName;
					console.log('Current User:' + currentUser);

					/* The below block of code iterates through through the users collection and matches the 'teamName' from the draftData (which is the email the admin entered on signup)
					with an email in the users collection. It then returns the index of the matching user. We then use this index to get the corresponding team name. We then add that teamName to the relevant object in the draftData array as teamName2.
					If no matching user is found we just add the email back in as teamName2.
					We then use this teamName2 in the first column of the budgets pane on the draft page. Previously we passed the draftData emails directly, which meant that the team name
					entered by the admin on setup directly populated the bugets pane which then had to match the team name of the logged in user. This made it hard to allow the admin to enter
					emails rather than team names. This has now been fixed. We then save this updated teamName2 into the Database, this occurs when the /drafts page is loaded. So in the DB
					the teamName1 and teamName2 remain as the email entered by the admin when creating the draft, until the point at which the coaches visits SuperDraftFantasy and signs up, then
					the first time the /draft page is initiated following this, the teamName2 will update in the DB to the Team Name that the user signs up with.*/
					var index;
					var teamName2;

					for (var i=0; i < drafts[0].coaches.length; i++){

						index = users.findIndex(function(data) {
							  return data.email == drafts[0].coaches[i].teamName;
						});

						if (index > -1){
							teamName2 = users[index].teamName;
						} else {
							teamName2 = drafts[0].coaches[i].teamName;
						}



						drafts[0].coaches[i].teamName2 = teamName2;
						console.log('TeamName2DB:' + drafts[0].coaches[i].teamName2);

						drafts[0].save(function(err){
							if (err) console.log(err);
							else console.log("Success!");
						})

					}


					return res.render("draft", {title: "Draft", players: players, drafts: drafts, users: users, currentUser: currentUser, coaches: drafts[0].coaches, results: drafts[0].results.reverse()});
				} else {
					throw err;
				}
		})
})
})
});

// GET /create
router.get("/create", function(req, res, next){
	return res.render("create", {title: "Create A Draft"});
});

// POST /create

router.post("/create", function(req, res, next){

	if (req.body.leagueName &&
		req.body.draftYear &&
		req.body.numOfCoaches &&
		req.body.rosterSize &&
		req.body.numOfDef &&
		req.body.numOfFwd &&
		req.body.numOfRuc &&
		req.body.numOfMid &&
		req.body.numOfBen &&
		req.body.budget){

		// First we create a coachesList, which is an array containing objects with all of the relevant coaches details.
		// We then assign this to the coaches value in the draftData object.
		var coachesList = [];
		var coachObject;
		var coachNum = "";

		for (var i=1; i <= req.body.numOfCoaches; i++){
			coachNum = "coachNum: " + "coach" + i;
			coachObject = {teamName: req["body"]["coach" + i], budget: req.body.budget, numOfPlayers: 0, teamName2: req["body"]["coach" + i], benchCount: 0, rosterSpots: [true, true, true, true, true, true, true, true, true, true]};
			coachesList.push(coachObject);
		};


			// create object with form input
			var draftData = {
				leagueName: req.body.leagueName,
				draftYear: req.body.draftYear,
				numOfCoaches: req.body.numOfCoaches,
				rosterSize: req.body.rosterSize,
				numOfDef: req.body.numOfDef,
				numOfFwd: req.body.numOfFwd,
				numOfRuc: req.body.numOfRuc,
				numOfMid: req.body.numOfMid,
				numOfBen: req.body.numOfBen,
				admin: req.session.teamName,
				coaches: coachesList,
				otbPlayer: "Patrick Dangerfield",
				otbBid: 1,
				otbCoach :req.body.coach1,
				pickCounter: 1
			};

			// use schema's 'create' method to insert document into Mongo.
			Draft.create(draftData, function (error, draft){
				if (error){
					return next(error);
				} else {
					return res.redirect("/myDrafts");
				}
				});

			// Use nodemailer to send an invite to all coaches in the coaches list when the create draft form is submitted.
			// Create the mailing list.
			var mailingList = '';
			for (var i=0; i < draftData.coaches.length; i++){
				console.log(draftData.coaches[i].teamName);
				console.log ('Team 1: ' + draftData.coaches[1].teamName);
				console.log('Team 0: ' + draftData.coaches[0].teamName);
				mailingList += draftData.coaches[i].teamName + ",";
			};
			// Create the text.
			var bodyText = 'You have been invited to a Superdraft by ' + draftData.admin + '! Visit www.superdraftfantasy.com/register to sign up and get drafting!';
			// Define the parameters for the mail to be sent.
			var mailOptions = {
				from: 'jwkumm@gmail.com',
				to: mailingList,
				subject: 'Its Drafting Time!',
				text: bodyText
			};
			// Send the email when the users submits the create draft form.
			transporter.sendMail(mailOptions, function(error, info){
				if (error){
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
			
	} else {
		var err = new Error("All fields required.");
		err.status = 400;
		return next(err);
}});

router.get("/myDrafts", function(req, res, next){
	// Get the current users email address.
	var currentUserEmail = req.session.email;
	var myDraftsList = [];
	console.log(currentUserEmail);

	Draft.find({}, function(err, drafts){
		// Loops through the draftData and find drafts that contain the current users email address.
		for(var i = 0; i < drafts.length; i++) {
			for (var j=0; j < drafts[i].coaches.length; j++){
				// If we find a draft containing the users email address, we create an addDraft variable and add it to our myDraftsList array.
				if (drafts[i].coaches[j].teamName == currentUserEmail) {
					var addDraft = {leagueName: drafts[i].leagueName, draftYear: drafts[i].draftYear, numOfCoaches: drafts[i].numOfCoaches, admin: drafts[i].admin, _id: drafts[i]._id}
					myDraftsList.push(addDraft);
					console.log(myDraftsList);
			}
		    }
		};
		// Reverses the myDraftsList array so that the most recent drafts appear at the top.
		myDraftsList.reverse();

		User.find({}, function(err, users){
			// We send the myDraftsList array and the users data to the front end to be used in our template.
			return res.render("myDrafts", {title: "My Drafts", results: myDraftsList, users: users});
			});
		});
	});



/*

// ROUTERS THAT LINK UP WITH AJAX REQUESTS IN THE PLAYERLOOKUP.JS FILE.

// PUT /draftData/:dID/otbPlayer/:pID used for updating the current otbPlayer.
router.put("/draftData/:dID/otbPlayer/:pID/:posID", function(req, res, next){
	Draft.findById(req.params.dID, function(err, data){
		if(err) return next(err);
		data.otbPlayer = req.params.pID;
		data.otbPos = req.params.posID;
		data.otbBid = 1;

	    var now = new Date();
	    now.setSeconds(now.getSeconds() + 12);
	    var endTime = now.getTime();
		data.otbEndTime = endTime;

		data.save();
		res.json(data);


	})
});




// PUT /draftData/:dID/otbBid/:bID used for updating the current otbBid used in the logBid() function.
router.put("/draftData/:dID/otbBid/:bID", function(req, res, next){
	Draft.findById(req.params.dID, function(err, data){
		if(err) return next(err);

		// If statement to check if bid is valid.
		if (req.params.bID > data.otbBid){

		data.otbBid = req.params.bID;
		data.otbBidder = req.session.teamName;
		// Code to add 11 seconds to the current end time.
	    var now = new Date();
	    now.setSeconds(now.getSeconds() + 11);
	    var endTime = now.getTime();
		data.otbEndTime = endTime;
		data.save();
		res.json(data);

	} else {
		// Code to send an error to the browser if the bid value is less than the current bid.
		res.send(500, "showAlert");
	}


	})
});





// PUT /draftData/:dID/coaches used for adding a drafted player to the relevant coaches team.
router.put("/draftData/:dID/coaches", function(req, res, next){


	// Returns the relevant draft based on the dID parameter provided in the URL.
	Draft.findById(req.params.dID, function(err, data){

		// The newPlayer variable defines the player details to be added to the relevant coaches players array below.
		var newPlayer = {name: data.otbPlayer, position: data.otbPos, price: data.otbBid};
		var newResult = {name: data.otbPlayer, position: data.otbPos, price: data.otbBid, team: data.otbBidder};

		data.results.push(newResult);

		// The update $inc function incremenents the budget and numOfPlayers fields by the provided number.
		Draft.update({"_id": req.params.dID, "coaches.teamName": data.otbBidder}, {"$inc":{
			"coaches.$.budget" : -data.otbBid,
			"coaches.$.numOfPlayers": 1

		}}, function(err){
			if(err) throw err
		});

		// The update $push function adds the newPlayer variable defined above to the relevant coaches players array.
		Draft.update({"_id": req.params.dID, "coaches.teamName": data.otbBidder}, {"$push":{
			"coaches.$.players" : newPlayer

		}}, function(err){
			if(err) throw err
		});

		data.otbCoach = data.coaches[data.pickCounter].teamName;
		console.log(data.otbCoach);

		if (data.pickCounter === 9){
			data.pickCounter = 0;
		} else {
			data.pickCounter += 1;
		}
		console.log(data.pickCounter);

		data.save();
		res.json(data);
	
	});

});

*/

module.exports = router;
