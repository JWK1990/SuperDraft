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
		type: String,
		required: true
	},
	points: {
		type: String
	},
	games: {
		type: String
	},
	ave: {
		type: String
	},
	stdDev: {
		type: String
	},
	age: {
		type: String
	},
	bye: {
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