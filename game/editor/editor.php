<?php
include_once("html_site.php");
$html = new Html;
?>

<!DOCTYPE html>
<html>
  <head style="height:100%">
    <title>Map editor</title>
    <meta charset='utf-8'>
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=1024", initial-scale=1.0">

   <meta name="Author" content="Mattias"/>
    <meta name="description" content="Camera test using canvas."/>
   <link rel="stylesheet" href="menustyles.css">

    <script src="../js/jquery-1.7.2.min.js" type="text/javascript"></script>
    <script src="../js/jquery-ui-1.8.13.custom.min.js" type="text/javascript"></script>

    <script src="./camera_site.js" type="text/javascript"></script>
    <?php
       $html->header();
    ?>

    <!-- zzz Get this to work or localize it in a local file.
    <script src=".SOCKET_IO."></script>
    <script src="http://fr4gments.com:8079/socket.io/socket.io.js"></script>
    <script src="http://localhost:8079/socket.io/socket.io.js"></script>
    -->
    
    <script src="../js/jquery.ui.touch-punch.min.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="./style.css">
  </head>

  <body>
    <div id="canvasContainer">
      <canvas id="gameCanvas" >undefined</canvas>
    </div>

    <div id="infotab" class="transpwind">
      <canvas id="topCanvas"> undefined </canvas>
    </div>

<div id="login" class="transpwind" style="text-align: center; font-size:x-large">
LOGIN
  <table width="100%" border="0">
  <tbody>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td><p>
        <label for="username">Username:</label>
        <input type="text" name="Username" id="Username">
        <label for="Password">Password:</label>
        <input type="password" name="Password" id="Password">
	<input type="button" name="Login" id="Login" value="Login" onclick="submit_credentials()"/>
      </p></td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  </tbody>
  </table>
  
</div>

<div id="editor_menu" class="transpwind"> <div id='cssmenu'>
<!-- double ids because of event propagation></!-->
<ul>
   <li class='active'><a href='http://fr4gments.com/'><span>Home</span></a></li>
   <li class='has-sub'><a href='#'><span>Brush size</span></a>
      <ul id="size">
         <li><a href='#' id="1"><span id="1">Small (1 hex)</span></a></li>
         <li><a href='#' id="2"><span id="2">Medium (7 hex)</span></a></li>
         <li><a href='#' id="3"><span id="3">Big (19 hex) Not working</span></a></li>
         <li class='last'><a href='#'><span>Extra</span></a></li>
      </ul>
   </li>
   <li class='has-sub'><a href='#'><span>Terrain type</span></a>
      <ul id="terrain">
         <li><a href='#' id="1"><span id="1">Dirt</span></a></li>
         <li><a href='#' id="2"><span id="2">Forest</span></a></li>
         <li><a href='#' id="3"><span id="3">Water (bad size)</span></a></li>
         <li><a href='#' id="4"'><span id="4">Semi forest (forest)</span></a></li>
         <li><a href='#' id="5"'><span id="5">factory</span></a></li>
	 <li><a href='#' id="6"'><span id="6">barrack</span></a></li>
	 <li><a href='#' id="7"'><span id="7">refinery</span></a></li>
	 <li><a href='#' id="8"'><span id="8">cityhall</span></a></li>
         <li class='last'><a href='#'><span>Extra</span></a></li>
      </ul>
   </li>
   <li class='has-sub last'><a href='#'><span>Random/Fixed</span></a>
      <ul id="type">
         <li><a href='#' id="1"><span id="1">1</span></a></li>
         <li><a href='#' id="2"><span id="2">2</span></a></li>
         <li><a href='#' id="3"><span id="3">3</span></a></li>
         <li><a href='#' id="4"><span id="4">4</span></a></li>
         <li><a href='#' id="5"><span id="5">5</span></a></li>
         <li><a href='#' id="6"><span id="6">Random</span></a></li>
         <li class='last'><a href='#'><span>Detail</span></a></li>
      </ul>
   </li>
</ul>
</div>
</div> 

   <div id="bottomContainer" class="transpwind">
    <canvas id="bottomCanvas"> undefined </canvas>
   </div>

  <script src="./cache.js" type="text/javascript"></script>
  <script src="./menu.js" type="text/javascript"></script>
  <script src="./server_com.js" type="text/javascript"></script>
  <script src="./camera.js" type="text/javascript"></script>
  </body>

</html>
