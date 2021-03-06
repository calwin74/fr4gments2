/*
 * Functions used by the map representation. Using JQuery plugins.
 */

// ---------------------------------------------------------------------------
// Global variables

//Character data
var character = null;

//Initiate TaffyDB
var mapDB = TAFFY();

//Middle position for board
//This the middle of the board and board creation will be based on this point.
var x_position = 0;
var y_position = 0;

//Size of board.
//The variables are set in initialize.
var x_board_max = 0;
var x_board_min = 0;
var y_board_max = 0;
var y_board_min = 0;

//Size of map data in client database
//The variables are set in initialize.
var x_batch_size = 0;
var y_batch_size = 0;

//Size of data in database, needed to make sure a line is odd or not.
//The variables are set in initialize.
var x_global = 0;
var y_global = 0;

//Boarder for loaded data in client database.
var x_pos_boarder = 0;
var x_neg_boarder = 0;
var y_pos_boarder = 0;
var y_neg_boarder = 0;

//Selected army position on board. NULL or coordinate array
var army_selected = null;

//Selected position on board. NULL or coordinate array
var tile_selected = null;

//Selected hex coordinate. NULL or coordinate array
var hex_selected = null;

//Global modes, handling command buttons.
var move_mode = 0;
var attack_mode = 0;
var cancel_move_mode = 0;

//garrison stats
var garrison = {};
garrison.soldiers = 0;
garrison.engineers = 0;

//Road for movement
var road = null;

//Times for actions. Should be stored centralized.
var move_time = 4; //5s
var claim_time = 4; //5s
var build_time = 4; //5s

//Board editor
var edit_terrain = 0;
var edit_terrain_radius = 1;

//websockets
var socket = 0;

// ---------------------------------------------------------------------------
// Code to run on data load

//Create XMLHttpRequest object for all browsers.
var request = false;
var request_delta = false;

try {
    request = new XMLHttpRequest();
} catch (trymicrosoft) {
    try {
	request = new ActiveXObject("Msxml2.XMLHTTP");
   } catch (othermicrosoft) {
	try {
	    request = new ActiveXObject("Microsoft.XMLHTTP");
	} catch (failed) {
	    request = false;
	}  
    }
}

if (!request) {
    alert("Error initializing XMLHttpRequest!");
}

//----------------------------------------------------------------------------
// Init

//Client initialization (sync)
initialize();

//Read board
loadMapBatch();

// ---------------------------------------------------------------------------
// async functions

function initialize() {
    // This is a sync call, need to get init data before any other data.
    var url = "initialize.php?isMobile=" + escape(isMobile);
    request.open("GET", url, false);
    request.onreadystatechange = handleInitialize;
    request.send(null);
}

function loadMapBatch() {
    var url = "map_update.php?x_position=" + escape(x_position) + "&y_position=" + escape(y_position) + "&x_batch_size=" + escape(x_batch_size) + "&y_batch_size=" + escape(y_batch_size);
    request.open("GET", url, true);
    request.onreadystatechange = handleMapUpdate;
    request.send(null);

    updateBoarderXY(x_position, y_position);
}

function sendMove(steps) {
    socket.emit("move", {steps: steps});
}

function sendCancelMove() {
    socket.emit("cancel move");
}

function sendClaim(coord) {
    socket.emit("claim", {coord: coord});
}

function sendBuild(coord, building) {
    var build = {coord:coord, type:building};
    socket.emit("build", build);
}

function sendBuildUnit(coord, unit) {
    var build = {coord:coord, type:unit};
    socket.emit("unit", build);
}

function sendAGChange(a_soldiers, a_engineers, g_soldiers, g_engineers) {
    var change = {a_sol:a_soldiers, a_eng:a_engineers, g_sol:g_soldiers, g_eng:g_engineers};
    socket.emit("change a g", change);
}

function setTerrain(coord, terrain) {
    var url = "edit_update.php?coord=" + escape(coord) + "&class=" + escape(terrain);
    request.open("GET", url, true);
    request.onreadystatechange = handleDefaultUpdate;
    request.send(null);
}

// ---------------------------------------------------------------------------
// callbacks for async functions

function handleDefaultUpdate() {
    if (request.readyState == 4) {
	if (request.status == 200) {
	    //var response = request.responseText;
	}
	else if (request.status == 404) {
	    alert("handleDefaultUpdate: Request URL does not exist");
	}
	else {
	    alert("handleDefaultUpdate: Error - status code is " + request.status);
	}
    }
}

function handleInitialize() {
   if (request.readyState == 4) {
       if (request.status == 200) {
	   var response = request.responseText;
	   
	   // This might not be secure. Use a JSON parser instead?
	   var initObj = eval('(' + response + ')');
	   
	   x_board_max = initObj.x_view_map_size;
	   x_board_min = -initObj.x_view_map_size;
	   y_board_max = initObj.y_view_map_size;
	   y_board_min = -initObj.y_view_map_size;
	   
	   x_global = initObj.x_global_map_size;
	   y_global = initObj.y_global_map_size;
	   
	   x_batch_size = initObj.x_batch_map_size;
	   y_batch_size = initObj.y_batch_map_size;
	   
	   y_edge = initObj.y_edge;
	   x_edge = initObj.x_edge;
	   
	   y_step = initObj.y_step;
	   x_step = initObj.x_step;
	   
	   character = initObj.character;
	   
	   x_position = parseInt(initObj.home_x);
	   y_position = parseInt(initObj.home_y);
       }
       else if (request.status == 404) {
	   alert("Request URL does not exist");
       }
       else {
	   alert("Error: status code is " + request.status);
       }
   }
}

function handleMapUpdate() {
    if (request.readyState == 4) {
	if (request.status == 200) {
	    var response = request.responseText;
	    
	    // remove all rows from database
	    mapDB().remove();
	    // insert json response into database
	    mapDB.insert(response);
	    // create selection for map based on (x_position|y_position)
	    var records = getBoard();	    
	    //update board
	    updateBoard(records);
	}
	else if (request.status == 404) {
	    alert("Request URL does not exist");
	}
	else {
	    alert("Error: status code is " + request.status);
	}
    }
}

// ---------------------------------------------------------------------------
// local functions

function updateTile(x, y, army, add, path) {
    var class_coord = ".xy_" + x + "_" + y;
    
    //set army
    var army_class = " " + army;
    var core_id = getCoreId($(class_coord).attr('id'));
    
    if (add){
	$("#c"+core_id).addClass(army_class);
    }
    else{
	$("#c"+core_id).removeClass(army_class);
    }
    if (path) {
	var tmp = "remove from " + core_id;
	$("#b"+core_id).removeClass("marked_path");
	$("#b"+core_id).addClass("front");
    }
}

function updateTileBuilding(x, y, building, add) {
    var class_coord = ".xy_" + x + "_" + y;
    
    var building_class = " " + building;
    var core_id = getCoreId($(class_coord).attr('id'));
   
    if (add){
	$("#a"+core_id).addClass(building_class);
    }
    else{
	$("#a"+core_id).removeClass(building_class);
    }
}

function updateTileMark(x, y, marker, add) {
    var class_coord = ".xy_" + x + "_" + y;
    
    var marker_class = " " + marker;
    var core_id = getCoreId($(class_coord).attr('id'));
    
    if (add){
	$("#b"+core_id).addClass(marker_class);
    }
    else{
	$("#b"+core_id).removeClass(marker_class);
    }
}

function updateTileTerrain(core_id, terrain) {
    var a_id = "a" + core_id;
    var old_a = $("#"+a_id); //current objects
    var br = old_a.hasClass("br");
    var firstodd = old_a.hasClass("firstodd");
    var odd = old_a.hasClass("odd");
    var even = old_a.hasClass("even");
    var edit = old_a.hasClass("edit");
    var hex = old_a.hasClass("hex");
    var c = "";
    
    //find position classes
    if (br) { 
	c = c + " br";
    }
    if (firstodd) {
	c = c + " firstodd";
    }
    if (odd) {
	c = c + " odd";
    }
    if (even) {
	c = c + " even";
   }
   if (edit) {
       c = c + " edit";
   }
   if (hex) {
      c = c + " hex";
   }

   var a_class = c + " " + terrain;
   $("#"+a_id).attr("class", a_class);
}


var x_board_min = 0;
var x_board_max = 0;
var y_board_min = 0;
var y_board_max = 0;

function updateBoard(records) {
   var x = x_board_min;
   var y = y_board_max; 

   // loop through records and modify class attributes
   records.each(function (r) {
       var id = x + "_" + y;
       var a_id = "a" + id;
       var b_id = "b" + id;

       //current objects
       var old_a = $("#"+a_id);

       // zzz fix this for edit
       var old_b = $("#"+b_id);                

       //align map
       var br = old_a.hasClass("br");
       var firstodd = old_a.hasClass("firstodd");
       var odd = old_a.hasClass("odd");
       var even = old_a.hasClass("even");
       // zzz fix this for edit
       var edit = old_b.hasClass("edit");       
       var alignment = "";

       //find position classes
       if (br) { 
	   alignment = alignment + " br";
       }
       if (firstodd) {
	   alignment = alignment + " firstodd";
       }
       if (odd) {
	   alignment = alignment + " odd";
       }
       if (even) {
	   alignment = alignment + " even";
       }
       
       //css class hex is always needed for terrain.
       var a_class = alignment + " hex";
       
       if (r.building.length) {
	   a_class = a_class + " " + r.building;
       }
       a_class = a_class + " " + r.terrain;
       
       if (r.friend && r.friend.length) {
	   a_class = a_class + " " + r.friend;
       }

       // Marked tile
       //zzz Must have marked armies for this to work.
       var marked = r.marked;
       
       if (marked.length) {
	   var b_class = alignment + " " + r.marked;
       }
       else {
	   var b_class = alignment +  " " + r.classes;
       }

       var army_class = "";
       
       if (r.army && !isEditor) {
	   army_class = " " + r.army;
           //zzz 
	   //setArmyPower(id, parseInt(r.soldiers) + parseInt(r.engineers), isFoo(r.army));
	   
           /* zzz
	   if (!isFoo(r.army)) {
	       updateArmy(r.soldiers, r.engineers);
	   }
           */
       }
       
       var b_class = alignment + " " + r.classes + army_class;
       
       // The xy coordinate class must always be first in the class attribute list.
       var class_coord = "xy_" + r.x + "_" + r.y;
       if (edit) {
	   var b_class = class_coord + " " + alignment + " " + "edit";
       }
       else {
	   var b_class = class_coord + " " + alignment + " " + r.classes;
       }

       // class attribute
       $("#"+a_id).attr("class", a_class);
       $("#"+b_id).attr("class", b_class);

       //edit x and y ...
       if (x >= x_board_max) {
	   x = x_board_min;
	   y--;
       }
       else {
	   x++;
       }
    })
}

function updateBoardSimple(records) {
    var x = x_board_min;
    var y = y_board_max; 

    // loop through records and modify class attributes
    records.each(function (r){
        // ids
	var id = x + "_" + y;
	var a_id = "a" + id;
	
	//current objects
	var old_a = $("#"+a_id);
	
	//check classes
	var br = old_a.hasClass("br");
	var firstodd = old_a.hasClass("firstodd");
	var odd = old_a.hasClass("odd");
	var even = old_a.hasClass("even");
	
	var c = "";
	
	//find position classes
	if (br) { 
	    c = c + " br";
	}
	if (firstodd) {
	    c = c + " firstodd";
	}
	if (odd) {
	    c = c + " odd";
	}
	if (even) {
	    c = c + " even";
	}
	
	//css class hex is always needed for terrain.
	var a_class = c + " hex";
	
	if (r.building.length) {
	    a_class = a_class + " " + r.building;
	}
	a_class = a_class + " " + r.terrain;
	
	if (r.friend && r.friend.length) {
	    a_class = a_class + " " + r.friend;
	}
	
	// class attribute
	$("#"+a_id).attr("class", a_class);
	
	//edit x and y ...
	if (x >= x_board_max) {
	    x = x_board_min;
	  y--;
	}
	else {
	    x++;
	}
    })
}

function isFoo(army) {
    if (army == "army-enemy") {
	return 1;
    }
    else {
	return 0;
    }
}

function getBoard() {
    var x_left = x_position - x_board_max;
    var x_right = x_position + x_board_max;
    var y_top = y_position + y_board_max;
    var y_bottom = y_position - y_board_max;
    
    var y_diff = y_global - y_top;

    if (y_diff % 2) {
	//First line should be even, need to modify the y coordinates. Increase by one.
	y_top++;
	y_bottom++;
    }

    var records = mapDB( {y:{lte:y_top}}, {y:{gte:y_bottom}}, {x:{gte:x_left}}, {x:{lte:x_right}} );
   
    return records;
}

// Update boarders of client database map data.
function updateBoarderXY(x,y)
{
    x_pos_boarder = x + x_batch_size;
    x_neg_boarder = x - x_batch_size;
    y_pos_boarder = y + y_batch_size;
    y_neg_boarder = y - y_batch_size;
}

// Check if outside client database boarder.
function checkBoarder(x,y) {
    var outside = 0;

    if ( ((x + x_board_max) > x_global) || ((x + x_board_min) < -x_global) ||
         ((y + y_board_max) > y_global) || ((y + y_board_min) < -y_global))
    {
	outside = 2;
    }
    else if ( (x + x_board_max > x_pos_boarder) || (-x - x_board_min < x_neg_boarder) ||
	      (y + y_board_max > y_pos_boarder) || (-y - y_board_min < y_neg_boarder))
    {
	outside = 1;
    }

    return outside;
}

//Check if a move is valid
function checkMoveMap(x,y) {
    var status = checkBoarder(x, y);
    
    if (status == 1) {
	alert("load map from database");
	// load more map data from database
	loadMapBatch();
    }
    else if (status == 2) {
	// totally out of map
	alert("Out of map");
    }
    else {
	// get map from cache
	var records = getBoard();
	updateBoard(records);
    }
}

//Check if current is same as stop
function atDestination(current_hex, stop_hex) {
    var done = 0;
    if ((current_hex[0] == stop_hex[0]) && (current_hex[1] == stop_hex[1])) {
	done = 1;
    }
    
    return done;
}

function createCoord(x,y) {
    var coord = new Array();
    coord[0] = x;
    coord[1] = y;
    
    return coord;
}

function roadToPath(road) {
    markRoadMap(road, true);
}

function markRoadMap(road, path) {
    var i = 0;
    var tile = null;
    var len = road.length;
    
    //remove other waypoints
    removeWaypoints();

    while(tile = road[i++]) {
	var cartesian = hexToCartesian(tile);
	var coord = ".xy_" + cartesian[0] + "_" + cartesian[1];
	var id = $(coord).attr("id");
	
	if (path) {
	    setPath(getCoreId(id))
	} 
	else {
	    setMark(getCoreId(id), null);
	    if (i == len) {
		setWayPoint(getCoreId(id));         
	    }   
	}
    }
}

function printRoad(road) {
    var i = 0;
    var tile = null;
    var desc = "road:";
    
    while(tile = road[i++]) {
	var cartesian = hexToCartesian(tile);
	desc = desc.concat("(", cartesian[0], "|", cartesian[1], ")");
    }
    
    return desc;
}

//Format way using comma separated list x|y,x|y, ...
function formatWay(road) {
    var i = 1; //Skip start position
    var tile = null;
    var desc = "";
    
    while(tile = road[i]) {
	if(i != 1) {
	    desc = desc.concat(",");
	}
	var cartesian = hexToCartesian(tile);
	desc = desc.concat(cartesian[0], "|", cartesian[1]);
	i++;
    }
    
    return desc;
}

//Get (x|y) coordinates in the form of an array.
function getXY(coords_str) {
    var parts = coords_str.split("xy_");
    var xy_coords = parts[1].split("_");
    return xy_coords;
}

//Get one record from cache using cartesian coordinates.
function getRecord(x, y) {
    var records = mapDB( {x:{is:x.toString()}}, {y:{is:y.toString()}} );
    var my_record = null;
    
    if (records.count() == 1) {
	records.each(function (r) {
	    my_record = r;
	});
    }

    return my_record;
}

//Get one record from cache using army name.
function getRecordName(name) {
    var records = mapDB( {name:{is:name}} );
    var my_record = null;
    
    if (records.count() == 1) {
	records.each(function (r){
	    my_record = r;
	})
    }

    return my_record;
}

//Get one record from cache using hex coordinates.
function getRecordHex(x_hex, y_hex) {
    var records = mapDB( {x_hex:{is:x_hex.toString()}}, {y_hex:{is:y_hex.toString()}} );
    var my_record = null;

    if (records.count() == 1) {
	records.each(function (r){
	    my_record = r;
	})
    }

    return my_record;
}

//Update "marked" in record from cache using cartesian coordinates.
function updateRecordMarked(x, y, value) {
    //This is stupid. Make this generic ...
    mapDB( {x:{is:x.toString()}}, {y:{is:y.toString()}} ).update( {marked:value} );
}

function updateAllRecordMarked(value) {
    mapDB().update( {marked:value} );
}

function cartesianToHex(cartesian) {
    var hex = new Array();
    
    record = getRecord(cartesian[0], cartesian[1]);
    
    hex[0] = record.x_hex;
    hex[1] = record.y_hex;
    
    return hex;
}

function hexToCartesian(hex) {
    var cartesian = new Array();
    
    record = getRecordHex(hex[0], hex[1]);
    cartesian[0] = record.x;
    cartesian[1] = record.y;
    
    return cartesian;
}

function getHexX(hex) {
    return hex[0];
}

function getHexY(hex) {
    return hex[1];
}

//Get distance based on hex coordinates and delta distances
function getDistance(start_hex, stop_hex) {
    var deltaX = getHexX(stop_hex) - getHexX(start_hex);
    var deltaY = getHexY(stop_hex) - getHexY(start_hex);
    var deltaXY = deltaX - deltaY;
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);
    var absXY = Math.abs(deltaXY);    
    var distance = 0;

    if ( (absX >= absY) && (absX >= absXY) ) {
	distance = absX;
    }
    else if ( (absY >= absX) && (absY >= absXY) ) {
	distance = absY;
    }
    else {
	distance = absXY;
    }

    return distance;
}

function getNextStepEast(current_hex, stop_hex) {
    var distance = getDistance(current_hex, stop_hex);
    var coord;
    var tile_distance;

    //North
    coord = createCoord(getHexX(current_hex), parseInt(getHexY(current_hex)) + 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //NorthEast
    coord = createCoord(parseInt(getHexX(current_hex)) + 1, parseInt(getHexY(current_hex)) + 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //SouthEast
    coord = createCoord(parseInt(getHexX(current_hex)) + 1, getHexY(current_hex));
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //South
    coord = createCoord(getHexX(current_hex), parseInt(getHexY(current_hex)) - 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //SouthWest
    coord = createCoord(parseInt(getHexX(current_hex)) - 1, parseInt(getHexY(current_hex)) - 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //NorthWest
    coord = createCoord(parseInt(getHexX(current_hex)) - 1, getHexY(current_hex));
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
}

function getNextStepWest(current_hex, stop_hex) {
    var distance = getDistance(current_hex, stop_hex);
    var coord;
    var tile_distance;

    //NorthWest
    coord = createCoord(parseInt(getHexX(current_hex)) - 1, getHexY(current_hex));
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //SouthWest
    coord = createCoord(parseInt(getHexX(current_hex)) - 1, parseInt(getHexY(current_hex)) - 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	    return coord;
    }
    //South
    coord = createCoord(getHexX(current_hex), parseInt(getHexY(current_hex)) - 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //SouthEast
    coord = createCoord(parseInt(getHexX(current_hex)) + 1, getHexY(current_hex));
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //NorthEast
    coord = createCoord(parseInt(getHexX(current_hex)) + 1, parseInt(getHexY(current_hex)) + 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
    //North
    coord = createCoord(getHexX(current_hex), parseInt(getHexY(current_hex)) + 1);
    tile_distance = getDistance(coord, stop_hex);
    if (tile_distance < distance) {
	return coord;
    }
}

function getRoadMap(current, destination) {
    var road = new Array();
    var spin = 0; // 0 = east, 1 = west.

    //Transform to hex coordinates
    current_hex = cartesianToHex(current);
    destination_hex = cartesianToHex(destination);

    //include starting point for marks
    road.push(current_hex);
    
    while(!atDestination(current_hex, destination_hex)) {
	var next_step;

	if (spin == 0) {
	    next_step = getNextStepEast(current_hex, destination_hex);
	    spin = 1;
	}
	else {
	    next_step = getNextStepWest(current_hex, destination_hex);
	    spin = 0;
	}
	
	var record = getRecordHex(getHexX(next_step), getHexY(next_step));
	if (record.terrain == "mwater") {
	    break;
	}
       else {
	   road.push(next_step);
	   current_hex = next_step;
       }
    }

    return road;
}

function getCoreId(id) {
    var core_id = id.substring(1);
    return core_id;
}

function getCoordsFromClass(id) {
    var classes = $("#d"+id).attr("class");
    var parts = classes.split(" ");
    var xy_coords = getXY(parts[0]);
    return xy_coords;
}

function clearMarks() {
    $(".marked_enemy").removeClass("marked_enemy").addClass("front");
    $(".marked_friend").removeClass("marked_friend").addClass("front");
    $(".marked_neutral").removeClass("marked_neutral").addClass("front");
    
    //update cache
    updateAllRecordMarked("");
}

function showDevView(id_x, id_y, core_id) {
    var str = "id:(".concat(id_x).concat("|").concat(id_y).concat(")");
    document.getElementById('board_id').innerHTML = str;
    
    var xy = getCoordsFromClass(core_id);
    var record = getRecord(xy[0], xy[1]);
    str = "hex:(".concat(record.x_hex).concat("|").concat(record.y_hex).concat(")");
    document.getElementById('hex_coord').innerHTML = str;
    
    var classes = "d:click:".concat($("#d"+core_id).attr("class"));
    document.getElementById('dclasses').innerHTML = classes;
    
    classes = "c:army:".concat($("#c"+core_id).attr("class"));
    document.getElementById('cclasses').innerHTML = classes;
    
    classes = "b:mark:".concat($("#b"+core_id).attr("class"));
    document.getElementById('bclasses').innerHTML = classes;
    
    classes = "a:background:".concat($("#a"+core_id).attr("class"));
    document.getElementById('aclasses').innerHTML = classes;   
    
    var army_str = null;
    if (army_selected) {
	army_str = "army_selected".concat(army_selected);
    }
    document.getElementById('army_selected').innerHTML = army_str; 
}

function moveMap(steps, y_axis) {
    if (y_axis) {
	y_position = y_position + steps;
    }
    else {
	x_position = x_position + steps;
    }
    
    var records = getBoard();
    updateBoard(records);
    //checkMoveMap(x_position, y_position);
}

function getMark(core_id) {
    var army_id = "#c" + core_id;
    var building_id = "#a" + core_id;
    var mark = "marked_neutral";
    
    if ($(army_id).hasClass('army-enemy')) {
	mark = "marked_enemy";
    }
    else if ($(army_id).hasClass('army')) {
	mark = "marked_friend";
    }
    else if ($(building_id).hasClass('enemy')) {
	mark =  "marked_enemy";
    }
    else if ($(building_id).hasClass('friend')) {
	mark = "marked_friend";
    }
    
    return mark;
}

function setPath(core_id) {
    var mark = "marked_path";
    setMark(core_id, mark);
}

function setMark(core_id, mark_class) {
    var mark = null;
    var mark_id = "#b" + core_id;
    
    if (mark_class) {
	mark = mark_class;
    } else {
	mark = getMark(core_id);
    }
    
    $(mark_id).removeClass("front").addClass(mark);
    
    //update cache
    var xy = getCoordsFromClass(core_id);
    updateRecordMarked(xy[0], xy[1], mark);   
}

function setWayPoint(core_id) {
    var mark_id = "#b" + core_id;
    $(mark_id).addClass("waypoint");
}

function removeWaypoints() {
    $(".waypoint").removeClass("waypoint");   
}

function resetMove() {
    road = null;
    clearMarks();
    removeWaypoints();
}

function handleArmyMovement(core_id) {
    //get road map
    var xy_coords = getCoordsFromClass(core_id);
    road = getRoadMap(army_selected, xy_coords);
    markRoadMap(road, false);
}

//Counter handling
function Countdown(options) {
    var timer,
	instance = this,
	seconds = options.seconds || 10,
	updateCoord = options.updateCoord,
	foo = options.foo,
	updateStatus = options.onUpdateStatus || function () {},
	counterEnd = options.onCounterEnd || function () {};
	
	function decrementCounter() {
	    updateStatus(updateCoord, seconds, foo);
	    if (seconds === 0) {
		counterEnd(updateCoord);
		instance.stop();
	    }
	    seconds--;
	}

	this.start = function () {
	    clearInterval(timer);
	    timer = 0;
	    seconds = options.seconds;
	    timer = setInterval(decrementCounter, 1000);
	};

	this.stop = function () {
	    clearInterval(timer);
	};
}

function endCounter(coord) {
    var core_id = getCoreId($(coord).attr('id'));
    var d_id = "d" + core_id;
    document.getElementById(d_id).innerHTML = "";
}

function updateCounter(coord, sec, foo) {
    var text;
    
    if (foo) {
	text = '<p class="army-enemy-text">' + ' ' + sec + '</p>';
    }
    else {
	text = '<p class="army-text">' + ' ' + sec + '</p>';
    }
    
    var core_id = getCoreId($(coord).attr('id'));
    var d_id = "d" + core_id;
    document.getElementById(d_id).innerHTML = text;
}

function setActionTimer(coord, time, foo) {
    var myCounter = new Countdown({  
	    seconds:time,  // number of seconds to count down
	    updateCoord:coord, //id to update
	    foo:foo, //foo or not
	    onUpdateStatus: updateCounter, // callback for each second
	    onCounterEnd: endCounter, // final action
	});
    
    myCounter.start();
}

function setArmyPower(id, power, foo) {
    var c_id = "c" + id;
    var force = parseInt(power);
    
    if (foo) {
	text = '<p class="army-enemy-strength">' + ' ' + force + '</p>';
    }
    else {
	text = '<p class="army-strength">' + ' ' + force + '</p>';
    }
    
    document.getElementById(c_id).innerHTML = text;
}

function handleWalk(core_id) {
    var mark_id = "#b" + core_id;
    var waypoint = $(mark_id).hasClass("waypoint");
    var result = false;
    
    if (waypoint) {
	var steps = formatWay(road);
      
	//set walk
	sendMove(steps);
	
	//alert(printRoad(road));
	
	//Set path
	roadToPath(road);
	
	//set timer for first step
	var start = road[0];
	var cartesian = hexToCartesian(start);
	var class_coord = ".xy_" + cartesian[0] + "_" + cartesian[1];
	setActionTimer(class_coord, move_time, 0);
	
	//clear way and wayend tiles
	resetMove();
	army_selected = null;
	move_mode = 0;
	attack_mode = 0;
	
	cancel_move_mode = 1;
	if (isMobile) {
	    $("#com_m_1").attr("src", "img/cancel2.png");
	    $("#com_m_1").addClass("com_cancel");
	}
	$("#com1").attr("src", "img/cancel2.png");
	$("#com1").addClass("com_cancel");
    
	result = true;
    }
    
    return result;
}

function isNeutral(core_id) {
    var bg_id = "#a" + core_id;
    if (!$(bg_id).hasClass('friend') && !$(bg_id).hasClass('enemy')) {
	return 1;
    }
    else {
	return 0;
    }
}

function isFriend(core_id) {
    var bg_id = "#a" + core_id;
    return $(bg_id).hasClass('friend');
}

function isEnemy(core_id) {
    var bg_id = "#a" + core_id;
    return $(bg_id).hasClass('enemy');
}

function isCrater(core_id) {
    var bg_id = "#a" + core_id;
    if (($(bg_id).hasClass('crater1')) || ($(bg_id).hasClass('crater2')) || ($(bg_id).hasClass('crater3'))) {
	return 1;
    }
    else {
	return 0;
    }
}

function hasBuilding(core_id, building) {
    var bg_id = "#a" + core_id;
    return $(bg_id).hasClass(building);
}

function createCommand(name, class_name) {
    var command = {};

    command.name = name;
    command.class_name = class_name;
    return command;
}

function addCommands(upper, lower, mobile) {
    var cnt = 1;
    for (var i in upper) {
	var com_id;

	if (mobile) {
	    com_id = "#com_m_" + cnt;
	}
	else {
	    com_id = "#com" + cnt;
	}
        $(com_id).attr("src", "img/" + upper[i].name + "_com.png");
        $(com_id).addClass("com_" + upper[i].class_name);
        cnt++;
    }
    
    cnt = 12;
    for (var i in lower) {
	var com_id;
	
	if (mobile) {
	    com_id = "#com_m_" + cnt;
	}
	else {
	    com_id = "#com" + cnt;
	}
        $(com_id).attr("src", "img/" + lower[i].name + "_com.png");
        $(com_id).addClass("com_" + lower[i].class_name);
        cnt++;
    }
}

function clearCommands(mobile) {
    var n_commands = 22;
    for (var i = 1; i <= n_commands; i++) {
	var com_id;

	if (mobile) {
	    com_id = "#com_m_" + i;
	}
	else {
	    com_id = "#com" + i;
	}
	$(com_id).attr("src", "img/empty.png");
	$(com_id).attr("class", "");
    }
}

function setCommands(core_id) {
    var army_id = "#c" + core_id;
    var upper_commands = new Array();    
    var lower_commands = new Array();    

    //clear commands
    if (isMobile) {
	clearCommands(1);
    }
    clearCommands(0);

    //check what's in the hex
    if ($(army_id).hasClass('army')) {
        upper_commands.push(createCommand("move", "move"));
        upper_commands.push(createCommand("attack", "attack"));

	//only concreate if neutral
	if (isNeutral(core_id)) {
	    if (isCrater(core_id)) {
                lower_commands.push(createCommand("refinery", "refinery"));
	    }
	    else if (isBoarder(core_id)) {
		upper_commands.push(createCommand("claim", "claim"));
		lower_commands.push(createCommand("bunker", "bunker"));
	    }
	    else {
                lower_commands.push(createCommand("bunker", "bunker"));
	    }
	}
	
	if (isFriend(core_id)) {
            if (hasBuilding(core_id, "concrete")) {
                lower_commands.push(createCommand("barrack", "barrack"));
                lower_commands.push(createCommand("factory", "factory"));
                lower_commands.push(createCommand("cityhall", "cityhall"));
	    }
        }
        
        army_selected = getCoordsFromClass(core_id);
    }
    
    tile_selected = getCoordsFromClass(core_id);
    
    if (isFriend(core_id)) {
        if (hasBuilding(core_id, "barrack")) {
            lower_commands.push(createCommand("soldier", "soldier"));
        }
        if (hasBuilding(core_id, "cityhall")) {
            lower_commands.push(createCommand("engineer", "engineer"));
        }
	else if (hasBuilding(core_id, "factory")) {
	    lower_commands.push(createCommand("factory_addon", "factory_addon1"));
	}
	else if (hasBuilding(core_id, "factory_a1")) {
	    lower_commands.push(createCommand("factory_addon", "factory_addon2"));
	}
    }
    
    if (cancel_move_mode) {
        upper_commands.push(createCommand("cancel"));
    }
    
    if (isMobile) {
	addCommands(upper_commands, lower_commands, 1);
    }
    addCommands(upper_commands, lower_commands, 0);
}

function resetModes() {
    move_mode = 0;
    attack_mode = 0;
}

function updateMessage(message) {
    var para = document.createElement("li");
    var node = document.createTextNode(message);
    para.appendChild(node);
    var ticker = document.getElementById("tickerlist");
    ticker.insertBefore(para, ticker.firstChild);
}

function updateArmy(soldiers, engineers){
    document.getElementById('a_soldiers').value = soldiers;
    document.getElementById('a_engineers').value = engineers;

    if (isMobile) {
	document.getElementById('a_soldiers_m').value = soldiers;
	document.getElementById('a_engineers_m').value = engineers;
    }
}

function updateGarrison(soldiers, engineers){
    garrison.soldiers = soldiers;
    garrison.engineers = engineers;
    
    document.getElementById('g_soldiers').value = garrison.soldiers;
    document.getElementById('g_engineers').value = garrison.engineers;

    if (isMobile) {
	document.getElementById('g_soldiers_m').value = garrison.soldiers;
	document.getElementById('g_engineers_m').value = garrison.engineers;
    }
}

function addToGarrison(type) {
    if (type == "soldier") {
	garrison.soldiers++;
	document.getElementById('g_soldiers').value = garrison.soldiers;
	if (isMobile) {
	    document.getElementById('g_soldiers_m').value = garrison.soldiers;
	}
    }
    else if (type == "engineer") {
	garrison.engineers++;
	document.getElementById('g_engineers').value = garrison.engineers;
	if (isMobile) {
	    document.getElementById('g_engineers_m').value = garrison.engineers;
	}
    }
}

function checkBoarderTile(tile) {
    var ok = 0;
    
    if (tile.friend.length) {
	if ((tile.building !== "bunker") || (tile.building !== "refinery")) {
	    ok = 1;
	}
    }
    
    return ok;
}

function isBoarder(core_id) {
    var ok = 0;
    var xy = getCoordsFromClass(core_id);
    var current = getRecord(xy[0], xy[1]);
    var x_hex = current.x_hex;
    var y_hex = current.y_hex;
    
    // Check all neighbour tiles

    //north    
    var tile = getRecordHex(parseInt(x_hex), parseInt(y_hex) + 1);
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    //north east
    tile = getRecordHex(parseInt(x_hex) + 1, parseInt(y_hex) + 1);
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    //south east
    tile = getRecordHex(parseInt(x_hex) + 1, parseInt(y_hex));
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    //south
    tile = getRecordHex(parseInt(x_hex), parseInt(y_hex) + 1);
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    //south west
    tile = getRecordHex(parseInt(x_hex) - 1, parseInt(y_hex) - 1);
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    //north west
    tile = getRecordHex(parseInt(x_hex) - 1, parseInt(y_hex));
    ok = checkBoarderTile(tile);
    if (ok) return ok;
    
    return ok;
}

// ---------------------------------------------------------------------------
// JQuery functions

/*
var angle = 0;
setInterval(function() {
	angle+=3;
	$("#radarrotate").rotate(angle);
    },30
);
*/

var setEventHandlers = function() {
    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);
    socket.on("stats", onStatsUpdate);
    socket.on("money", onMoneyUpdate);
    socket.on("civs", onCivsUpdate);    
    socket.on("hello", onHello);
    socket.on("claim", onClaim);
    socket.on("build", onBuild);
    socket.on("construct", onConstruct);
    socket.on("addon", onAddOn);
    socket.on("unit construct", onUnitConstruct);
    socket.on("unit build", onUnitBuild);
    socket.on("change army", onChangeArmySize);
    socket.on("error_msg", onError);
};

function onSocketConnected() {
    //alert("Connected to socket server");
    socket.emit("hello", {name: character});
};

function onSocketDisconnect() {
    document.getElementById('server_status').innerHTML = "Server:Off";
};

function onNewPlayer(data) {
    //alert("New player connected: "+data.id);
    //alert("New player connected");
};

function onMovePlayer(data) {
    var old = getRecordName(data.name);

    //update cache
    mapDB( {x:{is:old.x}}, {y:{is:old.y}} ).update( {name: ""} );
    mapDB( {x:{is:old.x}}, {y:{is:old.y}} ).update( {army: ""} );
    mapDB( {x:{is:old.x}}, {y:{is:old.y}} ).update( {soldiers: null} );
    mapDB( {x:{is:old.x}}, {y:{is:old.y}} ).update( {engineers: null} );
    
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {name:data.name} );
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {army:old.army} );   
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {soldiers:old.soldiers} );   
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {engineers:old.engineers} );   

    //update tiles
    var remove_path = 1;
    updateTile(old.x, old.y, old.army, 0, remove_path);
    updateTile(data.x.toString(), data.y.toString(), old.army, 1, remove_path);

    var foo = 1;
    if (character == data.name) {
        foo = 0;
    }

    var class_coord = ".xy_" + data.x + "_" + data.y;

    //remove army strength text from old coordinates
    var old_coord = ".xy_" + old.x + "_" + old.y;
    var core_id = getCoreId($(old_coord).attr('id'));
    var c_id = "c" + core_id;
    document.getElementById(c_id).innerHTML = "";
    core_id = getCoreId($(class_coord).attr('id'));
    if (old.soldiers) {
        setArmyPower(core_id, parseInt(old.soldiers) + parseInt(old.engineers), foo); 
    }

    if (data.end == 0) {
	//Not end of walk, set timer.
        setActionTimer(class_coord, move_time, foo);
    }
    else {
	cancel_move_mode = 0;
    }
};

function onRemovePlayer(data) {
};

function onClaim(data) {
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {friend:"friend"} );
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {building:"concrete"} );
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {toxic:0} );

    updateTileBuilding(data.x, data.y, "friend concrete", 1);
    var message = data.name + " claims land";
    updateMessage(message);
}

function onBuild(data) {
    var old_record = getRecord(data.x, data.y);

    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {friend:"friend"} );
    mapDB( {x:{is:data.x.toString()}}, {y:{is:data.y.toString()}} ).update( {building:data.type} );

    updateTileMark(data.x, data.y, "building", 0);

    updateTileBuilding(data.x, data.y, old_record.building, 0);
    updateTileBuilding(data.x, data.y, "friend " + data.type, 1);
    var message = data.name + " builds " + data.type;
    updateMessage(message);
}

function onConstruct(data) {
    updateTileMark(data.x, data.y, "building", 1);
    var class_coord = ".xy_" + data.x + "_" + data.y;
    setActionTimer(class_coord, data.time, 0);
}

function onAddOn(data) {
    updateTileMark(data.x, data.y, "building", 1);
    var class_coord = ".xy_" + data.x + "_" + data.y;
    setActionTimer(class_coord, data.time, 0);
}

function onUnitConstruct(data) {
    var class_coord = ".xy_" + data.x + "_" + data.y;
    setActionTimer(class_coord, data.time, 0);
}

function onChangeArmySize(data) {
    var message = data.name + "s army:" + data.soldiers + "S|" + data.engineers + "E";
    updateMessage(message);

    //update cache
    var record = getRecordName(data.name);
    mapDB( {x:{is:record.x}}, {y:{is:record.y}} ).update( {soldiers: data.soldiers} );
    mapDB( {x:{is:record.x}}, {y:{is:record.y}} ).update( {engineers: data.engineers} );

    var class_coord = ".xy_" + record.x + "_" + record.y;
    var core_id = getCoreId($(class_coord).attr('id'));
    setArmyPower(core_id, parseInt(data.soldiers) + parseInt(data.engineers), isFoo(record.army)); 
}

function onUnitBuild(data) {
    var message = data.type + " has arrived";
    updateMessage(message);
    addToGarrison(data.type);
}

function onStatsUpdate(data) {
    document.getElementById('civs').innerHTML = "|Civs:" + data.civs;
    document.getElementById('energy').innerHTML = "|Energy:" + data.energy;
    document.getElementById('gold').innerHTML = "|Gold:" + data.gold;
    document.getElementById('income').innerHTML = "|Income:" + data.income;
    document.getElementById('cost').innerHTML = "|Cost:" + data.cost;

    updateGarrison(data.soldiers, data.engineers);
}

function onMoneyUpdate(data) {
    document.getElementById('energy').innerHTML = "|Energy:" + data.energy;
    document.getElementById('gold').innerHTML = "|Gold:" + data.gold;
}

function onCivsUpdate(data) {
    document.getElementById('civs').innerHTML = "|Civs:" + data.civs;
}

function onHello(data) {
    document.getElementById('server_status').innerHTML = "Server:On";
}

function onError(data) {
    alert(data.message);
}

function setSelectedData(core_id) {
    var xy = getCoordsFromClass(core_id);
    var record = getRecord(xy[0], xy[1]);
    var desc = "";

    var str = "x|y:".concat(record.x).concat("|").concat(record.y);
    desc = desc.concat(str);
    var str = " toxic:".concat(record.toxic);
    desc = desc.concat(str).concat("<br>");
    if (record.friend.length) {
	var str = " owner: ".concat(record.friend);
    }
    else {
	var str = " owner: no owner";
    }
    desc = desc.concat(str).concat("<br>");
    
    if (record.building.length) {
	var str = "building: ".concat(record.building);
	desc = desc.concat(str).concat("<br>");
    }
    if (record.army.length) {
	var str = "army: ".concat(record.army);
	desc = desc.concat(str).concat("<br>");
    }
    document.getElementById('s_desc_id').innerHTML = desc;
    if (isMobile) {
	document.getElementById('s_desc_id_mobile').innerHTML = desc;
    }
}

function showHideArmy(core_id) {
    var xy = getCoordsFromClass(core_id);
    var record = getRecord(xy[0], xy[1]);
    if (record.friend.length) {
	if (record.army.length && !isFoo(record.army)) {
	    if (record.building.length) {
		if ((record.building == "bunker") || (record.building == "refinery")) {
		    if (isMobile) {
			$("#armybox_mobile").hide();
		    }
		    $("#armybox").hide();
		}
		else {
		    if (isMobile) {
			$("#armybox_mobile").show();
		    }
		    $("#armybox").show();
		}
	    }
	}
    }
    else {
	if (isMobile) {
	    $("#armybox_mobile").hide();
	}
	$("#armybox").hide();
    }
}

$(document).ready(function() {
    $("#armybox").hide();
    if (isMobile) {
	$("#army_mobile").hide();
	$("#selected_mobile").hide();      
	$("#command_mobile").hide();      
    }  
});

$(function() {
/*
    $(".front").mouseover(function() {
        var core_id = getCoreId(this.id);
	var id_xy = core_id.split("_");
	var id_x = id_xy[0];
	var id_y = id_xy[1];
	showDevView(id_x, id_y, core_id);
    });

    $(".edit").mouseover(function() {
        var core_id = getCoreId(this.id);
	var id_xy = core_id.split("_");
	var id_x = id_xy[0];
	var id_y = id_xy[1];
	showDevView(id_x, id_y, core_id);
    });

    // click on tile to edit
    $(".edit").live("click", function() {
        var core_id = getCoreId(this.id);
 
	if (edit_terrain == 0) {
	    alert("no terrain type selected");
	}
	else {
	    var numner = 0;
	    
	    if (edit_terrain == "crater") {
		number = 1 + Math.floor(Math.random() * 3)
		    }
	    else {
		number = 1 + Math.floor(Math.random() * 5);
	    }

	    var rand_terrain = edit_terrain + number;
	    var xy = getCoordsFromClass(core_id);
	    var coord = xy[0] + "_" + xy[1];
	    
	    setTerrain(coord, rand_terrain);
	    updateTileTerrain(core_id, rand_terrain);
	}
    });

    $('input:radio[name=terrain]').click(function() {
        edit_terrain = $('input:radio[name=terrain]:checked').val();
    });

    $('input:radio[name=radius]').click(function() {
        edit_terrain_radius = $('input:radio[name=radius]:checked').val();
    });

    // Move map arrows
    $("#toparrow").click(function() {
        //alert(y_position);
	if (y_position + y_step > y_global - y_edge) {
	    alert("out of map");
	}
	else if (y_position + y_step + y_board_max > y_pos_boarder) {
	    alert("out of boarder");
	    // load more map data from database
	    loadMapBatch();
	}
	else {
	    moveMap(y_step, x_step);
	}

	  //if ((y_position + 2 + y_board_max) > y_global) {
	  //alert("outside map");
	  //}
	  //else if ((y_position + 2 + y_board_max) > y_pos_boarder) {
	  //alert("outside board");
	  //}
	  //else {
	  //moveMap(2, 1);
	  //}
    });

    $("#bottomarrow").click(function() {
        //alert(y_position);
        if (y_position - y_step < -y_global + y_edge) {
	    alert("out of map");
	}
	else if (y_position - y_step - y_board_max < y_neg_boarder) {
	    alert("out of boarder");
	    // load more map data from database
	    loadMapBatch();
	}
	else {
	    moveMap(-y_step, x_step);
	}
	//
	//  if ((y_position - 2 + y_board_min) < y_global) {
	//  alert("outside map");
	//  }
	//  else if ((y_position - 2 + y_board_min) < y_neg_boarder) {
	//  alert("outside board");
	//  }
	//  else {
        //  moveMap(-2, 1);
	//  }
    });

    $("#leftarrow").click(function() {
        if ((x_position -1 + x_board_min) < x_global) {
	    alert("outside map");
	}
	else if ((x_position -1 + x_board_min) < x_neg_boarder) {
	    alert ("outside board");
	}
	else {
	    moveMap(-1, 0);
	}
    });
    $("#rightarrow").click(function() {
        if ((x_position + 1 + x_board_max) > x_global) {
	    alert("outside map");
	}
	else if ((x_position + 1 + x_board_max) > x_pos_boarder) {
	    alert ("outside board");
	}
	else {
	    moveMap(1, 0);   
	}   
   });

   // click on tile
   $(".front").live("click", function() {
       var core_id = getCoreId(this.id);
       hex_selected = getCoordsFromClass(core_id);

       //clear marks
       clearMarks();
       
       //reset and adding image and class for commands when clicked
       setCommands(core_id);

       setMark(core_id, null);
       
       if (move_mode || attack_mode) {
	   if (!handleWalk(core_id)) {
	       // mark tile
	       handleArmyMovement(core_id);
	   }
       }
       
       setSelectedData(core_id);
       showHideArmy(core_id);
    });

    // click on move command
    $(".com_move").live("click", function() {
        var com_id = "#" + this.id;
	var tmp_mode = move_mode;
	
	resetModes();

	if (!tmp_mode) {
	    $(com_id).attr("src", "img/moveh_com.png");
	}
	else {
	    $(com_id).attr("src", "img/move_com.png");
	}
	move_mode = !tmp_mode;
    });

    // click on attack command
    $(".com_attack").live("click", function() {
        var com_id = "#" + this.id;
	var tmp_mode = attack_mode;

	resetModes();
	
	if (!tmp_mode) {
	    $(com_id).attr("src", "img/attackh_com.png");
	}
	else {
	    $(com_id).attr("src", "img/attack_com.png");
	}
	attack_mode = !tmp_mode;
    });

    // click on claim command
    $(".com_claim").live("click", function() {
        sendClaim(army_selected);
	    
	var class_coord = ".xy_" + army_selected[0] + "_" + army_selected[1];
	setActionTimer(class_coord, claim_time, 0);
    });

    // click on refinery command
    $(".com_refinery").live("click", function() {
        sendBuild(army_selected, "refinery");
    });

    // click on bunker command
    $(".com_bunker").live("click", function() {
        sendBuild(army_selected, "bunker");
    });

    // click on barrack command
    $(".com_barrack").live("click", function() {
        sendBuild(army_selected, "barrack");
    });

    // click on factory command
    $(".com_factory").live("click", function() {
        sendBuild(army_selected, "factory");
    });

    // click on factory addon command
    $(".com_factory_addon1").live("click", function() {
        sendBuild(tile_selected, "factory_a1");
    });

    $(".com_factory_addon2").live("click", function() {
        sendBuild(tile_selected, "factory_a2");
    });

    // click on cityhall command
    $(".com_cityhall").live("click", function() {
        sendBuild(army_selected, "cityhall");
    });

    // click in soldier command
    $(".com_soldier").live("click", function() {
        sendBuildUnit(tile_selected, "soldier");
    });

    // click in engineer command
    $(".com_engineer").live("click", function() {
        sendBuildUnit(tile_selected, "engineer");
    });

    // click on cancel command
    $(".com_cancel").live("click", function() {
        sendCancelMove();
        $(".marked_path").removeClass("marked_path");
	cancel_move_mode = 0;
	$("#com1").attr("class", "");
	$("#com1").attr("src", "img/empty.png");
    });

    //$('.jclock').jclock();

    if (!isMobile) {
	$(".arrows").live("click", function() {
	    var $button = $(this);

	    var a_soldiers_old = $("#a_soldiers").attr("value");
	    var g_soldiers_old = $("#g_soldiers").attr("value");
	    var a_engineers_old = $("#a_engineers").attr("value");
	    var g_engineers_old = $("#g_engineers").attr("value");
	    
	    var a_soldiers = a_soldiers_old;
	    var g_soldiers = g_soldiers_old;
	    var a_engineers = a_engineers_old;
	    var g_engineers = g_engineers_old;
	    
	    if ($button.text() == "s+") {
		// Don't allow decrementing below zero
		if (g_soldiers > 0) {
		    a_soldiers = parseFloat(a_soldiers_old) + 1;
		    g_soldiers = parseFloat(g_soldiers_old) - 1;
		}
	    } else if ($button.text() == "s-") {
		// Don't allow decrementing below zero
		if (a_soldiers > 0) {
		    a_soldiers = parseFloat(a_soldiers_old) - 1;
		    g_soldiers = parseFloat(g_soldiers_old) + 1;
		}
	    } else if ($button.text() == "e+") {
		// Don't allow decrementing below zero
		if (g_engineers > 0) {
		    a_engineers = parseFloat(a_engineers_old) + 1;
		    g_engineers = parseFloat(g_engineers_old) - 1;
		}
	    } else if ($button.text() == "e-") {
		// Don't allow decrementing below zero
		if (a_engineers > 0) {
		    a_engineers = parseFloat(a_engineers_old) - 1;
		    g_engineers = parseFloat(g_engineers_old) + 1;
		}
	    }
            
	    $("#a_soldiers").attr("value", a_soldiers);
	    $("#g_soldiers").attr("value", g_soldiers);
	    $("#a_engineers").attr("value", a_engineers);
	    $("#g_engineers").attr("value", g_engineers);
	    });
	
	$('#army_change').submit(function () {
		var a_soldiers = $("#a_soldiers").attr("value");
		var g_soldiers = $("#g_soldiers").attr("value");
		var a_engineers = $("#a_engineers").attr("value");
		var g_engineers = $("#g_engineers").attr("value");
		
		sendAGChange(a_soldiers, a_engineers, g_soldiers, g_engineers);
		updateGarrison(g_soldiers, g_engineers);
		
		return false;
	});
    }
    // ZZZ refactor please ...
    $(".arrows_mobile").live("click", function() {
        var $button = $(this);

	var a_soldiers_old = $("#a_soldiers_m").attr("value");
	var g_soldiers_old = $("#g_soldiers_m").attr("value");
	var a_engineers_old = $("#a_engineers_m").attr("value");
	var g_engineers_old = $("#g_engineers_m").attr("value");

	var a_soldiers = a_soldiers_old;
	var g_soldiers = g_soldiers_old;
	var a_engineers = a_engineers_old;
	var g_engineers = g_engineers_old;

	if ($button.text() == "s+") {
	    // Don't allow decrementing below zero
	    if (g_soldiers > 0) {
		a_soldiers = parseFloat(a_soldiers_old) + 1;
		g_soldiers = parseFloat(g_soldiers_old) - 1;
	    }
	} else if ($button.text() == "s-") {
	    // Don't allow decrementing below zero
	    if (a_soldiers > 0) {
		a_soldiers = parseFloat(a_soldiers_old) - 1;
		g_soldiers = parseFloat(g_soldiers_old) + 1;
	    }
	} else if ($button.text() == "e+") {
	    // Don't allow decrementing below zero
	    if (g_engineers > 0) {
		a_engineers = parseFloat(a_engineers_old) + 1;
		g_engineers = parseFloat(g_engineers_old) - 1;
	    }
	} else if ($button.text() == "e-") {
	    // Don't allow decrementing below zero
	    if (a_engineers > 0) {
		a_engineers = parseFloat(a_engineers_old) - 1;
		g_engineers = parseFloat(g_engineers_old) + 1;
	    }
	}

	$("#a_soldiers_m").attr("value", a_soldiers);
	$("#g_soldiers_m").attr("value", g_soldiers);
	$("#a_engineers_m").attr("value", a_engineers);
	$("#g_engineers_m").attr("value", g_engineers);
    });
   
    $('#army_change_mobile').submit(function () {
        var a_soldiers = $("#a_soldiers_m").attr("value");
	var g_soldiers = $("#g_soldiers_m").attr("value");
	var a_engineers = $("#a_engineers_m").attr("value");
	var g_engineers = $("#g_engineers_m").attr("value");
	
	sendAGChange(a_soldiers, a_engineers, g_soldiers, g_engineers);
	updateGarrison(g_soldiers, g_engineers);
      
	return false;
    });

    if (isMobile) {
	$("#bottomleft").live("click", function() {       
	    $("#army_mobile").toggle();
	    $("#bottomleft").removeClass("transpwind");
	    $("#bottomleft").addClass("active");

	    $("#selected_mobile").hide();
	    $("#bottomcenter").removeClass("active");
	    $("#bottomcenter").addClass("transpwind");
	    $("#command_mobile").hide();
	    $("#bottomright").removeClass("active");
	    $("#bottomright").addClass("transpwind");
	    });
        $("#bottomcenter").live("click", function() {
	    $("#selected_mobile").toggle();
	    $("#bottomcenter").removeClass("transpwind");
	    $("#bottomcenter").addClass("active");

	    $("#army_mobile").hide();
	    $("#bottomleft").removeClass("active");
	    $("#bottomleft").addClass("transpwind");
	    $("#command_mobile").hide();
	    $("#bottomright").removeClass("active");
	    $("#bottomright").addClass("transpwind");
	});
	$("#bottomright").live("click", function() {
           $("#command_mobile").toggle();
	   $("#bottomright").removeClass("transpwind");
	   $("#bottomright").addClass("active");

	   $("#army_mobile").hide();
	   $("#bottomleft").removeClass("active");
	   $("#bottomleft").addClass("transpwind");
	   $("#selected_mobile").hide();
	   $("#bottomcenter").removeClass("active");
	   $("#bottomcenter").addClass("transpwind");
	});
    }
*/
    $( "#map_container" ).draggable();

    var address = getServerAddress();
    socket = io.connect(address);
    setEventHandlers();
});
