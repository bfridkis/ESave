//This module delivers a router that will load sample data to the db using the
//"faker" package. See https://www.npmjs.com/package/faker
module.exports = (app) => {
    var express = require('express');
    var router = express.Router();
    var faker = require('faker');
    //var app = express();

    //Render interface for loading faker data
    router.get('/', (req, res, next) => {
      let context = {};
      context.css = ['style.css'];
      context.jsscriptsFaker = ['loadFakerData.js'];
      res.render("load_faker/loadFakerData", context);
    });

    //Handle HTTP POST request for loading faker data
    router.post('/', (req, res, next) => {
      let mysql = req.app.get('mysql');
      if (req.body.password === process.env.loadfakerpassword) {
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
                            let selectQuery = "SELECT SUM(1) AS COUNT FROM product, retailer " +
                                              "WHERE (product.id, retailer.id) NOT IN " +
                                              "(select product, retailer FROM retailer_product)";
                            mysql.pool.query(selectQuery,
                              (err, row, fields) => {
                                  if (err) {
                                    res.write(JSON.stringify(err));
                                    res.status(400);
                                    res.end();
                                  }
                                  else {
                                    let unusedRetProdPKCount = row[0].COUNT;
                                    if(unusedRetProdPKCount < req.body.numRetProds){
                                      res.send({
                                        "Response": "Unable to add Retail_Products. Retail_Product request count exceeds " +
                                                    "number of available primary keys. (Products and Retailers may have been added.)"
                                      });
                                    }
                                    else{
                                      let randomRetProdPK = Math.ceil(Math.random() * unusedRetProdPKCount);
                                      selectQuery = "SELECT DISTINCT product.id AS PROD, retailer.id AS RET " +
                                                    "FROM product, retailer WHERE (product.id, retailer.id) NOT IN " +
                                                    "(SELECT product, retailer from retailer_product) " +
                                                    `LIMIT ${unusedRetProdPKCount - 1000 > 1000 ? 
                                                            (randomRetProdPK + 1000 > unusedRetProdPKCount ?
                                                             Math.abs(randomRetProdPK - 1000) : randomRetProdPK) : 0}, 1000`;
                                      mysql.pool.query(selectQuery,
                                        (err, rows, fields) => {
                                          if (err) {
                                            res.write(JSON.stringify(err));
                                            res.status(400);
                                            res.end();
                                          }
                                          else {
                                            insertQuery = "INSERT INTO retailer_product (retailer, product, price, description) values ";
                                            let prices = [];
                                            rows.forEach( pk => {
                                              let ret_id = pk.RET,
                                                  prod_id = pk.PROD,
                                                  price = Number(faker.commerce.price()) + 0.99,
                                                  description = faker.lorem.sentences();
                                              prices.push(price);
                                              insertQuery += `("${ret_id}", "${prod_id}", "${price}", "${description}"), `;
                                            });
                                            insertQuery = insertQuery.substring(0, insertQuery.length - 2);
                                            mysql.pool.query(insertQuery,
                                              (err, row, fields) => {
                                                if (err) {
                                                  res.write(JSON.stringify(err));
                                                  res.status(400);
                                                  res.end();
                                                }
                                                else {
                                                  console.log(rows)//******************************
                                                  if (req.body.numPromos > 0) {
                                                    insertQuery = "INSERT INTO promotion ( discount, retailer, description, " +
                                                                  "ecoupon, expiration_date, product, qt_required, min_spend )  values ";
                                                    for(let j = 0; j < req.body.numPromos; j++){
                                                      let discount = Number(Math.random() * prices[j]).toFixed(2);
                                                      let promoDescription = faker.lorem.sentence();
                                                      let ecoupon = "";
                                                      for (let k = 0; k < 6; k++){
                                                          ecoupon += faker.random.alphaNumeric();
                                                      }
                                                      let expirationDate = faker.date.future().toString();
                                                      expirationDate = `${expirationDate.substring(11, 15)}-` +
                                                                       `${getMonthFromString(expirationDate.substring(4, 7))}-` +
                                                                       `${expirationDate.substring(8, 10)}`;
                                                      console.log(expirationDate);//*******************************
                                                      let qt_required = getRandomInt(2) === 1 ? getRandomInt(10) + 1 : null;
                                                      let min_spend = getRandomInt(2) === 1 ? faker.commerce.price() : null;
                                                      let randomRow = getRandomInt(rows.length);
                                                      insertQuery += `("${discount}", "${rows[randomRow].RET}", "${promoDescription}", "${ecoupon}", ` +
                                                                     `"${expirationDate}", ${qt_required !== null ? `"${rows[randomRow].PROD}"` : null}, ` +
                                                                     `${qt_required !== null ? `"${qt_required}"` : null}, ` +
                                                                     `${min_spend !== null ? `"${min_spend}"` : null}), `;
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
                                                          res.send({
                                                            "Response": "Sample Data Added!"
                                                          });
                                                        }
                                                      });
                                                    }
                                                    else {
                                                      res.send({
                                                        "Response": "Sample Data Added!"
                                                      });
                                                    }
                                                  }
                                                });
                                              }
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

                    //Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
                    function getRandomInt(max) {
                      return Math.floor(Math.random() * Math.floor(max));
                    }

                    //Taken from https://stackoverflow.com/questions/13566552/easiest-way-to-convert-month-name-to-month-number-in-js-jan-01
                    function getMonthFromString(mon){
                        return new Date(Date.parse(mon +" 1, 2018")).getMonth()+1
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
// * https://stackoverflow.com/questions/9932957/how-can-i-remove-a-character-from-a-string-using-javascript
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
// * https://stackoverflow.com/questions/27769842/write-after-end-error-in-node-js-webserver
// * https://stackoverflow.com/questions/13566552/easiest-way-to-convert-month-name-to-month-number-in-js-jan-01
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
