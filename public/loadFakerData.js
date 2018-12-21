//Front-End JavaScript for interface to load sample data into the ESave
//database. (Server uses faker package to generate most sample data items.
//See https://www.npmjs.com/package/faker for more details.)
function loadFakerData(){
  //Select all inputs
  let values = document.querySelectorAll("input");

  //Server-side logic dictates that at least one retailer must be
  //added in order to add a retailer_product. If user attempts to
  //set the retailer input field to 0 when the retailer_product input
  //field is greater than 0, set retailer_product and promotions to 0,
  //and display a message to the user accordingly. (Promotions is set to 0
  //because its value cannot exceed the value of the retailer_products input.
  //See below.)
  let retsInput = values[1];
  retsInput.addEventListener("input", e => {
    let ret_prods = values[2].value;
    let results1 = document.querySelector("#results1");
    let results2 = document.querySelector("#results2");
    if(Number(e.target.value) === 0 && ret_prods > 0){
      values[2].value = 0;
      results1.innerText = "Must add at least 1 retailer to add retailer_products."
      let promos = values[3].value;
      if(promos > values[2].value){
        values[3].value = 0;
        results2.innerText = "Promotions cannot exceed Retailer_Products."
      }
    }
    else{
      results1.innerText = "";
      results2.innerText = "";
    }
  });

  //Server-side logic dictates that at least one retailer must be
  //added in order to add a retailer_product. If user attempts to
  //set the retailer_product input field to a value greater than 0 when
  //the retailer input field equals 0, prevent input and display message
  //accordingly.
  let ret_prodsInput = values[2];
  ret_prodsInput.addEventListener("input", e => {
    let prods = values[0].value;
    let rets = values[1].value;
    let results1 = document.querySelector("#results1");
    if(e.target.value > 0 && Number(rets) === 0){
      e.target.value = 0;
      results1.innerText = "Must add at least 1 retailer to add retailer_product."
    }
    else{
      results1.innerText = "";
    }
  });

  //In order to ensure there are enough retailer_product primary keys available
  //for each sample promotion requested, the promotions input field value must be
  //less than or equal to the value of the retailer_products info. If the user
  //attempts to set the value of the promotions field greater than that of the
  //retailer_products field, disallow this input modification and display a
  //message to the user accordingly.
  let promotionsInput = values[3];
  promotionsInput.addEventListener("input", e => {
    let ret_prods = values[2].value;
    let results1 = document.querySelector("#results1");
    if(Number(e.target.value) > Number(ret_prods)){
      e.target.value = ret_prods;
      results1.innerText = "Promotions cannot exceed Retailer_Products."
    }
    else{
      results1.innerText = "";
    }
  });

  let submitButton = document.querySelector("button");
  let resultCount = 0;
  submitButton.addEventListener("click", submit.bind(submitButton));
  document.addEventListener("keypress", submit.bind("null"));

  let resetButton = document.querySelector("reset");
  document.addEventListener("click", reset);

  //Event listener for submitting request to load sample data...
  function submit(e){
    //User can press enter key or click submit button to sumbit request.
    if(e.keyCode === 13 || (String(this) !== "null" && this.getAttribute("id") === "submit")){
      let prods = values[0].value,
          rets = values[1].value,
          ret_prods = values[2].value,
          promos = values[3].value,
          pw = values[4].value;
      if(prods < ret_prods && rets < ret_prods){
        let results1 = document.querySelector("#results1");
        results1.innerText = "Either Products or Retailers (or both) must equal or exceed Retailer_Products.";
        values[2].value = Math.max(prods, rets);
      }
      else{
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
              results1.innerHTML = `ERROR MESSAGE: ${response1}&nbsp(Request # ${resultCount})`;
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

  function reset(e){
    let pw = document.querySelectorAll("input")[4].value;
    let req = new XMLHttpRequest;
    req.open("DELETE", "/loadFakerData?pw=" + pw, true);
    req.addEventListener('load', () => {
      let results1 = document.querySelector("#results1"),
          results2 = document.querySelector("#results2");
      if(typeof(JSON.parse(req.responseText).Response !== "undefined")){
        results1.innerText = JSON.parse(req.responseText).Response;
        results2.innerText = "";
      }
      else{
        response1 = req.status + " " + req.statusText;
        results1.innerText = response1;
        results2.innerText = "";
      }
    });
    req.send(null);
  }
}

// * References
// * https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript
// * https://stackoverflow.com/questions/8796988/binding-multiple-events-to-a-listener-without-jquery
// * https://stackoverflow.com/questions/14542062/eventlistener-enter-key
// * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
// * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/which
