<?php
class Html {
  function Html(){}
    function header() {
	 $script = '<script src="http://fr4gments.com:8079/socket.io/socket.io.js"></script>';
	 //$script = '<script src="http://localhost:8079/socket.io/socket.io.js"></script>';
         echo $script;
    }
  }
?>
