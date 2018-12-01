function addWishList(list, product_name, quantity, retailer_name, product, promo)
{
 let req = new XMLHttpRequest();

	 //Open GET request, using queryString

 let queryString = `/search?p1=${product_name}&q1=${quantity}&ret=${retailer_name}`;
	 req.open("GET", "/search?p1=play&q1=1&ret=NULL", true);
	 //req.setRequestHeader('Content-Type', 'application/json');  <-- Not needed for get request
   req.addEventListener("load", () => {
  	 if(req.status >= 200 && req.status < 400)
     {
    	 let results = JSON.parse(req.responseText);
       console.log(results);//**********************************
    			 listAdder(list, results, promo);
     }
  	 else
        console.log("Error: " + req.statusText);
 });
req.send(null);
}

function listAdder(list, orderData, promo_id){
  let promo = document.querySelector(`.${promo_id}`);
  if(!promo.getAttribute("added")){
    //Setup new XMLHttpRequest request
    let req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("PUT", "/listAdd", true);
    req.setRequestHeader('Content-Type', 'application/json');
    let data = {list: list,
                products: [],
                retailer: orderData[0]["RET_ID"]};
    orderData.forEach((row, i) => {
      data.products.push({ product_id : row["PROD_ID"],
                           quantity: row["QT"]
                         });
    });
    let orderFinalPrice = 0, orderInitialPrice = 0;
    orderData.forEach((row, i) => {
      orderFinalPrice += row["FINAL_PRICE"];
      orderInitialPrice += row["INITIAL_PRICE"];
    });
    data["current_price"] = orderFinalPrice;
    data["initial_price"] = orderInitialPrice;
    //data["order_name"] = document.querySelector(".list-add-input").value;
    req.addEventListener('load', () => {
      if(req.status >= 200 && req.status < 400){
        promo.setAttribute("added", "yes");
        if(promo.classList.contains("fa-heart")){
            //let favButtonDescription = document.querySelector("#fav-button-desc");
            //favButtonDescription.textContent = "(added to favorites!)";
            //favButtonDescription.style.color = "purple";
            promo.style.color = "rgb(39, 206, 100)";
        }
        else{
          //wishlistButtonDescription = document.querySelector("#wl-button-desc");
          //wishlistButtonDescription.textContent = "(added to wishlist!)";
          //wishlistButtonDescription.style.color = "purple";
          promo.style.color = "rgb(39, 206, 100)";
        }
      }
      else{
        console.log("Error: " + req.status + " " + req.statusText);
        promo.style.color = "red";
        if(promo.classList.contains("fa-heart")){
          document.querySelector("#fav-button-desc").innerHTML =
            "&nbsp&nbsp&nbsp&nbsp&nbsp(error)&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
        }
        else{
          document.querySelector("#wl-button-desc").innerHTML =
            "&nbsp&nbsp&nbsp&nbsp&nbsp(error)&nbsp&nbsp&nbsp&nbsp&nbsp";
        }
      }
    });
    req.send(JSON.stringify(data));
  }
}
