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
				context.title = tableName.charAt(0).toUpperCase() + tableName.slice(1)
								+ ' Table';
				context.css = ['style.css']
				res.render("user/userTable", context);
			}
		});
	});
	
	return router;
	
};

/**************************************************************************************************************************
** References
** https://paulund.co.uk/how-to-capitalize-the-first-letter-of-a-string-in-javascript
** https://stackoverflow.com/questions/49335352/express-routes-with-es6-classes-cannot-create-property-next-on-string?rq=1
** https://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module
** https://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module/13151726#13151726
***************************************************************************************************************************/