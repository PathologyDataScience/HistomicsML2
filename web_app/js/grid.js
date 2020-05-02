var annoGrpTransformFunc;
var uid = "";
var classifier = "";
var negClass = "";
var posClass = "";
var IIPServer = "";
var SlideSuffix = ".svs-tile.dzi.tif";
var SlideLocPre = "&RGN=";
var SlideLocSuffix = "&CVT=jpeg";

var viewer = null, imgHelper = null, osdCanvas = null;
var olDiv = null;

var lastScaleFactor = 0;
var	sampleDataJson = "";
var	slideCenxCenyJson = "";
var	boxes = ["box_1", "box_2", "box_3", "box_4", "box_5", "box_6","box_7", "box_8"];
var curDataset;
var datapath = "";
var pcapath = "";
var curBox = -1;
var curX = 0, curY = 0;

var boundaryOn = true;
var reloaded = false;
var init_reloaded = false;
var superpixelSize = 0;
var iteration = 0;
var trainingSetName = "";

//
//	Initialization
//
//
$(function() {

	if (statusObj.iteration() === 0){
		// Display the progress dialog...
		$('#progDiag').modal('show');
	}

	// Setup the thumbnail scroller
	//
	var	width = 0;


	$('#overflow .slider div').each(function() {
		width += $(this).outerWidth(true);
	});

	$('#overflow .slider').css('width', width + "px");

	// get session vars
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
			datapath = data['datapath'];
			pcapath = data['pcapath'];
			IIPServer = data['IIPServer'];
			reloaded = data['reloaded'];
			init_reloaded = data['init_reloaded'];
			superpixelSize = data['superpixelSize'];

			if( reloaded == true ) {
				iteration = data['iteration'];
				// datapath = data['dataSetPath'];
				trainingSetName = data['trainingSetName'];
				statusObj.iteration(iteration);
				$('#progressBar').css("width", '10%');
				reloadTrainingSet();
				setReloaded();
			}

			else {
				first_train_predict_get_samples();
			}

			if( uid == null ) {
				window.alert("No session active");
				window.history.back();
			}

		}
	});

	// Create the slide zoomer, update slide count etc...
	// We will load the tile pyramid after the slide list is loaded
	//
	viewer = new OpenSeadragon.Viewer({ showNavigator: true, id: "slideZoom", prefixUrl: "images/", animationTime: 0.1});
	imgHelper = viewer.activateImagingHelper({onImageViewChanged: onImageViewChanged});

	annoGrpTransformFunc = ko.computed(function() {
										return 'translate(' + svgOverlayVM.annoGrpTranslateX() +
										', ' + svgOverlayVM.annoGrpTranslateY() +
										') scale(' + svgOverlayVM.annoGrpScale() + ')';
									}, this);

	//
	// Image handlers
	//
	viewer.addHandler('open', function(event) {
		osdCanvas = $(viewer.canvas);
		statusObj.haveImage(true);

		osdCanvas.on('mouseenter.osdimaginghelper', onMouseEnter);
		osdCanvas.on('mousemove.osdimaginghelper', onMouseMove);
		osdCanvas.on('mouseleave.osdimaginghelper', onMouseLeave);

		statusObj.imgWidth(imgHelper.imgWidth);
		statusObj.imgHeight(imgHelper.imgHeight);
		statusObj.imgAspectRatio(imgHelper.imgAspectRatio);
		statusObj.scaleFactor(imgHelper.getZoomFactor());

		// Zoom and pan to selected nuclei
		homeToNuclei();
	});



	viewer.addHandler('close', function(event) {
		osdCanvas = $(viewer.canvas);
		statusObj.haveImage(false);

		//viewer.drawer.clearOverlays();
        osdCanvas.off('mouseenter.osdimaginghelper', onMouseEnter);
        osdCanvas.off('mousemove.osdimaginghelper', onMouseMove);
        osdCanvas.off('mouseleave.osdimaginghelper', onMouseLeave);

		osdCanvas = null;
		statusObj.curSlide("");

	});


	viewer.addHandler('animation-finish', function(event) {

		var annoGrp = document.getElementById('annoGrp');
		var sampGrp = document.getElementById('sample');

		if( sampGrp != null ) {
			sampGrp.parentNode.removeChild(sampGrp);
		}

		if( annoGrp != null ) {
			sampGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
			sampGrp.setAttribute('id', 'sample');
			annoGrp.appendChild(sampGrp);

			ele = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			ele.setAttribute('points', sampleDataJson['samples'][curBox]['boundary']);
			ele.setAttribute('id', 'boundary');
			ele.setAttribute('fill', 'yellow');
			ele.setAttribute("fill-opacity", "0.2");

			if( boundaryOn ) {
				ele.setAttribute('visibility', 'visible');
				// Make sure toggle button refects the correct action and is enabled
				$('#toggleBtn').val("Hide segmentation");
				$('#toggleBtn').removeAttr('disabled');
			} else {
				ele.setAttribute('visibility', 'hidden');
			}
			sampGrp.appendChild(ele);

			$('.overlaySvg').css('visibility', 'visible');
		}
	});



	// Assign click handlers to each of the thumbnail divs
	//
	boxes.forEach(function(entry) {

		var	box = document.getElementById(entry);
		var	clickCount = 0;

		box.addEventListener('click', function() {
			clickCount++;
			if( clickCount === 1 ) {
				singleClickTimer = setTimeout(function() {
					clickCount = 0;
					thumbSingleClick(entry);
				}, 200);
			} else if( clickCount === 2 ) {
				clearTimeout(singleClickTimer);
				clickCount = 0;
				thumbDoubleClick(entry);
			}
		}, false);
	});

});



function setReloaded() {
	// get session vars
	$.ajax({
		url: "php/setSession.php",
		data: "",
		dataType: "json",
		success: function(data) {

		}
	});
}

//
//	A double click in the thumbnail box toggles the current classification
//	of the object.
//
//
function thumbDoubleClick(box) {

	var index = boxes.indexOf(box);
	var label = sampleDataJson['samples'][index]['label'];

	// Toggle through the 2 states, pos, neg
	//
	if( label === 1 ) {
		sampleDataJson['samples'][index]['label'] = -1;
	} else {
		sampleDataJson['samples'][index]['label'] = 1;
	}

	updateClassStatus(index);
};






//
// A single click in the thumbnail box loads the appropriate slide into the viewer
// and pans and zooms to the specific object.
//
//
function thumbSingleClick(box) {

	// Load the appropriate slide in the viewer
	var index = boxes.indexOf(box);
	if( curBox != index ) {

		var newSlide = sampleDataJson['samples'][index]['slide'];

		// Slide loading process pans to the current nuclei, make sure
		// curX and curY are updated before loading a new slide.
		//
		curX = Math.round(sampleDataJson['samples'][index]['centX']);
		curY = Math.round(sampleDataJson['samples'][index]['centY']);

		if( statusObj.curSlide() == "" ) {
			statusObj.curSlide(newSlide);
			updateSlideView();
 		} else {
 			if( statusObj.curSlide() != newSlide ) {
				viewer.close();
				statusObj.curSlide(newSlide);
				updateSlideView();
			} else {
				// On same slide,, no need to load it again
				homeToNuclei();
 			}
		}

		// Mark the selected box with a gray background
		var boxDiv = "#"+box;
		$(boxDiv).css('background', '#CCCCCC');

		// Clear previously selected box if there was one
		if( curBox != -1 && curBox != index ) {
			boxDiv = "#"+boxes[curBox];
			$(boxDiv).css('background', '#FFFFFF');
		}
		curBox = index;
		boundaryOn = true;
	}
};






function updateSlideView() {


	$.ajax({
		type: "POST",
		url: "db/getPyramidPath.php",
		dataType: "json",
		data: { slide: statusObj.curSlide() },
		success: function(data) {

				// Zoomer needs '.dzi' appended to the end of the filename
				pyramid = "DeepZoom="+data[0]+".dzi";
				viewer.open(IIPServer + pyramid);
		}
	});
}





function homeToNuclei() {

	// Zoom in all the way
	viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());
	// Move to nucei
	imgHelper.centerAboutLogicalPoint(new OpenSeadragon.Point(imgHelper.dataToLogicalX(curX),
															  imgHelper.dataToLogicalY(curY)));
}




function first_train_predict_get_samples() {

	var target = 'selectonly';
	$.ajax({
			type: 'POST',
			url: '/model/model/selectonly',
			data: {
							uid: uid,
							target: target,
							iteration: iteration.toString(),
							dataset: datapath,
							pca: pcapath,
			},
			dataType: "json",
			success: function(data){

				slideCenxCenyJson = JSON.parse(data);
				statusObj.iteration(iteration);
				$('#progressBar').css("width", '60%');
				updateSamples();
			},
			error: function() {
				console.log("First prediction failed");
			}
		});

}

function next_train_predict_get_samples() {

	var target = 'selectonly';

	$.ajax({
		type: "POST",
		url: '/model/model/selectonly',
		dataType: "json",
		data: {
						uid: uid,
						target: target,
						iteration: iteration.toString(),
						dataset: datapath,
						pca: pcapath,
		},
		success: function(data) {

			$('#progressBar').css("width", '60%');
			slideCenxCenyJson = JSON.parse(data);
			iteration = iteration + 1;
			statusObj.iteration(iteration);
			updateSamples();
		}
	});


}


function updateSamples() {

	$.ajax({
		type: "POST",
		url: "php/selectSamples.php",
		data: slideCenxCenyJson,
		dataType: "json",
		success: function(data) {

			sampleDataJson = data;

			if( statusObj.curSlide() != "" ) {

				viewer.close();
				statusObj.curSlide("");
			};

			var slide, centX, centY, sizeX, sizeY, loc, thumbNail, scale;
			var sampleArray = data['samples'];
			var scale_cent = 25;
			var scale_size = 50.0;

			if (superpixelSize == "8") {
				scale_cent = 18;
				scale_size = 32.0;
			}
			else if (superpixelSize == "16") {
				scale_cent = 36;
				scale_size = 64.0;
			}
			else {
				scale_cent = 64;
				scale_size = 128.0;
			}
			// iteration = data['iteration'];
			statusObj.iteration(iteration);
			statusObj.accuracy(data['accuracy']);

			for( sample in sampleArray ) {

				thumbTag = "#thumb_"+(parseInt(sample)+1);
				labelTag = "#label_"+(parseInt(sample)+1);
				boxTag = "#"+boxes[sample];
				scale = sampleArray[sample]['scale'];
				slide = sampleArray[sample]['slide'];

				centX = (sampleArray[sample]['centX'] - (scale_cent * scale)) / sampleArray[sample]['maxX'];
				centY = (sampleArray[sample]['centY'] - (scale_cent * scale)) / sampleArray[sample]['maxY'];
				sizeX = (scale_size * scale) / sampleArray[sample]['maxX'];
				sizeY = (scale_size * scale) / sampleArray[sample]['maxY'];
				loc = centX+","+centY+","+sizeX+","+sizeY;

				thumbNail = IIPServer+"FIF="+sampleArray[sample]['path']+SlideLocPre+loc+"&WID=100"+SlideLocSuffix;

				$(thumbTag).attr("src", thumbNail);
				updateClassStatus(sample);

				// Hide progress dialog
				$('#progDiag').modal('hide');

				// Make sure overlay is hidden
				$('.overlaySvg').css('visibility', 'hidden');

				// Disable button
				$('#toggleBtn').attr('disabled', 'disabled');

				// Clear grid selection
				if( curBox != -1 ) {
					boxDiv = "#"+boxes[curBox];
					$(boxDiv).css('background', '#FFFFFF');
					curBox = -1;
				}
			}
			// Select first sample automatically
			thumbSingleClick("box_1");

		},
		error: function() {
			console.log("Selection failed");
		}
	});
}



function updateClassStatus(sample) {

	var labelTag = "#label_"+(parseInt(sample)+1),
		label = $('#box_'+(parseInt(sample)+1)).children(".classLabel")

	label.removeClass("negLabel");
	// label.removeClass("ignoreLabel");
	label.removeClass("posLabel");

	if( sampleDataJson['samples'][sample]['label'] === 1 ) {
		$(labelTag).text(posClass);
		label.addClass("posLabel");
	} else {
		$(labelTag).text(negClass);
		label.addClass("negLabel");
	}

}



// --------  Buton handlers ---------------------------------------------------


function cancelSession() {

	$('#cancelDiag').modal('show');
	$('#cancelprogressBar').css("width", '30%');

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

function reloadTrainingSet() {

	var target = 'reload';

	$.ajax({
		type: "POST",
		url: '/model/model/reload',
		dataType: "json",
		data: {
						uid: uid,
						target: target,
						dataset: datapath,
						pca: pcapath,
						trainingSetName: trainingSetName,
		},
		success: function(data) {
				var pass = data;
				$('#progressBar').css("width", '30%');
				first_train_predict_get_samples();
		}
	});
}


function submitLabels() {

	var itemTag;

	// Display the progress dialog...
	$('#progDiag').modal('show');
	$('#progressBar').css("width", '10%');

	// for augmentation
	var scale_cent = 36;
	var scale_size = 64.0;

	for( i = 0; i < sampleDataJson['samples'].length; i++ ) {
		sampleDataJson['samples'][i]['boundary'] = "";

		scale = sampleDataJson['samples'][i]['scale'];
		slide = sampleDataJson['samples'][i]['slide'];

		centX = (sampleDataJson['samples'][i]['centX'] - (scale_cent * scale)) / sampleDataJson['samples'][i]['maxX'];
		centY = (sampleDataJson['samples'][i]['centY'] - (scale_cent * scale)) / sampleDataJson['samples'][i]['maxY'];
		sizeX = (scale_size * scale) / sampleDataJson['samples'][i]['maxX'];
		sizeY = (scale_size * scale) / sampleDataJson['samples'][i]['maxY'];

		loc = centX+","+centY+","+sizeX+","+sizeY;

		thumbNail = IIPServer+"FIF="+sampleDataJson['samples'][i]['path']+SlideLocPre+loc+"&WID=128"+SlideLocSuffix;
		sampleDataJson['samples'][i]['aurl'] = thumbNail;
		sampleDataJson['samples'][i]['iteration'] = iteration;

	}

	viewJSON = {};
	viewJSON['id'] = uid;
	viewJSON['uid'] = uid;
	viewJSON['target'] = 'train';
	viewJSON['classifier'] = classifier;
	viewJSON['dataset'] = datapath;
	viewJSON['pca'] = pcapath;
	viewJSON['samples'] = sampleDataJson['samples'];
	viewJSON['iteration'] = iteration;

	$.ajax({
			type: 'POST',
			url: '/model/model/train',
			dataType: "json",
			contentType: 'application/json;charset=UTF-8',
			data: JSON.stringify(viewJSON),
							// posclass:	posClass,
							// negclass:	negClass,
			success: function(data){
					$('#progressBar').css("width", '30%');
					next_train_predict_get_samples();
			},
			error: function() {
				console.log("Selection failed");
			}
		});

}


function finishSave(saveJson) {

	var iterations = saveJson['iterations'];
	var filename = saveJson['filename'];
	var samples = JSON.stringify(saveJson['samples']);

	$.ajax({
		type: "POST",
		url: "php/finishSession_nn.php",
		data: {
						uid: uid,
						iterations: iterations,
						filename:	filename,
						samples: samples,
						classifier: classifier,
						posClass: posClass,
						negClass: negClass,
						dataset: curDataset
		},
		success: function(data) {
			$('#saveprogressBar').css("width", '80%');
			cancelSession();
		},
		error: function() {
			console.log("Save failed");
		}
	});

}

function finishSaveReloaded(saveJson) {

	var iterations = saveJson['iterations'];
	var filename = saveJson['filename'];
	var samples = JSON.stringify(saveJson['samples']);

	$.ajax({
		type: "POST",
		url: "php/finishReloadedSession_nn.php",
		data: {
						uid: uid,
						iterations: iterations,
						filename:	filename,
						samples: samples,
						classifier: classifier,
						posClass: posClass,
						negClass: negClass,
						dataset: curDataset
		},
		success: function(data) {
			$('#saveprogressBar').css("width", '80%');
			cancelSession();
		},
		error: function() {
			console.log("Save failed");
		}
	});

}


function saveSession() {

	$('#saveDiag').modal('show');
	$('#saveprogressBar').css("width", '30%');

	var target = 'save';

	if( init_reloaded ) {

			$.ajax({
					type: 'POST',
					url: '/model/model/save',
					data: {
									uid: uid,
									target: target,
									classifier: classifier,
									posclass: posClass,
									negclass: negClass,
									dataset: datapath,
									pca: pcapath,
									iteration: iteration.toString(),
									reloaded: init_reloaded.toString()
					},
					dataType: "json",
					success: function(data){
						var saveJson = JSON.parse(data);
						$('#saveprogressBar').css("width", '30%');
						finishSaveReloaded(saveJson);
					},
					error: function() {
						console.log("Save failed");
					}
				});

	} else {

		$.ajax({
				type: 'POST',
				url: '/model/model/save',
				data: {
								uid: uid,
								target: target,
								classifier: classifier,
								posclass: posClass,
								negclass: negClass,
								dataset: datapath,
								pca: pcapath,
								iteration: iteration.toString(),
								reloaded: init_reloaded.toString()
				},
				dataType: "json",
				success: function(data){
					var saveJson = JSON.parse(data);
					$('#saveprogressBar').css("width", '30%');
					finishSave(saveJson);
				},
				error: function() {
					console.log("Save failed");
				}
			});
	}
}



function toggleSegVisibility() {

	var boundary = document.getElementById('boundary');
	if( boundary != null ) {

		if( boundaryOn ) {
			$('#toggleBtn').val("Show segmentation");
			boundary.setAttribute('visibility', 'hidden');
			boundaryOn = false;
		} else {
			$('#toggleBtn').val("Hide segmentation");
			boundary.setAttribute('visibility', 'visible');
			boundaryOn = true;
		}
	}
}




//-----------------------------------------------------------------------------


function onImageViewChanged(event) {
	var boundsRect = viewer.viewport.getBounds(true);

	// Update viewport information. dataportXXX is the view port coordinates
	// using pixel locations. ie. if dataPortLeft is  0 the left edge of the
	// image is aligned with the left edge of the viewport.
	//
	statusObj.viewportX(boundsRect.x);
	statusObj.viewportY(boundsRect.y);
	statusObj.viewportW(boundsRect.width);
	statusObj.viewportH(boundsRect.height);
	statusObj.dataportLeft(imgHelper.physicalToDataX(imgHelper.logicalToPhysicalX(boundsRect.x)));
	statusObj.dataportTop(imgHelper.physicalToDataY(imgHelper.logicalToPhysicalY(boundsRect.y)) * imgHelper.imgAspectRatio);
	statusObj.dataportRight(imgHelper.physicalToDataX(imgHelper.logicalToPhysicalX(boundsRect.x + boundsRect.width)));
	statusObj.dataportBottom(imgHelper.physicalToDataY(imgHelper.logicalToPhysicalY(boundsRect.y + boundsRect.height))* imgHelper.imgAspectRatio);
	statusObj.scaleFactor(imgHelper.getZoomFactor());

	var p = imgHelper.logicalToPhysicalPoint(new OpenSeadragon.Point(0, 0));

	svgOverlayVM.annoGrpTranslateX(p.x);
	svgOverlayVM.annoGrpTranslateY(p.y);
	svgOverlayVM.annoGrpScale(statusObj.scaleFactor());

	var annoGrp = document.getElementById('annoGrp');
	annoGrp.setAttribute("transform", annoGrpTransformFunc());

}






function updateOverlayInfo() {

	// Only update the scale of the svg if it has changed. This speeds up
	// scrolling through the image.
	//
	if( lastScaleFactor != statusObj.scaleFactor() ) {
		lastScaleFactor = statusObj.scaleFactor();
		var annoGrp = document.getElementById('anno');

		if( annoGrp != null ) {
			var scale = "scale(" + statusObj.scaleFactor() + ")";
			annoGrp.setAttribute("transform", scale);
		}
	}
}


//
// Retruns the value of the GET request variable specified by name
//
//
function $_GET(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g,' '));
}


//
// ===============	Mouse event handlers for viewer =================
//

//
//	Mouse enter event handler for viewer
//
//
function onMouseEnter(event) {
	statusObj.haveMouse(true);
}


//
// Mouse move event handler for viewer
//
//
function onMouseMove(event) {
	var offset = osdCanvas.offset();

	statusObj.mouseX(imgHelper.dataToLogicalX(offset.left));
	statusObj.mouseY(imgHelper.dataToLogicalX(offset.top));
	statusObj.mouseRelX(event.pageX - offset.left);
	statusObj.mouseRelY(event.pageY - offset.top);
	statusObj.mouseImgX(imgHelper.physicalToDataX(statusObj.mouseRelX()));
	statusObj.mouseImgY(imgHelper.physicalToDataY(statusObj.mouseRelY()));
	statusObj.mouseLogX(imgHelper.dataToLogicalX(statusObj.mouseImgX()));
	statusObj.mouseLogY(imgHelper.dataToLogicalY(statusObj.mouseImgY()));
}





//
//	Mouse leave event handler for viewer
//
//
function onMouseLeave(event) {
	statusObj.haveMouse(false);
}





//
// Image data we want knockout.js to keep track of
//
var statusObj = {
	haveImage: ko.observable(false),
	haveMouse: ko.observable(false),
	imgAspectRatio: ko.observable(0),
	imgWidth: ko.observable(0),
	imgHeight: ko.observable(0),
	mouseRelX: ko.observable(0),
	mouseRelY: ko.observable(0),
	mouseImgX: ko.observable(0),
	mouseImgY: ko.observable(0),
	mouseLogX: ko.observable(0),
	mouseLogY: ko.observable(0),
	mouseX: ko.observable(0),
	mouseY: ko.observable(0),
	scaleFactor: ko.observable(0),
	viewportX: ko.observable(0),
	viewportY: ko.observable(0),
	viewportW: ko.observable(0),
	viewportH: ko.observable(0),
	dataportLeft: ko.observable(0),
	dataportTop: ko.observable(0),
	dataportRight: ko.observable(0),
	dataportBottom: ko.observable(0),
	iteration:	ko.observable(0),
	accuracy:	ko.observable(0.0),
	imgReady: ko.observable(false),
	curSlide: ko.observable("")
};


var svgOverlayVM = {
	annoGrpTranslateX:	ko.observable(0.0),
	annoGrpTranslateY:	ko.observable(0.0),
	annoGrpScale: 		ko.observable(1.0),
	annoGrpTransform:	annoGrpTransformFunc
};

var vm = {
	statusObj:	ko.observable(statusObj),
	svgOverlayVM: ko.observable(svgOverlayVM)
};



// Apply binfding for knockout.js - Let it keep track of the image info
// and mouse positions
//
ko.applyBindings(vm);
