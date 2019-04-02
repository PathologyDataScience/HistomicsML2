<?php

//
//	Copyright (c) 2014-2019, Emory University
//	All rights reserved.
//
//	Redistribution and use in source and binary forms, with or without modification, are
//	permitted provided that the following conditions are met:
//
//	1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
//	2. Redistributions in binary form must reproduce the above copyright notice, this list
// 	of conditions and the following disclaimer in the documentation and/or other materials
//	provided with the distribution.
//
//	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//	OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
//	SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//	INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
//	TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
//	BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
//	WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
//	DAMAGE.
//
//

	require '../db/logging.php';

	// Make sure initSession.php was referenced from the main
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
	if( empty($_POST["classifiername"]) ) {
			// Redirect back to the form
			header("Location:".$_SERVER['HTTP_REFERER']);
			exit;
	}



	// 	Retrieve a list of training set name from db.
	//
	$dbConn = guestConnect();

	$sql = 'SELECT name FROM training_sets WHERE name="'.$_POST["classifiername"].'"';
	// check if trainingset name already exists.
	if( $result = mysqli_query($dbConn, $sql) ) {
		while( $array = mysqli_fetch_row($result) ) {
			$isClassifyName = $array[0];
		}
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	// if(isset($isClassifyName)) {
	// 	echo "<script type='text/javascript'>window.alert('Classifier: $isClassifyName already exists !! ');
	// 	window.location.href = '../index.html';</script>";;
	// }

	if(isset($isClassifyName)) {
		echo "<script type='text/javascript'>window.alert('Classifier: $isClassifyName already exists !! ');
		window.location.href = '../index.html';</script>";;
	}

	else {




	if( empty($_POST["posName"]) ) {
			// Redirect back to the form
			header("Location:".$_SERVER['HTTP_REFERER']);
			exit;
	}

	if( empty($_POST["negName"]) ) {
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
	$sql = 'SELECT features_file, superpixel_size FROM datasets WHERE name="'.$_POST["dataset"].'"';

	if( $result = mysqli_query($dbConn, $sql) ) {

		$featureFile = mysqli_fetch_row($result);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	require 'hostspecs.php';

		write_log("INFO", "Session '".$_POST["classifiername"]."' started");

		session_start();
		$_SESSION['uid'] = $UID;
		$_SESSION['posClass'] = $_POST["posName"];
		$_SESSION['negClass'] = $_POST["negName"];
		$_SESSION['classifier'] = $_POST["classifiername"];
		$_SESSION['iteration'] = 0;
		$_SESSION['dataset'] = $_POST["dataset"];
		$_SESSION['datapath'] = $featureFile[0];
		$_SESSION['reloaded'] = false;
		$_SESSION['init_reloaded'] = false;
		$_SESSION['superpixelSize'] = $featureFile[1];
		header("Location: ../prime.html");
	}
?>
