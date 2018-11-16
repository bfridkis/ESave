module.exports = (req, res, context) => {
  let candidateProducts = [];
  let
  for(let key in req.query){
    let mysql = req.app.get('mysql');
    if(key.charAt(0) === "p"){
      mysql.pool.query("select product.name, retailer.name, " +
                        "product.price - sum(promotion.discount) - retailer.shipping_price as FINAL_PRICE" +
                        "from product, retailer, retailer_product, promotion " +
                        "where product.name LIKE %" + req.query[key] + "% or " +
                        req.query[key] + " = product.upc or " +
                        req.query[key] + " = product.model_number or " +
                        "retailer_product.description LIKE %" + req.query[key] + "% and " +
                        "product.id = retailer_product.product and "+
                        "promotion.retailer =  retailer.id and " +
                        "(promotion.product = product.id or promotion.product = NULL) " +
                        "GROUP BY product.id, retailer.id ORDER BY FINAL_PRICE ASC LIMIT 1",
      (err, rows, fields) => {
        if(err){
          res.write(JSON.stringify(err));
          res.end();
        }
        else{
          candidateProducts.push(rows);
        }
      });
    }
  }
  mysql.pool.query
  function complete(){
		callbackCount++;
		if(callbackCount >= tableNames.length){
			res.render(tableToRender + '/' + tableToRender + 'Table', context);
		}
	}
});

// References
// * https://www.w3schools.com/nodejs/nodejs_mysql_select.asp
// * https://dev.mysql.com/doc/refman/8.0/en/string-comparison-functions.html

//*************************************************************************
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
context.jsscriptsTableView = [];
res.render(tableName + "/" + tableName + "Table", context);
