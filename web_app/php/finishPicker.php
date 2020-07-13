<?php

	require 'hostspecs.php';			// Defines $host and $port
	require '../db/logging.php';		// Also includes connect.php

	session_start();

	$dataset = $_POST['dataset'];
	$testset = $_POST['classifier'];
	$response['posClass'] = $_POST['posClass'];
	$response['negClass'] = $_POST['negClass'];
	$response['filename'] = $_POST['filename'];

	$prog = true;

	if( $prog ) {
		$dbconn = guestConnect();
		$sql = 'SELECT id FROM datasets WHERE name="'.$dataset.'"';

		if( $result = mysqli_query($dbconn, $sql) ) {
			$array = mysqli_fetch_row($result);
			$datasetId = $array[0];
			mysqli_free_result($result);
		} else {
			log_error("Unable to get dataset id from database");
			$prog = false;
		}
	}

	if( $prog ) {
		$sql = 'INSERT INTO test_sets (name, dataset_id, filename, pos_name, neg_name) ';
		$sql = $sql.'VALUES("'.$testset.'", '.$datasetId.', ';
		$sql = $sql.'"'.$response['filename'].'", "'.$response['posClass'].'", "'.$response['negClass'].'")';

		$status = mysqli_query($dbconn, $sql);
		if( $status === FALSE ) {
			log_error("Unable to save test set to database");
			$prog = false;
		}
	}

	// Cleanup session variables
	//
	session_unset();
	session_destroy();
?>
