module.exports = (app) => {
    var express = require('express');
    var router = express.Router();
    //var app = express();

    router.put('/list', isLoggedIn, (req, res, next) => {
        var callbackCount = 0;
        //let orderDetails = JSON.parse(req.body);
        let mysql = req.app.get('mysql');
        let insertQuery = "Insert into order ( user, retailer, current_price ) values (?,?,?)";
        mysql.pool.query(insertQuery, [req.user.id, req.body.retailer, req.body.current_price],
          (err, rows, fields) => {
            if (err) {
              res.write(JSON.stringify(err));
              res.end();
            }
						else {
              var orderID = rows[0]["id"];
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
                      callbackCount++;
                      if (callbackCount === req.body.products.length) {
                        callbackCount = 0;
                        req.body.products.forEach((product, i) => {
                          let selectQuery;
                          if (i === 0) {
                            //Only yield non-product specific promotions on the first query to the promotion
                            //table (i.e. only when querying promotions for the first product).
                            selectQuery = `Select id from promotion where retailer = '${req.body.retailer}' AND` +
                              `(product = ${product.product_id} OR product IS NULL) AND` +
                              `(qt_required = ${product.quantity} OR qt_required IS NULL) AND` +
                              `(min_spend <= ${req.body.initial_price} OR min_spend IS NULL)`;
                          }
													else {
                            selectQuery = `Select id from promotion where retailer = '${req.body.retailer}' AND` +
                              `product = ${product.product_id} AND` +
                              `(qt_required = ${product.quantity} OR qt_required IS NULL) AND` +
                              `(min_spend <= ${req.body.initial_price} OR min_spend IS NULL)`;
                          }
                          mysql.pool.query(selectQuery,
                            (err, rows, fields) => {
                              if (err) {
                                res.write(JSON.stringify(err));
                                res.end();
                              }
															else {
                                callbackCount++;
                                let opInsertCallBackCount = 0;
                                rows.forEach((row, i) => {
                                  insertQuery = "Insert into order_promotion values (?, ?)"
                                  mysql.pool.query(insertQuery, [orderID, row["id"]],
                                    (err, rows, fields) => {
                                      if (err) {
                                        res.write(JSON.stringify(err));
                                        res.end();
                                      }
																			else {
                                        opInsertCallbackCount++;
                                        if (opInsertCallbackCount === rows.length &&
                                          callbackCount === req.body.products.length) {
																						if(req.body.list === "favorites"){
																							insertQuery = "Insert into favorites_order values (?, ?)";
																						}
																						else{
																							insertQuery = "Insert into wish_list values (?, ?)";
																						}
					                                  mysql.pool.query(insertQuery, [req.user.id, orderID],
																							(err, rows, fields) => {
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
                                      });
                                    });
                                  }
                              });
														});
                          }
                        }
                      });
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
