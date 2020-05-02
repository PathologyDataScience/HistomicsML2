<?php

	require 'connect.php';


	/* 	Retrieve the pyramid path for the specified slide
		Return as a json object
	*/
	$slide = $_POST['slide'];
	$dbConn = guestConnect();

	/*
		May want to change this if the joins cause a slowdown
	*/
	$sql = 'SELECT pyramid_path FROM slides WHERE name="'.$slide.'"';
	if( $result = mysqli_query($dbConn, $sql) ) {

		$path = array();
		while( $array = mysqli_fetch_row($result) ) {
			$path[] = $array[0];
		}
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	echo json_encode($path);
?>
