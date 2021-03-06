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
       //wait while presenting loading icon for a minimum of 1.5 seconds, to simulate loading process.
       //See processESave for remaining logic for processing ESave search request.
       //(This delay is artifical and can be removed in production by setting timeout to 0.)
       processESave(timeout, req, qts, items);
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

async function processESave(time_ms, req, qts, items) {
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

  if(typeof(results.Error) !== "undefined"){
    orderStageRightText.innerHTML = "Sorry. No Retailer Carries All Requested Products.<br>" +
                                    "<br>Please Remove One or More Products and Try Again.";
  }

  else{
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
       //let prodNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       //let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
       //prodNameHeader.textContent = "PRODUCT";
       //prodNameHeader.style.textDecoration = "underline";
       //let prodNameRow = stageTable.appendChild(document.createElement("tr"));
       //let prodName = prodNameRow.appendChild(document.createElement("td"));
       //prodName.textContent = results[0]["PROD_NAME"];
       //prodName.style.paddingBottom = "20px";

       //Add retailer name header and retailer name to result table.
       let retNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let retNameHeader = retNameHeaderRow.appendChild(document.createElement("th"));
       retNameHeader.textContent = "RETAILER";
       retNameHeader.style.textDecoration = "underline";
       let retNameRow = stageTable.appendChild(document.createElement("tr"));
       let retName = retNameRow.appendChild(document.createElement("td"));
       retName.textContent = results[0]["retailer"];
       retName.style.paddingBottom = "20px";

       //Add price per unit header and price per unit to result table for each product.
       let ppuHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let ppuHeader = ppuHeaderRow.appendChild(document.createElement("th"));
       ppuHeader.textContent = "PRICE PER UNIT";
       ppuHeader.style.textDecoration = "underline";
       Object.keys(results[0]["prices"]).sort().forEach((product, i) => {
         let ppuRow = stageTable.appendChild(document.createElement("tr"));
         let prod = ppuRow.appendChild(document.createElement("td"));
         prod.innerHTML = items[i].textContent + "&nbsp:&nbsp";
         let ppu = ppuRow.appendChild(document.createElement("td"));
         ppu.textContent =  "$" + results[0]["prices"][product];
         if(results[0]["prices"][product] % 1 === 0){
           ppu.textContent += ".00";
         }
       });

       //Add initial price (price before shipping and discounts are applied) header
       //and initial price to results table for each product.
       let initPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let initPriHeader = initPriHeaderRow.appendChild(document.createElement("th"));
       initPriHeader.textContent = "TOTAL PRODUCT COST";
       initPriHeader.style.textDecoration = "underline";
       initPriHeader.style.paddingTop = "20px";
       let initPriRow = stageTable.appendChild(document.createElement("tr"));
       let initPri = initPriRow.appendChild(document.createElement("td"));
       let iniPriBDS;
       initPri.textContent = "$" + results[0]["initial_price"];
       Object.keys(results[0]["prices"]).sort().forEach((product, i) => {
         let initPriBDSRow = stageTable.appendChild(document.createElement("tr"));
         initPriBDS = initPriBDSRow.appendChild(document.createElement("td"));
         initPriBDS.style.fontSize = "0.9rem";
         initPriBDS.style.textDecoration = "italic";
         initPriBDS.textContent = `('${items[i].textContent}' : ${qts[0].textContent} x ` +
                                  `${results[0]["prices"][i + 1]}` +
                                  `${results[0]["prices"][i + 1] % 1 === 0 ? '.00' : ''}$)`;
       });
       //initPriBDS.style.whiteSpace = "nowrap";
       initPriBDS.style.paddingBottom = "20px";

       //Add total discount header and total discount to results table.
       let totDiscHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let totDiscHeader = totDiscHeaderRow.appendChild(document.createElement("th"));
       totDiscHeader.textContent = "TOTAL DISCOUNT";
       totDiscHeader.style.textDecoration = "underline";
       let totDiscRow = stageTable.appendChild(document.createElement("tr"));
       let totDisc = totDiscRow.appendChild(document.createElement("td"));
       totDisc.textContent = "-$" + results[0]["discount"];
       if(results[0]["discount"] % 1 === 0){
         totDisc.textContent += ".00";
       }
       totDisc.style.paddingBottom = "20px";

       //Add shipping price header and shipping price to results table.
       let shipPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let shipPriHeader = shipPriHeaderRow.appendChild(document.createElement("th"));
       shipPriHeader.textContent = "SHIPPING COST";
       shipPriHeader.style.textDecoration = "underline";
       let shipPriRow = stageTable.appendChild(document.createElement("tr"));
       let shipPri = shipPriRow.appendChild(document.createElement("td"));
       shipPri.textContent = "$" + results[0]["shipping_price"];
       if(results[0]["shipping_price"] % 1 === 0){
         shipPri.textContent += ".00";
       }
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
       finPri.textContent = String((results[0]["discounted_price"] +
            results[0]["shipping_price"]).toFixed(2)) + "$";
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
       favButton.addEventListener("click", listAdder.bind(favButton.firstChild, "favorites", results[0], null));
       let wishlistButtonDescription = buttonDescriptionRow.appendChild(document.createElement("td"));
       wishlistButtonDescription.setAttribute("id", "wl-button-desc");
       wishlistButtonDescription.innerHTML = "&nbsp&nbsp(add to wishlist)";
       wishlistButtonDescription.classList.add("list-button-description");
       wishlistButton.addEventListener("click", listAdder.bind(wishlistButton.firstChild, "wish list", results[0], null));
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
       retailerLink.setAttribute("href", "//" + results[0]["ret_web_add"]);
       retailerLink.classList.remove("disable_a_href");
     }
 }
}

//Function to display "suggested" products to the user if one or more search
//parameters do not match.
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

  unmatched.forEach(suggestionList => {
    //Add product name header and product name to result table.
    let containerDiv = stageTable.appendChild(document.createElement("div"));
    containerDiv.classList =
      `suggested-products-div prod-${Number(suggestionList["prodNum"]) - 1}`;
    let prodNameHeaderRow = containerDiv.appendChild(document.createElement("tr"));
    let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
    prodNameHeader.textContent = `By '${searchItems[suggestionList["prodNum"] - 1].textContent}'` +
                                 ", Did You Mean...";
    prodNameHeader.style.color = "rgb(39, 206, 100)";
    prodNameHeader.style.fontSize = "1.75rem";

    //If no suggested products available...
    if(suggestionList.suggested.length === 0){
      let suggestionRow = containerDiv.appendChild(document.createElement("tr"));
      let suggestionName = suggestionRow.appendChild(document.createElement("td"));
      suggestionName.textContent = "Sorry. No Suggestions Available. :(";
      suggestionName.style.fontSize = "1.25rem";
    }

    //Else, display up to 10 suggestions...
    else{
      suggestionList.suggested.forEach((suggestion, i) => {
        if(i < 10){
          let suggestionRow = containerDiv.appendChild(document.createElement("tr"));
          let suggestionName = suggestionRow.appendChild(document.createElement("td"));
          suggestionName.classList = "suggested-products";
          suggestionName.textContent = suggestion["name"] + "?";
          suggestionName.style.fontSize = "1.25rem";
          suggestionName.addEventListener("click", e => {
            searchItems[suggestionList["prodNum"] - 1].textContent =
              e.target.textContent.slice(0, -1);
            searchItems[suggestionList["prodNum"] - 1].style.color = "black";
            containerDiv.classList = "suggested-products-div-hidden";
            removeSuggestedDiv(containerDiv, orderStageRight, orderStageRightText);
          })
        }
      });
    }

    //If more than 10 suggestions are available, provide a button to select next
    //"page" of up to 10 more suggestions
    if(suggestionList.suggested.length > 10){
      let nextButtonRow = containerDiv.appendChild(document.createElement("tr"));
      let nextButton = nextButtonRow.appendChild(document.createElement("td"));
      nextButton.innerHTML = '<i class="fas fa-arrow-right next"></i>';
      nextButton.firstChild.
        addEventListener("click", suggestNextPage.bind(nextButton.firstChild, 1,
            suggestionList["prodNum"] - 1));
    }
    else{
      containerDiv.lastChild.lastChild.style.paddingBottom = "20px";
    }
  });
}

//Function to wait 0.5 seconds and then remove the div containing set of up to 10
//suggested products. (This allows a "scale-to-0" animation to complete before removing
//the div.)
async function removeSuggestedDiv(containerDiv, orderStageRight, orderStageRightText){
  await sleep(500);
  containerDiv.style.display = "none";
  if(!document.querySelectorAll(".suggested-products-div").length){
    orderStageRight.removeChild(orderStageRight.lastChild);
    orderStageRight.style.height = "300px";
    orderStageRightText.innerHTML =
      'Products updated. Click "<i class="fas fa-check-square"></i>" to ESave staged order!';
  }
}

//Function to add ESaved order to user wishlist or favorites
function listAdder(list, orderData, promo_id){
  if(!this.getAttribute("added")){
    //Setup new XMLHttpRequest request
    let req = new XMLHttpRequest();
    //Open GET request, using queryString
    req.open("POST", "/listAdd", true);
    req.setRequestHeader('Content-Type', 'application/json');
    let data = {list: list,
                products: [],
                retailer: orderData["ret_id"]};
    for(let key in orderData["prod_ids"]){
      data.products.push({ product_id : orderData["prod_ids"][key],
                           quantity: orderData["qts"][key]
                         });
    }
    data["current_price"] = Number(orderData["discounted_price"]) +
                            Number(orderData["shipping_price"]);
    data["initial_price"] = orderData["initial_price"];
    data["discount_ids"] = orderData["discount_ids"];
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

//Function to provide the set of the next (up to) 10 suggested products
function suggestNextPage(currentPage, prodNum){
  let searchItems = document.querySelectorAll(".searchItem");
  let userInput = searchItems[prodNum].textContent;
  let queryString = `/search/${currentPage}?p=${userInput}`;
  let orderStageRight = document.querySelector("#stage-wrapper-right");
  let orderStageRightText = document.querySelector("#order-stage-right-text");
  //let orderStageRightHeight = orderStageRight.offsetHeight;

  //Setup new XMLHttpRequest request
  var req = new XMLHttpRequest();
  //Open GET request, using queryString
  req.open("GET", queryString, true);

  //Event listener for completed GET request
  req.addEventListener("load", () => {
    if(req.status >= 200 && req.status < 400){
      let thisSuggestionList =
        document.querySelector(`.prod-${prodNum}`);
      let thisSuggestionListHeight = thisSuggestionList.offsetHeight;
      thisSuggestionList.innerHTML = "";
      thisSuggestionList.style.height = String(thisSuggestionListHeight) + "px";
      let headerRow = thisSuggestionList.appendChild(document.createElement("tr"));
      let headerRowContent = headerRow.appendChild(document.createElement("th"));
      headerRowContent.textContent = `By '${userInput}', Did You Mean...`;
      headerRowContent.style.color = "rgb(39, 206, 100)";
      headerRowContent.style.fontSize = "1.75rem";
      let results = JSON.parse(req.responseText);
      results.forEach((suggestion, i) => {
        if(i < 10){
          let suggestionRow = thisSuggestionList.appendChild(document.createElement("tr"));
          let suggestionName = suggestionRow.appendChild(document.createElement("td"));
          suggestionName.classList = "suggested-products";
          suggestionName.textContent = suggestion["name"] + "?";
          suggestionName.style.fontSize = "1.25rem";
          suggestionName.addEventListener("click", e => {
            searchItems[prodNum].textContent = e.target.textContent.slice(0, -1);
            searchItems[prodNum].style.color = "black";
            thisSuggestionList.classList = "suggested-products-div-hidden";
            removeSuggestedDiv(thisSuggestionList, orderStageRight, orderStageRightText);
          })
        }
      });
      let pageButtonsRow = null, buttonCell = null;
      if(currentPage !== 0){
        pageButtonsRow = thisSuggestionList.appendChild(document.createElement("tr"));
        buttonCell = pageButtonsRow.appendChild(document.createElement("td"));
        buttonCell.innerHTML = `<i class="fas fa-arrow-left ip-${prodNum} next"></i>`;
        buttonCell.firstChild.style.marginBottom = "20px";
        let prevButton = document.querySelector(`.ip-${prodNum}`);
        prevButton.addEventListener("click", suggestNextPage.
          bind(prevButton, currentPage - 1, prodNum));
      }
      if(results.length > 10){
        let prevButtonPresent = true;
        if(pageButtonsRow === null){
          pageButtonsRow = thisSuggestionList.appendChild(document.createElement("tr"));
          prevButtonPresent = false;
        }
        if(buttonCell === null){
          buttonCell = pageButtonsRow.appendChild(document.createElement("td"));
        }
        buttonCell.appendChild(document.createElement("i"));
        buttonCell.lastChild.classList.add("fas", "fa-arrow-right",
          `in-${prodNum}`, "next");
        buttonCell.lastChild.style.marginBottom = "20px";
        if(prevButtonPresent){
            buttonCell.firstChild.style.marginRight = "10px";
            buttonCell.lastChild.style.marginRight = "10px";
        }
        let nextButton = document.querySelector(`.in-${prodNum}`);
        nextButton.addEventListener("click", suggestNextPage.
          bind(nextButton, currentPage + 1, prodNum));
      }
      if(buttonCell === null){
        thisSuggestionList.lastChild.firstChild.style.paddingBottom = "20px";
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
// * https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
// * https://www.w3schools.com/jsref/jsref_tofixed.asp
