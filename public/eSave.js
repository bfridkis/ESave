
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", () => {
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
    let req = new XMLHttpRequest();
    req.open("GET", queryString, true);
    req.addEventListener("load", () => {
      if(req.status >= 200 && req.status < 400){
        console.log(req.status + " " + req.statusText);
       //window.location.replace("/search");
       let results = JSON.parse(req.responseText);
        console.log(results);
        sleepFor(2000);
     		let orderStageRight = document.querySelector("#order-stage-right");
        orderStageRight.style.borderColor = "rgb(39, 206, 100)";
        let shoppingCart = document.querySelector("#shopping-cart-inner");
        shoppingCart.classList.toggle("sparkley");
        orderStageRightText.innerHTML = "";
        let stageTable = document.createElement("table");
        stageTable.style.margin = "auto";
        orderStageRight.appendChild(stageTable);
        let prodNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let prodNameHeader = prodNameHeaderRow.appendChild(document.createElement("th"));
        prodNameHeader.textContent = "PRODUCT";
        prodNameHeader.style.textDecoration = "underline";
        let prodNameRow = stageTable.appendChild(document.createElement("tr"));
        let prodName = prodNameRow.appendChild(document.createElement("td"));
        prodName.textContent = results[0]["PROD_NAME"];
        let retNameHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let retNameHeader = retNameHeaderRow.appendChild(document.createElement("th"));
        retNameHeader.textContent = "RETAILER";
        retNameHeader.style.textDecoration = "underline";
        let retNameRow = stageTable.appendChild(document.createElement("tr"));
        let retName = retNameRow.appendChild(document.createElement("td"));
        retName.textContent = results[0]["RET_NAME"];
        let ppuHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let ppuHeader = ppuHeaderRow.appendChild(document.createElement("th"));
        ppuHeader.textContent = "PRICE PER UNIT";
        ppuHeader.style.textDecoration = "underline";
        let ppuRow = stageTable.appendChild(document.createElement("tr"));
        let ppu = ppuRow.appendChild(document.createElement("td"));
        ppu.textContent = results[0]["PRICE_PER_UNIT"];
        let initBDSPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let initBDSPriHeader = initPriHeaderRow.appendChild(document.createElement("th"));
        initPriHeader.textContent = "TOTAL BEFORE SHIPPING AND PROMOTIONS";
        initPriHeader.style.textDecoration = "underline";
        let initPriRow = stageTable.appendChild(document.createElement("tr"));
        let initPri = initPriRow.appendChild(document.createElement("td"));
        initPri.textContent = results[0]["INITIAL_PRICE"];
        let initPriBDS = initPriRow.appendChild(document.createElement("td"));
        initPriBDS.style.fontSize = "1rem";
        initPriBDS.style.textDecoration = "italic";
        initPriBDS.textContent = "( " + qts[0].textContent + " x " + results[0]["PRICE_PER_UNIT"] + " )";
        let totDiscHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let totDiscHeader = totDiscHeaderRow.appendChild(document.createElement("th"));
        totDiscHeader.textContent = "TOTAL DISCOUNT";
        totDiscHeader.style.textDecoration = "underline";
        let totDiscRow = stageTable.appendChild(document.createElement("tr"));
        let totDisc = totDiscRow.appendChild(document.createElement("td"));
        totDisc.textContent = results[0]["TOTAL_DISCOUNT"];
        let shipPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let shipPriHeader = shipPriHeaderRow.appendChild(document.createElement("th"));
        shipPriHeader.textContent = "RETAILER";
        shipPriHeader.style.textDecoration = "underline";
        let shipPriRow = stageTable.appendChild(document.createElement("tr"));
        let shipPri = shipPriRow.appendChild(document.createElement("td"));
        shipPri.textContent = results[0]["SHIPPING_PRICE"];
        let totPriHeaderRow = stageTable.appendChild(document.createElement("tr"));
        let totPriHeader = totPriHeaderRow.appendChild(document.createElement("th"));
        totPriHeader.textContent = "RETAILER";
        totPriHeader.style.textDecoration = "underline";
        let totPriRow = stageTable.appendChild(document.createElement("tr"));
        let totPri = totPriRow.appendChild(document.createElement("td"));
        totPri.textContent = results[0]["TOTAL_PRICE"];
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

  async function sleepFor(time_ms) {
    console.log('Taking a break...');
    await sleep(time_ms);
    console.log('Two seconds later');
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

//We can type at the same time! Just like google Docs...
//Anyway, I'm just trying to get my http request to the server, and I'm not sure it's making it...
