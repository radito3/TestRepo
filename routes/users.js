var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/loginapp';

var User = require('../models/user');

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
			//maybe times on sudoku solutions
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown User'});
			}

		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) throw err;
			if(isMatch){
				return done(null, user);
			} else {
				return done(null, false, {message: 'Invalid password'});
			}
		});
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local',
		{successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}
	), function(req, res) {
		res.redirect('/');
});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/');
});

router.get('/times', loggedIn, function(req, res) {
	var findTimes = function(db, callback) {
		// Tested, working
		var cursor = db.collection('users').find({"_id": ObjectId(req.user._id.toString())}, {times:1});
		// This returns something strange
		cursor.each(function(err, doc) {
			if (err) console.log(err);
			if (doc != null) {

				console.log(req.user._id); //this is the correct id

				console.dir(doc);
			} else {
				callback();
			}
		});
	};

	MongoClient.connect(url, function(err, db) {
		if (err) console.log(err);
		findTimes(db, function() {
			db.close();
		});
	});

	res.render('times'); //should be rendered with the times
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;
