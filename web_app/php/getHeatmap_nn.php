<?php

	require '../db/logging.php';		// Also includes connect.php
	require 'hostspecs.php';

	session_start();

	$jsonData = array();

	$dbConn = guestConnect();
	$sql = 'SELECT x_size, y_size FROM slides WHERE name="'.$_POST['slide'].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {
		$sizes = mysqli_fetch_row($result);
		$jsonData[] = $sizes[0]; // width
		$jsonData[] = $sizes[1]; // height
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	echo json_encode($jsonData);


?>
