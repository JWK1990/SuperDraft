var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Player = require("../models/playerData");
var Draft = require("../models/draftData");
var mid = require("../middleware");
var path = require("path");

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
				return res.redirect ("/profile");
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
					return res.redirect("/profile");
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
		Draft.find({"_id":req.query.draft}, function(err, drafts){
			Player.find({}, function(err, players){
				if(!err){
					var currentUser = req.session.email;
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
		req.body.numOfCoaches){


			// create object with form input
			var draftData = {
				leagueName: req.body.leagueName,
				draftYear: req.body.draftYear,
				numOfCoaches: req.body.numOfCoaches,
				admin: req.session.name,
				coaches: [{email: req.body.coach1, budget: 300, numOfPlayers: 0, players:[{name: "Patrick Dangerfield", price: 10, position: "M"}, {name: "Sam Mitchell", price: 20, position: "M"}]}, 
						{email: req.body.coach2, budget: 300, numOfPlayers: 0},
						{email: req.body.coach3, budget: 300, numOfPlayers: 0}, 
						{email: req.body.coach4, budget: 300, numOfPlayers: 0},
						{email: req.body.coach5, budget: 300, numOfPlayers: 0}, 
						{email: req.body.coach6, budget: 300, numOfPlayers: 0},
						{email: req.body.coach7, budget: 300, numOfPlayers: 0},
						{email: req.body.coach8, budget: 300, numOfPlayers: 0},
						{email: req.body.coach9, budget: 300, numOfPlayers: 0},
						{email: req.body.coach10, budget: 300, numOfPlayers: 0}],
				otbPlayer: "Patrick Dangerfield",
				otbBid: 1,
				otbEndTime: new Date(),
				otbCoach :req.body.coach1,
				pickCounter: 0
			};

			// use schema's 'create' method to insert document into Mongo.
			Draft.create(draftData, function (error, draft){
				if (error){
					return next(error);
				} else {
					return res.redirect("/myDrafts");
				}
				});
			
	} else {
		var err = new Error("All fields required.");
		err.status = 400;
		return next(err);
}});

router.get("/myDrafts", function(req, res, next){
	Draft.find({}, function(err, drafts){
		User.find({}, function(err, users){
			return res.render("myDrafts", {title: "My Drafts", results: drafts, users: users});
			});
		});
	});




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
		data.otbBidder = req.session.email;
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
		var newResult = {name:data.otbPlayer, position: data.otbPos, price: data.otbBid, team: data.otbBidder};

		data.results.push(newResult);

		// The update $inc function incremenents the budget and numOfPlayers fields by the provided number.
		Draft.update({"_id": req.params.dID, "coaches.email": data.otbBidder}, {"$inc":{
			"coaches.$.budget" : -data.otbBid,
			"coaches.$.numOfPlayers": 1

		}}, function(err){
			if(err) throw err
		});

		// The update $push function adds the newPlayer variable defined above to the relevant coaches players array.
		Draft.update({"_id": req.params.dID, "coaches.email": data.otbBidder}, {"$push":{
			"coaches.$.players" : newPlayer

		}}, function(err){
			if(err) throw err
		});

		data.otbCoach = data.coaches[data.pickCounter].email;
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


module.exports = router;
