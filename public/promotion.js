function addWishList(list, promo)
{
 let req = new XMLHttpRequest();

   console.log("This is promo: ", promo)//*************************************
   let promotion = JSON.parse(promo);
   console.log("This is promotion: ", promotion)//*************************************
	 //Open GET request, using queryString
	 let product_name = promotion.product_name;
	 let quantity = promotion.quantity;
	 let retailer_name = promotion.retailer_name;
	 let product_id = promotion.product;

 let queryString = `/search?p1=${product_name}&q1=${quantity}&ret=${retailer_name}`;
	 req.open("GET", queryString, true);
	 req.setRequestHeader('Content-Type', 'application/json');

	 if(req.status >= 200 && req.status < 400)
 {
	 let results = JSON.parse(req.responseText);
			 listAdder(list, results);
 }
	 else
 console.log("Error: " + req.statusText);
req.send();
}
