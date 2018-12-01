module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
	//var app = express();

	router.get('/', isLoggedIn, (req, res, next) => {
		var callbackCount = 0;
		var eSaveResults = [];
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log("This is the query: ", req.query);//******************************
		if(Object.keys(req.query).length !== 0){
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p"){
		      let qtKey = "q" + key.substring(1);
					queryString = "select product.id AS PROD_ID, retailer.id AS RET_ID, " +
												"product.name AS PROD_NAME, retailer.name AS RET_NAME, " +
												"retailer.web_address AS RET_WEB_ADD, " +
												"FORMAT(retailer_product.price * '" + req.query[qtKey] + "', 2) AS INITIAL_PRICE, " +
												"FORMAT(retailer_product.price, 2) AS PRICE_PER_UNIT, " +
												"case " +
												"    when sum(promotion.discount) IS NULL then FORMAT(retailer_product.price * " +
												"         '" + req.query[qtKey] + "' + retailer.shipping_price, 2) " +
												"    else FORMAT(retailer_product.price * '" + req.query[qtKey] + "' + " +
												"         retailer.shipping_price - sum(promotion.discount), 2) " +
												"		 end AS FINAL_PRICE, " +
												"FORMAT(retailer.shipping_price, 2) AS SHIPPING_PRICE, " +
												"case  " +
												"     when sum(promotion.discount) IS NULL then 0.00 " +
												"     else FORMAT(sum(promotion.discount), 2) " +
												"     end AS TOTAL_DISCOUNT, " +
												req.query[qtKey] + " AS QT " +
												"from product join retailer_product ON product.id = retailer_product.product AND " +
												"(product.name LIKE '%" + req.query[key] + "%' OR " +
												"'" + req.query[key] + "' = product.upc OR '" + req.query[key] +
												"' = product.model_number OR retailer_product.description LIKE '%" + req.query[key] + "%') " +
												"JOIN retailer ON retailer_product.retailer = retailer.id  AND " +
												"(retailer.id = '" + req.query.ret + "' OR retailer.name = '" + req.query.ret + "') " +
												"LEFT JOIN promotion ON promotion.retailer = retailer.id AND " +
												"(promotion.product = product.id OR promotion.product IS NULL) AND " +
												"(promotion.min_spend <= retailer_product.price * '" + req.query[qtKey] + "' "+
												"OR promotion.min_spend IS NULL) AND " +
												"(promotion.qt_required <= '" + req.query[qtKey] + "' OR promotion.qt_required IS NULL) " +
					 						  "GROUP BY retailer.id, product.id ORDER BY FINAL_PRICE ASC LIMIT 1";
		      mysql.pool.query(queryString,
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);
		          eSaveResults.push(rows[0]);
							complete();
		        }
		      });
		    }
		  }
		}

		else{
			context.user = req.user.username;
			res.render('search/search', context)
		}

		function complete(){
			callbackCount++;
			if(callbackCount >= (Object.keys(req.query).length / 2) - 1){
				console.log(eSaveResults);
				res.send(JSON.stringify(eSaveResults));
			}
		}
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


// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
// * https://stackoverflow.com/questions/5223/length-of-a-javascript-object
// * https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html#function_truncate
// * https://www.w3resource.com/mysql/string-functions/mysql-format-function.php
