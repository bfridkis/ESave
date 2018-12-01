module.exports = (app) => {
	var express = require('express');
  var router = express.Router();
  var app = express();

  var bodyParser = require('body-parser');
	var jsonParser = bodyParser.json();
	app.use(bodyParser.urlencoded({ extended: true }))

  //get route - if someone goes to /promotion
  router.get('/', isLoggedIn, (req, res, next) => {
    var context = {};
    //context.jsGreatDeals = "promotion.js"
    let mysql = req.app.get('mysql');

    mysql.pool.query("SELECT product.name AS product_name, promotion.product, retailer.name AS retailer_name, " +
										 "promotion.discount, promotion.description, promotion.ecoupon, promotion.qt_required, promotion.id, " +
										// "retailer.id AS RET_ID " +
                    "FROM promotion " +
                    "INNER JOIN retailer on retailer.id=promotion.retailer " +
                    "INNER JOIN product on promotion.product=product.id", function(error, results, fields){
	  	if(error){
	    		res.write(JSON.stringify(error));
	    		res.end();
	  	}
      context.promotions = results;
      context.navbarLogo = ["images/logo.jpg"];
      context.css = ["promotionPage.css"];
      context.user = req.user;
      //context.js = ["promotion.js"];
      res.render('promotion/promotion',context);
			//res.render('/', context);
	 });

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
