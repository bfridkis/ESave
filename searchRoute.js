module.exports = app => {
	var express = require('express');
	var router = express.Router();
	//var app = express();

	//Route for an ESave request
	router.get('/', isLoggedIn, (req, res, next) => {
		console.log("req.query: ", req.query);//***************************************
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
												"     end AS TOTAL_DISCOUNT " +
												"from product join retailer_product ON product.id = retailer_product.product AND " +
												"(product.name = '" + req.query[key] + "' OR " +
												"'" + req.query[key] + "' = product.upc OR '" + req.query[key] +
												"' = product.model_number) " +
												"JOIN retailer ON retailer_product.retailer = retailer.id AND " +
												"retailer_product.product = product.id " +
												"LEFT JOIN promotion ON promotion.retailer = retailer.id AND " +
												"(promotion.product = product.id) AND " +
												"(promotion.min_spend <= retailer_product.price * '" + req.query[qtKey] + "' "+
												"OR promotion.min_spend IS NULL) AND " +
												"(promotion.qt_required <= '" + req.query[qtKey] + "' OR promotion.qt_required IS NULL) " +
					 						  "GROUP BY retailer.id, product.id ORDER BY DISCOUNTED_PRICE ASC";
		      mysql.pool.query(queryString,
		      (err, rows, fields) => {
		        if(err){
							console.log("ERROR: ", err);//*************************
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//Save results for each product, if any are returned
							//console.log(rows);
							if(rows[0]){
								rows.forEach(row => {
									row.INITIAL_PRICE = stripCommas(row.INITIAL_PRICE);
									row.PRICE_PER_UNIT = stripCommas(row.PRICE_PER_UNIT);
									row.DISCOUNTED_PRICE = stripCommas(row.DISCOUNTED_PRICE);
									row.SHIPPING_PRICE = stripCommas(row.SHIPPING_PRICE);
									row.TOTAL_DISCOUNT = stripCommas(row.TOTAL_DISCOUNT);
								});
		          	eSaveResults.push({"results" : rows,
																	 "prodNum" : Number(key.substring(1)),
																	 "qt" : Number(req.query[qtKey])
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
				console.log("Results for Search: ", eSaveResults[0]);

				let someProductsUnmatched = eSaveResults.some( result => {
					if(result.hasOwnProperty("suggested")){
						eSaveResults.sort(compare);
						res.send(JSON.stringify(eSaveResults));
						return result.hasOwnProperty("suggested")
					}
				})

				if(!someProductsUnmatched){
					var resultsTotalsByRetailer = {};
					if(req.query.ret !== "NULL"){
						resultsTotalsByRetailer[req.query.ret] = {};
						resultsTotalsByRetailer[req.query.ret]["prices"] = {};
						resultsTotalsByRetailer[req.query.ret]["qts"] = {};
						resultsTotalsByRetailer[req.query.ret]["prod_ids"] = {};
						resultsTotalsByRetailer[req.query.ret]["discount_ids"] = {};
						resultsTotalsByRetailer[req.query.ret]["discounted_price"] = 0;
						resultsTotalsByRetailer[req.query.ret]["shipping_price"] = 0;
						resultsTotalsByRetailer[req.query.ret]["discount"] = 0;
						resultsTotalsByRetailer[req.query.ret]["initial_price"] = 0;
						resultsTotalsByRetailer[req.query.ret]["num_prods"] = 0;
						let retIndex;
						eSaveResults.forEach(eSaveResult => {
							let retailerMatch = eSaveResult.results.some((result, i) => {
								if(result.RET_NAME === req.query.ret || result.RET_ID === req.query.ret){
									retIndex = i;
								}
								return result.RET_NAME === req.query.ret || result.RET_ID === req.query.ret;
							});
							if(retailerMatch){
								resultsTotalsByRetailer[req.query.ret]["discounted_price"] +=
									Number(eSaveResult.results[retIndex].DISCOUNTED_PRICE);
									console.log("discounted price?: ", resultsTotalsByRetailer[req.query.ret]["discounted_price"])//*******
								resultsTotalsByRetailer[req.query.ret]["shipping_price"] +=
									Number(eSaveResult.results[retIndex].SHIPPING_PRICE);
								resultsTotalsByRetailer[req.query.ret]["discount"] +=
								  Number(eSaveResult.results[retIndex].TOTAL_DISCOUNT);
								resultsTotalsByRetailer[req.query.ret]["initial_price"] +=
									Number(eSaveResult.results[retIndex].INITIAL_PRICE);
								resultsTotalsByRetailer[req.query.ret]["prices"][eSaveResult.prodNum]
									= Number(eSaveResult.results[retIndex].PRICE_PER_UNIT);
								resultsTotalsByRetailer[req.query.ret]["prod_ids"][eSaveResult.prodNum]
									= Number(eSaveResult.results[retIndex].PROD_ID);
								resultsTotalsByRetailer[req.query.ret]["qts"][eSaveResult.prodNum]
									= Number(eSaveResult.qt);
								resultsTotalsByRetailer[req.query.ret]["num_prods"]++;
								resultsTotalsByRetailer[req.query.ret]["ret_id"] =
									eSaveResult.results[retIndex].RET_ID;
								resultsTotalsByRetailer[req.query.ret]["ret_web_add"] =
									eSaveResult.results[retIndex].RET_WEB_ADD;
							}
						});
						console.log('results totals by ret: ', resultsTotalsByRetailer);//*****************
					}
					else{
						eSaveResults.forEach((productResults, i) => {
							productResults.results.forEach(result => {
								if(resultsTotalsByRetailer.hasOwnProperty(result.RET_NAME)){
									//Use scaling where necessary to ensure all values are rounded to 2 decimal places
									//See https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
									resultsTotalsByRetailer[result.RET_NAME]["discounted_price"] +=
										Number(result.DISCOUNTED_PRICE);
									resultsTotalsByRetailer[result.RET_NAME]["discount"] +=
										Number(result.TOTAL_DISCOUNT);
									resultsTotalsByRetailer[result.RET_NAME]["initial_price"] +=
										Number(result.INITIAL_PRICE);
									resultsTotalsByRetailer[result.RET_NAME]["prices"][productResults.prodNum]
										= Number(result.PRICE_PER_UNIT);
									resultsTotalsByRetailer[result.RET_NAME]["prod_ids"][productResults.prodNum]
										= Number(result.PROD_ID);
									resultsTotalsByRetailer[result.RET_NAME]["qts"][productResults.prodNum]
										= Number(productResults.qt);
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
									resultsTotalsByRetailer[result.RET_NAME]["prod_ids"] = {};
									resultsTotalsByRetailer[result.RET_NAME]["prod_ids"][productResults.prodNum]
										= Number(result.PROD_ID);
									resultsTotalsByRetailer[result.RET_NAME]["qts"] = {};
									resultsTotalsByRetailer[result.RET_NAME]["qts"][productResults.prodNum]
										= Number(productResults.qt);
									resultsTotalsByRetailer[result.RET_NAME]["num_prods"] = 1;
									resultsTotalsByRetailer[result.RET_NAME]["ret_id"] = result.RET_ID;
									resultsTotalsByRetailer[result.RET_NAME]["ret_web_add"] = result.RET_WEB_ADD;
									resultsTotalsByRetailer[result.RET_NAME]["discount_ids"] = {};
								}
							});
						});
					}
					for(retailer in resultsTotalsByRetailer){
						if(resultsTotalsByRetailer[retailer]["num_prods"] !==
								(Object.keys(req.query).length - 1) / 2){
									delete resultsTotalsByRetailer[retailer];
						}
					}
					if(Object.keys(resultsTotalsByRetailer).length === 0){
						res.send({"Error" : "No Retailers With All Requested Products"});
					}
					else{
						let mysql = req.app.get('mysql');
						let productListString = null;
						for(retailer in resultsTotalsByRetailer){
							Object.keys(resultsTotalsByRetailer[retailer]["prod_ids"]).forEach((pid, i) => {
								if(i === 0){
									productListString = `'${resultsTotalsByRetailer[retailer]["prod_ids"][pid]}',`;
								}
								else{
									productListString += `'${resultsTotalsByRetailer[retailer]["prod_ids"][pid]}',`;
								}
								if(i === Object.keys(resultsTotalsByRetailer[retailer]["prod_ids"]).length - 1){
									productListString = productListString.slice(0, -1);
								}
							});
							queryString = "SELECT promotion.*, retailer.name AS ret_name " +
														"FROM promotion JOIN retailer " +
														"ON promotion.retailer = retailer.id WHERE " +
														`promotion.retailer = '${resultsTotalsByRetailer[retailer]["ret_id"]}' ` +
														`AND (promotion.qt_required IS NULL OR promotion.product IN (${productListString})) ` +
														"AND (promotion.min_spend IS NULL OR " +
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
										discounts.forEach((discount, i) => {
											if(discount.product === null &&
												resultsTotalsByRetailer[ret_name]["discounted_price"] >=
													Number(discount.discount)){
														resultsTotalsByRetailer[ret_name]["discount"] +=
															Number(discount.discount);
														resultsTotalsByRetailer[ret_name]["discounted_price"] -=
															Number(discount.discount);
														resultsTotalsByRetailer[ret_name]["discount_ids"][String(i)] = discount.id;
												}
												else{
													resultsTotalsByRetailer[ret_name]["discount_ids"][String(i)] = discount.id;
												}
											});
										}
										complete2();
									}
								});
							}
						}
					}
				}

			//Compare function used for sorting final array of result objects when
			//not all products can be matched.
			//See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
			function compare(a, b){
				return a.prodNum - b.prodNum;
			}

			//Secondary complete function to track callbacks while each eligible retailer's
			//non-product specific promotions are applied (using a greedy technique, see above)
			//as available.
			function complete2(){
				callbackCount2++;
				if(Object.keys(resultsTotalsByRetailer).length
						&& callbackCount2 === Object.keys(resultsTotalsByRetailer).length){
					let minFinalPrice = Number.MAX_SAFE_INTEGER, minFinalPriceRetailer;
					for(key in resultsTotalsByRetailer){
						if(resultsTotalsByRetailer[key]["discounted_price"] < minFinalPrice){
									minFinalPrice = resultsTotalsByRetailer[key]["discounted_price"];
									minFinalPriceRetailer = key;
						}
					}
					resultsTotalsByRetailer[minFinalPriceRetailer]["retailer"] = minFinalPriceRetailer;
					resultsTotalsByRetailer[minFinalPriceRetailer]["discounted_price"] =
						Number(resultsTotalsByRetailer[minFinalPriceRetailer]["discounted_price"].toFixed(2));
					resultsTotalsByRetailer[minFinalPriceRetailer]["discount"] =
						Number(resultsTotalsByRetailer[minFinalPriceRetailer]["discount"].toFixed(2));
					resultsTotalsByRetailer[minFinalPriceRetailer]["initial_price"] =
						Number(resultsTotalsByRetailer[minFinalPriceRetailer]["initial_price"].toFixed(2));
					console.log("Winner :", resultsTotalsByRetailer[minFinalPriceRetailer]);
					res.send(JSON.stringify([resultsTotalsByRetailer[minFinalPriceRetailer]]));
				}
			}

			//Function to return a string which is the str parameters with all
			//commas removed. (Used for values returned from sql search query greater
			//than 999.99).
			function stripCommas(str){
				while(str.indexOf(",") !== -1){
					str = str.slice(0, ip.indexOf(",")) + str.slice(indexOf(",") + 1);
				}
				return = str;
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
