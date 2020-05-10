<?php

	require 'hostspecs.php';
	session_start();

	$_SESSION['activation'] = $_POST['activation'];
	$_SESSION['optimizer'] = $_POST['optimizer'];
	$_SESSION['learning_rate'] = $_POST['learning_rate'];
	$_SESSION['dropout'] = $_POST['dropout'];
	$_SESSION['epochs'] = $_POST['epochs'];

?>
