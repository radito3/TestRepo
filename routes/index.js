var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', /*ensureAuthenticated, */function(req, res){
	res.render('index');
});

// not sure if needed
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

module.exports = router;