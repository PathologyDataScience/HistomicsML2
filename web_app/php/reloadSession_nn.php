<?php

	require '../db/logging.php';

	// Generate a unique id to track this session in the server
	//
	$UID = uniqid("", true);

	// Get the trainingset file from the database
	//
	$dbConn = guestConnect();
	$sql = 'SELECT filename, modelname FROM training_sets WHERE name="'.$_POST["trainingset"].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$filename = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to get training set from the database");
	}

	$sql = 'SELECT features_file, pca_file, superpixel_size FROM datasets WHERE name="'.$_POST["reloadDataset"].'"';
	if( $result = mysqli_query($dbConn, $sql) ) {

		$featureFile = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to get training set from the database");
	}

	write_log("INFO", "Feature file '".$featureFile[0]."', trainset: ".$filename[0]);

	mysqli_close($dbConn);

	write_log("INFO", "Session '".$_POST["trainingset"]."' reloaded");

	// $command = escapeshellcmd('python ../../predict-rest-api/run_model_server.py');
  // $output = shell_exec($command);

	session_start();
	$_SESSION['uid'] = $UID;
	$_SESSION['classifier'] = $_POST["trainingset"];
	$_SESSION['dataset'] = $_POST["reloadDataset"];
	$_SESSION['posClass'] = $_POST['reloadPosClass'];
	$_SESSION['negClass'] = $_POST['reloadNegClass'];
	$_SESSION['iteration'] = $_POST['reloadIterClass'];
	$_SESSION['datapath'] = $featureFile[0];
	$_SESSION['pcapath'] = $featureFile[1];
	$_SESSION['trainingSetName'] = $filename[0];
	$_SESSION['trainingSetModelName'] = $filename[1];
	$_SESSION['reloaded'] = true;
	$_SESSION['init_reloaded'] = true;
	$_SESSION['superpixelSize'] = $featureFile[2];
	header("Location: ../viewer.html");

?>
