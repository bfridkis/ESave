module.exports = () => {
	var express = require('express');
	var router = express.Router();
	var app = express();

/*select product.name AS PROD_NAME, retailer.name AS RET_NAME,
retailer_product.price * '1' AS INITIAL_PRICE,
case
	when sum(promotion.discount) IS NULL then
		retailer_product.price * '1' - retailer.shipping_price
	else retailer_product.price * '1' - retailer.shipping_price - sum(promotion.discount)
    end AS FINAL_PRICE,
retailer.shipping_price AS SHIPPING_PRICE,
case
	when sum(promotion.discount) IS NULL then 0
    else sum(promotion.discount)
    end AS TOTAL_DISCOUNT
from product join retailer_product on product.id = retailer_product.product and
	(product.name LIKE '%honey%' or '720054111124' = product.upc or
	null = product.model_number or retailer_product.description LIKE '%raw%')
join retailer on retailer_product.retailer = retailer.id
left join promotion on promotion.retailer = retailer.id and
(promotion.product = product.id or promotion.product IS NULL) and
(promotion.min_spend <= retailer_product.price * '1' or
promotion.min_spend IS NULL) and
(promotion.qt_required <= '1' or promotion.qt_required IS NULL)
GROUP BY product.id ORDER BY FINAL_PRICE ASC LIMIT 1*/

	router.get('/', (req, res, next) => {
		//var searchRouteEsave = req.app.get('./searchRouteEsave');
		var callbackCount = 0;
		var eSaveResults = [];
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log(req.query); //*************************
		if(Object.keys(req.query).length !== 0){
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p"){
		      qtKey = "q" + key.substring(1);
					console.log("QT", req.query[qtKey]);//**********************************
		      mysql.pool.query("select product.name AS PROD_NAME, retailer.name AS RET_NAME, " +
													 "retailer_product.price * '" + req.query[qtKey] + "' AS INITIAL_PRICE, " +
													 "case " +
													 		"when sum(promotion.discount) IS NULL then " +
															"retailer_product.price * '" + req.query[qtKey] + "' - retailer.shipping_price " +
															"else retailer_product.price * '" + req.query[qtKey] + "' "+
															 		"- retailer.shipping_price - sum(promotion.discount) " +
															"end AS FINAL_PRICE " +
														"retailer.shipping_price AS SHIPPING_PRICE, " +
														"case " +
																"when sum(promotion.discount) IS NULL then 0 " +
																"else sum(promotion.discount) " +
																"end AS TOTAL_DISCOUNT " +
														"from product join retailer_product on product.id = retailer_product.product AND" +
																"(product.name LIKE '%" + req.query[key] + "%' OR " +
																"'" + req.query[key] + "' = product.upc OR " +
																"'" + req.query[key] + "' = product.model_number OR " +
																"retailer_product.description LIKE '%" + req.query[key] + "%') " +
														"join retailer on retailer_product.retailer = retailer.id " +
														"(promotion.product = product.id or promotion.product IS NULL) and " +
														"(promotion.min_spend <= retailer_product.price * '" + req.query[qtKey] + "' OR " +
														"promotion.min_spend IS NULL) and " +
														"(promotion.qt_required <= '" + req.query[qtKey] + "' OR promotion.qt_required IS NULL) " +
														"GROUP BY product.id ORDER BY FINAL_PRICE ASC LIMIT 1"
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);
		          eSaveResults.push(rows[0]);
							console.log(eSaveResults);
							complete();
		        }
		      });
		    }
		  }
		}

		else{
			res.render('search/search', context)
		}

		function complete(){
			callbackCount++;
			if(callbackCount >= Object.keys(req.query).length / 2){
				res.send(JSON.stringify(eSaveResults));
			}
		}
	});

	return router;

};



// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
// * https://stackoverflow.com/questions/5223/length-of-a-javascript-object
