function addWishList(list, product_name, quantity, retailer_name, product, promo)
{
 let req = new XMLHttpRequest();

	 //Open GET request, using queryString

 let queryString = `/search?p1=${product_name}&q1=${quantity}&ret=${retailer_name}`;
	 req.open("GET", "/search?p1=play&q1=1&ret=NULL", true);
	 //req.setRequestHeader('Content-Type', 'application/json');  <-- Not needed for get request

	 if(req.status >= 200 && req.status < 400)
 {
	 let results = JSON.parse(req.responseText);
   console.log(results);//**********************************
			 listAdder(list, results, promo);
 }
	 else
 console.log("Error: " + req.statusText);
req.send(null);
}
