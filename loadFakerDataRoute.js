module.exports = (app) => {
    var express = require('express');
    var router = express.Router();
    var faker = require('faker');
    //var app = express();

    router.get('/', (req, res, next) => {
      let context = {};
      context.css = ['style.css'];
      context.jsscriptsSample = ['loadFakerData.js'];
      res.render("load_faker/loadFakerData", context);
    });

    router.post('/', (req, res, next) => {
      let mysql = req.app.get('mysql');
      if (req.body.password === "loadfakedata") {
        let callbackCountProduct = 0;
        if (!req.body.numProds) req.body.numProds = 0;
        for (let i = 0; i < req.body.numProds; i++) {
          name = faker.commerce.productName();
          upc = String(Math.floor(Math.random() * 900000) + 100000) +
            String(Math.floor(Math.random() * 900000) + 100000);
          model_number = faker.random.alphaNumeric();
          let insertQuery = "Insert into 'product' ( name, upc, model_number ) values " +
                            `( ${name}, ${upc}, ${model_number})`;
          mysql.pool.query(insertQuery,
              (err, row, fields) => {
                if (err) {
                  res.write(JSON.stringify(err));
                  res.status(400);
                  res.end();
                }
                else {
                  complete("product");
                  if (callbackCountProduct === req.body.numProds) {
                    let callbackCountRetailer = 0;
                    if (!req.body.numRets) req.body.numRets = 0;
                    for (let i = 0; i < req.body.numRets; i++) {
                      name = faker.company.companyName();
                      website = name + ".com";
                      address = `${faker.address.streetAddress()} ${faker.address.city()}, ` +
                                `${faker.address.stateAbbr()} ${faker.address.zipCode()}`;
                      shippingPrice = ((Math.random() * 7) + 2.99).toFixed(2);
                      insertQuery = "Insert into 'retailer' ( name, web_address, mailing_address, shipping_price ) values " +
                                    `( ${name}, ${website}, ${address}, ${shippingPrice})`;
                      mysql.pool.query(insertQuery,
                        (err, row, fields) => {
                          if (err) {
                            res.write(JSON.stringify(err));
                            res.status(400);
                            res.end();
                          }
                          else {
                            complete("retailer");
                            if (callbackCountRetailer === req.body.numRets) {
                              if (!req.body.numRetProds) req.body.numRetProds = 0;
                              let callbackCountRetailerProduct = 0;
                              let callbackCountPromos = 0;
                              for (let i = 0; i < req.body.numRetProds; i++) {
                                let selectQuery = "SELECT id FROM retailer AS ret1 JOIN " +
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
                                      selectQuery = "SELECT id FROM product AS prod1 JOIN " +
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
                                              `WHERE retailer = '${ret_id}' AND product = '${prod_id}'`;
                                            mysql.pool.query(selectQuery,
                                              (err, row, fields) => {
                                                if (err) {
                                                  res.write(JSON.stringify(err));
                                                  res.status(400);
                                                  res.end();
                                                }
                                                else {
                                                  if (!row[0].retailer) {
                                                    price = faker.commerce.price();
                                                    description = faker.lorem.sentences();
                                                    insertQuery = "INSERT INTO retailer_product (retailer, product, price, description) " +
                                                      `values (${ret_id}, ${prod_id}, ${price}, ${description})`;
                                                    mysql.pool.query(insertQuery,
                                                      (err, row, fields) => {
                                                        if (err) {
                                                          res.write(JSON.stringify(err));
                                                          res.status(400);
                                                          res.end();
                                                        }
                                                        else {
                                                          if (callbackCountPromos < req.body.numPromos) {
                                                            discount = Math.random() * price;
                                                            promoDescription = faker.lorem.sentence();
                                                            ecoupon = faker.random.alphaNumeric();
                                                            expirationDate = faker.date.future().substring(0, 10);
                                                            qt_required = getRandomInt(2) === 1 ? faker.number.random : 'NULL';
                                                            min_spend = getRandomInt(2) === 1 ? faker.commerce.price : 'NULL';
                                                            insertQuery = "INSERT INTO promotion ( discount, retailer, description, " +
                                                              "ecoupon, expiration_date, product, qt_required, min_spend ) " +
                                                              `values (${discount},${ret_id},${promoDescription},${ecoupon},` +
                                                              `${expirationDate},${prod_id},${qt_required},${min_spend})`;
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
                                    }
                                  });
                                }
                              }
                            }
                          });
                        }
                      }
                      else {
                        res.send({
                          "Response": "Invalid Password"
                        });
                      }

                      function complete(table) {
                        if (table === 'product') {
                          callbackCountProducts++;
                        }
                        if (table === 'retailer') {
                          callbackCountRetailers++;
                        }
                        if (table === 'retailer_product') {
                          callbackCountRetailerProducts++;
                        }
                        if (table === 'promotion') {
                          callbackCountPromotions++;
                        }
                        if (callbackCountProducts === req.body.numProds &&
                            callbackCountRetailers === req.body.numRets &&
                            callbackCountRetailerProducts == req.body.numRetProds &&
                            callbackCountPromos === req.body.numPromos) {
                            res.send({
                              "Response": "Sample Data Added!"
                            });
                        }
                      }

                      function getRandomInt(max) {
                        return Math.floor(Math.random() * Math.floor(max));
                      }
                    });
                    return router;
                  }

// * References
// * https://stackoverflow.com/questions/2175512/javascript-expression-to-generate-a-5-digit-number-in-every-case
// * https://github.com/lestoni/faker-cli
// * https://stackoverflow.com/questions/15762768/javascript-math-round-to-two-decimal-places
// * https://stackoverflow.com/questions/4329396/mysql-select-10-random-rows-from-600k-rows-fast
// * https://www.w3schools.com/sql/func_mysql_rand.asp
// * https://www.w3schools.com/jsref/jsref_substring.asp