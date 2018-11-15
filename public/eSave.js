
function eSave(){
  let eSaveButton = document.querySelector("#esave-button");
  eSaveButton.addEventListener("click", () => {
    let items = document.getElementsByClassName("searchItem");
    items = [...items];
    let queryString = "/search?";
    items.forEach((item, i) => {
      queryString += "p" + (i + 1) + "=" + String(item.textContent);
    });
    console.log(queryString);
    let req = new XMLHttpRequest();
    req.open("GET", queryString, true);
    req.addEventListener("load", () => {
      if(req.status >= 200 && req.status < 400){
        //Now I'm here, logging client side to see what status
        //I'm getting, if any...
        console.log(req.status + " " + req.statusText);
        window.location.replace("/search");
      }
      else{
        alert("Error: " + req.status + " " + req.statusText);
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

//We can type at the same time! Just like google Docs...
//Anyway, I'm just trying to get my http request to the server, and I'm not sure it's making it...
