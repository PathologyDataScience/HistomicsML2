<?php

	require '../db/logging.php';		// Also includes connect.php
	require 'hostspecs.php';

	session_start();

	$application = $_POST['application'];
	$runCommand = "heatMap";

	$dbConn = guestConnect();
	$sql = 'SELECT x_size, y_size FROM slides WHERE name="'.$_POST['slide'].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {
		$sizes = mysqli_fetch_row($result);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	if ($application == "region"){
			$runCommand = "sregionHeatMap";
	}

	$sel_data =  array("command" => $runCommand,
					   "slide" => $_POST['slide'],
					   "width" => intval($sizes[0]),
					   "height" => intval($sizes[1]),
	  			 	   "uid" => $_SESSION['uid'] );

	$sel_data = json_encode($sel_data);

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

	socket_write($socket, $sel_data, strlen($sel_data));
	$response = socket_read($socket, 4096);
	$additional = socket_read($socket, 4096);
	while( $additional != false ) {
		$response = $response.$additional;
		$additional = socket_read($socket, 4096);
	}
	socket_close($socket);

	echo json_encode($response);


?>
