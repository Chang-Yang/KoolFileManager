<?php
	mb_internal_encoding("UTF-8");

	$path="../TestUpload";

	if ($handle = opendir($path)) {
		$str = "";
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." && $entry != "..") {
				$size = getimagesize($path . "/" . $entry);
				if (!$size) {
					$str .= $entry . " is not an image file<br>";
				} else {
					$str .= $entry . ", width : " . $size[0] . ", height : " . $size[1] . "<br>";
				}
			}
		}
		echo $str;
	}
?>