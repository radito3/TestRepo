var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/loginapp';
//var elapsedTime = require('../public/js/sudokuAlg.js'); <- } )( jQuery ); <- jQuery not defined

router.get('/', function(req, res){
	res.render('index');
});

// When the check() operation is successful
// this should be executed
// Don't know how though
router.post('/', function(req, res) {
	// Tested, working as it should
	var updateTimes = function(db, callback) {
		db.collection('users').updateOne(
			// Need to figure out how to get elapsedTime from sudokuAlg.js
			{"_id": ObjectId(req.user._id.toString())}, {$push: {times: elapsedTime}},
			function(err, results) {
				if (err) console.log(err);
				console.log(results);
				callback();
		});
	};

	MongoClient.connect(url, function(err, db) {
		if (err) console.log(err);
		updateRestaurants(db, function() {
			db.close();
		});
	});
});

router.get('/solver', loggedIn, function(req, res) {
	res.render('indexSolve');
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;
