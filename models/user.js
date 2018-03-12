var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

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

/* Original UserSchema.
var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
	},
	drafts: {
		type: Array
	},
});
*/

}); // Close UserSchema.

/*
// authenticate input against database documents.
UserSchema.statics.authenticate = function(email, password, callback){
	User.findOne({email: email})
		.exec(function (error, user){
			if (error){
				return callback(error);
			} else if (!user){
				var err = new Error("User not found.");
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function(error, result){
				if (result === true){
					return callback(null, user);
				} else {
					return callback();
				}
			})
		});
}
*/

// hash password before saving to database.
UserSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, 10);
};

UserSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
};

/*

// hash password before saving to database.
UserSchema.pre("save", function(next){
	// Only hash the password on registration if the user is authenticated by an email signup rather than a Facebook sign up.
		var user = this;
		bcrypt.hash(user.password, 10, function(err, hash){
			if (err){
				return next(err);
			}
		user.password = hash;
		next();
		});
});

*/


var User = mongoose.model("User", UserSchema);

module.exports = User;
