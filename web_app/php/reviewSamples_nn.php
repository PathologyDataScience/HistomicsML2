<?php

//
//	Copyright (c) 2014-2019, Emory University
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

	require 'hostspecs.php';
	require '../db/logging.php';

	session_start();


	// Now get the max X & Y from the database for the slide of the samples
	//
	$dbConn = guestConnect();
	$response = json_decode($_POST['samples'], true);


	for($i = 0, $len = count($response['review']); $i < $len; ++$i) {

		$response['review'][$i]['centX'] = (float)$response['review'][$i]['centX'];
		$response['review'][$i]['centY'] = (float)$response['review'][$i]['centY'];
		// // write_log("INFO","CenTX: ".$response['review'][$i]['centX']);
		// $response['review'][$i]['label'] = (int)$response['review'][$i]['label'];


		// get slide dimensions for the sample
		$sql = 'SELECT x_size, y_size, pyramid_path, scale FROM slides WHERE name="'.$response['review'][$i]['slide'].'"';
		if( $result = mysqli_query($dbConn, $sql) ) {
			$row = mysqli_fetch_row($result);

			$response['review'][$i]['maxX'] = intval($row[0]);
			$response['review'][$i]['maxY'] = intval($row[1]);
			$response['review'][$i]['path'] = $row[2];
			$response['review'][$i]['scale'] = intval($row[3]);

			mysqli_free_result($result);
		}

		$boundaryTablename = "sregionboundaries";

		// Get database id for the sample
		$sql = 'SELECT id, boundary FROM '.$boundaryTablename.' WHERE slide="'.$response['review'][$i]['slide'].'"';
		$sql = $sql.' AND centroid_x='.$response['review'][$i]['centX'].' and centroid_y='.$response['review'][$i]['centY'];

		if( $result = mysqli_query($dbConn, $sql) ) {
			$array = mysqli_fetch_row($result);

			$response['review'][$i]['id'] = intval($array[0]);
			$response['review'][$i]['boundary'] = $array[1];
			mysqli_free_result($result);
		}
	}
	mysqli_close($dbConn);
	$response = json_encode($response);

	echo $response;
?>
