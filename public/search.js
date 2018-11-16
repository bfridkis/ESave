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
addProd.addEventListener("click", () => {
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
    let deleteB = row.appendChild(document.createElement("td"));
    deleteB.innerHTML = '<i class="fas fa-minus-circle"></i>';
    deleteB.childNodes[0].style.color = "red";
    deleteB.childNodes[0].style.paddingLeft = "10px";
    deleteB.childNodes[0].addEventListener("click", () => {
      stageTable.removeChild(row);
    });
  }
});

var

// References
// https://www.w3schools.com/js/js_htmldom_elements.asp
// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
// https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
