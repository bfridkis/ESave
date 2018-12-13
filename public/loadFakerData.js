function loadFakerData(){
  let values = document.querySelectorAll("input");

  let retsInput = values[1];
  retsInput.addEventListener("input", e => {
    let ret_prods = values[2].value;
    if(e.target.value === 0 && ret_prods > 0){
      values[2].value = 0;
      let results1 = document.querySelector("#results1");
      results1.innerText = "Must add at least 1 retailer to add retailer_products."
      let promos = values[3].value;
      if(promos > values[2].value){
        values[3].value = values[2].value;
        let results2 = document.querySelector("#results2");
        results2.innerText = "Promotions cannot exceed Retailer_Products."
      }
    }
  });

  let ret_prodsInput = values[2];
  ret_prodsInput.addEventListener("input", e => {
    let prods = values[0].value;
    let rets = values[1].value;
    if(e.target.value > prods && e.target.value > rets){
      e.target.value = Math.max(prods, rets);
      let results1 = document.querySelector("#results1");
      results1.innerText = "Retailer_Products cannot exceed both Products and Retailers."
    }
    if(e.target.value > 0 && rets === 0){
      e.target.value = 0;
      let results1 = document.querySelector("#results1");
      results1.innerText = "Must add at least 1 retailer to add retailer_product."
    }
  });

  let promotionsInput = values[3];
  promotionsInput.addEventListener("input", e => {
    let ret_prods = values[2].value;
    if(e.target.value > ret_prods){
      e.target.value = ret_prods;
      let results1 = document.querySelector("#results1");
      results1.innerText = "Promotions cannot exceed Retailer_Products."
    }
  });

  let submitButton = document.querySelector("button");
  let resultCount = 0;
  submitButton.addEventListener("click", submit.bind(submitButton));
  document.addEventListener("keypress", submit.bind("null"));

  function submit(e){
    if(e.keyCode === 13 || (String(this) !== "null" && this.getAttribute("id") === "submit")){
      let prods = values[0].value,
          rets = values[1].value,
          ret_prods = values[2].value,
          promos = values[3].value,
          pw = values[4].value;
      if(prods < ret_prods && rets < ret_prods){
        alert("Either Products or Retailers (or both) must equal or exceed Retailer_Products.");
        if(ret_prods < promos){
          alert("Retailer_Products must equal or exceed Promotions.");
        }
      }
      else if(ret_prods < promos){
        alert("Retailer_Products must equal or exceed Promotions.");
      }
      let req = new XMLHttpRequest;
      req.open("POST", "/loadFakerData", true);
      req.setRequestHeader('Content-Type', 'application/json');
      let data = {numProds: prods,
                  numRets: rets,
                  numRetProds: ret_prods,
                  numPromos: promos,
                  password: pw};
      req.addEventListener('load', () => {
        resultCount++;
        let results1 = document.querySelector("#results1"),
            results2 = document.querySelector("#results2");
        if(req.status >= 200 && req.status < 400 &&
            typeof(JSON.parse(req.responseText).sqlMessage) === "undefined"){
          let response = JSON.parse(req.responseText).Response;
          if(results1.innerText === ""){
            results1.innerText = response;
          }
          else{
            results1.innerHTML = `${response}&nbsp(Request # ${resultCount})`;
            results2.innerText = "";
          }
        }
        else{
          let response1, response2;
          if(!(req.responseText.includes("<html>"))){
            response1 = JSON.parse(req.responseText).sqlMessage;
            response2 = JSON.parse(req.responseText).sql;
          }
          else{
            response1 = req.status + " " + req.statusText;
          }
          if(results1.innerText === ""){
            results1.innerText = `ERROR MESSAGE: ${response1}`;
          }
          else{
            results1.innerHTML = `SQL MESSAGE: ${response1}&nbsp(Request # ${resultCount})`;
          }
          if(typeof(response2) !== "undefined"){
            results2.innerText = `SQL: ${response2}`;
          }
  			  console.log("Error: " + req.status + " " + req.statusText);
  		  }
      });
      req.send(JSON.stringify(data));
    }
  }
}

// * References
// * https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript
// * https://stackoverflow.com/questions/8796988/binding-multiple-events-to-a-listener-without-jquery
// * https://stackoverflow.com/questions/14542062/eventlistener-enter-key
// * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
// * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/which
