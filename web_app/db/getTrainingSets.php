<?php

	require 'connect.php';

	/* 	Retrieve a list of datasets from the data base.
		Return as a json object
	*/

	$dbConn = guestConnect();

	if( $result = mysqli_query($dbConn, "SELECT name, filename from training_sets order by name") ) {

		$jsonData = array();
		while( $array = mysqli_fetch_row($result) ) {
			$obj = array();

			$obj[] = $array[0];
			$obj[] = $array[1];

			$jsonData[] = $obj;
		}
		mysqli_free_result($result);

		echo json_encode($jsonData);
	}
	mysqli_close($dbConn);
?>
