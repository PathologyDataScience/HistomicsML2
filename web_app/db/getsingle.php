<?php

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
