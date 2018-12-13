//AJAX request to delete row via a "DELETE" request.
function deleteRow(primaryKeys, primaryKeyValues entity){
/*  --jQuery Version - Kept here for reference--

	var pageRequest = '/' + entity + 'Table' + '/';
	$.ajax({
	url: pageRequest + id,
	type: 'DELETE',
	success: function(result){
		window.location.reload(true);
		}
	})
*/
	var windowToReplace = '/' + entity + 'Table';
	var pageRequest = `/${entity}Table/${primaryKeys}/${primaryKeyValues}`;
	var req = new XMLHttpRequest();
	req.open("DELETE", pageRequest, true);
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			window.location.replace(windowToReplace);
		}
		else{
			alert("Error: " + req.status + " " + req.statusText);
		}
	})
	req.send(null);
};
