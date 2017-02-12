<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">

    <title>map test</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <script src="http://maps.google.com/maps/api/js?sensor=true" type="text/javascript"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js" type="text/javascript"></script>
    <script src="jquery-ui-map/jquery.ui.map.full.min.js" type="text/javascript"></script>


  </head>
  <body>

<script type="text/javascript">
        $(function() {
                // Also works with: var yourStartLatLng = '59.3426606750, 18.0736160278';
                var yourStartLatLng = new google.maps.LatLng(59.3426606750, 18.0736160278);
                $('#map_canvas').gmap({'center': yourStartLatLng});
        });
</script>


<div id="map_canvas" style="width:1000px;height:1000px"></div>

</body>
</html>
