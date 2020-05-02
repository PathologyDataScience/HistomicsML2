<?php

// $aurl = $_POST['urls'];

// $result = shell_exec('python ../scripts/gen_augmentation.py '.escapeshellarg($aurl));
$result = shell_exec('python ../scripts/gen_augmentation.py 2>&1');
$rst = json_decode($result, true);
// $rt = array("features" => $rst);
var_dump($rst);
?>
