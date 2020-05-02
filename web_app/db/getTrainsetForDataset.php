<?php

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';

	$dataset = $_POST['dataset'];

//	$sql = 'SELECT t.name, t.fileName FROM training_sets t '
//			.'JOIN datasets d ON t.dataset_id=d.id WHERE d.name="'.$dataset.'"';

	$sql = 'SELECT name, fileName, modelName FROM training_sets';

	$dbConn = guestConnect();

	if( $result = mysqli_query($dbConn, $sql) ) {

		$trainingSetNames = array();
		$fileNames = array();
		while( $array = mysqli_fetch_row($result) ) {
			$trainingSetNames[] = $array[0];
			$fileNames[] = $array[1];
			$modelNames[] = $array[2];
		}

		$trainingSetData = array("trainingSets" => $trainingSetNames, "fileNames" => $fileNames, "modelNames" => $modelNames));
		mysqli_free_result($result);

	} else {
		log_error("Unable to retrieve training sets from database");
		exit();
	}
	mysqli_close($dbConn);

	echo json_encode($trainingSetData);
?>
