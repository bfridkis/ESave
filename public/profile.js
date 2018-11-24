document.getElementById('username_input').setAttribute("disabled", "disabled");
document.getElementById('firstname_input').setAttribute("disabled", "disabled");
document.getElementById('lastname_input').setAttribute("disabled", "disabled");
document.getElementById('email_input').setAttribute("disabled", "disabled");
var input = document.getElementById("editBtn");

input.addEventListener("click", () => {
  var x = document.getElementById("username_input");
  document.getElementById('username_input').removeAttribute("disabled");
  document.getElementById('firstname_input').removeAttribute("disabled");
  document.getElementById('lastname_input').removeAttribute("disabled");
  document.getElementById('email_input').removeAttribute("disabled");
  document.getElementById("saveBtn").style.display = "block";
  document.getElementById("editBtn").style.display = "none";
});
