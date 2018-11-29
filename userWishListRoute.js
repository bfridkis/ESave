module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
  var mysql = require('./dbcon.js');
	//var app = express();

  function getWishList(res, mysql, context, userid){
      mysql.pool.query("SELECT order.current_price, order_product.quantity, product.name AS product, retailer.name AS retailer FROM wish_list " +
      "INNER JOIN `order` ON wish_list.order = order.id " +
      "INNER JOIN order_product ON order.id = order_product.order " +
      "INNER JOIN product ON order_product.product = product.id " +
      `INNER JOIN retailer ON order.retailer = retailer.id WHERE wish_list.user = 2`, function(err, rows){
          if(err){
              res.write(JSON.stringify(err));
              res.end();
          }
          context.list  = rows;
      });
  }

	router.get('/', isLoggedIn, (req, res, next) => {
		context = {};
		//context.css = ["userWishList.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
    context.user = req.user;

    getWishList(res, mysql, context, req.user.id);
		console.log(context.list);//*********************************

    res.render('wish_list/wishList', context);
});

return router;

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/');
}
