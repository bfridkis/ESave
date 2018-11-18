
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", () => {
    let prevOrderTable = document.querySelector(".order-table");
    if(prevOrderTable){
      prevOrderTable.parentNode.removeChild(prevOrderTable);
    }
    let prevCheckOutMessageLinkContainer = document.querySelector(".checkoutMessageLinkContainter");
    if(prevCheckOutMessageLinkContainer){
      prevCheckOutMessageLinkContainer.parentNode.removeChild(checkoutMessageLinkContainter);
    }
    let checkoutMessageLinkContainter =
       document.querySelector("#inner-checkout-message-link-container");
    checkoutMessageLinkContainter.style.display = "none";
    let retailerLink = document.querySelector("#retailer-link");
    retailerLink.setAttribute("href", "");
    let orderStageRightText = document.querySelector("#order-stage-right-text");
		orderStageRightText.innerHTML = '<i class="fas fa-sync fa-spin"></i></i>';
    let items = document.getElementsByClassName("searchItem");
    let qts = document.getElementsByClassName("qtSearchItem");
    items = [...items];
    qts = [...qts];
    let queryString = "/search?";
    items.forEach((item, i) => {
      queryString += "p" + (i + 1) + "=" + item.textContent + "&"
                    + "q" + (i + 1) + "=" + qts[i].textContent;
      if(i < items.length - 1){
        queryString += "&";
      }
    });
    console.log(queryString);
    var req = new XMLHttpRequest();
    req.open("GET", queryString, true);
    req.addEventListener("load", () => {
      if(req.status >= 200 && req.status < 400){
        console.log(req.status + " " + req.statusText);
       //window.location.replace("/search");
      sleepFor(1500, req, qts);
      }
      else{
        alert("Error: " + req.status + " " + req.statusText);
      }
    });
    req.send(null);
  });

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

  //The following two functions provide a mechanism to "sleep"
  //They are taken directly from here: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function sleepFor(time_ms, req, qts) {
    await sleep(time_ms);
    let orderStageLeft = document.querySelector("#stage-wrapper-left");
    let orderStageLeftHeight = orderStageLeft.offsetHeight;
    let results = JSON.parse(req.responseText);
     console.log(results);
     let orderStageRightText = document.querySelector("#order-stage-right-text");
     if(!results[0]){
       orderStageRightText.innerHTML = "";
       orderStageRightText.innerText = "No results. Please modify your search and try again."
     }
     else{
       let orderStageRight = document.querySelector("#stage-wrapper-right");
       orderStageRight.style.borderColor = "rgb(39, 206, 100)";
       let shoppingCart = document.querySelector("#shopping-cart-outer");
       shoppingCart.style.paddingBottom = "0";
       orderStageRightText.innerHTML = "";
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
       let prodNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
       prodNameHeader.textContent = "PRODUCT";
       prodNameHeader.style.textDecoration = "underline";
       let prodNameRow = stageTable.appendChild(document.createElement("tr"));
       let prodName = prodNameRow.appendChild(document.createElement("td"));
       prodName.textContent = results[0]["PROD_NAME"];
       prodName.style.paddingBottom = "20px";
       let retNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let retNameHeader = retNameHeaderRow.appendChild(document.createElement("th"));
       retNameHeader.textContent = "RETAILER";
       retNameHeader.style.textDecoration = "underline";
       let retNameRow = stageTable.appendChild(document.createElement("tr"));
       let retName = retNameRow.appendChild(document.createElement("td"));
       retName.textContent = results[0]["RET_NAME"];
       retName.style.paddingBottom = "20px";
       let ppuHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let ppuHeader = ppuHeaderRow.appendChild(document.createElement("th"));
       ppuHeader.textContent = "PRICE PER UNIT";
       ppuHeader.style.textDecoration = "underline";
       let ppuRow = stageTable.appendChild(document.createElement("tr"));
       let ppu = ppuRow.appendChild(document.createElement("td"));
       ppu.textContent = results[0]["PRICE_PER_UNIT"] + "$";
       ppu.style.paddingBottom = "20px";
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
       let totDiscHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let totDiscHeader = totDiscHeaderRow.appendChild(document.createElement("th"));
       totDiscHeader.textContent = "TOTAL DISCOUNT";
       totDiscHeader.style.textDecoration = "underline";
       let totDiscRow = stageTable.appendChild(document.createElement("tr"));
       let totDisc = totDiscRow.appendChild(document.createElement("td"));
       totDisc.textContent = "-" + results[0]["TOTAL_DISCOUNT"] + "$";
       totDisc.style.paddingBottom = "20px";
       let shipPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
       let shipPriHeader = shipPriHeaderRow.appendChild(document.createElement("th"));
       shipPriHeader.textContent = "SHIPPING COST";
       shipPriHeader.style.textDecoration = "underline";
       let shipPriRow = stageTable.appendChild(document.createElement("tr"));
       let shipPri = shipPriRow.appendChild(document.createElement("td"));
       shipPri.textContent = results[0]["SHIPPING_PRICE"] + "$";
       shipPri.style.paddingBottom = "20px";
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
       orderStageLeft.style.height = orderStageLeftHeight + "px";

       let checkoutMessageLinkContainer = document.querySelector(".checkoutMessageLinkContainter");
       checkoutMessageLinkContainter.style.display = "block";
       retailerLink.setAttribute("href", results[0]["RET_WEB_ADD"]);
     }
  }
};

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
