<?php

	require '../db/logging.php';		// Also includes connect.php
	require 'hostspecs.php';


	$dataset = $_POST['dataset'];

	// Get slide info for the dataset from the database
	//
	$dbConn = guestConnect();
	$sql = 'SELECT s.name, s.pyramid_path, s.x_size, s.y_size FROM slides s JOIN dataset_slides d ON s.id=d.slide_id JOIN datasets t ON d.dataset_id=t.id WHERE t.name="'.$dataset.'" ORDER BY s.name';

	if( $result = mysqli_query($dbConn, $sql) ) {
		$slideNames = array();
		$paths = array();
		$x_size = array();
		$y_size = array();

		while( $row = mysqli_fetch_row($result) ) {
			$slideNames[] = $row[0];
			$paths[] = $row[1];
			$x_size[] = $row[2];
			$y_size[] = $row[3];
		}

		$slideData = array("slides" => $slideNames,
						   "paths" => $paths,
						   "x_size" => $x_size,
						   "y_size" => $y_size );

		mysqli_free_result($result);
	}
	mysqli_close($dbConn);


	echo json_encode($slideData);
?>
