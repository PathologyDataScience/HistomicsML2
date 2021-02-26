	<?php

	require '../db/logging.php';
	require '../db/accounts.php';
	require 'hostspecs.php';

	$datasetName = $_POST['datasetName'];
	$projectDirectory = '/datasets/'.$_POST['project'];
	$slideInfoFile = $_POST['pyramid'];
	$featureFile = $_POST['feature'];
	$pcaFile = $_POST['pca'];
	$boundaryDir = $_POST['boundary'];

	// empty check for dataset name
	if( empty($datasetName) ) {
		echo "<script type='text/javascript'>window.alert('Dataset name is empty !! ');
		window.location.href = '../data.html';</script>";
		exit;
	}

	// check if dataset name exists
	$dbConn = mysqli_connect($dbAddress, $guestAccount, $guestPass, "nuclei");

	if( !$dbConn ) {
		echo("<p>Unable to connect to the first database server</p>" . mysqli_connect_error() );
		exit;
	}

	$sql = 'SELECT name FROM datasets WHERE name="'.$datasetName.'"';

	if( $result = mysqli_query($dbConn, $sql) ) {
		while( $array = mysqli_fetch_row($result) ) {
			$isDatasetName = $array[0];
		}
		mysqli_free_result($result);
	}

	mysqli_close($dbConn);

	if(isset($isDatasetName)) {
		echo "<script type='text/javascript'>window.alert('Dataset: $isDatasetName already exists !! ');
		window.location.href = '../data.html';</script>";
		exit;
	}

	$boundaryFile = 'boundarieZ.txt';
	$pathToboundaryFile = $projectDirectory.'/'.$boundaryFile;


	/************	Start checking and removing slide name for boundaries ************/

	$dbConn = mysqli_connect($dbAddress, $guestAccount, $guestPass, "nuclei");
	if( !$dbConn ) {
		echo("<p>Unable to connect to the database server</p>" . mysqli_connect_error() );
		exit;
	}

	$boundaryTablename = "sregionboundaries";
	// slide name check
	$sql = 'SELECT DISTINCT slide FROM '.$boundaryTablename;
	$slideArray = array();
	if( $result = mysqli_query($dbConn, $sql) ) {
		// read file
		$file = fopen($slideListPath,'r');
		while( $array = mysqli_fetch_row($result) ) {
				while ($line = fgets($file)) {
				if( strcmp($array, $line) == 0){
					$line = explode("\n", $line);
					$slideArray[] = $line[0];
				}
			}
		}
		fclose($file);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	// remove duplicated slides from sregionboundaries
	// dataset name check

	$dbConn = mysqli_connect($dbAddress, $guestAccount, $guestPass, "nuclei");
	if( !$dbConn ) {
		echo("<p>Unable to connect to the database server</p>" . mysqli_connect_error() );
		exit;
	}

	foreach ($slideArray as $slide) {
		$sql = 'DELETE FROM '.$boundaryTablename.' WHERE slide="'.$slide.'"';
		if( $result = mysqli_query($dbConn, $sql) ) {
				mysqli_free_result($result);
		}
	}

	mysqli_close($dbConn);

	/************	End checking and removing slide name for boundaries ************/

	/************	Start existing slide name check ************/
	$newslidelist = array();
	$link = mysqli_init();
	mysqli_options($link, MYSQLI_OPT_LOCAL_INFILE, true);
	mysqli_real_connect($link, $dbAddress, $guestAccount, $guestPass, "nuclei");

	$sql = 'SELECT name, id FROM slides';

	if( $result = mysqli_query($link, $sql) ) {
		// read csv file
		$lines = file($projectDirectory.'/'.$slideInfoFile, FILE_IGNORE_NEW_LINES);
		foreach ($lines as $line)
		{
			$rows_pyramids = explode('\n', $line);
			list($slidename, $sizex, $sizey, $slidepath, $scale) = explode(',', $rows_pyramids[0]);
			while( $array = mysqli_fetch_row($result) ) {
			  if ($slidename !== $array[0]){
					// if slide name doesn't exists
					$newslidelist[] = $slidename;
				}
			}
		}
		mysqli_free_result($result);
	}
	else {
		echo "<script type='text/javascript'>window.alert('Slides: Cannot retrieve slide names from database !! ');
		window.location.href = '../data.html';</script>";
		exit;
	}

	// create a slide list
	$old_path = getcwd();
	chdir('/var/www/html/HistomicsML/scripts/');
	$output = shell_exec('./gen_slide_list.sh '.$projectDirectory.'/slide_info.csv slidelist.txt');

	/************	Start dataset importing************/
	// $out = $guestAccount.' '.$guestPass.' '.$datasetName.' '.$_POST['project'].'/'.$featureFile.' '.$projectDirectory.'/slidelist.txt';
	// add datasets and dataset_slides tables
	$result = shell_exec('python create_dataset_importtab.py '.escapeshellarg($dbAddress).' '.escapeshellarg($guestAccount).' '.escapeshellarg($guestPass).' '.escapeshellarg($datasetName).' '.$_POST['project'].'/'.escapeshellarg($featureFile).' '.$_POST['project'].'/'.escapeshellarg($pcaFile).' /var/www/html/HistomicsML/scripts/slidelist.txt');
	// write_log("INFO"," Directory".$out);

	if( $result != 0 ) {
		echo "<script type='text/javascript'>window.alert('Dataset: Cannot import dataset to database !! ');
		window.location.href = '../data.html';</script>";
		exit;
	}
	else{
		echo "<script type='text/javascript'>window.alert('Data import is completed !! ');
		window.location.href = '../index.html';</script>";
		exit;
	}
	/************	End dataset importing************/

?>
