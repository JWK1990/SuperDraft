var path = require("path");
var mid = require("../middleware");
var fs = require('fs');
var User = require("../models/user");
var Draft = require("../models/draftData");
var decode = require('unescape');

// Require nodemailer to send automated emails to signed up users.
var nodemailer = require("nodemailer");

// Sets up nodemailer for sending emails to users.
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'superdraftfantasy@gmail.com',
		pass: 'SuperDuperDraft123'
	}
});


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
        return next();
    } else {
    	// if they aren't, set the returnTo to the page they were trying to visit (so that once they're logged in we redirect to there).
    	// Then redirect them to the home page.
    	req.session.returnTo = req.originalUrl;
    	console.log(req.originalUrl);
    	req.flash('loginMessage', 'You must be logged in to view this page!');
    	res.redirect('/');
   	}
};



module.exports = function(app, passport){

// FACEBOOK ROUTES
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', { 
  scope : ['public_profile', 'email']
}));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successReturnToOrRedirect : '/myDrafts',
        failureRedirect : '/'
    }));


// TWITTER ROUTES
// route for twitter authentication and login
app.get('/auth/twitter', passport.authenticate('twitter'));

// handle the callback after twitter has authenticated the user
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successReturnToOrRedirect : '/myDrafts',
        failureRedirect : '/'
    }));


// GOOGLE ROUTES
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/auth/google/callback',
    passport.authenticate('google', {
            successReturnToOrRedirect : '/myDrafts',
            failureRedirect : '/'
    }));



// GET /
app.get('/', function(req, res, next) {
	console.log("SESSSSSSSIIIIIOOOOOOONNNNNNNN DETAILS!!!!!!!!");
	console.log(req.user);

	var loginMessage = req.flash('loginMessage');
	var loginText = loginMessage[0];
	var loginEmail = loginMessage[1];

	console.log(loginMessage);
	console.log(loginText);
	console.log(loginEmail);

	// signupMessage: req.flash('signupMessage'), signupEmail: req.flash('signupEmail')[0], signupName: req.flash('signupName')[0], loginMessageUser: req.flash('loginMessageUser'), loginEmail: req.flash('loginEmail')[0], loginMessagePassword: req.flash('loginMessagePassword')}
  return res.render('index', {title: 'Home', signupMessage: req.flash('signupMessage'), loginText: loginText, loginEmail: loginEmail});
});



app.get('/signup', function(req, res, next){
	res.render('signup', {title: "Sign Up"});
});
app.post('/signup', passport.authenticate('local-signup', {
    successReturnToOrRedirect : '/myDrafts', // redirect to the secure profile section
    failureRedirect : '/', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));



// GET /login
app.get("/login", function(req, res, next){
	return res.render("login", {title: "Log In"});
});
// POST /login
app.post("/login", passport.authenticate('local-login', {
        successReturnToOrRedirect : '/myDrafts', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the login page if there is an error
        failureFlash : true // allow flash messages
})); // Close app.post("/login").



// GET /about
app.get('/about', function(req, res, next) {
	req.session.returnTo = "/about";
  	return res.render('about', { title: 'About'});
});



// GET /research
app.get("/resources", function(req, res, next){
	req.session.returnTo = "/resources";
	console.log(req.user);
	return res.render("resources", {title: "Resources"});
});

app.get("/privacy", function(req,res,next){
	return res.render("privacy");
}); // Close app.get("/privacy");




app.get("/myDrafts", isLoggedIn, function(req, res, next){
	// Get the current users email address. If they are FB authenticated it will be held in req.user, if they are email authenticated it will be held in req.session.
	var currentUserEmail;
	var currentUserName;

	// Set the currentUserEmail and currentUserName based on the authentication type for the current user.
	if(req.user.local.email){
		console.log("Local Authenticated!");
		currentUserEmail = req.user.local.email.toUpperCase();
		currentUserName = req.user.local.name.toUpperCase();
	} else if(req.user.facebook.email){
		currentUserEmail = req.user.facebook.email.toUpperCase();
		currentUserName = req.user.facebook.name.toUpperCase();	
	} else if(req.user.twitter.email){
		currentUserEmail = req.user.twitter.email.toUpperCase();
		currentUserName = req.user.twitter.name.toUpperCase();			
	} else if(req.user.google.email){
		currentUserEmail = req.user.google.email.toUpperCase();
		currentUserName = req.user.google.name.toUpperCase();			
	}

	var myDraftsList = [];

	Draft.find({}, function(err, drafts){
		// Loops through the draftData and find drafts that contain the current users email address.
		for(var i = 0; i < drafts.length; i++) {
			for (var j=0; j < drafts[i].coaches.length; j++){
				// If we find a draft containing the users email address, we create an addDraft variable and add it to our myDraftsList array.
				if (drafts[i].coaches[j].teamName == currentUserEmail) {
					var addDraft = {leagueName: drafts[i].leagueName, draftYear: drafts[i].draftYear, numOfCoaches: drafts[i].numOfCoaches, admin: drafts[i].admin, _id: drafts[i]._id}
					myDraftsList.push(addDraft);
					console.log(myDraftsList);
				} // Close if() statement.
		    } // Close for(var j = 0) loop.
		} // Close for(var i = 0) loop.
		// Reverses the myDraftsList array so that the most recent drafts appear at the top.
		myDraftsList.reverse();


		User.find({}, function(err, users){
			// We send the myDraftsList array and the users data to the front end to be used in our template.
			return res.render("myDrafts", {title: "My Drafts", results: myDraftsList, users: users, currentUserName: currentUserName, createdDraftMessage: req.flash('createdDraft'), draftNotFound: req.flash('draftNotFound')});
		}); // Close User.find() function.

	}); // Close Draft.find() function.

}); // Close app.get("/myDrafts") function.


app.get("/join", isLoggedIn, function(req, res, next){
	return res.render("join", {title: "Join A Draft"});
}); // Close app.get("/myDrafts") function.


app.post("/join", isLoggedIn, function(req, res, next){

	var currentUserEmail;
	var selectedTeamName = decode(req.body.myTeamName.trim().toUpperCase().replace(/ +(?= )/g,''));


	if(req.user.local.email){
		console.log("Local Authenticated!");
		currentUserEmail = req.user.local.email.toUpperCase();
	} else if(req.user.facebook.email){
		currentUserEmail = req.user.facebook.email.toUpperCase();
	} else if(req.user.twitter.email){
		currentUserEmail = req.user.twitter.email.toUpperCase();		
	} else if(req.user.google.email){
		currentUserEmail = req.user.google.email.toUpperCase();
	}


	// Find the draft with the matching draftCode to the one entered by the user.
	Draft.findById(req.body.draftCode, function(err, drafts){
		if(!err){

			var alreadyEntered;
			var alreadyEnteredTeamName;
			var nameTaken;
			var teamNameTaken;

			// Check if the user has already entered a team in the draft.
			for(var i=0; i < drafts.coaches.length; i++){
				if(drafts.coaches[i].teamName == currentUserEmail){
					alreadyEnteredTeamName = drafts.coaches[i].teamName2;
					alreadyEntered = true;
					console.log("ALREADY ENTERED!");
					console.log(alreadyEntered);
					break;
				}
			}

			for(var i=0; i < drafts.coaches.length; i++){
				console.log()
				if(drafts.coaches[i].teamName2 == selectedTeamName){
					teamNameTaken = drafts.coaches[i].teamName2;
					nameTaken = true;
					console.log("NAME TAKEN!");
					console.log(nameTaken);
					break;
				}
			}

			// If the user has already entered a team in the draft, return an error.
			// Else add the user to the draft.
			if(drafts.coaches.length >= drafts.numOfCoaches){
				return res.render("join", {title: "Join A Draft", fail: "  Sorry, the selected draft is already full!"});
			} else if(alreadyEntered){
				return res.render("join", {title: "Join A Draft", fail: "  You have already joined that draft with the team name " + alreadyEnteredTeamName + "!"});
			} else if(nameTaken){
				return res.render("join", {title: "Join A Draft", fail: "  Sorry, the team name " + teamNameTaken + " is already taken in this draft!"});
			} else {
				// Create a coach object with the current users details for the current draft.
				// Add the coach object to the coaches array of the current draft.
				// Save the updated draft data.
				// Redirect to the myDrafts page where the draft should now appear as the coaches email is in the coaches list.
				var coachObject = {teamName: currentUserEmail, budget: drafts.budget, numOfPlayers: 0, teamName2: selectedTeamName, benchCount: 0, rosterSpots: [true, true, true, true, true, true, true, true, true, true]}
				drafts.coaches.push(coachObject);
				drafts.save();


				// Find the current user in the database based on their authentication type.
				// Add the joined draft to the current users drafts array.
				if(req.user.local.email){
					console.log("Local Authenticated!");
					User.findOne({"local.email":currentUserEmail}, function(err, user){
						user.drafts.push(req.body.draftCode);
						user.save();
					})
				} else if(req.user.facebook.email){
					console.log("Facebook Authenticated!");
					User.findOne({"facebook.email":currentUserEmail}, function(err, user){
						user.drafts.push(req.body.draftCode);
						user.save();
					})
				} else if(req.user.twitter.email){
					console.log("Twitter Authenticated!");
					User.findOne({"twitter.email":currentUserEmail}, function(err, user){
						user.drafts.push(req.body.draftCode);
						user.save();
					})		
				} else if(req.user.google.email){
					console.log("Twitter Authenticated!");
					User.findOne({"google.email":currentUserEmail}, function(err, user){
						user.drafts.push(req.body.draftCode);
						user.save();
					})				
				} // Close else if().
				res.redirect('/myDrafts');
			}

		} else {
			return res.render("join", {title: "Join A Draft", fail: "  That draft code could not be found!"});
		} // Close else{}statement.
	}); // Close Draft.find() function.


}); // Close app.get("/myDrafts") function.



// GET /logout.
app.get("/logout", function(req, res, next){
	req.logout();
	res.redirect('/');
});




/* Comment out email for now.

// POST /register
app.post("/register", function(req, res, next){


		// Use nodemailer to send a welcome email to the new coach.
		// Create the mailing list.
		var mailingList = userData.email;
		// Create the text.
		var bodyText = 'Welcome to Superdraft ' + userData.name + '! Visit www.superdraftfantasy.com/create to create your first draft and invite your league!';
		// Define the parameters for the mail to be sent.
		var mailOptions = {
			from: 'superdraftfantasy@gmail.com',
			to: mailingList,
			subject: 'Welcome To SuperDraft!',
			text: bodyText
		};
		// Send the email when the users submits the create draft form.
		transporter.sendMail(mailOptions, function(error, info){
			if (error){
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		}) // Close transporter.sendMail() function.




	/*
	if (req.body.email &&
		req.body.name &&
		req.body.teamName &&
		req.body.password &&
		req.body.confirmPassword){

			User.findOne({teamName:req.body.teamName}, function(err, teamName){
				if(teamName != null){
					return res.render("register", {fail: " Team Name is already taken!", reqBodyFail: req.body})
				} else if(req.body.password !== req.body.confirmPassword){
					return res.render("register", {fail: " Passwords did not match.", passMismatch: true, reqBodyFail: req.body})
				} else if(teamName == null && req.body.password == req.body.confirmPassword){
					User.findOne({email:req.body.email.toUpperCase()}, function(err,email){
						if(email != null){
							return res.render("register", {fail: " Email already in use!", dupEmail: req.body.email, reqBodyFail: req.body})
						}
					}); // Close User.findOne(email).
				} else {
				} // Close else{} statement.
			}); // Close User.findOne() statement.
	} else {
		return res.render("register", {fail: " All fields are required.", reqBodyFail: req.body})
	}
});

*/



// GET /draft
app.get("/draft", isLoggedIn, function(req, res, next){
	User.find({}, function(err, users){
		Draft.find({"_id":req.query.draft}, function(err, drafts){
			if(!err){

				var currentUserEmail;
				var currentUserTeam;

				// Set the currentUserEmail based on the authentication type of the current user.
				if(req.user.local.email){
					console.log("Local Authenticated!");
					currentUserEmail = req.user.local.email.toUpperCase();
				} else if(req.user.facebook.email){
					currentUserEmail = req.user.facebook.email.toUpperCase();
				} else if(req.user.twitter.email){
					currentUserEmail = req.user.twitter.email.toUpperCase();		
				} else if(req.user.google.email){
					currentUserEmail = req.user.google.email.toUpperCase();			
				}


				// Loop through the coaches array for the selected draft.
				// Find the coach with an email (teamName) matching the current user.
				// Return the team name (teamName2) corresponding with that coach.
				for(var i=0; i < drafts[0].coaches.length; i++){
					if(drafts[0].coaches[i].teamName == currentUserEmail){
						currentUserTeam = decode(drafts[0].coaches[i].teamName2.trim().toUpperCase().replace(/ +(?= )/g,''));
						break;
					}
				}

				console.log(currentUserTeam);

			// Define the players variable that contains the player data from the scPlayerData.json file if the leagueType is "Supercoach" or the dtPlayerData.json file if not.
			if(drafts[0].leagueType == "Supercoach"){
				var players = JSON.parse(fs.readFileSync('./public/js/scPlayerData.json', 'utf8'));
			} else {
				var players = JSON.parse(fs.readFileSync('./public/js/dtPlayerData.json', 'utf8'));
			}

				return res.render("draft", {title: "Draft", players: players, drafts: drafts, users: users, currentUser: currentUserTeam, coaches: drafts[0].coaches, results: drafts[0].results});
			} else {
				req.flash("draftNotFound", " Sorry, the selected draft could not be found!");
				return res.redirect("/myDrafts");
			} // Close else{}statement.
		}) // Close Draft.find() function.
	}) // Close User.find() function.
}); // Close router.get("/draft") function.

// GET /create
app.get("/create", isLoggedIn, function(req, res, next){
	return res.render("create", {title: "Create A Draft"});
});

// POST /create

app.post("/create", function(req, res, next){

	if (req.body.leagueName &&
		req.body.numOfCoaches &&
		req.body.rosterSize &&
		req.body.numOfDef &&
		req.body.numOfFwd &&
		req.body.numOfRuc &&
		req.body.numOfMid &&
		req.body.numOfBen &&
		req.body.budget &&
		req.body.selectCountdown &&
		req.body.bidCountdown &&
		req.body.leagueType &&
		req.body.myTeamName){



		var currentUserEmail;
		var selectedTeamName = decode(req.body.myTeamName.trim().toUpperCase().replace(/ +(?= )/g,''));

		// Set the currentUserEmail based on the authentication type for the current coach.
		if(req.user.local.email){
			console.log("Local Authenticated!");
			currentUserEmail = req.user.local.email.toUpperCase();
		} else if(req.user.facebook.email){
			currentUserEmail = req.user.facebook.email.toUpperCase();
		} else if(req.user.twitter.email){
			currentUserEmail = req.user.twitter.email.toUpperCase();		
		} else if(req.user.google.email){
			currentUserEmail = req.user.google.email.toUpperCase();		
		}


		var rosterCount = Number(req.body.numOfDef) + Number(req.body.numOfMid) + Number(req.body.numOfRuc) + Number(req.body.numOfFwd)	+ Number(req.body.numOfBen);

		// First we create a coachesList, which is an array containing objects with all of the relevant coaches details.
		// We then assign this to the coaches value in the draftData object.
		var coachesList = [];
		var coachObject = {teamName: currentUserEmail, budget: req.body.budget, numOfPlayers: 0, teamName2: selectedTeamName, benchCount: 0, rosterSpots: [true, true, true, true, true, true, true, true, true, true]}
		coachesList.push(coachObject);

		// create object with form input.
		var draftData = {
			leagueName: req.body.leagueName,
			draftYear: 2018,
			numOfCoaches: req.body.numOfCoaches,
			rosterSize: rosterCount,
			numOfDef: req.body.numOfDef,
			numOfFwd: req.body.numOfFwd,
			numOfRuc: req.body.numOfRuc,
			numOfMid: req.body.numOfMid,
			numOfBen: req.body.numOfBen,
			admin: selectedTeamName,
			coaches: coachesList,
			otbPlayer: "Patrick Dangerfield",
			otbPos: "MID",
			otbAverage: "132",
			otbBid: 1,
			otbCoach : selectedTeamName,
			pickCounter: 1,
			selectCountdown: req.body.selectCountdown,
			bidCountdown: req.body.bidCountdown,
			leagueType: req.body.leagueType,
			budget: req.body.budget
		};






		// use schema's 'create' method to insert document into Mongo.
		Draft.create(draftData, function (error, draft){
			if (error){
				return next(error);
			} else {
				var draftID = draft._id.toString();
				req.flash('createdDraft', draftID);

				// Find the current user in the database based on their authentication type.
				// Add the created draft to the current users drafts array.
				if(req.user.local.email){
					console.log("Local Authenticated!");
					User.findOne({"local.email":currentUserEmail}, function(err, user){
						user.drafts.push(draftID);
						user.save();
					})
				} else if(req.user.facebook.email){
					console.log("Facebook Authenticated!");
					User.findOne({"facebook.email":currentUserEmail}, function(err, user){
						console.log(user);
						user.drafts.push(draftID);
						user.save();
					})
				} else if(req.user.twitter.email){
					console.log("Twitter Authenticated!");
					User.findOne({"twitter.email":currentUserEmail}, function(err, user){
						user.drafts.push(draftID);
						user.save();
					})		
				} else if(req.user.google.email){
					console.log("Twitter Authenticated!");
					User.findOne({"google.email":currentUserEmail}, function(err, user){
						user.drafts.push(draftID);
						user.save();
					})				
				} // Close else if().

				return res.redirect("/myDrafts");
			} // Close else{}.
		}); // Close Draft.create() function.

		/* Comment out the email part of the code for now.
			// Define the parameters for the coachesMail to be sent.
			var coachesMailOptions = {
				from: 'Superdraftfantasy@gmail.com',
				to: coachesMailingList,
				subject: draftData.leagueName + " It's Drafting Time!",
				text: coachesBodyText
			};
			// Use nodemailer to send an invite to all coaches in the coaches list when the create draft form is submitted.
			// Create the mailing list and define the HTML for the email list to be sent to the coaches.
			var coachesMailingList = '';
			var emailListHTML = '';
			for (var i=1; i < draftData.coaches.length; i++){
				coachesMailingList += draftData.coaches[i].teamName + ",";
				emailListHTML += "<li>" + draftData.coaches[i].teamName + "</li>";
			};
			// Create the text.
			var coachesBodyText = "<h1>You have been invited to a Superdraft by " + draftData.admin + "!</h1><br>" +
							"<h2>Visit www.superdraftfantasy.com/register to sign up and get drafting!</h2><br>" +
							"<h3>IMPORTANT: Please ensure that you sign up with the email address that received this invite!</h3><br>" +
								"<ul>" +
								"<li> League Name: " + draftData.leagueName + "</li>" +
								"<li> League Type: " + draftData.leagueType + "</li>" +
								"<li> Admin: " + draftData.admin + "</li>" +
								"<li> Roster Size: " + draftData.rosterSize + " (" + draftData.numOfDef + "D, " + draftData.numOfMid + "M, " + draftData.numOfRuc + "R, " + draftData.numOfFwd + "F, " + draftData.numOfBen + "Bench) </li>" +
								"<li> Budget: $" + draftData.budget + "</li>" +
								"<li> Select Countdown: " + draftData.selectCountdown + " seconds per selection</li>" +
								"<li> Bid Countdown: " + draftData.bidCountdown + " seconds per bid</li>" +
								"</ul>" +
								"<h3>Your draft can't start until all coaches haved signed up with the below email addresses and joined the draft!</h3><br>" +
								"<ul>" +
								emailListHTML +
								"</ul>" +
								"<h4> *Important Note: SuperDraft is not designed for running your fantasy football competition, it is simply intended to allow you to conduct your draft in an Auction format! As a result, your drafted teams will need to be input into the Supercoach/AFL Fantasy website after your draft is complete. In order to do this, you simply run a normal Snake Draft and plug in the teams manually.</h4><br>"
								"<p> For any enquries please feel free to respond to this email (SuperDraftFantasy@gmail.com)! We'd be happy to hear from you with any feedback, issues, improvements or questions!</p>"
			// Send the email when the users submits the create draft form.
			transporter.sendMail(coachesMailOptions, function(error, info){
				if (error){
					console.log(error);
				} else {
					console.log('Coaches Email Sent: ' + info.response);
				}
			}); // Close transporter.sendMail(adminMailOptions).



			// Define the parameters for the adminMail to be sent.
			var adminMailOptions = {
				from: 'Superdraftfantasy@gmail.com',
				to: adminMailingList,
				subject: draftData.leagueName + " It's Drafting Time!",
				text: adminBodyText
			};
			// Use nodemailer to send an email to the admin coach when they create a draft.
			var adminMailingList = draftData.coaches[0].teamName;
			// Create the text.
			var adminBodyText = "<h1>You have successfully created a SuperDraft! </h1><br>" + 
								"<h2>Get your league members to sign-up with the email addresses below and visit www.superdraftfantasy.com/myDrafts to get drafting!</h2><br>" +
								"<h3>IMPORTANT: Please ensure that all users sign up with the email addresses that you invited below!</h3><br>" +
								"<ul>" +
								"<li> League Name: " + draftData.leagueName + "</li>" +
								"<li> League Type: " + draftData.leagueType + "</li>" +
								"<li> Admin: " + draftData.admin + "</li>" +
								"<li> Roster Size: " + draftData.rosterSize + " (" + draftData.numOfDef + "D, " + draftData.numOfMid + "M, " + draftData.numOfRuc + "R, " + draftData.numOfFwd + "F, " + draftData.numOfBen + "Bench) </li>" +
								"<li> Budget: $" + draftData.budget + "</li>" +
								"<li> Select Countdown: " + draftData.selectCountdown + " seconds per selection</li>" +
								"<li> Bid Countdown: " + draftData.bidCountdown + " seconds per bid</li>" +
								"</ul>" +
								"<h3>Your draft can't start until all coaches sign up with the below email addresses and join the draft!</h3><br>" +
								"<ul>" +
								emailListHTML +
								"</ul>" +
								"<h4> *Important Note: SuperDraft is not designed for running your fantasy football competition, it is simply intended to allow you to conduct your draft in an Auction format! As a result, your drafted teams will need to be input into the Supercoach/AFL Fantasy website after your draft is complete. In order to do this, you simply run a normal Snake Draft and plug in the teams manually.</h4><br>"
								"<p> For any enquries please feel free to respond to this email (SuperDraftFantasy@gmail.com)! We'd be happy to hear from you with any feedback, issues, improvements or questions!</p>"
			// Send the email when the users submits the create draft form.
			transporter.sendMail(adminMailOptions, function(error, info){
				if (error){
					console.log(error);
				} else {
					console.log('Admin Email Sent: ' + info.response);
				}
			}); // Close transporter.sendMail(adminMailOptions).
	*/
	} else {
		return res.render("create", {reqBodyFail: req.body})
	}
});



}; // Close module.exports.
