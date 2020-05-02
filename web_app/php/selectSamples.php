<?php

	require 'hostspecs.php';
	require '../db/logging.php';

	session_start();

	if( isset($_SESSION['uid']) ) {
		$uid = $_SESSION['uid'];
	}
	$response['samples'] = $_POST['samples'];

	// Now get the max X & Y from the database for the slide of the samples
	//
	$dbConn = guestConnect();
	// $response['samples'] = json_decode($response['samples'], true);

	for($i = 0, $len = count($response['samples']); $i < $len; ++$i) {

		$response['samples'][$i]['aurl'] = "";
		$response['samples'][$i]['uid'] = $uid;
		// write_log("INFO", "Response '".$response['samples'][$i]['centX']."' Test");
		$response['samples'][$i]['centX'] = floatval($response['samples'][$i]['centX']);
		$response['samples'][$i]['centY'] = floatval($response['samples'][$i]['centY']);
		$response['samples'][$i]['label'] = intval($response['samples'][$i]['label']);

		// get slide dimensions for the sample
		$sql = 'SELECT x_size, y_size, pyramid_path, scale FROM slides WHERE name="'.$response['samples'][$i]['slide'].'"';
		if( $result = mysqli_query($dbConn, $sql) ) {
			$row = mysqli_fetch_row($result);

			$response['samples'][$i]['maxX'] = intval($row[0]);
			$response['samples'][$i]['maxY'] = intval($row[1]);
			$response['samples'][$i]['path'] = $row[2];
			$response['samples'][$i]['scale'] = intval($row[3]);

			mysqli_free_result($result);
		}

		$boundaryTablename = "sregionboundaries";

		$sql = 'SELECT id, boundary FROM '.$boundaryTablename.' WHERE slide="'.$response['samples'][$i]['slide'].'"';
		$sql = $sql.' AND centroid_x='.$response['samples'][$i]['centX'].' and centroid_y='.$response['samples'][$i]['centY'];

		if( $result = mysqli_query($dbConn, $sql) ) {
			$array = mysqli_fetch_row($result);

			$response['samples'][$i]['id'] = intval($array[0]);
			$response['samples'][$i]['boundary'] = $array[1];
			mysqli_free_result($result);
		}
	}

	mysqli_close($dbConn);
	$response = json_encode($response);

	echo $response;
?>
