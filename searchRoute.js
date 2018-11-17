module.exports = () => {
	var express = require('express');
	var router = express.Router();
	var app = express();

	router.get('/', (req, res, next) => {
		//var searchRouteEsave = req.app.get('./searchRouteEsave');
		context = {};
		context.jsscriptsSearchPage = ["sparkle.jquery.js", "search.js", "eSave.js"];
		context.css = ["sparkle.css", "searchStyle.css"];
		context.navbarLogo = ["images/logo.jpg"];
		context.mainLogo = ["images/logo-medium.jpg"];
		console.log(req.query); //*************************
		if(Object.keys(req.query).length !== 0){
			var eSaveResults = [];
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p"){
		      qtKey = "q" + key.substring(1);
					console.log("QT", req.query[qtKey]);//**********************************
		      mysql.pool.query("select product.name AS PROD_NAME, retailer.name AS RET_NAME, " +
													 "retailer_product.price * " + req.query[qtKey] + " AS INITIAL_PRICE, retailer_product.price * 4 - sum(promotion.discount) - retailer.shipping_price AS FINAL_PRICE, retailer.shipping_price, sum(promotion.discount) AS TOTAL_DISCOUNT from product, retailer, retailer_product, promotion where (product.name LIKE '%honey%' OR 'honey' = product.upc OR 'honey' = product.model_number OR  retailer_product.description LIKE '%" + "4" + "%') AND product.id = retailer_product.product AND promotion.retailer =  retailer.id AND (promotion.product = product.id OR promotion.product IS NULL) AND (promotion.min_spend <= retailer_product.price * 4 OR promotion.min_spend IS NULL) AND (promotion.qt_required <= 4 OR promotion.qt_required IS NULL) GROUP BY product.id, retailer.id ORDER BY FINAL_PRICE ASC LIMIT 1",
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
							//console.log(rows);
		          eSaveResults.push(rows[0]);
		        }
						console.log(eSaveResults);
						res.send(JSON.stringify(eSaveResults));
		      });
		    }
		  }
		}

		else{
			res.render('search/search', context)
		}
	});

	return router;
};

// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
