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

	require 'logging.php';		// Also includes connect.php
	require '../php/hostspecs.php';

	$dataset = $_POST['dataset'];

	$sql = 'SELECT t.name, t.fileName FROM training_sets t '
			.'JOIN datasets d ON t.dataset_id=d.id WHERE d.name="'.$dataset.'"';

	$dbConn = guestConnect();

	if( $result = mysqli_query($dbConn, $sql) ) {

		$trainingSetNames = array();
		$fileNames = array();
		while( $array = mysqli_fetch_row($result) ) {
			$trainingSetNames[] = $array[0];
			$fileNames[] = $array[1];
		}

		$trainingSetData = array("trainingSets" => $trainingSetNames, "fileNames" => $fileNames);
		mysqli_free_result($result);

	} else {
		log_error("Unable to retrieve training sets from database");
		exit();
	}
	mysqli_close($dbConn);

	echo json_encode($trainingSetData);
?>
