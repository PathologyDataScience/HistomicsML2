<?php

		require 'hostspecs.php';
		require '../db/logging.php';

		$prog = true;

		$response['samples'] = json_decode($_POST['samples'], true);
		$response['iterations'] = $_POST['iterations'];
		$response['filename'] = $_POST['filename'];
		$response['modelname'] = $_POST['modelname'];
		$dataset = $_POST['dataset'];
		$classifier = $_POST['classifier'];
		$posClass = $_POST['posClass'];
		$negClass = $_POST['negClass'];

		$dbConn = guestConnect();
		// Get dataset ID
		if( $result = mysqli_query($dbConn, 'SELECT id from datasets where name="'.$dataset.'"') ) {

			$array = mysqli_fetch_row($result);
			$datasetId = $array[0];
			mysqli_free_result($result);
		}

		if( trim($response['filename']) === "" || !isset($response['filename']) ) {
			$response['filename'] = "lost filename";
		}

		// Delete classifier if exists,
		if( $prog ) {
			$sql = 'SELECT id from training_sets WHERE name="'.$classifier.'"';
			if( $result =  mysqli_query($dbConn, $sql) ) {
				$trainingSetId = mysqli_fetch_row($result)[0];
				mysqli_free_result($result);
				$sql = 'DELETE FROM training_sets WHERE id='.$trainingSetId;
				if ($result =  mysqli_query($dbConn, $sql)) {
					write_log("INFO", "Exist ".$filename." trainingSetId ".$trainingSetId);
					mysqli_free_result($result);
				}
			}
		}

		// Add classifier to database
		//
		$sql = 'INSERT INTO training_sets (name, type, dataset_id, iterations, filename, modelname)';
		$sql = $sql.' VALUES("'.$classifier.'", "binary", '.$datasetId;
		$sql = $sql.', '.$response['iterations'].', "'.$response['filename'].'", "'.$response['modelname'].'")';

		$status = mysqli_query($dbConn, $sql);
		$trainingSetId = $dbConn->insert_id;
		if( $status == FALSE ) {
			log_error("Unable to insert classifier into database ".mysqli_error($dbConn));
			log_error("Offending SQL: ".$sql);
			$prog = false;
		}

	if( $prog ) {
		// Add classes to the database
		//		!!!! Assuming binary for now !!!!
		//
		$sql = 'INSERT INTO classes (name, training_set_id, color, label)';
		$sql = $sql.'VALUES("'.$posClass.'",'.$trainingSetId.', "green", 1)';
		$status = mysqli_query($dbConn, $sql);
		$posId = $dbConn->insert_id;
		if( $status == FALSE ) {
			log_error("Unable to insert pos class into database ".mysqli_error($dbConn));
			log_error("Offending SQL: ".$sql);
			$prog = false;
		}
	}

	if( $prog ) {
		$sql = 'INSERT INTO classes (name, training_set_id, color, label)';
		$sql = $sql.'VALUES("'.$negClass.'",'.$trainingSetId.', "red", -1)';
		$status = mysqli_query($dbConn, $sql);
		$negId = $dbConn->insert_id;
		if( $status == FALSE ) {
			log_error("Unable to insert neg class into database ".mysqli_error($dbConn) );
			log_error("Offending SQL: ".$sql);
			$prog = false;
		}
	}

	if( $prog ) {
		// Add samples to the database
		//
		for($i = 0, $len = count($response['samples']); $i < $len; ++$i) {

			if( $response['samples'][$i]['label'] === "1" ) {
				$classId = $posId;
			} else {
				$classId = $negId;
			}

			$sql = 'INSERT INTO training_objs (training_set_id, cell_id, iteration, class_id)';
			$sql = $sql.'VALUES('.$trainingSetId.','.$response['samples'][$i]['id'].', '.$response['samples'][$i]['iteration'].','.$classId.')';
			mysqli_query($dbConn, $sql);
		}
		mysqli_close($dbConn);

		write_log("INFO", "Session ".$classifier." finished, Training set saved to: ".$response['filename']);

		echo "PASS";
	}

	if( $prog == false ) {
		echo "FAIL";
	}

?>
