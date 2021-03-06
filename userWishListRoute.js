module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
  var mysql = require('./dbcon.js');
	//var app = express();

	//Function to display user's wish_list contents
  function getWishList(res, mysql, context, userid){
			var callbackCount = 0;
			//Select all orders in user's wishlist from database
			let selectQuery = "SELECT wish_list.order, order.current_price, order.name, " +
												"DATE_FORMAT(order.created_on, '%W, %M %e %Y, %I:%i %p') AS created_on, " +
												"retailer.name AS retailer FROM wish_list JOIN `order` " +
												"ON order.id = wish_list.order " +
												"JOIN retailer ON retailer.id = order.retailer " +
												`WHERE order.user = ${userid}`;
			mysql.pool.query(selectQuery, (err, orders, next) => {
				if(err){
						res.write(JSON.stringify(err));
						res.end();
				}
				else{
					if(orders.length > 0){
						var list = [];
						//For each order, populate the "list" array with pertinent order-related data.
						orders.forEach((order, i) => {
							list.push({});
							list[i]["current_price"] = order.current_price;
							if(order.name){list[i]["name"] = order.name;}
							list[i]["created_on"] = order.created_on;
							list[i]["retailer"] = order.retailer;
							list[i]["order_id"] = order.order;
							//Select each product and quantity associated with each wishlist order
							selectQuery = "SELECT product.name AS product, order_product.quantity FROM product " +
														"JOIN order_product ON product.id = order_product.product " +
														"JOIN `order` ON order.id = order_product.order " +
														"JOIN wish_list ON order.id = wish_list.order " +
														`WHERE wish_list.user = ${userid} AND wish_list.order = ${order.order}`;
							mysql.pool.query(selectQuery, (err, orderProducts, next) => {
								if(err){
										res.write(JSON.stringify(err));
										res.end();
								}
								else{
									//For each wishlist order product, populate "products" object with
									//name and quantity
									list[i]["products"] = [];
									orderProducts.forEach((orderProduct, j) => {
										list[i]["products"].push({});
										list[i]["products"][j]["name"] = orderProduct.product;
										list[i]["products"][j]["qt"] = orderProduct.quantity;
									});
									list[i]["num_prods"] = list[i]["products"].length;

									//Lastly, for each wishlist order, select all promotions available
									selectQuery = "SELECT promotion.description FROM promotion " +
																"JOIN order_promotion on promotion.id = order_promotion.promotion " +
																`WHERE order_promotion.order = ${order.order}`;
									mysql.pool.query(selectQuery, (err, orderPromotions, next) => {
										if(err){
												res.write(JSON.stringify(err));
												res.end();
										}
										else{
											callbackCount++;
											if(orderPromotions.length){
												//Populate "promotions" key with list of promotion descriptions.
												list[i]["promotions"] = [];
												orderPromotions.forEach(orderPromotion => {
													list[i]["promotions"].push(orderPromotion.description);
												});
											}
											//If all orders have been queried, sort by created_on and
											//render page with wishlist data.
											if(callbackCount === orders.length){
												list.sort(compare);
												list.forEach((order, i) => {
													order["row_number"] = i + 1;
												});
												context.list = list;
												res.render('wish_list/wishList', context);
											}
										}
									});
								}
						});
					});
				}
			}
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

function compare(a, b){
	return a.created_on - b.created_on;
}

/* reference:
https://stackoverflow.com/questions/2520357/mysql-get-row-number-on-select
https://www.w3schools.com/sql/func_mysql_date_format.asp*/
