User.findOne({email:req.body.email.toUpperCase()}, function(err,email){
	if(email != null){
		return res.render("register", {fail: " Email already in use!", dupEmail: req.body.email, reqBodyFail: req.body})
	}
}); // Close User.findOne(email).