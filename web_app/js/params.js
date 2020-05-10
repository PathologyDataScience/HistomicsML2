var tempUID = "5zeefce763e4d1.18563122";

$(function() {

	$("#params_form").on("submit", function(e){

		var dataLabel = {};
		dataLabel['id'] = tempUID;
		dataLabel['uid'] = tempUID;
		dataLabel['target'] = 'params';
		dataLabel['activation'] = document.getElementById("activationLabelSel").value;
		dataLabel['optimizer'] = document.getElementById("optimizerLabelSel").value;
		dataLabel['epochs'] = document.getElementById("epochs").value;
		dataLabel['learning_rate'] = document.getElementById("learning_rate").value;
		dataLabel['dropout'] = document.getElementById("dropout").value;

		$.ajax({
			 type: 'POST',
			 url: '/model/model/params',
			 data: JSON.stringify(dataLabel),
			 contentType: 'application/json;charset=UTF-8',
			 dataType: "json",
			 success: function(data){
				 	var dt = JSON.parse(data);
					$("#activationtxt").val(dt['activation']);
					$("#optimizertxt").val(dt['optimizer']);
					$("#epochstxt").val(dt['epochs']);
					$("#learning_ratetxt").val(dt['learning_rate']);
					$("#dropouttxt").val(dt['dropout']);

			 },
			 error: function() {
				 console.log("Params setting failed");
			 }
		 });
		 e.preventDefault();
		});

});

//
// Retruns the value of the GET request variable specified by name
//
//
function $_GET(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g,' '));
}
