<?php

	require 'connect.php';

	$slide = $_POST['slide'];

	$dbConn = guestConnect();
	$sql = 'SELECT x_size, y_size, scale FROM slides WHERE name="'.$slide.'"';
	if( $result = mysqli_query($dbConn, $sql) ) {
		$sizes = mysqli_fetch_row($result);
		mysqli_free_result($result);
	}
	mysqli_close($dbConn);

	echo json_encode($sizes);

?>
