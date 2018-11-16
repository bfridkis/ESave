module.exports = () => {
	var express = require('express');
	var router = express.Router();
	var app = express();

	router.get('/search', (req, res, next) => {
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log(req.query); //*************************
		if(req.query){
	    let searchRouteEsave = req.app.get('searchRouteEsave');
			searchRouteEsave(req, res, context);
		}
		else{
			res.render('search/search', context)
		}
	});
};
