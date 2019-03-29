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
