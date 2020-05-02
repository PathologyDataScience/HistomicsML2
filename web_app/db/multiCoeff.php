<?php

		// require '../db/logging.php';
		if(isset($_POST['uni_coeff'])) {
			$csv_data = $_POST['uni_coeff'];
			if (file_put_contents("../python/uni_coeff.json", $csv_data))
			      echo "JSON uni_variate file created successfully...";
			else
			      echo "Oops! Error creating json file...";
			// $uni_result = shell_exec('python python/multiCoeff.py ' . escapeshellarg(json_encode($csv_data)));
			$uni_result = shell_exec('python python/multiCoeff.py python/uni_coeff.json uni');
			// write_log("INFO","Return value: ".$uni_result);
		}else if(isset($_POST['multi_coeff'])){
			$json = $_POST['multi_coeff'];
			if (file_put_contents("../python/multi_coeff.json", $json))
						echo "JSON multi_variate file created successfully...";

			else
						echo "Oops! Error creating json file...";
			$multi_result = shell_exec('python python/multiCoeff.py python/multi_coeff.json multi');
		}
?>
