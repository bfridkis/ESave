module.exports = (app) => {
	var express = require('express');
	var router = express.Router();
	//var app = express();

	router.get('/', (req, res, next) => {
		var callbackCount = 0;
		context = {};
		let mysql = req.app.get('mysql');
		//context.user = req.user.username;
		var user_name  = req.user.username;
		//console.log(user_name);
		mysql.pool.query(`SELECT * FROM User WHERE Username = '${user_name}'`, function(error, results, fields){
	  	if(error){
	    		res.write(JSON.stringify(error));
	    		res.end();
	  	}
		  context.userdata = results[0];
			//console.log(results);
			//console.log(context.userdata.id);

			res.render('profile/profile', context);
	    //complete();
	 });

		/*function complete(){
			callbackCount++;
			if(callbackCount){
				res.render('profile/profile', context);
			}
		}*/
	});
	return router;
};
