function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  return next();
}

function requiresLogin(req, res, next){
	if (req.session && req.session.userId){
		return next();
	} else {
		return res.render("login", {title: "Log In", fail:" Session expired, please log in again!"});
	}
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;