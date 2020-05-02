<?php

	require 'connect.php';

	/* 	Retrieve a list of segmented slides from the data base.
		Return as a json object
	*/
	$dataset = $_POST['dataset'];

	$dbConn = guestConnect();

	/*
		May want to change this if the joins cause a slowdown
	*/
	$sql = 'SELECT s.name, s.pyramid_path, s.x_size, s.y_size FROM slides s JOIN dataset_slides d ON s.id=d.slide_id JOIN datasets t ON d.dataset_id=t.id WHERE t.name="'.$dataset.'" ORDER BY s.name';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$slideNames = array();
		$xsizes = array();
		$ysizes = array();
		$paths = array();
		while( $array = mysqli_fetch_row($result) ) {
			$slideNames[] = $array[0];
			$paths[] = $array[1];
			$xsizes[] = $array[2];
			$ysizes[] = $array[3];
		}

		$slideData = array("slides" => $slideNames, "paths" => $paths, "xsizes" => $xsizes, "ysizes" => $ysizes);
		mysqli_free_result($result);

	}
	mysqli_close($dbConn);

	echo json_encode($slideData);
?>
