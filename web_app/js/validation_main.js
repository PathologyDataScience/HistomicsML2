
var uid = "";
var tempUID = "5zeefce763e4d1.18563122";
var classifier = "";
var negClass = "";
var posClass = "";
var curDataSet = "";
var datapath = "";

//
//	Initialization
//
//
$(function() {

	// get session vars
	//
	$.ajax({
		url: "php/getSession.php",
		data: "",
		dataType: "json",
		success: function(data) {

			uid = data['uid'];
			// Reusing getSession.php for picker, className is the testset name
			testset = data['className'];
			posClass = data['posClass'];
			negClass = data['negClass'];
			curDataset = data['dataset'];
			datapath = data['datapath'];
			IIPServer = data['IIPServer'];
			reloaded = data['reloaded'];
			superpixelSize = data['superpixelSize'];

		}
	});

	// Populate Dataset dropdown
	//
	$.ajax({
		type: "POST",
		url: "db/getdatasets.php",
		data: "",
		dataType: "json",
		success: function(data) {

				var	datasetSel = $("#datasetSel"),
					reloadDatasetSel = $("#reloadDatasetSel"),
					validateTrainDatasetSel = $("#validateTrainDatasetSel");
					validateDatasetSel = $("#validateDatasetSel");
				curDataset = data[0];

			for( var item in data ) {
				datasetSel.append(new Option(data[item][0], data[item][0]));
				reloadDatasetSel.append(new Option(data[item][0], data[item][0]));
				validateTrainDatasetSel.append(new Option(data[item][0], data[item][0]));
				validateDatasetSel.append(new Option(data[item][0], data[item][0]));
			}

			updateTestSets(curDataset[0]);
			updateTrainSets(curDataset[0]);
			updateSetsForValidate(curDataset[0]);
		}
	});
	$('#reloadDatasetSel').change(updateDataSet);
	$('#validateTrainDatasetSel').change(updateDataSetforTrain);
	$('#validateDatasetSel').change(updateDataSetforTest);


	$("#validate_form").on("submit", function(e){
		$('#valDiag').modal('show');
		$('#countprogressBar').css("width", '10%');
		var dataLabel = {};
		dataLabel['id'] = tempUID;
		dataLabel['uid'] = tempUID;
		dataLabel['target'] = 'validate';
		dataLabel['pca'] = 'validate';
		dataLabel['dataset'] = curDataset[1];
		dataLabel['trainset'] = document.getElementById("validateTrainsetSel").value;
		dataLabel['testset'] = document.getElementById("validateTestsetSel").value;

		$.ajax({
			 type: 'POST',
			 url: '/model/model/validate',
			 data: JSON.stringify(dataLabel),
			 contentType: 'application/json;charset=UTF-8',
			 dataType: "json",
			 success: function(data){
					$('#countprogressBar').css("width", '80%');
					var dt = JSON.parse(data);
					var link = document.createElement('a');
					var filename = dt['success'].split("/");
					link.href = dt['success'];
					link.download = filename[filename.length - 1];
					document.body.appendChild(link);
					link.click();
					$('#valDiag').modal('hide');
			 },
			 error: function() {
				 console.log("Validate failed");
			 }
		 });
		 e.preventDefault();
		});

});

function updateDataSetforTrain() {

	var sel = document.getElementById('validateTrainDatasetSel'),
			  dataset = sel.options[sel.selectedIndex].label;

	updateTrainSets(dataset);
}

function updateDataSetforTest() {

	var sel = document.getElementById('validateDatasetSel'),
			  dataset = sel.options[sel.selectedIndex].label;

	updateSetsForValidate(dataset);
}

function updateDataSet() {

	var sel = document.getElementById('reloadDatasetSel'),
			  dataset = sel.options[sel.selectedIndex].label;

	updateTestSets(dataset);
}



function updateTestSets(dataset) {

	$.ajax({
		type: "POST",
		url: "db/getTestsetForDataset.php",
		data: { dataset: dataset },
		dataType: "json",
		success: function(data) {

			var reloadTestSel = $("#reloadTestSetSel");

			$("#reloadTestSetSel").empty();

			if( reloadTestSel.length == 0 ) {
				reloadTestSel.classList.toggle("show");
			}

			if( data.testSets.length === 0 ) {
				document.getElementById('reloadPicker').disabled = true;
			} else {
				document.getElementById('reloadPicker').disabled = false;
			}

			for( var item in data.testSets ) {
				reloadTestSel.append(new Option(data.testSets[item], data.testSets[item]));
			}
		},
		error: function(x,s,e) {
			console.log("Error:"+e);
		}
	});

}

function updateSetsForValidate(dataset) {

	$.ajax({
		type: "POST",
		url: "db/getTestsetForDataset.php",
		data: { dataset: dataset },
		dataType: "json",
		success: function(data) {

			var validateTestSel = $("#validateTestsetSel");

			$("#validateTestsetSel").empty();

			if( validateTestSel.length == 0 ) {
				validateTestSel.classList.toggle("show");
			}

			for( var item in data.testSets ) {
				validateTestSel.append(new Option(data.testSets[item], data.testSets[item]));
			}
		},
		error: function(x,s,e) {
			console.log("Error:"+e);
		}
	});
}


function updateTrainSets(dataSet) {

	$.ajax({
		type: "POST",
		url: "db/getTrainsetForDataset.php",
		data: { dataset: dataSet },
		dataType: "json",
		success: function(data) {

			var	reloadTrainSel = $("#validateTrainsetSel");
			$("#validateTrainsetSel").empty();

			for( var item in data.trainingSets ) {
				reloadTrainSel.append(new Option(data.trainingSets[item], data.trainingSets[item]));
			}
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



function displayProg() {

	$('#progDiag').modal('show');
}
