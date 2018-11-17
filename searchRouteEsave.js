module.exports = function(req, res, context){
  let eSaveResults = [];
  for(let key in req.query){
    let mysql = req.app.get('mysql');
    if(key.charAt(0) === "p"){
      qtKey = "q" + key.substring(1);
      mysql.pool.query("select product.name, retailer.name, retailer.product_price * " + req.query[qtKey] + ", " +
                        "retailer_product.price * " + req.query[qtKey] + " - sum(promotion.discount) - " +
                        "retailer.shipping_price AS FINAL_PRICE, " +
                        "retailer.shipping_price, sum(promotion.discount) " +
                        "from product, retailer, retailer_product, promotion " +
                        "where (product.name LIKE %" + req.query[key] + "% OR " +
                        req.query[key] + " = product.upc OR " +
                        req.query[key] + " = product.model_number OR " +
                        "retailer_product.description LIKE %" + req.query[key] + "% AND " +
                        "product.id = retailer_product.product AND "+
                        "promotion.retailer =  retailer.id AND " +
                        "(promotion.product = product.id OR promotion.product = NULL) AND" +
                        "(promotion.min_spend <= retailer_product.price * " + req.query[qtKey] +
                        " promotion.min_spend IS NULL) AND " +
                        "(promotion.qt_required <= 1 OR promotion.qt_required IS NULL) " +
                        "GROUP BY product.id, retailer.id ORDER BY FINAL_PRICE ASC LIMIT 1",
      (err, rows, fields) => {
        if(err){
          res.write(JSON.stringify(err));
          res.end();
        }
        else{
          eSaveResults.push(JSON.stringify(rows[0]));
        }
      });
    }
  }
  console.log(eSaveResults);
  res.send(eSaveResults);

  /*  Not needed because we only run a single select statement
  function complete(){
		callbackCount++;
		if(callbackCount >= tableNames.length){
			res.render(tableToRender + '/' + tableToRender + 'Table', context);
		}
	}
  */
}

// References
// * https://www.w3schools.com/nodejs/nodejs_mysql_select.asp
// * https://dev.mysql.com/doc/refman/8.0/en/string-comparison-functions.html
// * https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index
//* https://www.w3schools.com/jsref/jsref_substring.asp

//*************************************************************************
