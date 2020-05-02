<?php

	$trainSet = $_POST['downloadset'];

	$file = "../trainingsets/".$trainSet;

	if( file_exists($file) ) {

		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachement; filename='.basename($file));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: '. filesize($file));
		readfile($file);
		exit;
	}
?>
