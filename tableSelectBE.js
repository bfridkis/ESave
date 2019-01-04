/**********************************************
** Main - ESave Web Server
** CS361 - SOFTWARE ENGINEERING I
** ------------------------------------------
** Router for viewing tables. Development only
***********************************************/
module.exports = tableName => {
  var express = require('express');
  var router = express.Router();
	var app = express();

	//Handles GET requests to table page. Redirected here after updates
	//and deletes.
	router.get('/', (req, res) => {
		var mysql = req.app.get('mysql');
		var context = {};
		mysql.pool.query("select * from `" + tableName + "`",
		(err, rows, fields) => {
			if(err){
				res.write(JSON.stringify(err));
				res.end();
			}
			else{
				context.css = ['style.css'];
				rows.forEach(row => {
					for(var key in row){
						if(row[key] === null || row[key] === ''){
							row[key] = "NULL";
						}
						else if(typeof(row[key]) === 'object'){
							row[key] = new Date(row[key]);
							row[key] = row[key].toJSON();
							row[key] = String(row[key]).substring(0, 10) +
									   " " + String(row[key]).substring(11,19);
						}
					}
				});
				context[tableName] = rows;
				let _index = tableName.indexOf("_");
				if(_index !== -1){
					context.title = tableName.charAt(0).toUpperCase() +
									tableName.substring(1, _index) + " " +
									tableName.charAt(_index + 1).toUpperCase() +
									tableName.substring(_index + 2) + ' Table';
				}
				else{
					context.title = tableName.charAt(0).toUpperCase() + tableName.slice(1)
									+ ' Table';
				}
				context.jsscriptsTableView = ["deleteRow.js"];
				res.render(tableName + "/" + tableName + "Table", context);
			}
		});
	});

	router.delete('/:primarykey/:pk_values', function(req, res){
		var mysql = req.app.get('mysql');
    let pkFields = req.params.primarykey.split("-");
    let pkValues = req.params.pk_values.split("-");
		let sql = "DELETE FROM `" + tableName + "` WHERE ";
    pkFields.forEach(field => {
      sql += `${field}=? AND `
    })
    sql = sql.substring(0, sql.length - 5);
		sql = mysql.pool.query(sql, pkValues, function(error, results, fields){
			if(error){
        console.log("error: ", error);//**********************
				res.write(JSON.stringify(error));
				res.status(400);
				res.end();
			}
			else{
				res.status(202).end();
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
** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
***************************************************************************************************************************/
