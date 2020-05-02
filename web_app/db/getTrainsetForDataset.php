<?php

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';

	$dataset = $_POST['dataset'];

	$sql = 'SELECT t.name, t.fileName, t.modelName FROM training_sets t '
			.'JOIN datasets d ON t.dataset_id=d.id WHERE d.name="'.$dataset.'"';

	$dbConn = guestConnect();

	// $sql = "SELECT name, filename, modelname FROM training_sets";

	if( $result = mysqli_query($dbConn, $sql) ) {

		 $jsonData = array();
		 while( $array = mysqli_fetch_row($result) ) {
			 $obj = array();

			 $obj[] = $array[0];
			 $obj[] = $array[1];
			 $obj[] = $array[2];

			 $jsonData[] = $obj;
		 }
		 mysqli_free_result($result);

		 echo json_encode($jsonData);
 }

 mysqli_close($dbConn);
?>
