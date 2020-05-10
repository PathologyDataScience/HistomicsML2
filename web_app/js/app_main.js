var uid = "";
var classifier = "";
var negClass = "";
var posClass = "";
var strlink = "";
var superpixelSize = 0;
var iteration = 0;


//
//	Initialization
//
//
$(function() {

	var	datasetSel = $("#datasetSel");


	// get session vars
	//
	$.ajax({
		url: "php/getSession.php",
		data: "",
		dataType: "json",
		success: function(data) {

			uid = data['uid'];
			classifier = data['className'];
			posClass = data['posClass'];
			negClass = data['negClass'];
			curDataset = data['dataset'];
			IIPServer = data['IIPServer'];
			datapath = data['datapath'];
			pcapath = data['pcapath'];
			superpixelSize = data['superpixelSize'];

			if( uid === null ) {
				$('#nav_select').hide();
				$('#nav_heatmaps').hide();
				$('#nav_review').hide();
				$('#nav_params').hide();
				$('#resetBtn').hide();

			} else {

				$('#beginSession').attr('disabled', 'true');
				$('#trainset').attr('disabled', 'true');
				$('#datasetSel').attr('disabled', 'true');
				$('#posClass').attr('disabled', 'true');
				$('#negClass').attr('disabled', 'true');
				$('#reloadSession').attr('disabled', 'true');
				$('#reloadDatasetSel').attr('disabled', 'true');
				$('#reloadTrainSetSel').attr('disabled', 'true');

				// No reports while session active
				$('#nav_reports').hide();
				$('#nav_data').hide();
				$('#resetBtn').show();

			}

		}
	});

	// Populate Dataset dropdown
	//
	$.ajax({
		type: "POST",
		url: "db/getdatasets.php",
		data: {},
		dataType: "json",
		success: function(data) {

			var	reloadDatasetSel = $("#reloadDatasetSel");

			curDataset = data[0];		// Use first dataset initially

			for( var item in data ) {
				datasetSel.append(new Option(data[item][0], data[item][0]));
				reloadDatasetSel.append(new Option(data[item][0], data[item][0]));
			}
			updateTrainingSets(curDataset[0]);
		}
	});

	$('#reloadTrainSetSel').change(updateTrainingSet);
	$('#reloadDatasetSel').change(updateDataset);

});





function updateDataset() {

	var dataset = reloadDatasetSel.options[reloadDatasetSel.selectedIndex].label;
	updateTrainingSets(dataset);
}





function updateTrainingSets(dataSet) {

	$.ajax({
		type: "POST",
		url: "db/getTrainsetForDataset.php",
		data: { dataset: dataSet },
		dataType: "json",
		success: function(data) {

			var	reloadTrainSel = $("#reloadTrainSetSel");
			$("#reloadTrainSetSel").empty();
			if( reloadTrainSetSel.length == 0 ) {0

				reloadTrainSetSel.classList.toggle("show");
			}

			for( var item in data.trainingSets ) {
				reloadTrainSel.append(new Option(data.trainingSets[item], data.trainingSets[item]));
			}
			updateTrainingsetInfo(data.trainingSets[0]);
		}
	});
}






function updateTrainingSet() {

	var trainSet = reloadTrainSetSel.options[reloadTrainSetSel.selectedIndex].label;

	updateTrainingsetInfo(trainSet);
}





function updateTrainingsetInfo(trainSet) {

	// initialize training set infomation before updating
	document.getElementById('reloadNeg').innerHTML = "";
	document.getElementById('reloadPos').innerHTML = "";
	// document.getElementById('reloadIter').innerHTML = data.iterations;
	document.getElementById('reloadNegCount').innerHTML = "";
	document.getElementById('reloadPosCount').innerHTML = "";

	$.ajax({
		type: "POST",
		url: "db/getTrainsetInfo.php",
		data: { trainset: trainSet },
		dataType: "json",
		success: function(data) {

			document.getElementById('reloadPos').innerHTML = data.labels[1];
			document.getElementById('reloadNeg').innerHTML = data.labels[0];
			document.getElementById('reloadIter').innerHTML = data.iterations;
			document.getElementById('reloadPosCount').innerHTML = data.counts[1];
			document.getElementById('reloadNegCount').innerHTML = data.counts[0];
			$("#reloadPosClass").val(data.labels[1]);
			$("#reloadNegClass").val(data.labels[0]);
			$("#reloadIterClass").val(data.iterations);

		}
	});
}




function displayProg() {

	$('#progDiag').modal('show');
}




function cancelSession() {

	$('#cancelDiag').modal('show');
	$('#cancelprogressBar').css("width", '50%');

	var target = "cancel";

	$.ajax({
		type: "POST",
		url: '/model/model/cancel',
		dataType: "json",
		data: {
						uid: uid,
						target: target,
						dataset: datapath,
						pca: pcapath
		},
		success: function(data) {

			$('#cancelprogressBar').css("width", '80%');
			cancel();

		}
	});

}


function cancel() {
	$.ajax({
		url: "php/cancelSession_nn.php",
		data: "",
		success: function() {
			window.location = "index.html";
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
