module.exports = app => {
	var express = require('express');
	var router = express.Router();
	//var app = express();

	//Route for an ESave request
	router.get('/', isLoggedIn, (req, res, next) => {
		var callbackCount = 0;
		var eSaveResults = [];
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		//For each product queried, find the lowest possible price (and associated retailer)
		//by applying all available promotions in table query.
		if(Object.keys(req.query).length !== 0){
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p" && key !== "page"){
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
												"(product.name = '" + req.query[key] + "' OR " +
												"'" + req.query[key] + "' = product.upc OR '" + req.query[key] +
												"' = product.model_number) " +
												"JOIN retailer ON (retailer_product.retailer = retailer.id  OR " +
												"retailer.id = '" + req.query.ret + "' OR retailer.name = '" + req.query.ret + "') " +
												"LEFT JOIN promotion ON promotion.retailer = retailer.id AND " +
												"(promotion.product = product.id OR promotion.product IS NULL) AND " +
												"(promotion.min_spend <= retailer_product.price * '" + req.query[qtKey] + "' "+
												"OR promotion.min_spend IS NULL) AND " +
												"(promotion.qt_required <= '" + req.query[qtKey] + "' OR promotion.qt_required IS NULL) " +
					 						  "GROUP BY retailer.id, product.id ORDER BY FINAL_PRICE ASC";
		      mysql.pool.query(queryString,
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);

							//Determine result row with minimum price
							let minPrice = Number.MAX_SAFE_INTEGER, minRowNumber = 0;
							rows.forEach( (row, i) => {
								if(Number(row["FINAL_PRICE"]) < minPrice){
									minPrice = Number(row["FINAL_PRICE"]);
									minRowNumber = i;
								}
							});
							//Save row with minimum price
							if(rows[minRowNumber]){
		          	eSaveResults.push(rows[minRowNumber]);
								complete();
							}

							//If no results are matched for user's query, provide a list of 10
							//suggestions instead.
							else{
								queryString = "SELECT product.name FROM product JOIN " +
															"retailer_product ON product.id = retailer_product.product " +
															" WHERE product.name LIKE '%" +
															req.query[key] + "%' OR retailer_product.description LIKE '%" +
															req.query[key] + `%' LIMIT 11`;
								mysql.pool.query(queryString, (err, suggested, fields) => {
									if(err){
					          res.write(JSON.stringify(err));
					          res.end();
					        }
					        else{
										//console.log(suggested);
										eSaveResults.push({ "suggested" : suggested,
																				"prodNum" : Number(key.substring(1))});
										complete();
								}
							});
		        }
		      }
		    });
		  }
		}
	}
		//If no ESave criteria are specified, render page.
		else{
			context.user = req.user.username;
			res.render('search/search', context)
		}

		//Function to track number of products queried, and send results to client
		//only after all queried products are returned
		function complete(){
			callbackCount++;
			if(callbackCount >= ((Object.keys(req.query).length - 1) / 2)){
				//console.log(eSaveResults);
				res.send(JSON.stringify(eSaveResults));
			}
		}
	});

	//Route for a suggested products 'next page' request
	router.get('/:page', isLoggedIn, (req, res, next) => {
		let mysql = req.app.get('mysql');
		let queryString = "SELECT DISTINCT product.name FROM product JOIN " +
											"retailer_product ON product.id = retailer_product.product " +
											" WHERE product.name LIKE '%" +
											req.query["p"] + "%' OR retailer_product.description LIKE '%" +
											req.query["p"] + `%' LIMIT ${Number(req.params.page) * 10}, 11`;
		mysql.pool.query(queryString, (err, suggested, fields) => {
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				//console.log(suggested);
				res.send(JSON.stringify(suggested));
		}
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
	res.redirect('/');
}


// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
// * https://stackoverflow.com/questions/5223/length-of-a-javascript-object
// * https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html#function_truncate
// * https://www.w3resource.com/mysql/string-functions/mysql-format-function.php
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
// * https://blog.udemy.com/sql-limit/
