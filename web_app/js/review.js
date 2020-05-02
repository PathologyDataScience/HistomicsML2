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

var curDataset;
var cur_box;
var curX = 0, curY = 0;

var boundaryOn = true;
var segDisplayOn = true;

var igrArray = new Array();

var slide_list = [];
var cell_index = [];
var boundaries = [];

var updates = new Array();

var cur_slide_num = -1;
var sortable_group = "";
var sortable_group_list = [];

var superpixelSize = 0;
var datapath = "";
var pcapath = "";
var reloaded = false;
var init_reloaded = false;

//
//	Review
//
//		Get a list of the selected cells from the database
//

$(function() {

	// get slide host info
	//
	$.ajax({
		url: "php/getSession.php",
		data: "",
		dataType: "json",
		success: function(data) {

			uid = data['uid'];
			IIPServer = data['IIPServer'];
			posClass = data['posClass'];
			negClass = data['negClass'];
			curDataset = data['dataset'];
			superpixelSize = data['superpixelSize'];
			datapath = data['datapath'];
			pcapath = data['pcapath'];
			reloaded = data['reloaded'];
			init_reloaded = data['init_reloaded'];

			if( uid === null ) {
				window.alert("No session active");
				window.history.back();
			}
			else{
				// will be used when the class names are requried.
				//$("#posHeader1").text("Positive class : "+ posClass);
				//$("#negHeader1").text("Negative class : "+ negClass);
				getSamples();

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

			ele = document.createElementNS("http://www.w3.org/2000/svg", "rect");

			ele.setAttribute('x', curX - 50);
			ele.setAttribute('y', curY - 50);
			ele.setAttribute('width', 100);
			ele.setAttribute('height', 100);
			ele.setAttribute('stroke', 'yellow');
			ele.setAttribute('fill', 'none');
			ele.setAttribute('stroke-width', 4);
			ele.setAttribute('id', 'boundBox');

			sampGrp.appendChild(ele);

			ele = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
			ele.setAttribute('points', boundaries[cur_box]);
			ele.setAttribute('id', 'boundary');
			ele.setAttribute('stroke', 'yellow');
			ele.setAttribute('stroke-width', 4);
			ele.setAttribute('fill', 'none');
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

	if( uid === null ) {
		window.alert("No session active");
		window.history.back();
	} else {
		// getSamples();
		// genReview();
	}
});

// Find current samples
//
function getSamples() {

	var target = "review";

	$.ajax({
		type: "POST",
		url: '/model/model/review',
		dataType: "json",
		data: {
						uid: uid,
						target: target,
						dataset: datapath,
						pca: pcapath,
		},
		success: function(data) {

				genReview(JSON.parse(data));

		}
	});

}





// Do review
//
function genReview(samples) {
  $.ajax({
		type: "POST",
    url: "php/reviewSamples_nn.php",
		data: {
			samples: JSON.stringify(samples),
		},
    dataType: "json",
    success: function(data) {

      sampleDataJson = data;

			// Clear the slide viewer if there's something showing
			//
			if( statusObj.curSlide() != "" ) {
				viewer.close();
				statusObj.curSlide("");
			};

			// sort by slide name
			sampleDataJson['review'].sort(function(a, b) {
			  var nameA = a.slide.toUpperCase();
			  var nameB = b.slide.toUpperCase();
			  if (nameA < nameB) {
			    return -1;
			  }
			  if (nameA > nameB) {
			    return 1;
			  }
			  // names must be equal
			  return 0;
			});

			// set boundaries
			for( i = 0; i < sampleDataJson['review'].length; i++ ) {
				boundaries[i] = sampleDataJson['review'][i]['boundary'];
			}
			// 1'st row information
			slidesInfo();
			// 2'nd row information
			displaySlidesamples();
			// gen sortable group
			create_sortable_group();
			// default view
			thumbSingleClick(0);
    },
    error: function() {
      console.log("Review failed");
    }
  });
}

// Creates mouse event
// Parameter: sample data
// Return
//
//
function create_mouse_event(sample, slide_num, sample_index){

		var	box = document.getElementById('box_'+slide_num+'_'+sample);
		var	clickCount = 0;
		var	clickCount1 = 0;
		var box_loc = sample_index[sample];
		box.addEventListener('click', function() {
			clickCount++;
			if( clickCount === 1 ) {
				singleClickTimer = setTimeout(function() {
					clickCount = 0;
					thumbSingleClick(box_loc);
					//destroy_sortable_group();
					reload_js('js/Sortable.js');
					doreviewSel();
				}, 200);
			}
		}, false);

		box.addEventListener("dragend", function( event ) {

			//var label = sampleDataJson['review'][box_loc]['label'];
			var updateItem = new Object();
			// find parent id of the moved cell
			var p_id = event.target.parentNode.id;
			// set the current label value
			if (p_id == 'pos_tile'){
				sampleDataJson['review'][box_loc]['label'] = 1;
			}
			else if(p_id == 'neg_tile'){
				sampleDataJson['review'][box_loc]['label'] = -1;
			}
			else{
				sampleDataJson['review'][box_loc]['label'] = 0;
			}

			updateItem.id = sampleDataJson['review'][box_loc]['id'];
			updateItem.label = sampleDataJson['review'][box_loc]['label'];
			updates.push(updateItem);

			updateLabels();
			doreviewSel();
			slidesInfo();

		}, false);

}

function reload_js(src) {
	$('script[src="' + src + '"]').remove();
	$('<script>').attr('src', src).appendTo('head');
}


// Creates sortable sample images
// Parameter: none
// Return
// enables sample images to move
//
//
function create_sortable_group(){
		// if current slide selection is not "all"
		if (cur_slide_num != -1){
				var byId = document.getElementById('s'+'_'+cur_slide_num);

				[].forEach.call(byId.getElementsByClassName('tile_list'), function (el){
						sortable_group =
								Sortable.create(el, {
								animation: 150,
								group: 'sampleimage'+'_'+cur_slide_num
							})

				});
		}
		else{
				for( var i=0; i < slide_list.length; i++ ) {

						var byId = document.getElementById('s'+'_'+i);

						[].forEach.call(byId.getElementsByClassName('tile_list'), function (el){
								sortable_group_list.push(
									Sortable.create(el, {
										animation: 150,
										group: 'sampleimage'+'_'+i
									})
								)
						});
				}
			}
}

// Destroy sortable sample images
// Parameter: none
// Return
//
//
function destroy_sortable_group(){
		// if current slide selection is not "all"
		if (cur_slide_num != -1) {
				sortable_group.destroy()
		}
		else {
			for( var i=0; i < slide_list.length; i++ ) {
					sortable_group_list[i].destroy();
			}
		}
}

// Gets slides information
// Parameter: none
// the selected sample information in array
// Return
// displays the information of the selected cells
//
//
function slidesInfo() {

	var totalNumofSlides = 0;
	var totalNumofCells = sampleDataJson['review'].length;
	var totalNumofPositive = 0;
	var totalNumfofNegative = 0;
	var array_slide = [];

	for( sample in sampleDataJson['review'] ) {

		if (sampleDataJson['review'][sample]['label'] === 1){
			totalNumofPositive = totalNumofPositive + 1;
		}
		else if (sampleDataJson['review'][sample]['label'] === -1){
			totalNumfofNegative = totalNumfofNegative + 1;
		}
		array_slide.push(sampleDataJson['review'][sample]['slide']);
	}

	totalNumofSlides = counts(array_slide);

	for( var i=0; i<totalNumofSlides; i++) {
		cell_index.push([]);
	}

	// contents exist, remove them
	$("#posHeader1").empty();

	var	container, row, linebreak;
	container = document.getElementById('posHeader1');
	row = document.createElement("div");
	row.setAttribute('class','row');
	row.innerHTML = "<font size=3> <b> Total slides : </b> " + totalNumofSlides + " <br>" +
		"<b> Total superpixels : </b> " + totalNumofCells + " <br>" +
		"<b> Total positive superpixels : </b> " + totalNumofPositive + " <br>" +
		"<b> Total negative superpixels : </b> " + totalNumfofNegative;
	container.appendChild(row);

}

// Gets object counts
// Parameter: array-like
// an object information
// Return: int
// number of objects
//
//
function counts(array){
	var counts = {};
	var totalNum = 0;

	array.forEach(function(element) {
	  counts[element] = (counts[element] || 0) + 1;
	});

	totalNum = Object.keys(counts).length;

	return totalNum;
}


// Displays samples for each slide
// Parameter: none
// the selected sample information in array
// Return
// display the selected samples for each slide
//
//
function displaySlidesamples(){

	var slideObject = [];
	var slideName = "";
	var slide_num = 0;
	var isFirst = true;
	slide_list = [];

	// splits slides
	for( sample in sampleDataJson['review'] ) {
		if (isFirst){
			slideObject = [];
			slideName = sampleDataJson['review'][sample]['slide'];
			slideObject.push(sampleDataJson['review'][sample]);
			isFirst = false;
		}
		else{
			if( slideName != sampleDataJson['review'][sample]['slide']){
				slide_list.push(slideObject);
				slideObject = [];
				slideName = sampleDataJson['review'][sample]['slide'];
				slideObject.push(sampleDataJson['review'][sample]);
				slide_num = slide_num + 1;
				cursampleIndex = 0;
			}
			else{
				slideObject.push(sampleDataJson['review'][sample]);
			}
		}
		cell_index[slide_num].push(sample);
	}

	if(slideObject.length > 0){
		slide_list.push(slideObject);
	}

	var	reviewSel = $("#reviewSel");
	reviewSel.append(new Option("All", "All"));
	for( var i=0; i < slide_list.length; i++ ) {
		reviewSel.append(new Option(slide_list[i][0]['slide'], slide_list[i][0]['slide']));
	}
	// display cells for each slide
	for( var i=0; i < slide_list.length; i++ ) {
		displayOneslide(slide_list[i], i);
		for( sample in slide_list[i]) {
				create_mouse_event(sample, i, cell_index[i]);
		}
	}
}

// Runs when selecting a slide and displays the selected cells in the slide
// Parameter: None
// Return: None
//
//
function doreviewSel(){
	var slide_name = document.getElementById("reviewSel").value;
	clearslides();
	if (slide_name == "All"){
		// display all slides
		for( var i=0; i < slide_list.length; i++ ) {
			displayOneslide(slide_list[i], i);
			for( sample in slide_list[i]) {
					create_mouse_event(sample, i, cell_index[i]);
			}
		}
		cur_slide_num = -1;
	}
	else{
		// display a slide which is selected
		for( var i=0; i < slide_list.length; i++ ) {
      if (slide_name == slide_list[i][0]['slide']){
				cur_slide_num = i;
			}
		}
		displayOneslide(slide_list[cur_slide_num], cur_slide_num);
		for( sample in slide_list[cur_slide_num]) {
				create_mouse_event(sample, cur_slide_num, cell_index[cur_slide_num]);
		}
	}

	create_sortable_group();

}

// Clears current positive, negative, ignore divs
// Parameter: None
// Return: None
//
//
function clearslides(){
	document.getElementById('slides').innerHTML = "";
}

// Displays samples for one slide
// Parameter: array-like, int
// one slide and the selected samples for the slide
// Return
// display the selected samples for the slide
//
//
function displayOneslide(sampleArray, slide_num){

	var container, row;
	var postile, negtile; //, igrtile;
	var postile__name, negtile__name; //, igrtile__name;
	var postile__list, negtile__list; //, igrtile__list;
	var scale, slide, centX, centY, sizeX, sizeY, loc, thumbNail;

	container = document.getElementById('slides');
	row = document.createElement("div");
	row.setAttribute('id', 's'+'_'+slide_num);
	row.innerHTML = "<br/><br/> <b> Slide name : </b> " +  sampleArray[0]['slide']+ " <br>";

	postile = document.createElement("div");
	postile.setAttribute('class', 'layer tile');
	postile_name = document.createElement("div");
	postile_name.setAttribute('class', 'tile_name');
	postile_list = document.createElement("div");
	postile_list.setAttribute('class', 'tile_list');
	postile_list.setAttribute('id', 'pos_tile');

	negtile = document.createElement("div");
	negtile.setAttribute('class', 'layer tile');
	negtile_name = document.createElement("div");
	negtile_name.setAttribute('class', 'tile_name');
	negtile_list = document.createElement("div");
	negtile_list.setAttribute('class', 'tile_list');
	negtile_list.setAttribute('id', 'neg_tile');

	// igrtile = document.createElement("div");
	// igrtile.setAttribute('class', 'layer tile');
	// igrtile_name = document.createElement("div");
	// igrtile_name.setAttribute('class', 'tile_name');
	// igrtile_list = document.createElement("div");
	// igrtile_list.setAttribute('class', 'tile_list');
	// igrtile_list.setAttribute('id', 'igr_tile');


	for( sample in sampleArray ) {

		//var div_im = document.createElement('div');
		//div_im.setAttribute('id','box_'+slide_num+'_'+sample);
		var im = document.createElement('img');
		scale = sampleArray[sample]['scale'];
		slide = sampleArray[sample]['slide'];

		var scale_cent = 25.0;
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

		centX = (sampleArray[sample]['centX'] - (scale_cent * scale)) / sampleArray[sample]['maxX'];
		centY = (sampleArray[sample]['centY'] - (scale_cent * scale)) / sampleArray[sample]['maxY'];

		sizeX = (scale_size * scale) / sampleArray[sample]['maxX'];
		sizeY = (scale_size * scale) / sampleArray[sample]['maxY'];
		loc = centX+","+centY+","+sizeX+","+sizeY;

		thumbNail = IIPServer+"FIF="+sampleArray[sample]['path']+SlideLocPre+loc+"&WID=100"+SlideLocSuffix;

		im.setAttribute('src',thumbNail);
		im.setAttribute('id','box_'+slide_num+'_'+sample);

		//div_im.appendChild(im);

		if( sampleArray[sample]['label'] === 1 ) {
			postile_list.appendChild(im);
		// } else if( sampleArray[sample]['label'] === -1 ) {
		}	else{
			negtile_list.appendChild(im);
		// }	else{
		// 	igrtile_list.appendChild(im);
		}

	}

	// find max number of samples in each section
	var a = postile_list.childElementCount;
	var b = negtile_list.childElementCount;
	// var c = igrtile_list.childElementCount;

	var max = Math.max(a, b);
	// max = Math.max(max, c);

	var sample_num = sampleArray.length;
	var sizeX = 100;
	var sizeY = 100;
	for (i = max; i > 0; i--) {
		if ((a-i) < 0) {
			var im = document.createElement('img');
			im.setAttribute('class',"no-border");
			im.setAttribute('width',sizeX);
			im.setAttribute('height',sizeY);
			im.setAttribute('id','box_'+slide_num+'_'+sample_num);
			postile_list.appendChild(im);
			sample_num = sample_num + 1;
		}
		if ((b-i) < 0) {
			var im = document.createElement('img');
			im.setAttribute('class',"no-border");
			im.setAttribute('width',sizeX);
			im.setAttribute('height',sizeY);
			im.setAttribute('id','box_'+slide_num+'_'+sample_num);
			negtile_list.appendChild(im);
			sample_num = sample_num + 1;
		}
		// if ((c-i) < 0) {
		// 	var im = document.createElement('img');
		// 	im.setAttribute('class',"no-border");
		// 	im.setAttribute('width',sizeX);
		// 	im.setAttribute('height',sizeY);
		// 	im.setAttribute('id','box_'+slide_num+'_'+sample_num);
		// 	igrtile_list.appendChild(im);
		// 	sample_num = sample_num + 1;
		// }
	}

	postile_name.innerHTML = posClass;
	postile.appendChild(postile_name);
	postile.appendChild(postile_list);
	negtile_name.innerHTML = negClass;
	negtile.appendChild(negtile_name);
	negtile.appendChild(negtile_list);
	// igrtile_name.innerHTML = "Ignore";
	// igrtile.appendChild(igrtile_name);
	// igrtile.appendChild(igrtile_list);

	row.appendChild(postile);
	row.appendChild(negtile);
	// row.appendChild(igrtile);

	container.appendChild(row);

}

// ThumbNamil one click function
//
//
function thumbSingleClick(index) {
	// Load the appropriate slide in the viewer
	var newSlide = sampleDataJson['review'][index]['slide'];
	curX = Math.round(sampleDataJson['review'][index]['centX']);
	curY = Math.round(sampleDataJson['review'][index]['centY']);

	if( statusObj.curSlide() == "" ) {
		statusObj.curSlide(newSlide);
		statusObj.currentX(curX);
		statusObj.currentY(curY);
		updateSlideView();
	}
	else if( statusObj.curSlide() != newSlide ) {
			viewer.close();
			statusObj.curSlide(newSlide);
			statusObj.currentX(curX);
			statusObj.currentY(curY);
			updateSlideView();
	}
	else {
		// On same slide,, no need to load it again
		statusObj.currentX(curX);
		statusObj.currentY(curY);
		homeToNuclei();
	}
	cur_box = index;
	boundaryOn = true;
}
//
//	A double click in the thumbnail box toggles the current classification
//	of the object.
//
//
// function thumbDoubleClick(index) {
//
// 	var label = sampleDataJson['review'][index]['label'];
// 	var updateItem = new Object();
//
// 	// Toggle through the 3 states, pos, neg and ignore
// 	//
// 	if( label === 1 ) {
// 		sampleDataJson['review'][index]['label'] = -1;
// 	} else if( label === -1 ) {
// 		sampleDataJson['review'][index]['label'] = 1;
// 	} else {
// 		sampleDataJson['review'][index]['label'] = 0;
// 	}
//
// 	updateItem.id = sampleDataJson['review'][index]['id'];
// 	updateItem.label = sampleDataJson['review'][index]['label'];
// 	updates.push(updateItem);
//
// 	updateLabels();
// 	doreviewSel();
// 	// slidesInfo(sampleDataJson['review']);
// }

//	Updates labels in al server
//
function updateLabels() {

	// No need to send boundaries to the server
	for( i = 0; i < sampleDataJson['review'].length; i++ ) {
		sampleDataJson['review'][i]['boundary'] = "";
	}

	var update_samples = JSON.stringify(updates);
	var target = "reviewSave";

	$.ajax({
		type: "POST",
		url: '/model/model/reviewSave',
		dataType: "json",
		data: {
			uid: uid,
			target: target,
			samples: update_samples,
			dataset: datapath,
			pca: pcapath
		},
		success: function() {

			updates = new Array();
		}
	});
}

// Update slide view when mouse button is clicked on thumbNail
//
//
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



//
// Retruns the value of the GET request variable specified by name
//
//
function $_GET(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g,' '));
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
	curSlide: ko.observable(""),
	currentX: ko.observable(0),
	currentY: ko.observable(0),
	posSel: ko.observable(0),
	negSel: ko.observable(0),
	totalSel: ko.observable(0),
	testSetCnt: ko.observable(0),
	selectSampleslide: ko.observable(0),
	selectSampleid: ko.observable(0),
	selectSamplecentX: ko.observable(0),
	selectSamplecentY: ko.observable(0),
	selectSampleboundary: ko.observable(0),
	selectSamplemaxX: ko.observable(0),
	selectSamplemaxY: ko.observable(0),
	selectSamplescale: ko.observable(0),
	selectSamplelabel: ko.observable(0),
	selectSampleclickX: ko.observable(0),
	selectSampleclickY: ko.observable(0)

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
