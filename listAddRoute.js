module.exports = app => {
    var express = require('express');
    var router = express.Router();
    //var app = express();

    router.post('/', isLoggedIn, (req, res, next) => {
        var callbackCount = 0;
        let mysql = req.app.get('mysql');
        console.log("body: ", req.body);//**************************
        let insertQuery = "Insert into `order` ( user, retailer, current_price, name ) values (?,?,?,?)";
        mysql.pool.query(insertQuery, [req.user.id, req.body.retailer, Number(req.body.current_price),
																			 req.body.order_name],
          (err, row, fields) => {
            if (err) {
              console.log("err: ", err);//************************
							res.write(JSON.stringify(err));
							res.status(400);
							res.end();
            }
						else {
              console.log("row: ", row);//************************
							var orderID = row.insertId;
              //Work around so auto-timestamp feature can be used for "Created_On" in
              //addition to "last_ppdated". (Only one field can be designated with "ON
              //UPDATE CURRENT_TIMESTAMP". This is used for the last_updated field, where
              //the value is immediately copied to the "created_on" field at the time the
              //record is created.)
							mysql.pool.query("update `order` a INNER JOIN `order` b ON a.id = b.id " +
																`SET b.created_on = a.last_updated where a.id = ${orderID}`,
			          (err, row, fields) => {
			            if (err) {
										res.write(JSON.stringify(err));
										res.status(400);
										res.end();
			            }
									else {
										insertQuery = "Insert into order_product values (?, ?, ?)";
			              req.body.products.forEach((product, i) => {
			                mysql.pool.query(insertQuery, [orderID, req.body.products[i].product_id,
			                    req.body.products[i].quantity],
			                  (err, rows, fields) => {
			                    if (err) {
			                      res.write(JSON.stringify(err));
			                      res.end();
			                    }
													else {
			                      if (++callbackCount === req.body.products.length) {
			                        if(Object.keys(req.body.discount_ids).length > 0){
                                let insertQuery = "INSERT INTO order_promotion values ";
  			                        for(let key in req.body.discount_ids){
  		                            insertQuery += `(${orderID}, ${req.body.discount_ids[key]}),`;
                                  }
                                insertQuery = insertQuery.slice(0, -1);
  		                          mysql.pool.query(insertQuery,
  		                            (err, row, fields) => {
  		                              if (err) {
                                      console.log("err: ", err);//************
  		                                res.write(JSON.stringify(err));
  		                                res.end();
  		                              }
  																	else {
                                      console.log("row: ", row);//************
  																		if(req.body.list === "favorites"){
  																			insertQuery = "Insert into favorites_order values (?, ?)";
  																		}
  																		else{
  																			insertQuery = "Insert into wish_list values (?, ?)";
  																		}
  	                                  mysql.pool.query(insertQuery, [req.user.id, orderID],
  																			(err, row, fields) => {
                                          if (err) {
                                            res.write(JSON.stringify(err));
                                            res.end();
                                          }
  																				else {
  																					res.status(202).end();
  																				}
  																		});
                                    }
                                  });
                                }
																else{
																	if(req.body.list === "favorites"){
																		insertQuery = "Insert into favorites_order values (?, ?)";
																	}
																	else{
																		insertQuery = "Insert into wish_list values (?, ?)";
																	}
																	mysql.pool.query(insertQuery, [req.user.id, orderID],
																		(err, row, fields) => {
																			if (err) {
																				res.write(JSON.stringify(err));
																				res.end();
																			}
																			else {
																				res.status(202).end();
																			}
                                   });
                                  }
																 }
			                          }
			                        });
			                      });
			                    }
												});
											}
										});
                  });

      return router;
};

    // route middleware to make sure
    function isLoggedIn(req, res, next) {

      // if user is authenticated in the session, carry on
      if (req.isAuthenticated())
        return next();

      // if they aren't redirect them to the login page
      res.redirect('/');
    }


    // References
    // * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    // * https://stackoverflow.com/questions/5223/length-of-a-javascript-object
    // * https://dev.mysql.com/doc/refman/8.0/en/mathematical-functions.html#function_truncate
    // * https://www.w3resource.com/mysql/string-functions/mysql-format-function.php
    // * https://stackoverflow.com/questions/26732123/turn-properties-of-object-into-a-comma-separated-list
    // * https://www.w3schools.com/jsref/jsref_join.asp
    // * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
		// * https://stackoverflow.com/questions/1262786/mysql-update-query-based-on-select-query
