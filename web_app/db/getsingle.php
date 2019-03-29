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

	require 'logging.php';		// Also includes connect.php

	/* 	Retrieve a single nuclei that has the closest centroid to the specified point
		Return as a json object
	*/

	/*
		Get the bounding box centroid and slide name passed by the ajax call
	*/
	$cellX = floatval($_POST['cellX']);
	$cellY = floatval($_POST['cellY']);
	$slide = $_POST['slide'];
	$range = 64;

	$boxLeft = $cellX - $range;
	$boxRight = $cellX + $range;
 	$boxTop = $cellY - $range;
	$boxBottom = $cellY + $range;

	$boundaryTablename = "sregionboundaries";
	$dbConn = guestConnect();

	$sql = 'SELECT boundary, id, centroid_x, centroid_y, '.
		   '(pow(centroid_x -'.$cellX.',2) + pow(centroid_y -'.$cellY.',2)) AS dist '.
		   'FROM '.$boundaryTablename.' WHERE slide="'.$slide.'" AND centroid_x BETWEEN '.$boxLeft.' AND '.$boxRight.
		   ' AND centroid_y BETWEEN '.$boxTop.' AND '.$boxBottom.
		   ' ORDER BY dist LIMIT 1';


	if( $result = mysqli_query($dbConn, $sql) ) {

		$boundaryData = mysqli_fetch_row($result);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);


	if( sizeof($boundaryData) > 0 ) {
		$dbConn = guestConnect();
		$sql = 'SELECT x_size, y_size, scale FROM slides WHERE name="'.$slide.'"';
		if( $result = mysqli_query($dbConn, $sql) ) {
			$sizes = mysqli_fetch_row($result);
			mysqli_free_result($result);

		}
		mysqli_close($dbConn);

		$jsonData = array();
		array_push($jsonData, $boundaryData[0], intval($boundaryData[1]), floatval($boundaryData[2]), floatval($boundaryData[3]),
					$sizes[0], $sizes[1], $sizes[2], $cellX, $cellY);

		echo json_encode($jsonData);
	}
?>
