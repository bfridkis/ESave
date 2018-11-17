module.exports = () => {
	var express = require('express');
	var router = express.Router();
	var app = express();

	router.get('/', (req, res, next) => {
		var searchRouteEsave = req.app.get('./searchRouteEsave');
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log(req.query); //*************************
		if(Object.keys(req.query).length !== 0){
			console.log(typeof(searchRouteEsave));
			searchRouteEsave(req, res, context);
		}
		else{
			res.render('search/search', context)
		}
	});

	return router;
};

// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
