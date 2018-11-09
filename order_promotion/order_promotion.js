/*****************************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ------------------------------------------
** Router for order_promotion table. Development only
******************************************************/
module.exports = function(){
    var express = require('express');
    var router = express.Router();
	var app = express();
	
	//Handles GET requests to table page. Redirected here after updates
	//and deletes.
	router.get('/', (req, res) => {
		var mysql = req.app.get('mysql');
		var context = {};
		mysql.pool.query("select * from order_promotion", 
		function(err, rows, fields){
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				context.css = ['style.css'];
				context["order_promotions"] = rows;
				context.title = 'order_promotion Table';
				context.css = ['style.css']
				res.render("order_promotion/order_promotionTable", context);
			}
		});
	});
	
	return router;
	
}();