<?php

	require '../db/logging.php';

	// Make sure initPicker.php was referenced from the main picker
	// page by checking if 'submit' is empty
	//
	if( empty($_POST['submit']) ) {
		echo "Form was not submitted <br>";
		exit;
	}

	// TODO - Add an alert to indicate what was missing. Should
	// be on the main page


	// Each of the text fields must also be filled in
	//
	if( empty($_POST["testsetname"]) ) {
			// Redirect back to the form
			header("Location:".$_SERVER['HTTP_REFERER']);
			exit;
	}

	if( empty($_POST["posClass"]) ) {
			// Redirect back to the form
			header("Location:".$_SERVER['HTTP_REFERER']);
			exit;
	}

	if( empty($_POST["negClass"]) ) {
			// Redirect back to the form
			header("Location:".$_SERVER['HTTP_REFERER']);
			exit;
	}

	// Generate a unique id to track this session in the server
	//
	$UID = uniqid("", true);

	// Get the dataset file from the database
	//
	$dbConn = guestConnect();
	$sql = 'SELECT features_file, pca_file, superpixel_size FROM datasets WHERE name="'.$_POST["dataset"].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$featureFile = mysqli_fetch_row($result);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	require 'hostspecs.php';

	write_log("INFO", "Session '".$_POST["testsetname"]."' started");

	session_start();
	$_SESSION['uid'] = $UID;
	$_SESSION['posClass'] = $_POST["posClass"];
	$_SESSION['negClass'] = $_POST["negClass"];
	$_SESSION['classifier'] = $_POST["testsetname"];	// Reusing className for test set name
	$_SESSION['iteration'] = 0;
	$_SESSION['dataset'] = $_POST["dataset"];
	$_SESSION['reloaded'] = false;
	$_SESSION['datapath'] = $featureFile[0];
	$_SESSION['pcapath'] = $featureFile[1];
	$_SESSION['init_reloaded'] = false;
	$_SESSION['superpixelSize'] = $featureFile[2];
	$_SESSION['activation'] = 'relu';
	$_SESSION['optimizer'] = 'Adam';
	$_SESSION['learning_rate'] = '0.001';
	$_SESSION['dropout'] = '0.3';
	$_SESSION['epochs'] = '10';
	$_SESSION['dataSetPath'] = false;
	$_SESSION['trainingSetName'] = false;
	$_SESSION['trainingSetModelName'] = false;
	$_SESSION['reviewed'] = false;
	header("Location: ../picker.html");
?>
