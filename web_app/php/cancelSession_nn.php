<?php
	require 'hostspecs.php';	// $host & $port defined here
	require '../db/logging.php';

	session_start();

	write_log("INFO", "Session '".$_SESSION['classifier']."' canceled");

	// Cleanup session variables
	//
	session_destroy();
?>
