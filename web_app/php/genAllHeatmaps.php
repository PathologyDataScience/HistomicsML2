<?php

//
//	Copyright (c) 2014-2017, Emory University
//	All rights reserved.
//
//	Redistribution and use in source and binary forms, with or without modification, are
//	permitted provided that the following conditions are met:
//
//	1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
//	2. Redistributions in binary form must reproduce the above copyright notice, this list
// 	of conditions and the following disclaimer in the documentation and/or other materials
//	provided with the distribution.
//
//	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//	OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
//	SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//	INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
//	TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
//	BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
//	WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
//	DAMAGE.
//
//

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
