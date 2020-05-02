<?php

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';


	//	Get the bounding box and slide name passed by the ajax call
	//
	$left = intval($_POST['left']);
	$right = intval($_POST['right']);
	$top = intval($_POST['top']);
	$bottom = intval($_POST['bottom']);
	$slide = $_POST['slide'];
	$trainSet = $_POST['trainset'];
	$boundaryTablename = "sregionboundaries";

	// Get labels for the objects within the viewport
	if( $trainSet != "none" ) {

		if( $trainSet === "PICKER" ) {
			$colors = array('aqua', 'yellow');
		} else {
			$colors = array('lightgrey', 'lime');
		}

		$dataSet = $_POST['dataset'];

	}


	$dbConn = guestConnect();
	$sql = 'SELECT boundary, id, centroid_x, centroid_y from '.$boundaryTablename.' where slide="'.$slide.'" AND centroid_x BETWEEN '.$left.' AND '.$right.' AND centroid_y BETWEEN '.$top.' AND '.$bottom;

	if( $result = mysqli_query($dbConn, $sql) ) {

		$jsonData = array();
		while( $array = mysqli_fetch_row($result) ) {
			$obj = array();

			$obj[] = $array[0];
			$obj[] = $array[1];

			$obj[] = "aqua";
			$obj[] = $array[2];
			$obj[] = $array[3];

			$jsonData[] = $obj;
		}
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	echo json_encode($jsonData);

?>
