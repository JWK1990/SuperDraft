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
		type: String
	},
	scChange: {
		type: String
	},
	points16: {
		type: String
	},
	games16: {
		type: String
	},
	ave16: {
		type: String
	},
	sd16: {
		type: String
	},
	min16: {
		type: String
	},
	max16: {
		type: String
	},
	ave1To8: {
		type: String
	},
	ave9To16: {
		type: String
	},
	ave17To23: {
		type: String
	},
	aveSCFinals: {
		type: String
	},
	age: {
		type: String
	},
	draftPrice16: {
		type: String
	},
	draftTeam16: {
		type: String
	},
	draftPrice15: {
		type: String
	},
	draftTeam15: {
		type: String
	},
	draftPrice14: {
		type: String
	},
	draftTeam14: {
		type: String
	},
	points15: {
		type: String
	},
	ave15: {
		type: String
	},
	nabDraftPick: {
		type: String
	},
	draftee16: {
		type: String
	},
	drafted: {
		type: Boolean
	}
});

PlayerSchema.statics.playerSearch = function(name){
	Player.find({"name":name}, function (err, docs){
		console.log(docs);
		return docs;
	})};

var Player = mongoose.model("Player", PlayerSchema, "playerData");

module.exports = Player;