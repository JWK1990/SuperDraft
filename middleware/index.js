function loggedOut(req, res, next) {
// If the user is authenticated then we will have a req.user.
  if (req.user) {
    return res.redirect('/profile');
  }
  return next();
}

// If the user is not authenticated then we will not have a req.user.
function requiresLogin(req, res, next){
	if (req.user || req.session.name){
		return next();
	} else {
		return res.render("login", {title: "Log In", fail:" Session expired, please log in again!"});
	}
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;