var uid = "";
var projectDirMain = "";
var projectDir ="";
var array_mean = "";

$(function() {

	projectDirMain = "/datasets/";

	$.ajax({
		type: "POST",
		url: "php/data_getprojects.php",
		data: { projectDirMain: projectDirMain },
		dataType: "json",
		success: function(data) {
			// set first featurename
			for (var i = 0; i < data['projectDir'].length; i++) {
				$("#projectSel").append(new Option(data['projectDir'][i], data['projectDir'][i]));
			}
			updateFeature();
		}
	});

	// $.ajax({
	// 	type: "POST",
	// 	url: "db/getdatasets.php",
	// 	data: {},
	// 	dataType: "json",
	// 	success: function(data) {
	// 		// set first featurename
	// 		for( var item in data ) {
	// 			$("#projectSel").append(new Option(data[item][0], data[item][0]));
	// 		}
	// 		updateFeature();
	// 	}
	// });
	//

	$("#projectSel").change(updateFeature);

	$.ajax({
		type: "POST",
		url: "db/getdatasets.php",
		data: {},
		dataType: "json",
		success: function(data) {

			for( var item in data ) {
				$("#deleteDatasetSel").append(new Option(data[item][0], data[item][0]));
			}
		}
	});


	//$("#datasetSel").change(updateFeatures);
	$('#progDiag').modal('hide');
	$('#_form').submit(function() {
  		$('#progDiag').modal('show');
	});


});




//
//	Updates the list of feature files located in the project directory
//
function updateFeature() {

	projectDir = projectDirMain+projectSel.options[projectSel.selectedIndex].label;

	$('#pyramidSel').empty();
	$('#featureSel').empty();
	$('#pcaSel').empty();


	$.ajax({
		type: "POST",
		url: "php/data_getdatasetsfromdir.php",
		data: { projectDir: projectDir,
					},
		dataType: "json",
		success: function(data) {

			for (var i = 0; i < data['featureName'].length; i++) {
				$("#featureSel").append(new Option(data['featureName'][i], data['featureName'][i]));
			}
		}
	});

	$.ajax({
		type: "POST",
		url: "php/data_getpyramidinfofromdir.php",
		data: { projectDir: projectDir },
		dataType: "json",
		success: function(data) {

			for (var i = 0; i < data['slideInfo'].length; i++) {
				$("#pyramidSel").append(new Option(data['slideInfo'][i], data['slideInfo'][i]));
			}
		}
	});

	$.ajax({
		type: "POST",
		url: "php/data_getpcainfofromdir.php",
		data: { projectDir: projectDir },
		dataType: "json",
		success: function(data) {

			for (var i = 0; i < data['pcaInfo'].length; i++) {
				$("#pcaSel").append(new Option(data['pcaInfo'][i], data['pcaInfo'][i]));
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
