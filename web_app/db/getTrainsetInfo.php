<?php

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';

	$trainset = $_POST['trainset'];
	$dbConn = guestConnect();

    // Get labels, we order by class label which puts the negative class (-1)
    // first and the positive class (1) second.
	$sql = 'SELECT c.name, c.id from classes c join training_sets t on '
            .'c.training_set_id=t.id where t.name = "'.$trainset.'" order by c.label';

	if( $result = mysqli_query($dbConn, $sql) ) {

        $labels = array();
        $classIds = array();
		while( $array = mysqli_fetch_row($result) ) {
			$labels[] = $array[0];
            $classIds[] = $array[1];
		}
		mysqli_free_result($result);
	} else {
		log_error("Unable to retrieve training label names from database");
		exit();
	}

    // Get iterations
	$sql = 'SELECT iterations from training_sets t where name = "'.$trainset.'"';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$iterations = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to retrieve training iterations from database");
		exit();
	}

    // Get class counts
    $counts = array();

    // Negative class
    $sql = 'SELECT count(o.cell_id) from training_objs o join training_sets t '
           .' where t.name = "'.$trainset.'" and o.class_id='.$classIds[0];

	if( $result = mysqli_query($dbConn, $sql) ) {

		$counts[] = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to retrieve negative class count from database");
		exit();
	}

    // Positive class
    $sql = 'SELECT count(o.cell_id) from training_objs o join training_sets t '
           .' where t.name = "'.$trainset.'" and o.class_id='.$classIds[1];

	if( $result = mysqli_query($dbConn, $sql) ) {

		$counts[] = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to retrieve negative class count from database");
		exit();
	}

	mysqli_close($dbConn);

    $info = array("labels" => $labels, "iterations" => $iterations, "counts" => $counts);

	echo json_encode($info);
?>
