
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", () => {
    let orderStageRightText = document.querySelector("#order-stage-right-text");
		orderStageRightText.innerHTML = '<i class="far fa-sync fa-shopping-cart fa-spin"></i></i>';
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
       console.log(JSON.parse(req.responseText));
   		let orderStageRight = document.querySelector("#order-stage-right");
      orderStageRight.removeChild(orderStageRightText);
      orderStageRight

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

//We can type at the same time! Just like google Docs...
//Anyway, I'm just trying to get my http request to the server, and I'm not sure it's making it...
