<?php
	header('Content-type: text/html; charset=utf-8');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Credentials: true');

	$fileName = $_REQUEST["fileName"];
	$saveFolder = "../TestUpload" ;	//$_REQUEST("folderPath");
  
	$filePath = $saveFolder .  "/" . $fileName;
  
	if (file_exists($filePath)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="'.basename($filePath).'"');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($filePath));
		header("Cache-control: private");
		
		$fd = fopen ($filePath, "r");
		while (!feof($fd)) {
			$buffer = fread($fd, 2048);
			echo $buffer;
		}
		fclose ($fd);
		exit;
	}
?>