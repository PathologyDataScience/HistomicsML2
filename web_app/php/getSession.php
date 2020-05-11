<?php

	require 'hostspecs.php';
	session_start();


	$sessionInfo = array();

	if( isset($_SESSION['uid']) ) {
		$sessionInfo['uid'] = $_SESSION['uid'];
		$sessionInfo['className'] = $_SESSION['classifier'];
		$sessionInfo['posClass'] = $_SESSION['posClass'];
		$sessionInfo['negClass'] = $_SESSION['negClass'];
		$sessionInfo['dataset'] = $_SESSION['dataset'];
		$sessionInfo['datapath'] = $_SESSION['datapath'];
		$sessionInfo['pcapath'] = $_SESSION['pcapath'];
		$sessionInfo['reloaded'] = $_SESSION['reloaded'];
		$sessionInfo['init_reloaded'] = $_SESSION['init_reloaded'];
		$sessionInfo['iteration'] = $_SESSION['iteration'];
		$sessionInfo['dataSetPath'] = $_SESSION['dataSetPath'];
		$sessionInfo['trainingSetName'] = $_SESSION['trainingSetName'];
		$sessionInfo['trainingSetModelName'] = $_SESSION['trainingSetModelName'];
		$sessionInfo['superpixelSize'] = $_SESSION['superpixelSize'];
		$sessionInfo['activation'] = $_SESSION['activation'];
		$sessionInfo['optimizer'] = $_SESSION['optimizer'];
		$sessionInfo['learning_rate'] = $_SESSION['learning_rate'];
		$sessionInfo['dropout'] = $_SESSION['dropout'];
		$sessionInfo['epochs'] = $_SESSION['epochs'];
	} else {
		$sessionInfo['uid'] = null;
		$sessionInfo['dataset'] = null;
	}

	$sessionInfo['alServer'] = $host;
	$sessionInfo['alServerPort'] = $port;
	$sessionInfo['IIPServer'] = $IIPServer;

	echo json_encode($sessionInfo);
?>
