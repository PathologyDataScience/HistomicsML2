<?php

	//require 'connect.php';
	require 'logging.php';		// Also includes connect.php

	/* 	Retrieve a list of datasets from the data base.
		Return as a json object
	*/

	$dbConn = guestConnect();

	$sql = "SELECT name,features_file,pca_file,superpixel_size from datasets";

	 if( $result = mysqli_query($dbConn, $sql) ) {

		 	$jsonData = array();
			while( $array = mysqli_fetch_row($result) ) {
	 			$obj = array();

	 			$obj[] = $array[0];
	 			$obj[] = $array[1];
				$obj[] = $array[2];
				$obj[] = $array[3];

	 			$jsonData[] = $obj;
	 		}
 			mysqli_free_result($result);

 			echo json_encode($jsonData);
  }

	mysqli_close($dbConn);
?>
