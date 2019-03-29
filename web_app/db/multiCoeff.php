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
