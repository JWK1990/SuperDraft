var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({

	local: {
        email		: String,
        password	: String,
        name		: String
	},

    facebook: {
        id			: String,
        token		: String,
        email		: String,
        name		: String
    },

    twitter: {
        id			: String,
        token		: String,
        email		: String,
        name		: String
    },

    google: {
        id			: String,
        token		: String,
        email		: String,
        name		: String
    },

    drafts: {
    	type		: Array
    }

}); // Close UserSchema.


// hash password before saving to database.
UserSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, 10);
};

UserSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
};


var User = mongoose.model("User", UserSchema);

module.exports = User;
