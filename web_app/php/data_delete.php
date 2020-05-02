<?php

	require '../db/accounts.php';
	require 'hostspecs.php';
	require '../db/logging.php';

	$deleteDatasetSel = $_POST['deleteDatasetSel'];

	/************	Start existing dataset and slide name check ************/
	// dataset name check

	$dbConn = mysqli_connect($dbAddress, $guestAccount, $guestPass, "nuclei");

	if( !$dbConn ) {
		echo("<p>Unable to connect to the database server</p>" . mysqli_connect_error() );
		exit;
	}

	$sql = 'DELETE FROM datasets WHERE name="'.$deleteDatasetSel.'"';

	if( $result = mysqli_query($dbConn, $sql) ) {
		mysqli_free_result($result);
	}
	else{
		echo "<script type='text/javascript'>window.alert('Data deletion cannot be processed !! ');
		window.location.href = '../data.html';</script>";
		exit;
	}

	mysqli_close($dbConn);

	echo "<script type='text/javascript'>window.alert('$deleteDatasetSel is removed !! ');
	window.location.href = '../index.html';</script>";
	exit;

?>
