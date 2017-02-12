<?php

include_once("../include/map.php");
include_once("../include/land_utils.php");

$x = 0;
$y = 0;

$x_view_map_size = 8;
$y_view_map_size = 21;

$map = new Map();

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">

    <title>test12</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <link href="http://code.jquery.com/ui/1.8.21/themes/base/jquery-ui.css" rel="stylesheet">
    <link href="http://code.jquery.com/ui/1.8.21/themes/ui-lightness/jquery-ui.css" rel="stylesheet">

    <?php
    echo '<link href="http://code.jquery.com/ui/1.8.21/themes/base/jquery-ui.css" rel="stylesheet">';
    echo '<link href="http://code.jquery.com/ui/1.8.21/themes/ui-lightness/jquery-ui.css" rel="stylesheet">';
    echo '<link rel="stylesheet" type="text/css" href="style.css"></link>';
    echo '<script src="../js/jquery-1.7.2.min.js" type="text/javascript"></script>';
    echo '<script src="../js/jquery-ui-1.8.13.custom.min.js" type="text/javascript"></script>';
    echo '<script src="../js/jquery.ui.touch-punch.min.js" type="text/javascript"></script>';
    echo '<script src="map.js" type="text/javascript"></script>';
    ?>

  </head>
  <body>

<div id="container">

<div id="map_container" class="ui-widget-content">

<div id="map1">
<?php
  $map->printMap($x, $y, $x_view_map_size, $y_view_map_size, 1, 0);
?>

</div>

</div>

</div>

    </body>
</html>
