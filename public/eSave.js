//Function to establish the event listener for the "ESave" (product search) button.
//Uses an HTTP GET request using Javascript's "XMLHttpRequest" module to query
//ESave database.
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", () => {

    //If previous order was staged, clear it
    let prevOrderTable = document.querySelector(".order-table");
    if(prevOrderTable){
      prevOrderTable.parentNode.removeChild(prevOrderTable);
    }
    let prevButtonTable = document.querySelector(".button-table");
    if(prevButtonTable){
      prevButtonTable.parentNode.removeChild(prevButtonTable);
    }

    //Remove the checkout link message also, and disable the checkout link if necessary
    let prevCheckOutMessageLinkContainer = document.querySelector(".checkoutMessageLinkContainter");
    if(prevCheckOutMessageLinkContainer){
      prevCheckOutMessageLinkContainer.parentNode.removeChild(checkoutMessageLinkContainter);
    }
    let checkoutMessageLinkContainter =
       document.querySelector("#inner-checkout-message-link-container");
    checkoutMessageLinkContainter.style.display = "none";
    let retailerLink = document.querySelector("#retailer-link");
    retailerLink.classList.add("disable_a_href");
    //retailerLink.setAttribute("href", "");

    //Re-pad bottom of page if necessary
    let shoppingCartOuter = document.querySelector("#shopping-cart-outer");
    shoppingCartOuter.style.paddingBottom = "25px";

    //Set border color back to purple if necessary
    let orderStageRight = document.querySelector("#stage-wrapper-right");
    orderStageRight.style.borderColor = "purple";

    //Load stage right with "loading" icon
    let orderStageRightText = document.querySelector("#order-stage-right-text");
		orderStageRightText.innerHTML = '<i class="fas fa-sync fa-spin"></i></i>';

    //Get user inputs for products and quantities
    let items = document.getElementsByClassName("searchItem");
    let qts = document.getElementsByClassName("qtSearchItem");

    //Convert node collections to iterable object using "spread syntax"
    //See: https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
    //   : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    items = [...items];
    qts = [...qts];

    //Establish initial query string
    let queryString = "/search?";

    //Load query string with user inputs
    items.forEach((item, i) => {
      queryString += "p" + (i + 1) + "=" + item.textContent + "&"
                    + "q" + (i + 1) + "=" + qts[i].textContent;
      if(i < items.length - 1){
        queryString += "&";
      }
    });

    //console.log(queryString);

    //Setup new XMLHttpRequest request
    var req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("GET", queryString, true);

    //Event listener for completed GET request
    req.addEventListener("load", () => {
      if(req.status >= 200 && req.status < 400){

       //If parameters were sent (i.e. user did not engage ESave button with empty stage),
       //Wait present loading icon for a minimum of 1.5 seconds, to simulate loading process.
       //See processESave for remaining logic for processing ESave search request.
       //(This delay is artifical and can be removed in production by setting the first parameter
       //of processESave to 0.)
       if(queryString !== "/search?"){
         processESave(1500, req, qts);
       }
       //If no products were staged, print message on right stage accordingly.
       else{
         orderStageRightText.innerHTML =
            'Add products and click "<i class="fas fa-check-square"></i>" to ESave staged order...</span>';
       }
      }
      else{
        alert("Error: " + req.status + " " + req.statusText);
      }
    });
    req.send(null);
  });

  //Event listener to clear product (left) stage when user clicks the "X" button
  let clearButton = document.querySelector("#clear-button");
  clearButton.addEventListener("click", () => {
    let rows = document.getElementsByClassName("searchItemRow");
    rows = [...rows];
    rows.forEach(row => {
      while(row.firstChild){
        row.removeChild(row.firstChild);
      }
    });
  });
}
  //Sleep provides a way to simulate the loading process. It can be removed in
  //production by setting the first parameter of processESave to 0.
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function processESave(time_ms, req, qts) {
    //Simulate loading time
    await sleep(time_ms);

    //This is used to maintain the size/height of the product input (left) stage
    let orderStageLeft = document.querySelector("#stage-wrapper-left");
    let orderStageLeftHeight = orderStageLeft.offsetHeight;

    //console.log(req.responseText);

    //Parse the results and save in results array
    let results = JSON.parse(req.responseText);
    //console.log(results);

    //If the results are NULL, print message on right stage accordingly. Else
    //render results.
    let orderStageRightText = document.querySelector("#order-stage-right-text");
    if(!results[0]){
       orderStageRightText.innerHTML = "";
       orderStageRightText.innerText = "No results. Please modify your search and try again."
     }
     else{
       //Change right stage border color to green (rgb(39, 206, 100)) to indicate successful result.
       let orderStageRight = document.querySelector("#stage-wrapper-right");
       orderStageRight.style.borderColor = "rgb(39, 206, 100)";

       //Remove padding from bottom of shopping cart (because a checkout message will
       //be added underneath it shortly...
       let shoppingCart = document.querySelector("#shopping-cart-outer");
       shoppingCart.style.paddingBottom = "0";

       //Clear right stage's previous content.
       orderStageRightText.innerHTML = "";

       //Create and format a table for the right stage. This will hold product results.
       //Append the table to the right stage.
       let stageTable = document.createElement("table");
       stageTable.classList.add("order-table");
       stageTableCap = stageTable.appendChild(document.createElement("caption"));
       stageTableCap.innerText = "ESave's Best Offer";
       stageTableCap.style.paddingBottom = "20px";
       stageTableCap.style.captionSide = "top";
       stageTableCap.style.textAlign = "center";
       stageTableCap.style.fontSize = "2.5rem";
       stageTableCap.style.color = "purple";
       stageTable.style.margin = "auto";
       orderStageRight.appendChild(stageTable);

       //Add product name header and product name to result table.
       let prodNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
       prodNameHeader.textContent = "PRODUCT";
       prodNameHeader.style.textDecoration = "underline";
       let prodNameRow = stageTable.appendChild(document.createElement("tr"));
       let prodName = prodNameRow.appendChild(document.createElement("td"));
       prodName.textContent = results[0]["PROD_NAME"];
       prodName.style.paddingBottom = "20px";

       //Add retailer name header and retailer name to result table.
       let retNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let retNameHeader = retNameHeaderRow.appendChild(document.createElement("th"));
       retNameHeader.textContent = "RETAILER";
       retNameHeader.style.textDecoration = "underline";
       let retNameRow = stageTable.appendChild(document.createElement("tr"));
       let retName = retNameRow.appendChild(document.createElement("td"));
       retName.textContent = results[0]["RET_NAME"];
       retName.style.paddingBottom = "20px";

       //Add price per unit header and price per unit to result table.
       let ppuHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let ppuHeader = ppuHeaderRow.appendChild(document.createElement("th"));
       ppuHeader.textContent = "PRICE PER UNIT";
       ppuHeader.style.textDecoration = "underline";
       let ppuRow = stageTable.appendChild(document.createElement("tr"));
       let ppu = ppuRow.appendChild(document.createElement("td"));
       ppu.textContent = results[0]["PRICE_PER_UNIT"] + "$";
       ppu.style.paddingBottom = "20px";

       //Add initial price (price before shipping and promotions are applied) header
       //and initial price to results table.
       let initPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let initPriHeader = initPriHeaderRow.appendChild(document.createElement("th"));
       initPriHeader.textContent = "TOTAL PRODUCT COST";
       initPriHeader.style.textDecoration = "underline";
       let initPriRow = stageTable.appendChild(document.createElement("tr"));
       let initPri = initPriRow.appendChild(document.createElement("td"));
       initPri.textContent = results[0]["INITIAL_PRICE"] + "$";
       let initPriBDSRow = stageTable.appendChild(document.createElement("tr"));
       let initPriBDS = initPriBDSRow.appendChild(document.createElement("td"));
       initPriBDS.style.fontSize = "0.9rem";
       initPriBDS.style.textDecoration = "italic";
       initPriBDS.textContent = " (qt " + qts[0].textContent + " x " + results[0]["PRICE_PER_UNIT"] + "$)";
       //initPriBDS.style.whiteSpace = "nowrap";
       initPriBDS.style.paddingBottom = "20px";

       //Add total discount header and total discount to results table.
       let totDiscHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let totDiscHeader = totDiscHeaderRow.appendChild(document.createElement("th"));
       totDiscHeader.textContent = "TOTAL DISCOUNT";
       totDiscHeader.style.textDecoration = "underline";
       let totDiscRow = stageTable.appendChild(document.createElement("tr"));
       let totDisc = totDiscRow.appendChild(document.createElement("td"));
       totDisc.textContent = "-" + results[0]["TOTAL_DISCOUNT"] + "$";
       totDisc.style.paddingBottom = "20px";

       //Add shipping price header and shipping price to results table.
       let shipPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let shipPriHeader = shipPriHeaderRow.appendChild(document.createElement("th"));
       shipPriHeader.textContent = "SHIPPING COST";
       shipPriHeader.style.textDecoration = "underline";
       let shipPriRow = stageTable.appendChild(document.createElement("tr"));
       let shipPri = shipPriRow.appendChild(document.createElement("td"));
       shipPri.textContent = results[0]["SHIPPING_PRICE"] + "$";
       shipPri.style.paddingBottom = "20px";

       //Add final price (price after shipping and promotions have been applied) header
       //and final price to result table.
       let finPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let finPriHeader = finPriHeaderRow.appendChild(document.createElement("th"));
       finPriHeader.innerHTML = "<span style='color:rgb(39, 206, 100)'>$$</span> " +
                                "<span style='text-decoration:underline'>ESAVE BEST PRICE</span> " +
                                "<span style='color:rgb(39, 206, 100)'>$$</span>";
       finPriHeader.style.color = "purple";
       let finPriRow = stageTable.appendChild(document.createElement("tr"));
       let finPri = finPriRow.appendChild(document.createElement("td"));
       finPri.textContent = results[0]["FINAL_PRICE"] + "$";
       finPri.style.paddingBottom = "20px";
       finPri.style.color = "rgb(39, 206, 100)";

       //Add "add to favorites" and "add to wish list" buttons for ESaved order
       let buttonTable = orderStageRight.appendChild(document.createElement("table"));
       buttonTable.classList.add("button-table");
       buttonTable.style.margin = "auto";
       let buttonRow = buttonTable.appendChild(document.createElement("tr"));
       let favButton = buttonRow.appendChild(document.createElement("td"));
       favButton.innerHTML = "<i class='fas fa-heart list-add'></i>";
       favButton.style.paddingRight = "10px";
       let wishlistButton = buttonRow.appendChild(document.createElement("td"));
       wishlistButton.innerHTML = "<i class='fas fa-clipboard-check list-add'></i>";
       wishlistButton.style.paddingLeft = "10px";
       let buttonDescriptionRow = buttonTable.appendChild(document.createElement("tr"));
       let favButtonDescription = buttonDescriptionRow.appendChild(document.createElement("td"));
       favButtonDescription.setAttribute("id", "fav-button-desc");
       favButtonDescription.textContent = "(add to favorites)";
       favButtonDescription.style.fontStyle = "italic";
       favButtonDescription.style.paddingRight = "10px";
       favButtonDescription.style.fontSize = "0.8rem";
       favButton.addEventListener("click", listAdder.bind(favButton.firstChild, "favorites", results));
       let wishlistButtonDescription = buttonDescriptionRow.appendChild(document.createElement("td"));
       wishlistButtonDescription.setAttribute("id", "wl-button-desc");
       wishlistButtonDescription.textContent = "(add to wishlist)";
       wishlistButtonDescription.style.fontStyle = "italic";
       wishlistButtonDescription.style.paddingLeft = "10px";
       wishlistButtonDescription.style.fontSize = "0.8rem";
       wishlistButton.addEventListener("click", listAdder.bind(wishlistButton.firstChild, "wish list", results));

       //Reset stage left height to height before ESave operation
       orderStageLeft.style.height = orderStageLeftHeight + "px";

       //Add checkout message to bottom of ESave shopping cart at bottom of page.
       //Set the shopping cart and checkout message to link to the retailer for
       //ESave result.
       let checkoutMessageLinkContainer = document.querySelector("#inner-checkout-message-link-container");
       checkoutMessageLinkContainer.style.display = "block";
       let retailerLink = document.querySelector("#retailer-link");
       retailerLink.setAttribute("href", "//" + results[0]["RET_WEB_ADD"]);
       retailerLink.classList.remove("disable_a_href");
     }
  }

  function listAdder(list, orderData){
    if(!this.getAttribute("added")){
      //Setup new XMLHttpRequest request
      let req = new XMLHttpRequest();
      //Open GET request, using queryString
      req.open("PUT", "/listAdd", true);
      let data = {list: list,
                  products: [],
                  retailer: orderData[0]["RET_NAME"]};
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
      req.addEventListener('load', () => {
        if(req.status >= 200 && req.status < 400){
          this.setAttribute("added", "yes");
          if(this.classList.contains("fa-heart")){
              let favButtonDescription = document.querySelector("#fav-button-desc");
              favButtonDescription.textContent = "(added to favorites!)";
              favButtonDescription.style.color = "purple";
              this.style.color = "rgb(39, 206, 100)";
          }
          else{
            wishlistButtonDescription = document.querySelector("#wl-button-desc");
            wishlistButtonDescription.textContent = "(added to wishlist!)";
            wishlistButtonDescription.style.color = "purple";
            this.style.color = "rgb(39, 206, 100)";
          }
        }
        else{
          console.log("Error: " + req.status + " " + req.statusText);
          this.style.color = "red";
          if(this.classList.contains("fa-heart")){
            document.querySelector("#fav-button-desc").innerHTML =
              "&nbsp&nbsp&nbsp&nbsp&nbsp(error)&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
          }
          else{
            document.querySelector("#wl-button-desc").innerHTML =
              "&nbsp&nbsp&nbsp&nbsp&nbsp(error)&nbsp&nbsp&nbsp&nbsp&nbsp";
          }
		    }
      });
      console.log(JSON.stringify(data));
      req.send(JSON.stringify(data));
    }
  }

// References
// * https://en.wikipedia.org/wiki/Query_string
// * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
// * https://codeburst.io/javascript-increment-and-decrement-8c223858d5ed
// * https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
// * https://stackoverflow.com/questions/921789/how-to-loop-through-a-plain-javascript-object-with-the-objects-as-members
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
// * https://stackoverflow.com/questions/24775725/loop-through-childnodes
// * https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
// * https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
// * https://stackoverflow.com/questions/48647942/table-caption-goes-bottom-using-bootstrap
// * https://stackoverflow.com/questions/6938248/insert-a-div-element-as-parent
// * https://www.thesitewizard.com/html-tutorial/open-links-in-new-window-or-tab.shtml
// * https://stackoverflow.com/questions/5515310/is-there-a-standard-function-to-check-for-null-undefined-or-blank-variables-in/5515349
// * http://api.jquery.com/text/
// * https://stackoverflow.com/questions/17147126/how-to-force-an-html-link-to-be-absolute
// *https://stackoverflow.com/questions/5629684/how-to-check-if-element-exists-in-the-visible-dom
// * https://stackoverflow.com/questions/7654900/how-do-you-make-an-anchor-link-non-clickable-or-disabled
// * https://stackoverflow.com/questions/2108318/css-html-what-is-the-correct-way-to-make-text-italic
// * https://stackoverflow.com/questions/2430000/determine-if-string-is-in-list-in-javascript
// * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList

// ** Unused... **

//Code to insert a parent "wrapper" around the #shopping-cart-inner node.
//See https://stackoverflow.com/questions/6938248/insert-a-div-element-as-parent
/*
var retailerLink = document.createElement("a");
retailerLink.setAttribute("href", "//www." + results[0]["RET_WEB_ADD"]);
retailerLink.setAttribute("target", "_blank");
let wrapped = document.querySelector("#shopping-cart-inner")
shoppingCart.replaceChild(retailerLink, wrapped);
retailerLink.appendChild(wrapped);
*/
