//Function to establish the event listener for the "ESave" (product search) button.
//Uses an HTTP GET request using Javascript's "XMLHttpRequest" module to query
//ESave database.
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", eSaveWrapper.bind(eSaveButton, 1500));

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

//See notes for function processESave below for information on the timeout parameter.
function eSaveWrapper(timeout){
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
                  + "q" + (i + 1) + "=" + qts[i].textContent + "&";
    });
  queryString += "ret=NULL";

  //If product stage (stage-left) is not empty...
  if(queryString.includes("q")){
    //Setup new XMLHttpRequest request
    var req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("GET", queryString, true);

    //Event listener for completed GET request
    req.addEventListener("load", () => {
      if(req.status >= 200 && req.status < 400){
       //If parameters were sent (i.e. user did not engage ESave button with empty stage),
       //Wait while presenting loading icon for a minimum of 1.5 seconds, to simulate loading process.
       //See processESave for remaining logic for processing ESave search request.
       //(This delay is artifical and can be removed in production by setting timeout to 0.)
       processESave(timeout, req, qts);
      }
      else{
        alert("Error: " + req.status + " " + req.statusText);
      }
    });
    req.send(null);
  }
  //If no products were staged, print message on right stage accordingly.
  else{
    orderStageRightText.innerHTML =
       'Add products and click "<i class="fas fa-check-square"></i>" to ESave staged order...';
  }
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

  //Parse the results and save in results array
  let results = JSON.parse(req.responseText);
  //console.log(results);

  //If some (or all) products cannot be matched, present user suggested matches.
  //Else render results.
  let orderStageRightText = document.querySelector("#order-stage-right-text");
  let orderStageRight = document.querySelector("#stage-wrapper-right");

  //Check if all search parameters matched products. If not, convert
  //unmatched products to red text on stage left and present suggested
  //products for each on stage left.
  let unmatched = [];
  let searchItems = document.querySelectorAll(".searchItem");
  results.forEach((result, i) => {
    if(result.hasOwnProperty("suggested")){
      unmatched.push(result);
      searchItems[result["prodNum"] - 1].style.color = "red";
    }
  });

  if(!(unmatched.length === 0)){
     processUnmatched(orderStageRight, orderStageRightText,
                      unmatched, searchItems);
   }
   else{
     //Change right stage border color to green (rgb(39, 206, 100)) to indicate successful result.
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
     stageTableCap.classList.add("stage-table-cap");
     stageTableCap.innerText = "ESave's Best Offer";
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
     favButtonDescription.classList.add("list-button-description");
     favButton.addEventListener("click", listAdder.bind(favButton.firstChild, "favorites", results, null));
     let wishlistButtonDescription = buttonDescriptionRow.appendChild(document.createElement("td"));
     wishlistButtonDescription.setAttribute("id", "wl-button-desc");
     wishlistButtonDescription.innerHTML = "&nbsp&nbsp(add to wishlist)";
     wishlistButtonDescription.classList.add("list-button-description");
     wishlistButton.addEventListener("click", listAdder.bind(wishlistButton.firstChild, "wish list", results, null));
     let orderNameInputRow = buttonTable.appendChild(document.createElement("tr"));
     let orderNameInputCell = buttonTable.appendChild(document.createElement("td"));
     orderNameInputCell.setAttribute("colspan", "2");
     orderNameInputCell.style.paddingTop = "10px";
     let orderNameInput = orderNameInputCell.appendChild(document.createElement("input"));
     orderNameInput.setAttribute("type", "text");
     orderNameInput.classList.add("list-add-input", "form-control");
     orderNameInput.setAttribute("placeholder", "Enter Order Name (Optional)");

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

function processUnmatched(orderStageRight, orderStageRightText,
                          unmatched, searchItems){
  orderStageRightText.innerHTML = "";
  //Create and format a table for the right stage. This will hold product suggestions.
  //Append the table to the right stage.
  let stageTable = document.createElement("table");
  stageTable.classList.add("order-table");
  stageTableCap = stageTable.appendChild(document.createElement("caption"));
  stageTableCap.classList.add("stage-table-cap");
  stageTableCap.innerHTML = "Whoops!<br>One or More Products Not Found...";
  stageTableCap.style.fontSize = "2rem";
  orderStageRight.appendChild(stageTable);

  unmatched.forEach( suggestionList => {
    //Add product name header and product name to result table.
    let containerDiv = stageTable.appendChild(document.createElement("div"));
    containerDiv.classList = "suggested-products-div";
    let prodNameHeaderRow = containerDiv.appendChild(document.createElement("tr"));
    let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
    prodNameHeader.textContent = `By '${searchItems[suggestionList["prodNum"] - 1].textContent}'` +
                                 ", Did You Mean...";
    prodNameHeader.style.color = "rgb(39, 206, 100)";
    prodNameHeader.style.fontSize = "1.75rem";
    suggestionList.suggested.forEach( (suggestion, i) => {
      if(i < 10){
        let suggestionRow = containerDiv.appendChild(document.createElement("tr"));
        let suggestionName = suggestionRow.appendChild(document.createElement("td"));
        suggestionName.classList = "suggested-products";
        suggestionName.textContent = suggestion["name"] + "?";
        suggestionName.style.fontSize = "1.25rem";
        if(i === suggestionList.suggested.length - 1){
          suggestionName.style.paddingBottom = "20px";
        }
        suggestionName.addEventListener("click", e => {
          searchItems[suggestionList["prodNum"] - 1].textContent = e.target.textContent;
          searchItems[suggestionList["prodNum"] - 1].style.color = "black";
          containerDiv.classList = "suggested-products-div-hidden";
          removeSuggestedDiv(containerDiv, orderStageRight, orderStageRightText);
        })
      }
    });
    if(suggestionList.suggested.length > 10){
      let nextButtonRow = containerDiv.appendChild(document.createElement("tr"));
      let nextButton = nextButtonRow.appendChild(document.createElement("td"));
      nextButton.innerHTML = '<i class="fas fa-arrow-right next"></i>';
      nextButton.firstChild.
        addEventListener("click", suggestNextPage.bind(nextButton.firstChild, 1,
            suggestionList["prodNum"] - 1));
    }
  });
}

async function removeSuggestedDiv(containerDiv, orderStageRight, orderStageRightText){
  await sleep(500);
  containerDiv.style.display = "none";
  if(!document.querySelectorAll(".suggested-products-div").length){
    orderStageRight.removeChild(orderStageRight.lastChild);
    orderStageRightText.innerHTML =
      'Products updated. Click "<i class="fas fa-check-square"></i>" to ESave staged order!';
  }
}

function listAdder(list, orderData, promo_id){
  if(!this.getAttribute("added")){
    //Setup new XMLHttpRequest request
    let req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("POST", "/listAdd", true);
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
    data["order_name"] = document.querySelector(".list-add-input").value;
    req.addEventListener('load', () => {
      if(req.status >= 200 && req.status < 400){
        this.setAttribute("added", "yes");
        if(this.classList.contains("fa-heart")){
            let favButtonDescription = document.querySelector("#fav-button-desc");
            favButtonDescription.textContent = "(added to favorites!)";
            favButtonDescription.style.color = "purple";
            if(promo_id){
              document.querySelector(". " + promo_id).style.color = "rgb(39, 206, 100)";
            }
            else{
              this.style.color = "rgb(39, 206, 100)";
            }
        }
        else{
          wishlistButtonDescription = document.querySelector("#wl-button-desc");
          wishlistButtonDescription.textContent = "(added to wishlist!)";
          wishlistButtonDescription.style.color = "purple";
          if(promo_id){
            document.querySelector(". " + promo_id).style.color = "rgb(39, 206, 100)";
          }
          else{
            this.style.color = "rgb(39, 206, 100)";
          }
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
    req.send(JSON.stringify(data));
  }
}

function suggestNextPage(currentPage, prodNum){
  let searchItems = document.querySelectorAll(".searchItem");
  let userInput = searchItems[prodNum].textContent;
  let queryString = `/search/${currentPage}?p=${userInput}`;
  let orderStageRight = document.querySelector("#stage-wrapper-right");
  let orderStageRightText = document.querySelector("#order-stage-right-text");

  //Setup new XMLHttpRequest request
  var req = new XMLHttpRequest();
  //Open GET request, using queryString
  req.open("GET", queryString, true);

  //Event listener for completed GET request
  req.addEventListener("load", () => {
    if(req.status >= 200 && req.status < 400){
      let thisSuggestionList =
        document.querySelectorAll(".suggested-products-div")[prodNum];
      thisSuggestionList.innerHTML = "";
      let headerRow = thisSuggestionList.appendChild(document.createElement("tr"));
      let headerRowContent = headerRow.appendChild(document.createElement("th"));
      headerRowContent.innnerText = `By '${userInput}', Did You Mean...`;

      let results = JSON.parse(req.responseText);
      results.forEach( (suggestion, i) => {
        if(i < 10){
          let suggestionRow = thisSuggestionList.appendChild(document.createElement("tr"));
          let suggestionName = suggestionRow.appendChild(document.createElement("td"));
          suggestionName.classList = "suggested-products";
          suggestionName.textContent = suggestion["name"] + "?";
          suggestionName.style.fontSize = "1.25rem";
          if(results.length === 11 && i === 9 || i === results.length - 1){
            suggestionName.style.paddingBottom = "20px";
          }
          suggestionName.addEventListener("click", e => {
            searchItems[prodNum].textContent = e.target.textContent;
            searchItems[prodNum].style.color = "black";
            thisSuggestionList.classList = "suggested-products-div-hidden";
            removeSuggestedDiv(thisSuggestionList, orderStageRight, orderStageRightText);
          })
        }
      });
      if(results.length > 10){
        let pageButtonsRow = thisSuggestionList.appendChild(document.createElement("tr"));
        let nextButton = pageButtonsRow.appendChild(document.createElement("td"));
        nextButton.innerHTML = '<i class="fas fa-arrow-right next"></i>';
        nextButton.firstChild.
          addEventListener("click", suggestNextPage.
            bind(nextButton.firstChild, currentPage + 1, prodNum));
      }
    }
    else{
      alert("Error: " + req.status + " " + req.statusText);
    }
  });
  req.send(null);
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
// * https://www.w3schools.com/sql/sql_alter.asp
// * https://stackoverflow.com/questions/267658/having-both-a-created-and-last-updated-timestamp-columns-in-mysql-4-0
// * https://www.w3schools.com/csSref/pr_class_cursor.asp

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
