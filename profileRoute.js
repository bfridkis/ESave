module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
	var express = require('express');
	var app = express();
	var multer  = require('multer');
	var upload = multer({ dest: 'views/' });

	//var app = express();
	var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	app.use(bodyParser.urlencoded({ extended: true }))

	router.get('/', isLoggedIn, (req, res, next) => {
		var callbackCount = 0;
		context = {};
		let mysql = req.app.get('mysql');
		var user_name  = req.user.username;

		mysql.pool.query(`SELECT * FROM User WHERE Username = '${user_name}'`, function(error, results, fields){
	  	if(error){
	    		res.write(JSON.stringify(error));
	    		res.end();
	  	}
			context.jsscriptsProfilePage = "profile.js";
			context.user = req.user;
			context.navbarLogo = ["images/logo.jpg"];
			res.render('profile/profile', context);
	 });

router.post('/', jsonParser, (req, res, next) => {
			var context = {};
			var id = req.user.id; //won't change, good to use so sql knows which user to update
			let mysql = req.app.get('mysql');

			/****which fields need changed?****/

			///////username
			if(req.user.username != req.body.username) {
				//console.log('username different');

				//make user username new username
				req.user.username = req.body.username;
				var username = req.user.username;

				//send it
				//console.log(username);
				mysql.pool.query(`UPDATE user SET username = "${username}" WHERE id = "${id}"`,
				function(err, res, fields){
			  	if(err){
			    		console.log(JSON.stringify(err));
			  	}
					else {
						console.log('UPDATE USERNAME QUERY SUCCESSFUL');
						//console.log(res);
					}
				});
			}

			///////firstname
			if(req.user.first_name != req.body.firstname) {
				//console.log('first name different');
				//make user firstname new firstname
				req.user.first_name = req.body.firstname;
				//send it
				var firstname = req.user.first_name;
				//console.log(firstname);
				mysql.pool.query(`UPDATE user SET first_name = "${firstname}" WHERE id = "${id}"`,
				function(err, res, fields){
			  	if(err){
			    		console.log(JSON.stringify(err));
			  	}
					else {
						console.log('UPDATE FIRST NAME QUERY SUCCESSFUL');
						//console.log(res);
					}
				});
			}

			///////lastname
			if(req.user.last_name != req.body.lastname) {
			//	console.log('last name different');
				//make user lastname new lasrtname
				req.user.last_name = req.body.lastname;
				//send it
				var lastname = req.user.last_name;
			//	console.log(lastname);
				mysql.pool.query(`UPDATE user SET last_name = "${lastname}" WHERE id = "${id}"`,
				function(err, res, fields){
			  	if(err){
			    		console.log(JSON.stringify(err));
			  	}
					else {
						console.log('UPDATE LAST NAME QUERY SUCCESSFUL');
						//console.log(res);
					}
				});
			}

			///////email
			if(req.user.email != req.body.email) {
				//console.log('email different');
				//make user email new email
				req.user.email = req.body.email;
				//send it
				var email = req.user.email;
				//console.log(email);
				mysql.pool.query(`UPDATE user SET email = "${email}" WHERE id = "${id}"`,
				function(err, res, fields){
					if(err){
							console.log(JSON.stringify(err));
					}
					else {
						console.log('UPDATE EMAIL QUERY SUCCESSFUL');
						//console.log(res);
					}
				});
			}

			context.user = req.user;
			context.navbarLogo = ["images/logo.jpg"];
			res.render('profile/profile', context);
});

		/*function complete(){
			callbackCount++;
			if(callbackCount){
				res.render('profile/profile', context);
			}
		}*/
	});
	return router;
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/login');
}
