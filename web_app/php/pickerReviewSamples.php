<?php

	require 'hostspecs.php';		// Defines $host and $port
	require '../db/logging.php';

	session_start();
	$response['picker_review'] = json_decode($_POST['samples'], true);
	$prog = true;

	if( $prog ) {
		// Now get the max X & Y from the database for the slide of the samples
		//
		$dbConn = guestConnect();

		for($i = 0, $len = count($response['picker_review']); $i < $len; ++$i) {

			$response['picker_review'][$i]['centX'] = round($response['picker_review'][$i]['centX'], 1);
			$response['picker_review'][$i]['centY'] = round($response['picker_review'][$i]['centY'], 1);


			// get slide dimensions for the sample
			$sql = 'SELECT x_size, y_size, pyramid_path, scale FROM slides WHERE name="'.$response['picker_review'][$i]['slide'].'"';
			if( $result = mysqli_query($dbConn, $sql) ) {
				$row = mysqli_fetch_row($result);

				$response['picker_review'][$i]['maxX'] = intval($row[0]);
				$response['picker_review'][$i]['maxY'] = intval($row[1]);
				$response['picker_review'][$i]['path'] = $row[2];
				$response['picker_review'][$i]['scale'] = intval($row[3]);

				mysqli_free_result($result);
			}

			$boundaryTableName = "sregionboundaries";

			// Get database id for the sample
			$sql = 'SELECT id, boundary FROM '.$boundaryTableName.' WHERE slide="'.$response['picker_review'][$i]['slide'].'"';
			$sql = $sql.' AND centroid_x='.$response['picker_review'][$i]['centX'].' and centroid_y='.$response['picker_review'][$i]['centY'];

			if( $result = mysqli_query($dbConn, $sql) ) {
				$array = mysqli_fetch_row($result);

				$response['picker_review'][$i]['id'] = intval($array[0]);
				$response['picker_review'][$i]['boundary'] = $array[1];
				mysqli_free_result($result);
			}
		}
		mysqli_close($dbConn);
	}

	$response = json_encode($response);

	echo $response;
?>
