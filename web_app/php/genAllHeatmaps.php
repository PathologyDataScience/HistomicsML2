<?php

	require '../db/logging.php';		// Also includes connect.php
	require 'hostspecs.php';


	$dataset = $_POST['dataset'];
	$application = $_POST['application'];

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

		$serverData = array("slides" => $slideNames,
						   "x_size" => $x_size,
						   "y_size" => $y_size );

		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

  $cmd_name = "allHeatMaps";
	if($application == "region"){
		$cmd_name = "sregionallHeatMaps";
	}

	$cmd_data =  array("command" => $cmd_name,
					   "slides" => $serverData,
	  			 	   "uid" => $_POST['uid'] );

	$cmd_data = json_encode($cmd_data, JSON_NUMERIC_CHECK);

	$addr = gethostbyname($host);
	set_time_limit(0);

	$socket = socket_create(AF_INET, SOCK_STREAM, 0);
	if( $socket === false ) {
		log_error("socket_create failed:  ". socket_strerror(socket_last_error()));
	}

	$result = socket_connect($socket, $addr, $port);
	if( !$result ) {
		log_error("socket_connect failed: ".socket_strerror(socket_last_error()));
	}

	socket_write($socket, $cmd_data, strlen($cmd_data));

	$response = socket_read($socket, 4096);
	$additional = socket_read($socket, 4096);
	while( $additional != false ) {
		$response = $response.$additional;
		$additional = socket_read($socket, 4096);
	}
	socket_close($socket);

	$response = json_decode($response);

	$slideData = array("paths" => $paths,
					   "scores" => $response );

	echo json_encode($slideData);
?>
