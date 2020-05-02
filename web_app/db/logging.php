<?php

require 'connect.php';



function write_log($type, $message)
{

	if( $message == '' ) {
		return array( 'status' => false, 'message' => 'Empty message not valid');
	}

	$remoteAddr = $_SERVER['REMOTE_ADDR'];
	if( $remoteAddr == '' ) {
		$remoteAddr = "UNKNOWN";
	} else {
		$remoteAddr = gethostbyaddr($remoteAddr);
		if( $remoteAddr == '' ) {
			$remoteAddr = $_SERVER['REMOTE_ADDR'];
		}
	}


	$dbConn = loggerConnect();
	$message = mysqli_real_escape_string($dbConn, $message);
	$remoteAddr = mysqli_real_escape_string($dbConn, $remoteAddr);
	$type = mysqli_real_escape_string($dbConn, $type);

	$sql = "INSERT INTO logs (remote_addr, type, message) VALUES('$remoteAddr','$type','$message')";
	$status = mysqli_query($dbConn, $sql);

	if( !$status ) {
		return array( 'status' => false, 'message' => "Unable to add to log");
	}

	mysqli_close($dbConn);
	return array( 'status' => true);
}






function log_error($message) {
	write_log("ERROR", $message);
}



?>
