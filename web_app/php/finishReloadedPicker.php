<?php

	require 'hostspecs.php';			// Defines $host and $port
	require '../db/logging.php';		// Also includes connect.php

	session_start();

	// Cleanup session variables
	//
	session_unset();
	session_destroy();
?>
