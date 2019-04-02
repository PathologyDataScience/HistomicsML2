<?php

//
//	Copyright (c) 2014-2018, Emory University
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
		$sessionInfo['reloaded'] = $_SESSION['reloaded'];
		$sessionInfo['init_reloaded'] = $_SESSION['init_reloaded'];
		$sessionInfo['iteration'] = $_SESSION['iteration'];
		$sessionInfo['dataSetPath'] = $_SESSION['dataSetPath'];
		$sessionInfo['trainingSetName'] = $_SESSION['trainingSetName'];
		$sessionInfo['superpixelSize'] = $_SESSION['superpixelSize'];
	} else {
		$sessionInfo['uid'] = null;
		$sessionInfo['dataset'] = null;
	}

	$sessionInfo['alServer'] = $host;
	$sessionInfo['alServerPort'] = $port;
	$sessionInfo['IIPServer'] = $IIPServer;

	echo json_encode($sessionInfo);
?>
