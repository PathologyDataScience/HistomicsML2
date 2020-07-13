<?php

	require '../db/logging.php';		// Also includes connect.php
	require_once 'hostspecs.php';			// Defines $host and $port


	// Generate a unique id to track this session in the server
	//
	$UID = uniqid("", true);

	// Get the trainingset file from the database
	//
	$dbConn = guestConnect();
	$sql = 'SELECT name, pos_name, neg_name FROM test_sets WHERE name="'.$_POST["testSet"].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$filename = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to get test set from the database");
	}

	$sql = 'SELECT features_file, pca_file, superpixel_size FROM datasets WHERE name="'.$_POST["reloadDataset"].'"';
	if( $result = mysqli_query($dbConn, $sql) ) {

		$featureFile = mysqli_fetch_row($result);
		mysqli_free_result($result);
	} else {
		log_error("Unable to get training set from the database");
	}

	write_log("INFO", "Reloading:  '".$featureFile[0]."', trainset: ".$filename[0]);

	mysqli_close($dbConn);

	session_start();
	$_SESSION['uid'] = $UID;
	$_SESSION['posClass'] = $filename[1];
	$_SESSION['negClass'] = $filename[2];
	$_SESSION['classifier'] = $filename[0];
	$_SESSION['iteration'] = 0;
	$_SESSION['dataset'] = $_POST["reloadDataset"];
	$_SESSION['reloaded'] = true;
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
