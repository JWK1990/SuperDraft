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
	}
})



var PlayersSchema = new mongoose.Schema({
	name: {
		type: String
	},
	position: {
		type: String
	},
	price: {
		type: Number
	}
})




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
	}
});

var Draft = mongoose.model("Draft", DraftSchema, "draftData");
module.exports = Draft;

