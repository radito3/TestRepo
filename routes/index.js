var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/loginapp';

router.get('/', function(req, res){
	res.render('index');
});

router.get('/solved', function(req, res) {
	var elapsed = 30;//process.elapsed; //undefined
	var updateTimes = function(db, callback) {
		db.collection('users').updateOne(
			{"_id": ObjectId(req.user._id.toString())}, {$push: {times: elapsed}},
			function(err, results) {
				if (err) throw err;
				callback();
			}
		);
	};

	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		updateTimes(db, function() {
			db.close();
		});
	});

	req.flash('success_msg', 'Puzzle completed in ' + elapsed + ' seconds');
	res.redirect('/');
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

router.get('/allUsers', isAdmin, function(req, res) {
	var users = [];
	var getAllUsers = function(db, callback) {
		var cursor = db.collection('users').find();
		cursor.each(function(err, doc) {
			if (err) console.log(err);
			if (doc != null) {
				users.push(doc);
			} else {
				callback();
			}
		});
	};

	MongoClient.connect(url, function(err, db) {
		if (err) console.log(err);
		getAllUsers(db, function() {
			db.close();
		});
	});

	res.render('allUsers', {users: users});
});

function isAdmin(req, res, next) {
    if (req.user.email == "alabala@abv.bg") {
        next();
    } else {
    	req.flash('error_msg', 'You do not have permition to access that page');
        res.redirect('/');
    }
}

module.exports = router;
