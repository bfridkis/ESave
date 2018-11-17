module.exports = () => {
	var express = require('express');
	var router = express.Router();
	var app = express();

	router.get('/', (req, res, next) => {
		//var searchRouteEsave = req.app.get('./searchRouteEsave');
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log(req.query); //*************************
		if(Object.keys(req.query).length !== 0){
			var eSaveResults = [];
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p"){
		      qtKey = "q" + key.substring(1);
		      mysql.pool.query("select * from user",
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);
		          eSaveResults.push(JSON.stringify(rows[0]));
		        }
						console.log(eSaveResults);
						res.send(eSaveResults);
		      });
		    }
		  }
		}

		else{
			res.render('search/search', context)
		}
	});

	return router;
};

// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
