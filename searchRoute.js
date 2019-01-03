module.exports = app => {
	var express = require('express');
	var router = express.Router();
	//var app = express();

	//Route for an ESave request
	router.get('/', isLoggedIn, (req, res, next) => {
		var callbackCount = 0, callbackCount2 = 0;
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
												"         '" + req.query[qtKey] + "', 2) " +
												"    else FORMAT(retailer_product.price * '" + req.query[qtKey] + "'" +
												"         - sum(promotion.discount), 2) " +
												"		 end AS DISCOUNTED_PRICE, " +
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
												"(promotion.product = product.id) AND " +
												"(promotion.min_spend <= retailer_product.price * '" + req.query[qtKey] + "' "+
												"OR promotion.min_spend IS NULL) AND " +
												"(promotion.qt_required <= '" + req.query[qtKey] + "' OR promotion.qt_required IS NULL) " +
					 						  "GROUP BY retailer.id, product.id ORDER BY DISCOUNTED_PRICE ASC";
		      mysql.pool.query(queryString,
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);

							//Save results for each product, if any are returned
							if(rows[0]){
		          	eSaveResults.push({"results" : rows,
																	 "prodNum" : Number(key.substring(1))
																 });
								complete();
							}

							//If no results are matched for user's query, provide a list of 10
							//suggestions instead.
							else{
								queryString = "SELECT DISTINCT product.name FROM product JOIN " +
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

				let someProductsUnmatched = eSaveResults.some( result => {
					if(result.hasOwnProperty("suggested")){
						eSaveResults.sort(compare);
						console.log("Sending Suggested");//***********************************
						res.send(JSON.stringify(eSaveResults));
						return result.hasOwnProperty("suggested")
					}
				})

				if(!someProductsUnmatched){
					var resultsTotalsByRetailer = {};
					eSaveResults.forEach( (productResults, i) => {
						productResults.results.forEach( result => {
							if(resultsTotalsByRetailer.hasOwnProperty(result.RET_NAME)){
								//Use scaling where necessary to ensure all values are rounded to 2 decimal places
								//See https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
								let discount_pri = Number(result.DISCOUNTED_PRICE);
								resultsTotalsByRetailer[result.RET_NAME]["discounted_price"] +=
									discount_pri.toFixed(2);
								console.log("What the... ", resultsTotalsByRetailer[result.RET_NAME]["discounted_price"]);//*******
								resultsTotalsByRetailer[result.RET_NAME]["discount"] +=
									Math.round(Number(result.TOTAL_DISCOUNT) + 0.00001) * 100 / 100;
								resultsTotalsByRetailer[result.RET_NAME]["initial_price"] +=
									Math.round(Number(result.INITIAL_PRICE) + 0.00001) * 100 / 100;
								resultsTotalsByRetailer[result.RET_NAME]["prices"][productResults.prodNum]
									= Number(result.PRICE_PER_UNIT);
								resultsTotalsByRetailer[result.RET_NAME]["num_prods"]++;
							}
							else{
								resultsTotalsByRetailer[result.RET_NAME] = {};
								resultsTotalsByRetailer[result.RET_NAME]["discounted_price"] = Number(result.DISCOUNTED_PRICE);
								resultsTotalsByRetailer[result.RET_NAME]["shipping_price"] = Number(result.SHIPPING_PRICE);
								resultsTotalsByRetailer[result.RET_NAME]["discount"] = Number(result.TOTAL_DISCOUNT);
								resultsTotalsByRetailer[result.RET_NAME]["initial_price"] = Number(result.INITIAL_PRICE);
								resultsTotalsByRetailer[result.RET_NAME]["prices"] = {};
								resultsTotalsByRetailer[result.RET_NAME]["prices"][productResults.prodNum]
									= Number(result.PRICE_PER_UNIT);
								resultsTotalsByRetailer[result.RET_NAME]["num_prods"] = 1;
								resultsTotalsByRetailer[result.RET_NAME]["ret_id"] = result.RET_ID;
							}
						});
					});
					for(retailer in resultsTotalsByRetailer){
						if(resultsTotalsByRetailer[retailer]["num_prods"] !==
								(Object.keys(req.query).length - 1) / 2){
									delete resultsTotalsByRetailer[retailer];
						}
					}
					console.log("eligible retailer count: ", Object.keys(resultsTotalsByRetailer).length);//*****
					let mysql = req.app.get('mysql');
					for(retailer in resultsTotalsByRetailer){
						queryString = "SELECT promotion.discount, promotion.min_spend, promotion.ecoupon, " +
													"promotion.description, retailer.name AS ret_name " +
													"FROM promotion JOIN retailer " +
													"ON promotion.retailer = retailer.id WHERE " +
													`promotion.retailer = '${resultsTotalsByRetailer[retailer]["ret_id"]}' ` +
													"AND promotion.qt_required IS NULL AND (promotion.min_spend IS NULL OR " +
													`promotion.min_spend <= '${resultsTotalsByRetailer[retailer]["discounted_price"]}') ` +
													"ORDER BY promotion.discount DESC";
						mysql.pool.query(queryString, (err, discounts, fields) => {
							if(err){
								res.write(JSON.stringify(err));
								res.end();
							}
							else{
								//Greedy algorithm to apply non-product specfic promotions. The largest
								//discount possible is applied, followed by any smaller discounts from
								//largest to smallest.
								if(discounts.length > 0){
									let ret_name = discounts[0]["ret_name"];
									discounts.forEach( discount => {
										if(resultsTotalsByRetailer[ret_name]["discounted_price"] >=
											Number(discount.discount)){
												resultsTotalsByRetailer[ret_name]["discount"] +=
													Number(discount.discount);
												resultsTotalsByRetailer[ret_name]["discounted_price"] -=
													Number(discount.discount);
											}
										});
									}
									complete2();
								}
							});
						}
					}
				}

			//Compare function used for sorting final array of result objects when
			//not all products can be matched.
			//See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
			function compare(a, b){
				return a.prodNum - b.prodNum;
			}

			//Compare function used for sorting final array of result objects when
			//not all products can be matched.
			//See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
			function compare2(a, b){
				return a.prodNum - b.prodNum;
			}

			//Secondary complete function to track callbacks while each eligible retailer's
			//non-product specific promotions are applied (using a greedy technique, see above)
			//as available.
			function complete2(){
				callbackCount2++;
				console.log("Callbackcount2: ", callbackCount2);//*********************
				if(Object.keys(resultsTotalsByRetailer).length
						&& callbackCount2 === Object.keys(resultsTotalsByRetailer).length){
					let minFinalPrice = Number.MAX_SAFE_INTEGER, minFinalPriceRetailer;
					for(key in resultsTotalsByRetailer){
						if(resultsTotalsByRetailer[key]["discounted_price"] < minFinalPrice){
									minFinalPrice = resultsTotalsByRetailer[key]["discounted_price"];
									minFinalPriceRetailer = key;
						}
					}
					delete resultsTotalsByRetailer[minFinalPriceRetailer]["ret_id"];
					resultsTotalsByRetailer[minFinalPriceRetailer]["retailer"] = minFinalPriceRetailer;
					console.log("Winner :", resultsTotalsByRetailer[minFinalPriceRetailer]);//**************
					res.send(JSON.stringify([resultsTotalsByRetailer[minFinalPriceRetailer]]));
				}
				else if(callbackCount2 === Object.keys(resultsTotalsByRetailer).length){
					res.send({"Response" : "No Retailers With All Requested Products"});
				}
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
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
// * https://stackoverflow.com/questions/3455405/how-do-i-remove-a-key-from-a-javascript-object
// * https://stackoverflow.com/questions/14593538/make-heroku-run-non-master-git-branch
// * https://devcenter.heroku.com/articles/multiple-environments#advanced-linking-local-branches-to-remote-apps
// * https://www.google.com/search?q=force+a+push+heroku&rlz=1C1GGRV_enUS818US818&oq=force+a+push+heroku&aqs=chrome..69i57j0.2670j0j7&sourceid=chrome&ie=UTF-8
// * https://stackoverflow.com/questions/2641347/short-circuit-array-foreach-like-calling-break
// * https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
