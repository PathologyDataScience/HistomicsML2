<?php

function guestConnect() {
	require 'accounts.php';		// $logAccount $logPass $guestAccount $guestPass

	$dbConn = mysqli_connect($dbAddress, $guestAccount, $guestPass, "nuclei");
	if( !$dbConn ) {
		echo("<p>Unable to connect to the database server</p>" . mysqli_connect_error() );
		exit();
	}
	return $dbConn;
}






function loggerConnect() {
	require 'accounts.php';		// $logAccount $logPass $guestAccount $guestPass


	$dbConn = mysqli_connect($dbAddress, $logAccount, $logPass, "nuclei");
	if( !$dbConn ) {
		echo("<p>Unable to connect to the database server</p>" . mysqli_connect_error() );
		exit();
	}
	return $dbConn;
}





?>
