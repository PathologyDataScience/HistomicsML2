var tempUID = "5zeefce763e4d1.18563122";
var uid = "";
var datapath = "";
var pcapath = "";
var activation = "";
var optimizer = "";
var learning_rate = "";
var epochs = "";
var dropout = "";
var dataLabel = {};

$(function() {

	// get slide host info
	//
	$.ajax({
		url: "php/getSession.php",
		data: "",
		dataType: "json",
		success: function(data) {

			uid = data['uid'];
			datapath = data['datapath'];
			pcapath = data['pcapath'];
			activation = data['activation'];
			optimizer = data['optimizer'];
			epochs = data['epochs'];
			learning_rate = data['learning_rate'];
			dropout = data['dropout'];

			$("#activationtxt").text(activation);
			$("#optimizertxt").text(optimizer);
			$("#epochstxt").text(epochs);
			$("#learning_ratetxt").text(learning_rate);
			$("#dropouttxt").text(dropout);
		}
	});

	$("#params_form").on("submit", function(e){

		dataLabel['uid'] = uid;
		dataLabel['dataset'] = datapath;
		dataLabel['pca'] = pcapath;
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
					$("#activationtxt").text(dt['activation']);
					$("#optimizertxt").text(dt['optimizer']);
					$("#epochstxt").text(dt['epochs']);
					$("#learning_ratetxt").text(dt['learning_rate']);
					$("#dropouttxt").text(dt['dropout']);

			 },
			 error: function() {
				 console.log("Params setting failed");
			 }
		 });

		 setParameters();
		 e.preventDefault();
		});

});

function setParameters() {
	// get session vars
	$.ajax({
		type: "POST",
		url: "php/updateSession_nn.php",
		data: { activation: dataLabel['activation'],
						optimizer: dataLabel['optimizer'],
						learning_rate: dataLabel['learning_rate'],
						epochs: dataLabel['epochs'],
						dropout: dataLabel['dropout']
		},
		dataType: "json",
		success: function(data) {

		}
	});
}

function updateParameters() {

	// get parameters info
	//
	$.ajax({
		 type: 'POST',
		 url: '/model/model/getparams',
		 data: JSON.stringify(dataLabel),
		 contentType: 'application/json;charset=UTF-8',
		 dataType: "json",
		 success: function(data){
				var dt = JSON.parse(data);
				$("#activationtxt").text(dt['activation']);
				$("#optimizertxt").text(dt['optimizer']);
				$("#epochstxt").text(dt['epochs']);
				$("#learning_ratetxt").text(dt['learning_rate']);
				$("#dropouttxt").text(dt['dropout']);

		 },
		 error: function() {
			 console.log("Params setting failed");
		 }
	 });

}

//
// Retruns the value of the GET request variable specified by name
//
//
function $_GET(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g,' '));
}
