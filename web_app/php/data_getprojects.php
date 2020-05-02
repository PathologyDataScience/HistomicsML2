<?php

	require '../db/logging.php';		// Also includes connect.php

	$projectDir = $_POST['projectDirMain'];

	$array_dir = array();
	// Open a directory, and read its contents
	if (is_dir($projectDir)){
	  if ($dh = opendir($projectDir)){
	    	while (($file = readdir($dh)) !== false){
					if(is_dir($projectDir.$file)){
						if($file != '.' && $file != '..'){
							$array_dir[] = $file;
						}
					}
				}
    }
    closedir($dh);
	}

	$response = array("projectDir" => $array_dir);

	echo json_encode($response);

	?>
