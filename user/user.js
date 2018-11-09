/********************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ------------------------------------------
** Router for user table. Development only
*********************************************/
module.exports = function(tableName){
    var express = require('express');
    var router = express.Router();
	var app = express();
	
	//Handles GET requests to table page. Redirected here after updates
	//and deletes.
	router.get('/', (req, res) => {
		var mysql = req.app.get('mysql');
		var context = {};
		mysql.pool.query("select * from " + tableName, 
		function(err, rows, fields){
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				context.css = ['style.css'];
				context[tableName] = rows;
				context.title = tableName + ' Table';
				context.css = ['style.css']
				res.render("user/userTable", context);
			}
		});
	});
	
	return router;
	
}(tableName);