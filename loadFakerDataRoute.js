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
      //Password is entered on interface page.
      if (req.body.password === process.env.loadfakerpassword) {
        //Start the insert query for sample products...
        let insertQuery = "Insert into product ( name, upc, model_number ) values ";

        //For each sample product, generate a fake product name, a string comprised of a
        //random sequence of  12 digits as random upc. (Note a unique constraint violation
        //may occur if a randomly generated upc is not unique.) Then generate a random string
        //of 6 alpha-numeric characters as model_number.
        for (let i = 0; i < req.body.numProds; i++) {
          name = faker.commerce.productName();
          upc = String(Math.floor(Math.random() * 900000) + 100000) +
            String(Math.floor(Math.random() * 900000) + 100000);
          let model_number = "";
          for (let i = 0; i < 6; i++){
              model_number += faker.random.alphaNumeric();
          }
          //Append product data to insert query.
          insertQuery += `( "${name}", "${upc}", "${model_number}"), `;
        }
        //Trim trailing ", " from insert query, and run query.
        insertQuery = insertQuery.substring(0, insertQuery.length - 2);
          mysql.pool.query(insertQuery,
              (err, row, fields) => {
                if (err) {
                  res.write(JSON.stringify(err));
                  res.status(400);
                  res.end();
                }
                else {
                  //If sample retailers are specified...
                  if(req.body.numRets > 0){
                    //Start the insert query for sample retailers...
                    insertQuery = "Insert into retailer ( name, web_address, mailing_address, shipping_price ) values ";

                    //For each sample retailer, generate a fake company name, fake website
                    //(which is company name without spaces or commas), fake address, fake shipping-price,
                    //and append values to insert query.
                    for (let i = 0; i < req.body.numRets; i++) {
                      name = faker.company.companyName();
                      website = name.replace(/,/g, "").replace(/ /g, "") + ".com";
                      address = `${faker.address.streetAddress()} ${faker.address.city()}, ` +
                                `${faker.address.stateAbbr()} ${faker.address.zipCode()}`;
                      shippingPrice = Math.floor((Math.random() * 7) + 2.99) + 0.99;
                      insertQuery += `( "${name}", "${website}", "${address}", "${shippingPrice}"), `;
                    }
                    //Trim trailing ", " from insert query, and run query.
                    insertQuery = insertQuery.substring(0, insertQuery.length - 2);
                    mysql.pool.query(insertQuery,
                      (err, row, fields) => {
                        if (err) {
                          res.write(JSON.stringify(err));
                          res.status(400);
                          res.end();
                        }
                        else {
                          //If sample retailer_products are specified...
                          if (req.body.numRetProds > 0) {
                            //Determine the number of available primary keys (product, retailer) in
                            //retailer_product table using select query.
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
                                    //Save # of available primary keys in unusedRetProdPKCount.
                                    let unusedRetProdPKCount = row[0].COUNT;
                                    //If more retailer_products are requested than available, send error response
                                    //accordingly.
                                    if(unusedRetProdPKCount < req.body.numRetProds){
                                      res.send({
                                        "Response": "Unable to add Retail_Products. Retail_Product request count exceeds " +
                                                    "number of available primary keys. (Products and Retailers may have been added.)"
                                      });
                                    }
                                    else{
                                      //Generate random primary key starting row.
                                      let randomRetProdPK = Math.ceil(Math.random() * unusedRetProdPKCount);
                                      //Select a section of (up to 1000 rows of) the table view representing
                                      //all available primary keys. Start from a random row if more than 1000
                                      //primary keys are available, otherwise start from first row using select
                                      //query.
                                      selectQuery = "SELECT DISTINCT product.id AS PROD, retailer.id AS RET " +
                                                    "FROM product, retailer WHERE (product.id, retailer.id) NOT IN " +
                                                    "(SELECT product, retailer from retailer_product) " +
                                                    `LIMIT ${unusedRetProdPKCount - 1000 > 0 ?
                                                            getRandomInt(unusedRetProdPKCount - 999) : 0}, 1000`;
                                      mysql.pool.query(selectQuery,
                                        (err, retailer_products, fields) => {
                                          if (err) {
                                            res.write(JSON.stringify(err));
                                            res.status(400);
                                            res.end();
                                          }
                                          else {
                                            //Start insert query for retailer_products...
                                            insertQuery = "INSERT INTO retailer_product (retailer, product, price, description) values ";
                                            let prices = [];
                                            //Generate a fake price and description for each potential retailer_product.
                                            //(Save price in prices so fake discount [calculated below] will not exceed fake price.)
                                            retailer_products.forEach( pk => {
                                              let ret_id = pk.RET,
                                                  prod_id = pk.PROD,
                                                  price = Number(faker.commerce.price()) + 0.99,
                                                  description = faker.lorem.sentences();
                                              prices.push(price);
                                              //Append fake retailer_product info to insert query.
                                              insertQuery += `("${ret_id}", "${prod_id}", "${price}", "${description}"), `;
                                            });
                                            //Trim trailing ", " from insert query, and run query.
                                            insertQuery = insertQuery.substring(0, insertQuery.length - 2);
                                            mysql.pool.query(insertQuery,
                                              (err, row, fields) => {
                                                if (err) {
                                                  res.write(JSON.stringify(err));
                                                  res.status(400);
                                                  res.end();
                                                }
                                                else {
                                                  //If sample promotions are specified...
                                                  if (req.body.numPromos > 0) {
                                                    //Start the insert query for sample promotions...
                                                    insertQuery = "INSERT INTO promotion ( discount, retailer, description, " +
                                                                  "ecoupon, expiration_date, product, qt_required, min_spend )  values ";
                                                    //For each sample promotion, generate a fake discout, description, ecoupon code,
                                                    //expiration date, qt_required, & min_spend.
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
                                                      //qt_required is optional. Should be assigned null for ~50% of sample promos.
                                                      let qt_required = getRandomInt(2) === 1 ? getRandomInt(10) + 1 : null;
                                                      //min_spend is optional. Should be assigned null for ~50% of sample promos.
                                                      let min_spend = getRandomInt(2) === 1 ? faker.commerce.price() : null;
                                                      //randomRow is used to select a random row from retailer_products
                                                      let randomRow = getRandomInt(retailer_products.length);
                                                      insertQuery += `("${discount}", "${retailer_products[randomRow].RET}", "${promoDescription}", "${ecoupon}", ` +
                                                                     `"${expirationDate}", ${qt_required !== null ? `"${retailer_products[randomRow].PROD}"` : null}, ` +
                                                                     `${qt_required !== null ? `"${qt_required}"` : null}, ` +
                                                                     `${min_spend !== null ? `"${min_spend}"` : null}), `;
                                                      //Delete entry at index randomRow in retailer_products so it is not used again
                                                      //(as this would generate a unique constraint violation.)
                                                      //retailer_products = retailer_products.splice(randomRow, 1);
                                                    }
                                                    //Remove trailing ", " from insert query, and run query.
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
                    //Generates a random int in range 0 - (max - 1) [inclusive]
                    function getRandomInt(max) {
                      return Math.floor(Math.random() * Math.floor(max));
                    }

                    //Taken from https://stackoverflow.com/questions/13566552/easiest-way-to-convert-month-name-to-month-number-in-js-jan-01
                    //Generates month as 2-digit number from month as 3-character string (specified in parameter 'mon')
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
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
