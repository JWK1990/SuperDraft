var mongoose = require("mongoose");

var ResultsSchema = new mongoose.Schema({
	name: {
		type: String
	},
	position: {
		type: String
	},
	price: {
		type: Number
	},
	team: {
		type: String
	},
	average: {
		type: String
	}
});



var PlayersSchema = new mongoose.Schema({
	name: {
		type: String
	},
	position: {
		type: String
	},
	price: {
		type: Number
	},
	average: {
		type: String
	},
	originalPosition: {
		type: String
	}
});



var CoachSchema = new mongoose.Schema({
	teamName: {
		type: String
	},
	budget: {
		type: Number
	},
	numOfPlayers:{
		type: Number
	},
	players: {
		type: [PlayersSchema]
	},
	teamName2: {
		type: String
	},
	benchCount: {
		type: Number
	},
	rosterSpots: {
		type: Array
	}
});



var DraftSchema = new mongoose.Schema({
	leagueName: {
		type: String,
		required: true
	},
	draftYear: {
		type: Number,
		required: true,
		trim: true
	},
	numOfCoaches: {
		type: Number,
		required: true,
		trim: true
	},
	rosterSize: {
		type: Number,
		required: true,
		trim: true
	},
	numOfDef: {
		type: Number,
		required: true,
		trim: true
	},
	numOfFwd: {
		type: Number,
		required: true,
		trim: true
	},	
	numOfRuc: {
		type: Number,
		required: true,
		trim: true
	},
	numOfMid: {
		type: Number,
		required: true,
		trim: true
	},
	numOfBen: {
		type: Number,
		required: true,
		trim: true
	},
	admin: {
		type: String
	},
	coaches: {
		type: [CoachSchema]
	},
	otbPlayer: {
		type: String
	},
	otbPos: {
		type: String
	},
	otbAverage: {
		type: String
	},
	otbBid: {
		type: Number
	},
	otbBidder: {
		type: String
	},
	otbEndTime: {
		type: String
	},
	otbCoach: {
		type: String
	},
	pickCounter: {
		type: Number
	},
	results: {
		type: [ResultsSchema]
	},
	selectCountdown: {
		type: Number
	},
	bidCountdown: {
		type: Number
	},
	leagueType: {
		type: String
	}
});

var Draft = mongoose.model("Draft", DraftSchema, "draftData");
module.exports = Draft;

