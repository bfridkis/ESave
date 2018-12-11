function loadFakerData(){
  let values = document.querySelector("input");

  let ret_prodsInput = values[2];
  ret_prodsInput.addEventListener("input", () => {
    let prods = values[0].value;
    let rets = values[1].value;
    if(this.value > prods && this.value > rets){
      this.value = math.max(prods, rets);
    }
  });

  let submitButton = document.querySelector("button");
  submitButton.addEventListener("click", () => {
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
      if(req.status >= 200 && req.status < 400){
        let response = JSON.parse(req.responseText);
        let results = document.appendChild("p");
        results.innerText = response.Response;
      }
      else{
        let response = JSON.parse(req.statusText);
        let results = document.appendChild("p");
        results.innerText = response;
			  console.log("Error: " + req.status + " " + req.statusText);
		  }
    });
    req.send(JSON.stringify(data));
  });
}
