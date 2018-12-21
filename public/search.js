//From: https://stackoverflow.com/questions/9050345/selecting-last-element-in-javascript-array
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

var prodInput = document.getElementById("prodInput");
var qtInput = document.getElementById("quantity");
var addProd = document.getElementsByClassName("btn")[0];
var stageTable = document.querySelector("#order-stage-table");
addProd.addEventListener("click", stageProduct.bind(addProd));
document.addEventListener("keypress", stageProduct.bind("null"));

function stageProduct(e){
  if(e.keyCode === 13 || (String(this) !== "null" && this.getAttribute("id") === "stage-prod")){
    if(prodInput.value !== ""){
      let row = document.createElement("tr");
      row.setAttribute("class", "searchItemRow");
      stageTable.appendChild(row);
      let prodDesc = row.appendChild(document.createElement("td"));
      prodDesc.textContent = prodInput.value;
      prodDesc.style.textOverflow = "ellipsis";
      prodDesc.style.overflow = "hidden";
      prodDesc.style.whiteSpace = "nowrap";
      prodDesc.style.fontSize = "1.15rem";
      prodDesc.setAttribute("class", "searchItem");
      let prodQT = row.appendChild(document.createElement("td"));
      prodQT.textContent = qtInput.value;
      prodQT.style.paddingLeft = ("25px");
      prodQT.style.textAlign = ("center");
      prodQT.style.fontSize = "1.15rem";
      prodQT.setAttribute("class", "qtSearchItem");
      let increaseQT = row.appendChild(document.createElement("td"));
      increaseQT.innerHTML = '<i class="fas fa-caret-up"></i>';
      increaseQT.childNodes[0].style.color = "purple";
      increaseQT.childNodes[0].style.paddingLeft = "2px";
      increaseQT.childNodes[0].addEventListener("click", () => {
        prodQT.textContent = String(Number(prodQT.textContent) + 1);
      });
      let decreaseQT = row.appendChild(document.createElement("td"));
      decreaseQT.innerHTML = '<i class="fas fa-caret-down"></i>';
      decreaseQT.childNodes[0].style.color = "rgb(39, 206, 100)";
      decreaseQT.childNodes[0].addEventListener("click", () => {
        if(Number(prodQT.textContent) >= 1){
        prodQT.textContent = String(Number(prodQT.textContent) - 1);
        }
      });
      let deleteB = row.appendChild(document.createElement("td"));
      deleteB.innerHTML = '<i class="fas fa-minus-circle"></i>';
      deleteB.childNodes[0].style.color = "red";
      deleteB.childNodes[0].addEventListener("click", () => {
        stageTable.removeChild(row);
      });
      prodInput.value = "";
    }
  }
}

// References
// https://www.w3schools.com/js/js_htmldom_elements.asp
// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
// https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
