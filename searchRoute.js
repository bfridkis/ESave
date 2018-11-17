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
			let eSaveResults = [];
		  for(let key in req.query){
		    let mysql = req.app.get('mysql');
		    if(key.charAt(0) === "p"){
		      qtKey = "q" + key.substring(1);
		      mysql.pool.query("select product.name, retailer.name, retailer.product_price * " + req.query[qtKey] + ", " +
		                        "retailer_product.price * " + req.query[qtKey] + " - sum(promotion.discount) - " +
		                        "retailer.shipping_price AS FINAL_PRICE, " +
		                        "retailer.shipping_price, sum(promotion.discount) " +
		                        "from product, retailer, retailer_product, promotion " +
		                        "where (product.name LIKE %" + req.query[key] + "% OR " +
		                        req.query[key] + " = product.upc OR " +
		                        req.query[key] + " = product.model_number OR " +
		                        "retailer_product.description LIKE %" + req.query[key] + "% AND " +
		                        "product.id = retailer_product.product AND "+
		                        "promotion.retailer =  retailer.id AND " +
		                        "(promotion.product = product.id OR promotion.product = NULL) AND" +
		                        "(promotion.min_spend <= retailer_product.price * " + req.query[qtKey] +
		                        " promotion.min_spend IS NULL) AND " +
		                        "(promotion.qt_required <= 1 OR promotion.qt_required IS NULL) " +
		                        "GROUP BY product.id, retailer.id ORDER BY FINAL_PRICE ASC LIMIT 1",
		      (err, rows, fields) => {
		        if(err){
		          res.write(JSON.stringify(err));
		          res.end();
		        }
		        else{
		          eSaveResults.push(JSON.stringify(rows[0]));
		        }
		      });
		    }
		  }
			console.log(rows);
		  console.log(eSaveResults);
		  res.send(eSaveResults);
		}

		else{
			res.render('search/search', context)
		}
	});

	return router;
};

// References
// * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
