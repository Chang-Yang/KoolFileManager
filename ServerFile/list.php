<?php
	mb_internal_encoding("UTF-8");
	
	$path="../TestUpload";

	if ($handle = opendir($path)) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." && $entry != "..") {
				echo "<div>" . $entry . "</div>";
			}
		}
		
	}
?>