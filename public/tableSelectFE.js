//Function used on home page to set the form action to the page specified
//by the user's table input (via selector with id 'tableSelector'). Also
//uses local storage to pre-populate the selector with the user's last selection
//when returning to the home page.
function tableSelectFE(){
	var tableSelector = document.getElementById('tableSelector');
	if(sessionStorage.getItem('previousTableSelected') === null){
		sessionStorage.setItem('previousTableSelected', 'user');
	}
	tableSelector.value = sessionStorage.getItem('previousTableSelected');
	var tableSelectorForm = document.getElementById('tableSelectorForm');
	tableSelectorForm.setAttribute('action', '/' + tableSelector.value + 'Table');
	tableSelector.addEventListener('change', function(){
		sessionStorage.setItem('previousTableSelected', tableSelector.value);
		tableSelectorForm.setAttribute('action', '/' + tableSelector.value + 'Table');
	});
}