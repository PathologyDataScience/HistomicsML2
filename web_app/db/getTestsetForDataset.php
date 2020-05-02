<?php

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';

	$dataset = $_POST['dataset'];

	$sql = 'SELECT t.name, t.fileName FROM test_sets t '
			.'JOIN datasets d ON t.dataset_id=d.id WHERE d.name="'.$dataset.'"';

	$dbConn = guestConnect();

	if( $result = mysqli_query($dbConn, $sql) ) {

		$testSetNames = array();
		$fileNames = array();
		while( $array = mysqli_fetch_row($result) ) {
			$testSetNames[] = $array[0];
			$fileNames[] = $array[1];
		}

		$testSetData = array("testSets" => $testSetNames, "fileNames" => $fileNames);
		mysqli_free_result($result);

	} else {
		log_error("Unable to retrieve training sets from database");
		exit();
	}
	mysqli_close($dbConn);

	echo json_encode($testSetData);
?>
