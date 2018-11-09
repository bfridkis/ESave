/********************************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ------------------------------------------
** Router for favorites_retailer table. Development only
*********************************************************/
module.exports = function(){
    var express = require('express');
    var router = express.Router();
	var app = express();
	
	//Handles GET requests to table page. Redirected here after updates
	//and deletes.
	router.get('/', (req, res) => {
		var mysql = req.app.get('mysql');
		var context = {};
		mysql.pool.query("select * from favorites_retailer", 
		function(err, rows, fields){
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				context.css = ['style.css'];
				context["favorites_retailers"] = rows;
				context.title = 'favorites_retailer Table';
				context.css = ['style.css']
				res.render("favorites_retailer/favorites_retailerTable", context);
			}
		});
	});
	
	return router;
	
}();