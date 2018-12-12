function loadFakerData(){
  let values = document.querySelectorAll("input");

  let ret_prodsInput = values[2];
  ret_prodsInput.addEventListener("input", () => {
    let prods = values[0].value;
    let rets = values[1].value;
    if(this.value > prods && this.value > rets){
      this.value = math.max(prods, rets);
    }
  });

  let submitButton = document.querySelector("button");
  let resultCount = 0;
  submitButton.addEventListener("click", submit);
  document.addEventListener("keypress", submit);

  function submit(){
    if(this.getAttribute("id") === "submit" || this.keyCode === "13"){
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
        if(req.status >= 200 && req.status < 400 &&
            typeof(JSON.parse(req.responseText).sqlMessage) === "undefined"){
          let response = JSON.parse(req.responseText).Response;
          let results1 = document.querySelector("#results1");
          if(results1.innerText === ""){
            results1.innerText = response;
          }
          else{
            results1.innerHTML = `${response}&nbsp(Request # ${resultCount})`;
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
          let results1 = document.querySelector("#results1"),
              results2 = document.querySelector("#results2");
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
    });
  }
}

// * References
// * https://stackoverflow.com/questions/1789945/how-to-check-whether-a-string-contains-a-substring-in-javascript
// * https://stackoverflow.com/questions/8796988/binding-multiple-events-to-a-listener-without-jquery
// * https://stackoverflow.com/questions/14542062/eventlistener-enter-key
