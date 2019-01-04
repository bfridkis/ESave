function addWishList(list, product_name, quantity, retailer_name, product, promo)
{
 let req = new XMLHttpRequest();

	 //Open GET request, using queryString

 let queryString = `/search?p1=${product_name}&q1=${quantity ? quantity : "1"}&ret=${retailer_name}`;
	 req.open("GET", queryString, true);
	 //req.setRequestHeader('Content-Type', 'application/json');  <-- Not needed for get request
   req.addEventListener("load", () => {
  	 if(req.status >= 200 && req.status < 400)
     {
    	 let results = JSON.parse(req.responseText);
    			 listAdder(list, results[0], promo);
     }
  	 else
        console.log("Error: " + req.statusText);
 });
req.send(null);
}

function listAdder(list, orderData, promo_id){
  let promo = document.querySelector(`.${promo_id}`);
    //Setup new XMLHttpRequest request
    let req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("POST", "/listAdd", true);
    req.setRequestHeader('Content-Type', 'application/json');
    let data = {list: list,
                products: [],
                retailer: orderData["ret_id"]};
    for(key in orderData["prod_ids"]){
      data.products.push({ product_id : orderData["prod_ids"][key],
                           quantity: orderData["qts"][key]
                         });
    }
    data["current_price"] = orderData["discounted_price"];
    data["initial_price"] = orderData["initial_price"];

    req.addEventListener('load', () => {
      if(req.status >= 200 && req.status < 400){
        //promo.setAttribute("added", "yes");
        if(promo.classList.contains("fa-heart")){
            //let favButtonDescription = document.querySelector("#fav-button-desc");
            //favButtonDescription.textContent = "(added to favorites!)";
            //favButtonDescription.style.color = "purple";
            document.querySelector(`.${promo_id}_li`).innerHTML =
              "<i style='color:rgb(39, 206, 100)' class='fas fa-heart'></i>&nbsp&nbsp Added!";

        }
        else{
          //wishlistButtonDescription = document.querySelector("#wl-button-desc");
          //wishlistButtonDescription.textContent = "(added to wishlist!)";
          //wishlistButtonDescription.style.color = "purple";
          promo.style.color = "rgb(39, 206, 100)";
          document.querySelector(`.${promo_id}_li`).innerHTML=
            "<i style='color:rgb(39, 206, 100)' class='fas fa-clipboard-check'></i>&nbsp&nbsp Added!";
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
