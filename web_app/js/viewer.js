var annoGrpTransformFunc;
var IIPServer="";

//var SlideSuffix = ".svs-tile.dzi.tif";
var SlideSuffix = ".svs.dzi.tif";
var SlideLocPre = "&RGN=";
var SlideLocSuffix = "&CVT=jpeg";

var slideCnt = 0;
var curSlide = "";
var curWidth = 0;
var curHeight = 0;
var curDataset = "";

var viewer = null;
var imgHelper = null, osdCanvas = null, viewerHook = null;
var overlayHidden = false, selectMode = false, segDisplayOn = false, paintOn = false;
var olDiv = null;
var lastScaleFactor = 0;
var pyramids, trainingSets;
var clickCount = 0;
var isDragged = false;
var firstPaint = "";

// The following only needed for active sessions
var uid = null, negClass = "", posClass = "";

var boundsLeft = 0, boundsRight = 0, boundsTop = 0, boundsBottom = 0;
var	panned = false;
var	pannedX, pannedY;

var fixes = {iteration: 0, accuracy: 0, samples: []};

var heatmapLoaded = false;
var slideReq = null;
var uncertMin = 0.0, uncertMax = 0.0, classMin = 0.0, classMax = 0.0;

// check if the screen is panned or not. Defalut value is false
var ispannedXY = false;
var target = "";
var iteration = 0;
var datapath = "";
var pcapath = "";

var reloaded = false;
var init_reloaded = false;
// var XandYLabelsJson = {};
var viewresultJson = {};
var heatmapresultJson = {};
var isretrained = false;
var isfirstload = true;
var isfinalize = false;
//
//	Initialization
//
//		Get a list of available slides from the database
//		Populate the selection and classifier dropdowns
//		load the first slide
//		Register event handlers
//
$(function() {

	slideReq = $_GET('slide');
	// gets x and y positions
	pannedX = $_GET('x_pos');
	pannedY = $_GET('y_pos');

	// Create the slide zoomer, update slide count etc...
	// We will load the tile pyramid after the slide list is loaded
	//
	viewer = new OpenSeadragon.Viewer({ showNavigator: true, id: "image_zoomer", prefixUrl: "images/", animationTime: 0.1});
	imgHelper = viewer.activateImagingHelper({onImageViewChanged: onImageViewChanged});
    viewerHook = viewer.addViewerInputHook({ hooks: [
                    {tracker: 'viewer', handler: 'clickHandler', hookHandler: onMouseClick},
										{tracker: 'viewer', handler: 'dragHandler', hookHandler: onViewerDrag},
										{tracker: 'viewer', handler: 'dragEndHandler', hookHandler: onViewerDragEnd},
										{tracker: 'viewer', handler: 'releaseHandler', hookHandler: onViewerLeave},
										{tracker: 'viewer', handler: 'exitHandler', hookHandler: onViewerExit}
            ]});

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
		// check if the location of x and y is validated or not
		reviewCheck();
	});



	viewer.addHandler('close', function(event) {
		statusObj.haveImage(false);

        osdCanvas.off('mouseenter.osdimaginghelper', onMouseEnter);
        osdCanvas.off('mousemove.osdimaginghelper', onMouseMove);
        osdCanvas.off('mouseleave.osdimaginghelper', onMouseLeave);

		osdCanvas = null;
	});


	viewer.addHandler('animation-finish', function(event) {

		if( segDisplayOn ) {

			if( statusObj.scaleFactor() > 0.2 ) {

				if (uid != null) {
					gotoView();
				}
				else {
						updateSlideSeg();
				}
				// Zoomed in, show boundaries hide heatmap
				$('#anno').show();
				$('#heatmapGrp').hide();

			} else {

				if ( isretrained ) {
						gotoHeatmap();
						isretrained = false;
				}

				// Zoomed out, hide boundaries, show heatmap
				$('#heatmapGrp').show();
				$('#anno').hide();
				// Reset bounds to allow boundaries to be drawn when
				// zooming in from a heatmap.
				boundsLeft = boundsRight = boundsTop = boundsBottom = 0;
			}
		}
	});

	// get slide host info
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
			IIPServer = data['IIPServer'];
			curDataset = data['dataset'];
			datapath = data['datapath'];
			pcapath = data['pcapath'];
			reloaded = data['reloaded'];
			init_reloaded = data['init_reloaded'];

			if( reloaded == true ) {
				iteration = data['iteration'];
				$('#reloadDiag').modal('show');
				$('#btn_save').attr('disabled', 'disabled');
				// datapath = data['dataSetPath'];
				trainingSetName = data['trainingSetName'];
				trainingSetModelName = data['trainingSetModelName'];
				statusObj.iteration(iteration);
				$('#reloadprogressBar').css("width", '10%');
				reloadTrainingSet();
				setReloaded();
			}

			if( uid === null ) {
				// No active session, don;t allow navigation to select & visualize
				$('#nav_select').hide();
				$('#nav_heatmaps').hide();
				$('#nav_review').hide();
				$('#nav_params').hide();
				$('#nav_paramsinit').hide();
				// $('#nav_survival').hide();
				$('#trainInfo').hide();
				$('#heatmap').hide();
				$('#retrainInfo').hide();
				$('#legend').hide();

				// document.getElementById("index").setAttribute("href","index.html");

			} else {
				// Active session, dataset selection not allowed
				document.getElementById('dataset_sel').disabled = true

				var box = " <svg width='20' height='20'> <rect width='15' height = '15' style='fill:lightgrey;stroke-width:3;stroke:rgb(0,0,0)'/></svg>";
				document.getElementById('negLegend').innerHTML = box + " " + negClass;
				var box = " <svg width='20' height='20'> <rect width='15' height = '15' style='fill:lime;stroke-width:3;stroke:rgb(0,0,0)'/></svg>";
				document.getElementById('posLegend').innerHTML = box + " " + posClass;

				$('#legend').show();
				// No report generation during active session
				$('#nav_reports').hide();
				$('#nav_data').hide();
				$("#btn_save").show();
				// $('#nav_validation').hide();

			}

			// Slide list and classifier list will also be updated by this call
			updateDatasetList();
		}
	});


	// Set the update handlers for the selectors
	$("#slide_sel").change(updateSlide);
	$("#dataset_sel").change(updateDataset);

	// Set update handler for the heatmap radio buttons
	$('input[name=heatmapOption]').change(updateHeatmap);

	// Set update handler for the heatmap radio buttons
	$('input[name=paintOption]').change(updatePaint);

  // Set filter for numeric input
	$("#x_pos").keydown(filter);
	$("#y_pos").keydown(filter);

});


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
						trainingSetModelName: trainingSetModelName,
		},
		success: function(data) {
				var pass = data;
				$('#reloadprogressBar').css("width", '80%');
				$('#reloadDiag').modal('hide');
		}
	});
}

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
// a check function
// check if the location is validated or not
//

function reviewCheck(){
	if( pannedX === null || pannedY === null ) {
		ispannedXY = false;
	}
	else{
		ispannedXY = true;
		$("#x_pos").val(pannedX);
		$("#y_pos").val(pannedY);
		$("#btn_Go" ).click();
	}
}


// Filter keystrokes for numeric input
function filter(event) {

	// Allow backspace, delete, tab, escape, enter and .
	if( $.inArray(event.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
		// Allow Ctrl-A
	   (event.keyCode == 65 && event.ctrlKey === true) ||
		// Allow Ctrl-C
	   (event.keyCode == 67	&& event.ctrlKey === true) ||
		// Allow Ctrl-X
	   (event.keyCode == 88	&& event.ctrlKey === true) ||
		// Allow home, end, left and right
	   (event.keyCode >= 35	&& event.keyCode <= 39) ) {

			return;
	}

	// Don't allow if not a number
	if( (event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
		(event.keyCode < 96 || event.keyCode > 105) ) {

			event.preventDefault();
	}
}



//
//	Get the url for the slide pyramid and set the viewer to display it
//
//
function updatePyramid() {

	slide = "";
	panned = false;
	heatmapLoaded = false;

	// Zoomer needs '.dzi' appended to the end of the filename
	pyramid = "DeepZoom="+pyramids[$('#slide_sel').prop('selectedIndex')]+".dzi";
	viewer.open(IIPServer + pyramid);
}


//
//	Updates the dataset selector
//
function updateDatasetList() {
	var	datasetSel = $("#dataset_sel");

	// Get a list of datasets
	$.ajax({
		type: "POST",
		url: "db/getdatasets.php",
		data: {},
		dataType: "json",
		success: function(data) {

			for( var item in data ) {
				datasetSel.append(new Option(data[item][0], data[item][0]));
			}

			if( curDataset === null ) {
				curDataset = data[0][0];		// Use first dataset initially
			} else {
				datasetSel.val(curDataset);
			}

			// Need to update the slide list since we set the default slide
			updateSlideList();

		}
	});
}





//
//	Updates the list of available slides for the current dataset
//
function updateSlideList() {
	var slideSel = $("#slide_sel");
	var slideCntTxt = $("#count_patient");

	// Get the list of slides for the current dataset
	$.ajax({
		type: "POST",
		url: "db/getslides.php",
		data: { dataset: curDataset },
		dataType: "json",
		success: function(data) {

			var index = 0;

			pyramids = data['paths'];
			if( slideReq === null ) {
				curSlide = String(data['slides'][0]);		// Start with the first slide in the list
				curWidth = String(data['xsizes'][0]);		// Start with the first slide in the list
				curHeight = String(data['ysizes'][0]);		// Start with the first slide in the list
			} else {

				curSlide = slideReq;

				$.ajax({
					type: "POST",
					url: "php/getHeatmap_nn.php",
					dataType: "json",
					data: { uid:	uid,
							slide: 	curSlide,
							},
					success: function(data) {

						curWidth = data[0];
						curHeight = data[1];

					}
				});

			}

			slideCnt = Object.keys(data['slides']).length;;
			slideCntTxt.text(slideCnt);

			slideSel.empty();
			// Add the slides we have segmentation boundaries for to the dropdown
			// selector
			for( var item in data['slides'] ) {

				if( slideReq != null && slideReq == data['slides'][item] ) {
					index = item;
				}
				slideSel.append(new Option(data['slides'][item], data['slides'][item]));
			}

			if( index != 0 ) {
				$('#slide_sel').prop('selectedIndex', index);
			}

			// Get the slide pyrimaid and display
			updatePyramid();
		}
	});
}



//
//	A new slide has been selected from the drop-down menu, update the
// 	slide zoomer.
//
//
function updateSlide() {
	curSlide = $('#slide_sel').val();

	$.ajax({
		type: "POST",
		url: "php/getHeatmap_nn.php",
		dataType: "json",
		data: { uid:	uid,
				slide: 	curSlide,
				},
		success: function(data) {

			curWidth = data[0];
			curHeight = data[1];

			// fixes['samples'] = [];
			// $('#retrainBtn').attr('disabled', 'disabled');
			// Set the viewer to display it
			updatePyramid();

			if( segDisplayOn ) {

				// Clear heatmap if displayed
				var heatmapGrp = document.getElementById('heatmapGrp');

				if( heatmapGrp != null ) {
					heatmapGrp.parentNode.removeChild(heatmapGrp);
				}

				updateSeg();

			}

		}
	});



}

//
//	A new seg should be applied to the slide updated.
//
//
function updateSlideSeg() {

	var ele, segGrp, annoGrp;

	var left, right, top, bottom, width, height;

	// Grab nuclei a viewport width surrounding the current viewport
	//
	width = statusObj.dataportRight() - statusObj.dataportLeft();
	height = statusObj.dataportBottom() - statusObj.dataportTop();

	left = (statusObj.dataportLeft() - width > 0) ?	statusObj.dataportLeft() - width : 0;
	right = statusObj.dataportRight() + width;
	top = (statusObj.dataportTop() - height > 0) ?	statusObj.dataportTop() - height : 0;
	bottom = statusObj.dataportBottom() + height;


	var class_sel = document.getElementById('classifier_sel');

	$.ajax({
	type: "POST",
			url: "db/getsample.php",
			dataType: "json",
	data: {
			slide: 	curSlide,
			left:	left,
			right:	right,
			top:	top,
			bottom:	bottom,
	},


		success: function(data) {

				segGrp = document.getElementById('segGrp');
				annoGrp = document.getElementById('anno');

				// Save current viewport location
				boundsLeft = statusObj.dataportLeft();
				boundsRight = statusObj.dataportRight();
				boundsTop = statusObj.dataportTop();
				boundsBottom = statusObj.dataportBottom();

				// If group exists, delete it
				if( segGrp != null ) {
					segGrp.parentNode.removeChild(segGrp);
				}

				// Create segment group
        segGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
        segGrp.setAttribute('id', 'segGrp');
        annoGrp.appendChild(segGrp);


				for( cell in data ) {
					ele = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
					// boundary
					ele.setAttribute('points', data[cell][0]);
					// id
					ele.setAttribute('id', 'N' + data[cell][1]);
					ele.setAttribute('stroke', 'aqua');
					// ele.setAttribute('stroke-width', 4);
					//ele.setAttribute("stroke-dasharray", "5,5");
					ele.setAttribute("stroke-dasharray", "4 1");
					// color
					ele.setAttribute('fill', 'aqua');
					ele.setAttribute("fill-opacity", "0.2");
					//ele.setAttribute("fill", "none");
					segGrp.appendChild(ele);
				}

				if( panned ) {
					ele = document.createElementNS("http://www.w3.org/2000/svg", "rect");

					ele.setAttribute('x', pannedX - 50);
					ele.setAttribute('y', pannedY - 50);
					ele.setAttribute('width', 100);
					ele.setAttribute('height', 100);
					ele.setAttribute('stroke', 'yellow');
					ele.setAttribute('fill', 'none');
					ele.setAttribute('stroke-width', 4);
					ele.setAttribute('id', 'boundBox');

					segGrp.appendChild(ele);
				}

			}
  	});

}


//
//
//
//
function updateDataset() {

	curDataset = $('#dataset_sel').val();
	updateSlideList();
}



//
//	Display the appropriate heatmap (uncertain or positive class) when
//	a radio button is selected
//
function updateHeatmap() {

	var slide_width, slide_height;

	gotoHeatmap();

}


function updatePaint() {

			isNegPaint = true;
}



//
//	Update annotation and viewport information when the view changes
//  due to panning or zooming.
//
//
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




function getSampleColors() {

	var left, right, top, bottom, width, height;

	// Grab nuclei a viewport width surrounding the current viewport
	//
	width = statusObj.dataportRight() - statusObj.dataportLeft();
	height = statusObj.dataportBottom() - statusObj.dataportTop();

	left = (statusObj.dataportLeft() - width > 0) ?	statusObj.dataportLeft() - width : 0;
	right = statusObj.dataportRight() + width;
	top = (statusObj.dataportTop() - height > 0) ?	statusObj.dataportTop() - height : 0;
	bottom = statusObj.dataportBottom() + height;

	if (left > 0 && top > 0) {
			$.ajax({
			type: "POST",
					url: "db/getsamplecolor.php",
					dataType: "json",
			data: { uid:	uid,
					slide: 	curSlide,
					left:	left,
					right:	right,
					top:	top,
					bottom:	bottom,
					dataset: curDataset,
					trainset: classifier,
					classification: JSON.stringify(viewresultJson)
			},

			success: function(data) {

					$('#progressBar').css("width", '90%');


					segGrp = document.getElementById('segGrp');
					annoGrp = document.getElementById('anno');

					// Save current viewport location
					boundsLeft = statusObj.dataportLeft();
					boundsRight = statusObj.dataportRight();
					boundsTop = statusObj.dataportTop();
					boundsBottom = statusObj.dataportBottom();

					// If group exists, delete it
					if( segGrp != null ) {
						segGrp.parentNode.removeChild(segGrp);
					}

					// Create segment group
					segGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
					segGrp.setAttribute('id', 'segGrp');
					annoGrp.appendChild(segGrp);


					for( cell in data ) {
						ele = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

						ele.setAttribute('points', data[cell][0]);
						ele.setAttribute('id', 'N' + data[cell][1]);
						ele.setAttribute('stroke', 'aqua');
						// ele.setAttribute('stroke-width', '2');
						ele.setAttribute('fill', data[cell][2]);
						if (data[cell][2] == 'lightgrey') {
							ele.setAttribute("fill-opacity", "0");
						}
						if (data[cell][2] == 'lime') {
							ele.setAttribute("fill-opacity", "0.4");
						}
						ele.setAttribute("stroke-dasharray", "4 1");

						segGrp.appendChild(ele);
					}


					if( panned ) {
						ele = document.createElementNS("http://www.w3.org/2000/svg", "rect");

						ele.setAttribute('x', pannedX - 50);
						ele.setAttribute('y', pannedY - 50);
						ele.setAttribute('width', 100);
						ele.setAttribute('height', 100);
						ele.setAttribute('stroke', 'yellow');
						ele.setAttribute('fill', 'none');
						ele.setAttribute('stroke-width', 4);
						ele.setAttribute('id', 'boundBox');

						segGrp.appendChild(ele);
					}
					// if the number of samples fixed is larger than 0,
					if( fixes['samples'].length > 0 ) {
						for( cell in fixes['samples'] ) {
							var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

							if( bound != null ) {
									if( fixes['samples'][cell]['label'] == 1 ) {
											bound.setAttribute('fill', 'lime');
											bound.setAttribute("fill-opacity", "0.2");
									} else if( fixes['samples'][cell]['label'] == -1 ) {
											bound.setAttribute('fill', 'lightgrey');
											bound.setAttribute("fill-opacity", "0.2");
									}
							}
						}
					}
				}
			});
		}
}

function gotoView() {

		var left, right, top, bottom, width, height;

		// Grab nuclei a viewport width surrounding the current viewport
		//
		width = statusObj.dataportRight() - statusObj.dataportLeft();
		height = statusObj.dataportBottom() - statusObj.dataportTop();

		left = (statusObj.dataportLeft() - width > 0) ?	statusObj.dataportLeft() - width : 0;
		right = statusObj.dataportRight() + width;
		top = (statusObj.dataportTop() - height > 0) ?	statusObj.dataportTop() - height : 0;
		bottom = statusObj.dataportBottom() + height;

		// var stringjson = JSON.stringify(selectedJSON);
		viewJSON = {}
		viewJSON['id'] = uid;
		viewJSON['uid'] = uid;
		viewJSON['target'] = 'view';
		viewJSON['dataset'] = datapath;
		viewJSON['pca'] = pcapath;
		viewJSON['samples'] = 'None';
		viewJSON['width'] = curWidth;
		viewJSON['height'] = curHeight;
		viewJSON['slide'] = curSlide;
		viewJSON['left'] = Math.round(left).toString();
		viewJSON['right'] = Math.round(right).toString();
		viewJSON['top'] = Math.round(top).toString();
		viewJSON['bottom'] = Math.round(bottom).toString();
		// viewJSON['dataset'] = dataset;
		// viewJSON['trainset'] = trainset;

		$.ajax({
				type: 'POST',
				url: '/model/model/view',
				data: JSON.stringify(viewJSON),
				contentType: 'application/json;charset=UTF-8',
				dataType: "json",
				success: function(data){
					// var XandYLabelsJson = {left: 0, right: 0, top: 0, bottom: 0, samples: []};
					viewresultJson = JSON.parse(data);
					if( statusObj.scaleFactor() > 0.2 ) {
						getSampleColors();
					}
				},
				error: function() {
					console.log("Selection failed");
				}
			});

			// set heatmapLoaded to false after retraining
			heatmapLoaded = false;
}

function gotoHeatmap() {

	var viewJSON = {}
	viewJSON['id'] = uid;
	viewJSON['uid'] = uid;
	viewJSON['target'] = 'heatmap';
	viewJSON['dataset'] = datapath;
	viewJSON['pca'] = pcapath;
	viewJSON['slide'] = curSlide;
	viewJSON['width'] = curWidth;
	viewJSON['height'] = curHeight;
	viewJSON['index'] = 0;

	$.ajax({
			type: 'POST',
			url: '/model/model/heatmap',
			data: JSON.stringify(viewJSON),
			contentType: 'application/json;charset=UTF-8',
			dataType: "json",

		success: function(data) {

			heatmapresultJson = JSON.parse(data);

			if (typeof heatmapresultJson.width != "undefined") {

				annoGrp = document.getElementById('annoGrp');
				segGrp = document.getElementById('heatmapGrp');

				if( segGrp != null ) {
					segGrp.parentNode.removeChild(segGrp);
				}

				segGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
				segGrp.setAttribute('id', 'heatmapGrp');
				annoGrp.appendChild(segGrp);

				var xlinkns = "http://www.w3.org/1999/xlink";
				ele = document.createElementNS("http://www.w3.org/2000/svg", "image");
				ele.setAttributeNS(null, "x", 0);
				ele.setAttributeNS(null, "y", 0);
				ele.setAttributeNS(null, "width", heatmapresultJson.width);
				ele.setAttributeNS(null, "height", heatmapresultJson.height);
				ele.setAttributeNS(null, 'opacity', 0.25);
				ele.setAttribute('id', 'heatmapImg');

				uncertMin = heatmapresultJson.uncertMin;
				uncertMax = heatmapresultJson.uncertMax;
				classMin = heatmapresultJson.classMin;
				classMax = heatmapresultJson.classMax;

				if( $('#heatmapUncertain').is(':checked') ) {
					ele.setAttributeNS(xlinkns, "href", "heatmaps/"+uid+"/"+heatmapresultJson.uncertFilename+"?v="+(new Date()).getTime());
				} else {
					ele.setAttributeNS(xlinkns, "href", "heatmaps/"+uid+"/"+heatmapresultJson.classFilename+"?v="+(new Date()).getTime());
				}
				segGrp.appendChild(ele);

				heatmapLoaded = true;
			}

			// console.log("Uncertainty min: "+uncertMin+", max: "+uncertMax+", median: "+XandYLabelsJson.uncertMedian);
		}
	});
}
//
//	Retreive the boundaries for nuclei within the viewport bounds and an
//	area surrounding the viewport. The are surrounding the viewport is a
//	border the width and height of the viewport. This allows the user to pan a full
//	viewport width or height before having to fetch new boundaries.
//
//
function updateSeg() {

	var ele, segGrp, annoGrp, slide_width, slide_height;

	if( statusObj.scaleFactor() > 0.2 ) {

		gotoView();

	} else {

		// Only display heatmap for active sessions
		//
		if( curSlide != "" && classifier != 'none' && heatmapLoaded == false ) {

			gotoHeatmap();

		}
	}
}

//
// Update colors when a sample is selected
// Parameters
// selectedJSON id
//
function updateBoundColors(obj) {

	for( cell in fixes['samples'] ) {
		var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

		if( bound != null ) {
			if (fixes['samples'][cell]['id'] == obj['id']){
					bound.setAttribute('fill', 'yellow');
					bound.setAttribute("fill-opacity", "0.2");
			}
		}
	}
}

function updateRegionBoundColors(obj) {

	for( cell in fixes['samples'] ) {
		var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

		if( bound != null ) {
			if (fixes['samples'][cell]['id'] == obj['id']){
				if( fixes['samples'][cell]['label'] == 1 ) {
						bound.setAttribute('fill', 'lime');
						bound.setAttribute("fill-opacity", "0.2");
				}
				if( fixes['samples'][cell]['label'] == -1 ) {
						bound.setAttribute('fill', 'lightgrey');
						bound.setAttribute("fill-opacity", "0.2");
				}
			}
		}
	}
}

//
// Undo colors when a sample is deleted
// Parameters
// selectedJSON id
//
function undoBoundColors(obj) {

	for( cell in fixes['samples'] ) {
		var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

		if( bound != null ) {
			// check id
			if (fixes['samples'][cell]['id'] == obj['id']){
				// check label
				if( fixes['samples'][cell]['label'] == -1 ) {
					bound.setAttribute('fill', 'lime');
					bound.setAttribute("fill-opacity", "0.2");
				}
				else if( fixes['samples'][cell]['label'] == 1 ) {
						bound.setAttribute('fill', 'lightgrey');
						bound.setAttribute("fill-opacity", "0.2");
				}
			}
		}
	}
}


function undoRegionBoundColors(obj) {

	for( cell in fixes['samples'] ) {
		var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

		if( bound != null ) {
			// check id
			if (fixes['samples'][cell]['id'] == obj['id']){
				// check label
				if( fixes['samples'][cell]['label'] == -1 ) {
						bound.setAttribute('fill', 'lime');
						bound.setAttribute("fill-opacity", "0.2");
				} else if( fixes['samples'][cell]['label'] == 1 ) {
						bound.setAttribute('fill', 'lightgrey');
						bound.setAttribute("fill-opacity", "0.2");
				}
			}
		}
	}
}


function nucleiPaint() {

		$.ajax({
		    type:   "POST",
		    url:    "db/getsingle_nn.php",
		    dataType: "json",
		    data:   { slide:    curSlide,
		              cellX:    Math.round(statusObj.mouseImgX()),
		              cellY:    Math.round(statusObj.mouseImgY()),
		            },
		    success: function(data) {
	            if( data !== null ) {

		          	// We're adding an object, make sure the retrain button is enabled.
		          	$('#retrainBtn').removeAttr('disabled');
								$('#btn_del').removeAttr('disabled');

								// find augment url
								var scale_cent = 32;
								var scale_size = 64.0;
								var a_id = data[1];
								var a_cenx = data[2];
								var a_ceny = data[3];
								var a_maxx = data[4];
								var a_maxy = data[5];
								var a_scale = data[6];
								var a_path = data[7];

								var centX = (a_cenx - (scale_cent * a_scale)) / a_maxx;
								var centY = (a_ceny - (scale_cent * a_scale)) / a_maxy;
								var sizeX = (scale_size * a_scale) / a_maxx;
								var sizeY = (scale_size * a_scale) / a_maxy;
								var loc = centX+","+centY+","+sizeX+","+sizeY;

								var thumbNail = IIPServer+"FIF="+a_path+SlideLocPre+loc+"&WID=128"+SlideLocSuffix;


								var	obj = {slide: curSlide, centX: a_cenx, centY: a_ceny, label: 0, id: a_id, aurl: thumbNail};
		          	var cell = document.getElementById("N"+obj['id']);
								// initializes a flag to check the status of undo
								var undo = false;
								var flip = false;
								// Flip the label here. lime indicates the positive class, so we
								// want to change the label to -1. Change to 1 for lightgrey. If
								// the color is niether, the sample has been picked already so
								// ignore.
								//

								var color = cell.getAttribute('fill');

								if (firstPaint == "") {

									if (color === "lightgrey" ) {
										firstPaint = "lime";
									}
									else if (color === "lime" ) {
										firstPaint = "lightgrey";
									}

									for( cell in fixes['samples'] ) {
										if (fixes['samples'][cell]['id'] == obj['id']){
											obj['label'] = fixes['samples'][cell]['label'];
											if (obj['label'] === -1 ) {
												firstPaint = "lime";
											}
											else if (obj['label'] === 1 ) {
												firstPaint = "lightgrey";
											}
											undo = true;
										}
									}
								}

								if ((firstPaint == "lime")&&(color === "lightgrey" )) {
									obj['label'] = 1;
									flip = true;
									// find a cell with the same id
									for( cell in fixes['samples'] ) {
										if (fixes['samples'][cell]['id'] == obj['id']){
											obj['label'] = fixes['samples'][cell]['label'];
											undo = true;
										}
									}
								}
								else if ((firstPaint == "lightgrey")&&(color === "lime" )) {
									obj['label'] = -1;
									flip = true;
									// find a cell with the same id
									for( cell in fixes['samples'] ) {
										if (fixes['samples'][cell]['id'] == obj['id']){
											obj['label'] = fixes['samples'][cell]['label'];
											undo = true;
										}
									}
								}
								if (flip){
									// if the cell is already selected
									if (undo){
										// call undoBoundColrs to undo the color
										undoRegionBoundColors(obj);
										for( cell in fixes['samples'] ) {
											if (fixes['samples'][cell]['id'] == obj['id']){
												fixes['samples'].splice(cell, 1);
											}
										}
										statusObj.samplesToFix(statusObj.samplesToFix()-1);
										undo = false;
									}
									// else if the cell is labeled to -1 or 1
									// else if( (obj['label'] == -1) || (obj['label'] == 1) ) {
									else {

										// var slide, centX, centY, sizeX, sizeY, loc, thumbNail, scale;
										// var sampleobjs;
										// var scale_cent = 32;
										// var scale_size = 64.0;
										// var fixes_length = fixes['samples'].length;

										fixes['samples'].push(obj);
										// call updateBoundColors to update to color
										updateRegionBoundColors(obj);
										statusObj.samplesToFix(statusObj.samplesToFix()+1);

										// $.ajax({
										// 	type: "POST",
										// 	url: "db/getImgurls.php",
										// 	data: {samples: obj},
										// 	dataType: "json",
										// 	success: function(data) {
										//
										// 		// console.log("Pass get");
										// 		sampleobjs = data;
										//
										// 			scale = sampleobjs['scale'];
										// 			slide = sampleobjs['slide'];
										//
										// 			centX = (sampleobjs['centX'] - (scale_cent * scale)) / sampleobjs['maxX'];
										// 			centY = (sampleobjs['centY'] - (scale_cent * scale)) / sampleobjs['maxY'];
										// 			sizeX = (scale_size * scale) / sampleobjs['maxX'];
										// 			sizeY = (scale_size * scale) / sampleobjs['maxY'];
										// 			loc = centX+","+centY+","+sizeX+","+sizeY;
										//
										// 			thumbNail = IIPServer+"FIF="+sampleobjs['path']+SlideLocPre+loc+"&WID=128"+SlideLocSuffix;
										//
										// 			fixes['samples'][fixes_length]['aurl'] = thumbNail;
										//
										// 		}
										//
										// });



		          		}

		          	}
	          }
        }
		});
}

function del(){

	for( cell in fixes['samples'] ) {
		var bound = document.getElementById("N"+fixes['samples'][cell]['id']);

		if( bound != null ) {
			// check id
				if( fixes['samples'][cell]['label'] == -1 ) {
						bound.setAttribute('fill', 'lime');
						bound.setAttribute("fill-opacity", "0.2");
				} else if( fixes['samples'][cell]['label'] == 1 ) {
						bound.setAttribute('fill', 'lightgrey');
						bound.setAttribute("fill-opacity", "0.2");
				}
		}
	}

	fixes['samples'] = [];
	statusObj.samplesToFix(0);
	$('#btn_del').attr('disabled', 'disabled');
	$('#retrainBtn').attr('disabled', 'disabled');

}

function retrain() {

	// Set iteration to -1 to indicate these are hand-picked
	fixes['iteration'] = -1;
	isretrained = true;

	var left, right, top, bottom, width, height;
	var viewJSON;
	var delay = 2000;

	$('#progDiag').modal('show');
	$('#progressBar').css("width", '10%');

	if( statusObj.scaleFactor() > 0.2 ) {

		// Grab nuclei a viewport width surrounding the current viewport
		//
		width = statusObj.dataportRight() - statusObj.dataportLeft();
		height = statusObj.dataportBottom() - statusObj.dataportTop();

		left = (statusObj.dataportLeft() - width > 0) ?	statusObj.dataportLeft() - width : 0;
		right = statusObj.dataportRight() + width;
		top = (statusObj.dataportTop() - height > 0) ?	statusObj.dataportTop() - height : 0;
		bottom = statusObj.dataportBottom() + height;

		// var stringjson = JSON.stringify(selectedJSON);
		viewJSON = {};
		viewJSON['id'] = uid;
		viewJSON['uid'] = uid;
		viewJSON['target'] = 'retrainView';
		viewJSON['classifier'] = classifier;
		viewJSON['dataset'] = datapath;
		viewJSON['pca'] = pcapath;
		viewJSON['samples'] = fixes['samples'];
		viewJSON['width'] = curWidth;
		viewJSON['height'] = curHeight;
		viewJSON['slide'] = curSlide;
		viewJSON['left'] = Math.round(left).toString();
		viewJSON['right'] = Math.round(right).toString();
		viewJSON['top'] = Math.round(top).toString();
		viewJSON['bottom'] = Math.round(bottom).toString();
		viewJSON['iteration'] = iteration;

		$.ajax({
			type: "POST",
			url: '/model/model/retrainView',
			dataType: "json",
			data: JSON.stringify(viewJSON),
			contentType: 'application/json;charset=UTF-8',
			success: function(data) {

				$('#progressBar').css("width", '50%');
				$('#progDiag').find('.modal-body p').text('Retrain done. Updating samples ...');
				fixes['samples'] = [];
				statusObj.samplesToFix(0);
				viewresultJson = JSON.parse(data);

				if( statusObj.scaleFactor() > 0.2 ) {
					getSampleColors();
				}

				setTimeout(function() {
					// Hide progress dialog
					$('#progDiag').modal('hide');
			        }, delay);

			}
		});

	}

	else {

			if( curSlide != "" && classifier != 'none' && heatmapLoaded == false ) {

				viewJSON = {};
				viewJSON['id'] = uid;
				viewJSON['uid'] = uid;
				viewJSON['target'] = 'retrainHeatmap';
				viewJSON['classifier'] = classifier;
				viewJSON['samples'] = fixes['samples'];
				viewJSON['dataset'] = datapath;
				viewJSON['pca'] = pcapath;
				viewJSON['slide'] = curSlide;
				viewJSON['iteration'] = iteration;
				viewJSON['width'] = curWidth;
				viewJSON['height'] = curHeight;

				$.ajax({
						type: 'POST',
						url: '/model/model/retrainHeatmap',
						data: JSON.stringify(viewJSON),
						contentType: 'application/json;charset=UTF-8',
						dataType: "json",

					success: function(data) {

						heatmapresultJson = JSON.parse(data);

						annoGrp = document.getElementById('annoGrp');
						segGrp = document.getElementById('heatmapGrp');

						if( segGrp != null ) {
							segGrp.parentNode.removeChild(segGrp);
						}

						segGrp = document.createElementNS("http://www.w3.org/2000/svg", "g");
						segGrp.setAttribute('id', 'heatmapGrp');
						annoGrp.appendChild(segGrp);

						var xlinkns = "http://www.w3.org/1999/xlink";
						ele = document.createElementNS("http://www.w3.org/2000/svg", "image");
						ele.setAttributeNS(null, "x", 0);
						ele.setAttributeNS(null, "y", 0);
						ele.setAttributeNS(null, "width", heatmapresultJson.width);
						ele.setAttributeNS(null, "height", heatmapresultJson.height);
						ele.setAttributeNS(null, 'opacity', 0.25);
						ele.setAttribute('id', 'heatmapImg');

						uncertMin = heatmapresultJson.uncertMin;
						uncertMax = heatmapresultJson.uncertMax;
						classMin = heatmapresultJson.classMin;
						classMax = heatmapresultJson.classMax;

						if( $('#heatmapUncertain').is(':checked') ) {
							// heatmap should be reloaded with different time after updating heatmap image on local directory
							ele.setAttributeNS(xlinkns, "href", "heatmaps/"+uid+"/"+heatmapresultJson.uncertFilename+"?v="+(new Date()).getTime());
							// document.getElementById('heatMin').innerHTML = XandYLabelsJson.uncertMin.toFixed(2);
							// document.getElementById('heatMax').innerHTML = XandYLabelsJson.uncertMax.toFixed(2);
						} else {
							ele.setAttributeNS(xlinkns, "href", "heatmaps/"+uid+"/"+heatmapresultJson.classFilename+"?v="+(new Date()).getTime());
							// document.getElementById('heatMin').innerHTML = XandYLabelsJson.classMin.toFixed(2);
							// document.getElementById('heatMax').innerHTML = XandYLabelsJson.classMax.toFixed(2);
						}
						segGrp.appendChild(ele);

						heatmapLoaded = true;
						// console.log("Uncertainty min: "+uncertMin+", max: "+uncertMax+", median: "+XandYLabelsJson.uncertMedian);

						fixes['samples'] = [];
						statusObj.samplesToFix(0);

						setTimeout(function() {
							// Hide progress dialog
							$('#progDiag').modal('hide');
									}, delay);
					}
				});
			}
	}

	$('#btn_del').attr('disabled', 'disabled');
	$('#retrainBtn').attr('disabled', 'disabled');
	$('#btn_save').removeAttr('disabled');

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

	statusObj.mouseRelX(event.pageX - offset.left);
	statusObj.mouseRelY(event.pageY - offset.top);
	statusObj.mouseImgX(imgHelper.physicalToDataX(statusObj.mouseRelX()));
	statusObj.mouseImgY(imgHelper.physicalToDataY(statusObj.mouseRelY()));
}


//
//	Mouse leave event handler for viewer
//
//
function onMouseLeave(event) {
	statusObj.haveMouse(false);
}





function onMouseClick(event) {
		event.preventDefaultAction = true;
		isDragged = false;
}

function onViewerDrag(event) {
	isDragged = true;
		if (paintOn == true) {
			event.preventDefaultAction = true;
			nucleiPaint();
			// if (firstPaint == "") {
			// 	getFirstnucleiPaint();
			// }
			// else{
			// 	nucleiPaint();
			// }
			// if (isNegPaint == false) {
			// 	nucleiPosPaint();
			// }
			// else {
			// 	nucleiNegPaint();
			// }
	}
}

function onViewerDragEnd(event) {
		// firstPaint = "";
}

function onViewerExit(event) {
		// firstPaint = "";
}

function onViewerLeave(event) {
		event.preventDefaultAction = false;
		isDragged = false;
		firstPaint = "";

		if( fixes['samples'].length == 0 ) {
			$('#btn_del').attr('disabled', 'disabled');
			$('#retrainBtn').attr('disabled', 'disabled');
		}

}


//
// =======================  Button Handlers ===================================
//



//
//	Load the boundaries for the current slide and display
//
//
function viewSegmentation() {

	var	segBtn = $('#btn_1');
	var	paintBtn = $('#btn_paint');

	if( segDisplayOn ) {
		// Currently displaying segmentation, hide it
		segBtn.val("Show Segmentation");
		$('.overlaySvg').css('visibility', 'hidden');
		segDisplayOn = false;

		if (paintOn) {
			paintBtn.val("Paint On");
			paintOn = false;
		}

	} else {
		// Segmentation not currently displayed, show it
		segBtn.val("Hide Segmentation");
		$('.overlaySvg').css('visibility', 'visible');
		segDisplayOn = true;

		if (uid != null) {
			if( statusObj.scaleFactor() > 0.2 ) {
					gotoView();
			} else {
					gotoHeatmap();
			}
		}
		else {
			if( statusObj.scaleFactor() > 0.2 ) {
				updateSlideSeg();
			}
		}

	}

}

function paintMode() {

	var	segBtn = $('#btn_paint');

	if (segDisplayOn) {

		if( paintOn ) {
			segBtn.val("Paint On");
			paintOn = false;
		} else {
			segBtn.val("Paint Off");
			paintOn = true;
		}

	}

	else {
		window.alert("View Segmentation should be on !!");
	}

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

function saveTrainSet() {

	$('#saveDiag').modal('show');
	$('#saveprogressBar').css("width", '30%');

	var target = 'save';

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
				if( init_reloaded ) {
					finishSaveReloaded(saveJson);
				}
				else{
					finishSave(saveJson);
				}
				$('#saveDiag').modal('hide');
			},
			error: function() {
				console.log("Save failed");
			}
		});

		$('#btn_save').attr('disabled', 'disabled');

}


function saveSession() {

	$('#saveDiag').modal('show');
	$('#saveprogressBar').css("width", '30%');

	var target = 'save';
	isfinalize = true;

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
			if (isfinalize) {
				cancelSession();
			}
		},
		error: function() {
			console.log("Save failed");
		}
	});

}


function finishSave(saveJson) {

	var iterations = saveJson['iterations'];
	var filename = saveJson['filename'];
	var modelname = saveJson['modelname'];
	var samples = JSON.stringify(saveJson['samples']);

	$.ajax({
		type: "POST",
		url: "php/finishSession_nn.php",
		data: {
						uid: uid,
						iterations: iterations,
						filename:	filename,
						modelname: modelname,
						samples: samples,
						classifier: classifier,
						posClass: posClass,
						negClass: negClass,
						dataset: curDataset
		},
		success: function(data) {
			$('#saveprogressBar').css("width", '80%');
			if (isfinalize) {
				cancelSession();
			}
		},
		error: function() {
			console.log("Save failed");
		}
	});

}


function go() {

	var	segBtn = $('#btn_1');

	pannedX = $("#x_pos").val();
	pannedY = $("#y_pos").val();

	// TODO! - Need to validate location against size of image
	if( pannedX === "" || pannedY === "" ) {
		window.alert("Invalid position");
	} else {

		// Turn on overlay and reset bounds to force update
		segBtn.val("Hide Segmentation");
		$('.overlaySvg').css('visibility', 'visible');
		segDisplayOn = true;
		boundsLeft = boundsRight = boundsTop = boundsBottom = 0;

		// Zoom in all the way
		viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());

		// Move to nucei
		imgHelper.centerAboutLogicalPoint(new OpenSeadragon.Point(imgHelper.dataToLogicalX(pannedX),
															  imgHelper.dataToLogicalY(pannedY)));
		panned = true;
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
	scaleFactor: ko.observable(0),
	viewportX: ko.observable(0),
	viewportY: ko.observable(0),
	viewportW: ko.observable(0),
	viewportH: ko.observable(0),
	dataportLeft: ko.observable(0),
	dataportTop: ko.observable(0),
	dataportRight: ko.observable(0),
	dataportBottom: ko.observable(0),
	samplesToFix: ko.observable(0),
	iteration:	ko.observable(0)
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
