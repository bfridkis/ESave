/*****************************************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ---------------------------------------------------------------
** Main server engine. dev1 renders table views, for development
** purposes only.
*******************************************************************/
module.exports = function(){
    var express = require('express');
    var router = express.Router();
	var app = express();
	
	//Handles GET requests to table page. Redirected here after updates
	//and deletes.
	router.get('/', (req, res) => {
		var mysql = req.app.get('mysql');
		var context = {};
		mysql.pool.query("select * from user", 
		function(err, rows, fields){
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				context.css = ['style.css'];
				context["users"] = rows;
				context.title = 'User Table';
				context.css = ['style.css']
				res.render("user/userTable", context);
			}
		});
	});
	
	return router;
	
}();