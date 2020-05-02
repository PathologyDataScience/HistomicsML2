<?php

	require 'hostspecs.php';
	require '../db/logging.php';

	$prog = true;

	$samples = json_decode($_POST['samples'], true);
	$iterations['iterations'] = $_POST['iterations'];
	$filename = $_POST['filename'];
	$response['modelname'] = $_POST['modelname'];
	$dataset = $_POST['dataset'];
	$classifier = $_POST['classifier'];
	$posClass = $_POST['posClass'];
	$negClass = $_POST['negClass'];

	// This training set has been saved before, so only the samples need
	// to be processed. Some may have been updated, others may me new.
	//
	$dbConn = guestConnect();
	// Get dataset ID
	if( $result = mysqli_query($dbConn, 'SELECT id from datasets where name="'.$dataset.'"') ) {

		$array = mysqli_fetch_row($result);
		$datasetId = $array[0];
		mysqli_free_result($result);
	}

	if( $prog ) {
		$sql = 'SELECT id from training_sets WHERE name="'.$classifier.'"';
		if( $result =  mysqli_query($dbConn, $sql) ) {
			$trainingSetId = mysqli_fetch_row($result)[0];
			mysqli_free_result($result);
		}
	}

	write_log("INFO", "Session ".$filename." trainingSetId ".$trainingSetId);

	if( $prog ) {
		$sql = 'UPDATE training_sets SET filename="'.$filename.'" WHERE id='.$trainingSetId;
		 if( !mysqli_query($dbConn, $sql) ) {
 			log_error("Error updating record: ". mysqli_error($dbConn));
 		}
	}

	if( $prog ) {
		// Get class id's
		$sql = 'SELECT id from classes WHERE training_set_id='.$trainingSetId.' AND label = 1';
		if( $result =  mysqli_query($dbConn, $sql) ) {
			$posId = mysqli_fetch_row($result)[0];
			mysqli_free_result($result);
		}

		$sql = 'SELECT id from classes WHERE training_set_id='.$trainingSetId.' AND label = -1';
		if( $result =  mysqli_query($dbConn, $sql) ) {
			$negId = mysqli_fetch_row($result)[0];
			mysqli_free_result($result);
		}
	}

	// Add samples to the datab
	for ($i = 0; $i <= count($samples); $i++) {

		if( $samples[$i]['label'] === "1" ) {
			$classId = $posId;
		} else {
			$classId = $negId;
		}

		// Check if object already exists.
		$sql = 'SELECT cell_id from training_objs WHERE training_set_id='.$trainingSetId
			.' AND cell_id='.$samples[$i]['id'];

		if( $result =  mysqli_query($dbConn, $sql) ) {
			$objId = mysqli_fetch_row($result)[0];
			mysqli_free_result($result);
		}

		if( $objId == NULL ) {
			$sql = 'INSERT INTO training_objs (training_set_id, cell_id, iteration, class_id)'
			      .'VALUES('.$trainingSetId.','.$samples[$i]['id'].', '
				  .$samples[$i]['iteration'].','.$classId.')';
			mysqli_query($dbConn, $sql);
		} else {
			$sql = 'UPDATE training_objs SET class_id='.$classId
				   .' WHERE cell_id='.$objId.' AND training_set_id='.$trainingSetId;
			if( !mysqli_query($dbConn, $sql) ) {
				log_error("Error updating record: ". mysqli_error($dbConn));
			}
		}
	}
	mysqli_close($dbConn);

	write_log("INFO", "Session ".$classifier." finished, Training set saved to: ".$filename);
	echo "PASS";


?>
