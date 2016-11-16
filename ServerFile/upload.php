<?php
//include 'chromephp-master/ChromePhp.php';
$realPath = "C:\website\Apache24\htdocs\KoolFileManager\TestUpload\\";		// Saving to Temporary File

header('Content-type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

//ChromePhp::log('started');
if(isset($_REQUEST['isBig'])){
	$output = "Debug Objects : isBig = " . $_REQUEST['isBig'] . " title = " . $_REQUEST["title"];
	//ChromePhp::log($output);
}

$total = count($_FILES['FileData']['name']);
if ($total > 0) {
	$tmpFilePath = $_FILES['FileData']['tmp_name'];
	
	//ChromePhp::log('File Name: ' . $_FILES['FileData']['name']);
	if ($tmpFilePath != ""){
		$newFilePath = iconv("utf-8", "CP949", $realPath . $_FILES['FileData']['name']);
		move_uploaded_file($tmpFilePath, $newFilePath);
	}
}
?>
