var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/loginapp';
var elapsedTime = 20;//require('../public/js/sudokuAlg.js'); <- } )( jQuery ); <- jQuery not defined

router.get('/', function(req, res){
	res.render('index', {user: (req.user ? true : false)});
});

router.get('/solved', function(req, res) {
	console.log('in solved');
	// Tested, working
	var updateTimes = function(db, callback) {
		db.collection('users').updateOne(
			// Need to figure out how to get elapsedTime from sudokuAlg.js
			{"_id": ObjectId(req.user._id.toString())}, {$push: {times: elapsedTime}},
			function(err, results) {
				if (err) console.log(err);
				//console.log(results);  I have confirmed that it works correctly
				callback();
			}
		);
	};

	MongoClient.connect(url, function(err, db) {
		if (err) console.log(err);
		updateTimes(db, function() {
			db.close();
		});
	});

	req.flash('success_msg', 'Puzzle completed in ' + elapsedTime + ' seconds');
	res.redirect('/');  // need to not redirect but just show the message and keep the solved puzzle with green border
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/solver', loggedIn, function(req, res) {
	res.render('indexSolve');
});

router.get('/about', function(req, res) {
	res.render('about');
});

module.exports = router;
