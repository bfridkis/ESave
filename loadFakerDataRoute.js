module.exports = (app) => {
    var express = require('express');
    var router = express.Router();
    var faker = require('faker');
    //var app = express();

    router.get('/', (req, res, next) => {
      let context = {};
      context.css = ['style.css'];
      context.jsscriptsFaker = ['loadFakerData.js'];
      res.render("load_faker/loadFakerData", context);
    });

    router.post('/', (req, res, next) => {
      let mysql = req.app.get('mysql');
      if (req.body.password === process.env.loadfakerpassword) {
        var callbackCountRetailerProduct = 0, callbackCountPromotion = 0;
        let insertQuery = "Insert into product ( name, upc, model_number ) values ";
        for (let i = 0; i < req.body.numProds; i++) {
          name = faker.commerce.productName();
          upc = String(Math.floor(Math.random() * 900000) + 100000) +
            String(Math.floor(Math.random() * 900000) + 100000);
          let model_number = "";
          for (let i = 0; i < 6; i++){
              model_number += faker.random.alphaNumeric();
          }
          insertQuery += `( "${name}", "${upc}", "${model_number}"), `;
        }
        insertQuery = insertQuery.substring(0, insertQuery.length - 2);
          mysql.pool.query(insertQuery,
              (err, row, fields) => {
                if (err) {
                  res.write(JSON.stringify(err));
                  res.status(400);
                  res.end();
                }
                else {
                  if(req.body.numRets > 0){
                    insertQuery = "Insert into retailer ( name, web_address, mailing_address, shipping_price ) values ";
                    for (let i = 0; i < req.body.numRets; i++) {
                      name = faker.company.companyName();
                      website = name.replace(/,/g, "").replace(/ /g, "") + ".com";
                      address = `${faker.address.streetAddress()} ${faker.address.city()}, ` +
                                `${faker.address.stateAbbr()} ${faker.address.zipCode()}`;
                      shippingPrice = Math.floor((Math.random() * 7) + 2.99) + 0.99;
                      insertQuery += `( "${name}", "${website}", "${address}", "${shippingPrice}"), `;
                    }
                    insertQuery = insertQuery.substring(0, insertQuery.length - 2);
                    mysql.pool.query(insertQuery,
                      (err, row, fields) => {
                        if (err) {
                          res.write(JSON.stringify(err));
                          res.status(400);
                          res.end();
                        }
                        else {
                          if (req.body.numRetProds > 0) {
                            for (let i = 0; i < req.body.numRetProds; i++){
                              let selectQuery = "SELECT ret1.id FROM retailer AS ret1 JOIN " +
                                "(SELECT CEIL(RAND() * (SELECT MAX(id) FROM retailer)) AS id) " +
                                "AS ret2 " +
                                "WHERE ret1.id >= ret2.id " +
                                "ORDER BY ret1.id ASC " +
                                "LIMIT 1";
                              mysql.pool.query(selectQuery,
                                (err, row, fields) => {
                                  if (err) {
                                    res.write(JSON.stringify(err));
                                    res.status(400);
                                    res.end();
                                  }
                                  else {
                                    let ret_id = row[0].id;
                                    selectQuery = "SELECT prod1.id FROM product AS prod1 JOIN " +
                                      "(SELECT CEIL(RAND() * (SELECT MAX(id) FROM product)) AS id) " +
                                      "AS prod2 " +
                                      "WHERE prod1.id >= prod2.id " +
                                      "ORDER BY prod1.id ASC " +
                                      "LIMIT 1";
                                    mysql.pool.query(selectQuery,
                                      (err, row, fields) => {
                                        if (err) {
                                          res.write(JSON.stringify(err));
                                          res.status(400);
                                          res.end();
                                        }
                                        else {
                                          prod_id = row[0].id;
                                          selectQuery = "SELECT retailer FROM retailer_product " +
                                            `WHERE retailer = "${ret_id}" AND product = "${prod_id}"`;
                                          mysql.pool.query(selectQuery,
                                            (err, row, fields) => {
                                              if (err) {
                                                res.write(JSON.stringify(err));
                                                res.status(400);
                                                res.end();
                                              }
                                              else {
                                                if (typeof(row[0]) === "undefined") {
                                                  price = Number(faker.commerce.price()) + 0.99;
                                                  description = faker.lorem.sentences();
                                                  insertQuery = "INSERT INTO retailer_product (retailer, product, price, description) " +
                                                    `values ("${ret_id}", "${prod_id}", "${price}", "${description}")`;
                                                  mysql.pool.query(insertQuery,
                                                    (err, row, fields) => {
                                                      if (err) {
                                                        res.write(JSON.stringify(err));
                                                        res.status(400);
                                                        res.end();
                                                      }
                                                      else {
                                                        if (callbackCountPromotion < req.body.numPromos) {
                                                          discount = Math.random() * price;
                                                          promoDescription = faker.lorem.sentence();
                                                          ecoupon = faker.random.alphaNumeric();
                                                          expirationDate = (faker.date.future()).substring(0, 10);
                                                          qt_required = getRandomInt(2) === 1 ? faker.number.random() : 'NULL';
                                                          min_spend = getRandomInt(2) === 1 ? faker.commerce.price() : 'NULL';
                                                          insertQuery = "INSERT INTO promotion ( discount, retailer, description, " +
                                                            "ecoupon, expiration_date, product, qt_required, min_spend ) " +
                                                            `values ("${discount}", "${ret_id}", "${promoDescription}", "${ecoupon}", ` +
                                                            `"${expirationDate}", "${prod_id}", "${qt_required}", "${min_spend}")`;
                                                          mysql.pool.query(insertQuery,
                                                            (err, row, fields) => {
                                                              if (err) {
                                                                res.write(JSON.stringify(err));
                                                                res.status(400);
                                                                res.end();
                                                              }
                                                              else {
                                                                complete("promotion");
                                                                complete("retailer_product");
                                                              }
                                                            });
                                                          }
                                                          else {
                                                            complete("retailer_product");
                                                          }
                                                        }
                                                      });
                                                    }
                                                    else {
                                                      i--;
                                                    }
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    }
                                    else{
                                      res.send({
                                        "Response": "Sample Data Added!"
                                      });
                                    }
                                  }
                                });
                              }
                              else{
                                res.send({
                                  "Response": "Sample Data Added!"
                                });
                              }
                            }
                          });
                        }
						         else {
                        res.send({
                          "Response": "Invalid Password"
                        });
                      }

                      function complete(table) {
                        if (table === 'retailer_product') {
                          callbackCountRetailerProduct++;
                        }
                        if (table === 'promotion') {
                          callbackCountPromotion++;
                        }

                        if (callbackCountRetailerProduct === Number(req.body.numRetProds) &&
                            callbackCountPromotion === Number(req.body.numPromos)) {
                            res.send({
                              "Response": "Sample Data Added!"
                            });
                            res.status(202).end();
                        }
                      }
                    });

                      function getRandomInt(max) {
                        return Math.floor(Math.random() * Math.floor(max));
                      }
                  return router;
                  }

// * References
// * https://stackoverflow.com/questions/2175512/javascript-expression-to-generate-a-5-digit-number-in-every-case
// * https://github.com/lestoni/faker-cli
// * https://stackoverflow.com/questions/15762768/javascript-math-round-to-two-decimal-places
// * https://stackoverflow.com/questions/4329396/mysql-select-10-random-rows-from-600k-rows-fast
// * https://www.w3schools.com/sql/func_mysql_rand.asp
// * https://www.w3schools.com/jsref/jsref_substring.asp
// * https://stackoverflow.com/questions/9932957/how-can-i-remove-a-character-from-a-string-using-javascript
//* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
// * https://stackoverflow.com/questions/27769842/write-after-end-error-in-node-js-webserver
