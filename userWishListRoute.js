module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
  var mysql = require('./dbcon.js');
	//var app = express();


  function getWishList(res, mysql, context, userid){

      mysql.pool.query("SELECT (@rownum := @rownum + 1) AS row_number, z.* " +
          "FROM (SELECT wish_list.order AS order_id, order.current_price, DATE_FORMAT(order.created_on, '%W, %M %e %Y, %I:%i %p') AS created_on, order_product.quantity, product.name AS product, promotion.description AS promotion, retailer.name AS retailer FROM wish_list " +
          "INNER JOIN `order` ON wish_list.order = order.id " +
          "INNER JOIN order_product ON order.id = order_product.order " +
          "INNER JOIN product ON order_product.product = product.id " +
          "LEFT JOIN order_promotion ON order.id = order_promotion.order " +
          "LEFT JOIN promotion ON order_promotion.promotion = promotion.id " +
          "INNER JOIN retailer ON order.retailer = retailer.id " +
          "WHERE wish_list.user = ? " +
          "ORDER BY order.created_on)z," +
         "(SELECT @rownum := 0)y", userid, function(err, rows){
          if(err){
              res.write(JSON.stringify(err));
              res.end();
          }
          context.list  = rows;
          res.render('wish_list/wishList', context);
      });
  }

	router.get('/', isLoggedIn, (req, res, next) => {
		context = {};
		context.css = ["userWishList.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
    context.user = req.user;

    getWishList(res, mysql, context, req.user.id);
});

router.delete('/:order_id', function(req, res){
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM wish_list WHERE wish_list.order = ?";
    var inserts = [req.params.order_id];
    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.status(202).end();
        }
    })
})

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

/* reference:
https://stackoverflow.com/questions/2520357/mysql-get-row-number-on-select
https://www.w3schools.com/sql/func_mysql_date_format.asp*/
