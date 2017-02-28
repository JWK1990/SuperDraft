var mongoose = require("mongoose");

var PlayerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	team: {
		type: String,
		required: true
	},
	position: {
		type: String,
		required: true
	},
	pos1: {
		type: String,
		required: true
	},
	pos2: {
		type: String,
		required: true
	},
	rank: {
		type: Number,
		required: true
	},
	scPrice: {
		type: Number
	},
	scChange: {
		type: Number
	},
	points16: {
		type: Number
	},
	games16: {
		type: Number
	},
	ave16: {
		type: Number
	},
	sd16: {
		type: Number
	},
	min16: {
		type: Number
	},
	max16: {
		type: Number
	},
	ave1To8: {
		type: Number
	},
	ave9To16: {
		type: Number
	},
	ave17To23: {
		type: Number
	},
	aveSCFinals: {
		type: Number
	},
	age: {
		type: Number
	},
	draftPrice16: {
		type: Number
	},
	draftTeam16: {
		type: String
	},
	draftPrice15: {
		type: Number
	},
	draftTeam15: {
		type: String
	},
	draftPrice14: {
		type: Number
	},
	draftTeam14: {
		type: String
	},
	points15: {
		type: Number
	},
	ave15: {
		type: Number
	},
	nabDraftPick: {
		type: Number
	},
	draftee16: {
		type: String
	}
});

PlayerSchema.statics.playerSearch = function(name){
	Player.find({"name":name}, function (err, docs){
		console.log(docs);
		return docs;
	})};

var Player = mongoose.model("Player", PlayerSchema, "playerData");

module.exports = Player;