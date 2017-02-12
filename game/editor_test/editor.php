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
   <meta name="viewport" content="width=1024; initial-scale=1.0">	
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
    <script type="text/javascript">
function MM_showHideLayers() { //v9.0
  var i,p,v,obj,args=MM_showHideLayers.arguments;
  for (i=0; i<(args.length-2); i+=3) 
  with (document) if (getElementById && ((obj=getElementById(args[i]))!=null)) { v=args[i+2];
    if (obj.style) { obj=obj.style; v=(v=='show')?'visible':(v=='hide')?'hidden':v; }
    obj.visibility=v; }
}
    </script>
  </head>

  <body>
    <div id="canvasContainer" style="position:relative;overflow:hidden;">
      <!-- 1920 947 -->
      
        <canvas id="gameCanvas" width=2020 height=2020 >undefined</canvas>
      </div>

<div id="infotab" class="transpwind">
    <table width="100%" border="0">
      <tbody>
        <tr style="font-size: x-large">
          <td>Menu <br>
          :::<br></td>
          <td> Manpower<br>
          20/100</td>
          <td>Army<br>
          13/100 </td>
          <td>Citizens<br>
          67/100 </td>
          <td>Resources<br>
          163 </td>
          <td>Upkeep<br>
          -25 </td>
        </tr>
      </tbody>
    </table> 
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
    	
   <div id="bottomcontainer" width="100">
    	
    <div id="cityhall" class="transpwind"><table width="95%" border="0">
  <caption style="font-size: xx-large; font-style: normal; font-weight: 900;">
CITY HALL
  </caption>
  <tbody>
    <tr>      </tr>
  </tbody>
    </table>
<table width="95%" border="0">
      <tbody>
          <tr>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/engineer2.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','inherit','Construct','','hide','cityhallbuild','','hide')"><br>Engineer<br>100/0<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/concreteh_com.png" width="110" height="110"><br>Concrete<br>100/25<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/buildbuildings.png" width="157" height="110" onClick="MM_showHideLayers('cityhall','','hide','Construct','','show','cityhallbuild','','hide')"><br>
            Construct<br>buildings<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','hide','barrack','','show')"><br>
            #<br>Barrack<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','hide','Factory1','','show')"><br>#<br>Factory 1<br></td>
          </tr>
      </tbody>
      </table>
    </div>
    
    <div id="Construct" class="transpwind"><table width="95%" border="0">
  <caption style="font-size: xx-large; font-style: normal; font-weight: 900;">
CONSTRUCT
  </caption>
  <tbody>
    <tr>      </tr>
  </tbody>
    </table>
<table width="95%" border="0">
      <tbody>
          <tr>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/factoryh_com.png" width="110" height="110"><br>Factory<br>150/50<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/barrackh_com.png" width="110" height="110"><br>Barrack<br>125/25<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/bunkerh_com.png" width="110" height="110"><br>
            Bunker<br>25/25<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/refineryh_com.png" width="110" height="110"><br>Refinery<br>150/100<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/moveh_com.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','show','Construct','','hide')"><br>
            Go<br>back<br></td>
          </tr>
      </tbody>
      </table>
    </div>
    
    <div id="Factory1" class="transpwind"><table width="95%" border="0">
  <caption style="font-size: xx-large; font-style: normal; font-weight: 900;">
FACTORY 1
  </caption>
  <tbody>
    <tr>      </tr>
  </tbody>
    </table>
<table width="95%" border="0">
      <tbody>
          <tr>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/factory_addon_com.png" width="110" height="110"><br>
            Build<br>addon<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/factory_addon_com.png" width="110" height="110"><br>
            Build<br>addon<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/moveh_com.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','show','Factory1','','hide')"><br>
            Go<br>back<br></td>
          </tr>
      </tbody>
      </table>
    </div>
    
    <div id="cityhallbuild" class="transpwind"><table width="95%" border="0">
  <caption style="font-size: xx-large; font-weight: 900;">
BUILD
  </caption>
  <tbody>
    <tr>      </tr>
  </tbody>
    </table>
<table width="95%" border="0" align="center">
      <tbody>
          <tr>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/engineer2.png" alt="" width="110" height="110" onClick="MM_showHideLayers('cityhall','','show','cityhallbuild','','hide')"/><br>
            Engineer</td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/bunkerh_com.png" width="110" height="110" alt=""/><br>
            Bunker</td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/bunkerh_com.png" width="110" height="110" alt=""/><br>
            Bunker2</td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/cityhallh_com.png" width="110" height="110" alt=""/><br>
            City Hall</td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/factory_addon_com.png" width="110" height="110" alt=""/><br>
            AddOn</td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/factoryh_com.png" width="110" height="110"><br>
            Factory</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div id="barrack" class="transpwind"><table width="95%" border="0">
  <caption style="font-size: xx-large; font-style: normal; font-weight: 900;">
BARRACK
  </caption>
  <tbody>
    <tr>      </tr>
  </tbody>
    </table>
<table width="95%" border="0">
      <tbody>
          <tr>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/soldierh_com.png" width="110" height="110"><br>&nbsp;<br>Soldier<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/artillery2.png" width="110" height="110"><br>
             <br>Artillery<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/na.png" width="110" height="110"><br>Not<br>available<br></td>
            <td align="center" valign="bottom" style="font-size: x-large"><img src="../img/moveh_com.png" width="110" height="110" onClick="MM_showHideLayers('cityhall','','show','barrack','','hide')"><br>
            Go<br>back<br></td>
          </tr>
      </tbody>
      </table>
    </div>
  </div>
    
    
    
    
    
    
  </div>
    <script src="./camera.js" type="text/javascript"></script>
  </body>

</html>
