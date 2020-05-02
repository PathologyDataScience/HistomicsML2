<?php

	require '../db/logging.php';		// Also includes connect.php

	$projectDir = $_POST['projectDir'];

	$array_features = array();
	// Open a directory, and read its contents
	if (is_dir($projectDir)){
	  if ($dh = opendir($projectDir)){
	    	while (($file = readdir($dh)) !== false){
					$info = pathinfo($file);
					if ($info["extension"] == "h5") {
							// if (strpos($file, 'spfeatures') !== false) {
								$array_features[] = $file;
							// }
				 }
	    }
	    closedir($dh);
	  }
	}

	$response = array("featureName" => $array_features);

	echo json_encode($response);

	?>
