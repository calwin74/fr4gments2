// wrapper for our game "classes", "methods" and "objects"
window.Game = {};

var hexagon = {
    s: 100,  // upper horizontal line
    h: 50,   // horisontal distance to corner
    r: 60    // half height of hexagon
};

/*
var hexagon = {
    s: 50,  // upper horizontal line
    h: 25,   // horisontal distance to corner
    r: 30    // half height of hexagon
};
*/

var size = hexagon.s + 2 * hexagon.h;
var y_offset = size - 2 * hexagon.r;

var HEX_HORIZONTAL = hexagon.s + hexagon.h;
var HEX_VERTICAL = 2 * hexagon.r;

var CANVAS_OFFSET = -70;

var MAP_WORLD_ROWS = 100;
var MAP_WORLD_COLS = 100;

var MAP_ROOM_ROWS = 0;
var MAP_ROOM_COLS = 0;

var EDITOR_USER = "editor";
var editorMode = 0;

//zzz fix location and functionality

var imgFileMap = {};
//Land types from here.
imgFileMap['dirt'] = "../img/dirt.png";
imgFileMap['forest'] = "../img/forest.png";
imgFileMap['water'] = "../img/water.gif";
imgFileMap['semi-forest'] = "../img/semi-forest.png";
//Buildings from here.
imgFileMap['factory'] = "../img/factory.png";
imgFileMap['barrack'] = "../img/barrack.png";
imgFileMap['refinery'] = "../img/refinery.png";
imgFileMap['cityhall'] = "../img/cityhall.png";
imgFileMap['engineer'] = "../img/engineer2.png";
imgFileMap['concrete'] = "../img/forest.png";
imgFileMap['concrete_com'] = "../img/concreteh_com.png";
imgFileMap['buildbuildings'] = "../img/buildbuildings.png";
imgFileMap['factory_com'] = "../img/factoryh_com.png";
imgFileMap['barrack_com'] = "../img/barrackh_com.png";
imgFileMap['bunker_com'] = "../img/bunkerh_com.png";
imgFileMap['refinery_com'] = "../img/refineryh_com.png";
imgFileMap['move_com'] = "../img/moveh_com.png";
imgFileMap['soldier_com'] = "../img/soldier_com.png";
imgFileMap['artillery_com'] = "../img/artillery_com.png";
imgFileMap['soldier'] = "../img/army.png";

var imgMap = {};
var totalImgs = Object.keys(imgFileMap).length;//var totalImgs = img.length;
var curImgs = 0;

var editorData = {
    size: 1,    //Brush size
    terrain: 1, //Terrain type
    type: 1     //Fixed value or random
};

var loginData = {
    name: "" //username
};

//zzz Need global scope here?
var my_canvas = document.getElementById('gameCanvas');
var my_container = document.getElementById('canvasContainer');
var x_start, y_start, x_stop, y_stop;

var topCanvas;
var topContext;

var bottomCanvas;
var bottomContext;

// wrapper for "class" Rectangle
(function(){
    function Rectangle(left, top, width, height)
    {
	this.left = left || 0;
	this.top = top || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
    }
		
    Rectangle.prototype.set = function(left, top, /*optional*/width, /*optional*/height)
    {
	this.left = left;
	this.top = top;
	this.width = width || this.width;
	this.height = height || this.height
	this.right = (this.left + this.width);
	this.bottom = (this.top + this.height);
    }
    
    Rectangle.prototype.within = function(r)
    {
	return (r.left <= this.left && 
		r.right >= this.right &&
		r.top <= this.top && 
		r.bottom >= this.bottom);
    }		
    
    Rectangle.prototype.overlaps = function(r)
    {
	return (this.left < r.right && 
		r.left < this.right && 
		this.top < r.bottom &&
		r.top < this.bottom);
    }
    
    // add "class" Rectangle to our Game object
    Game.Rectangle = Rectangle;
})();	

// wrapper for "class" Camera (avoid global objects)
(function(){
    // Camera constructor
    function Camera(xView, yView, cameraWidth, cameraHeight, xRoom, yRoom, roomWidth, roomHeight)
    {
	// position of camera (left-top coordinate)
	this.xView = xView || 0;
	this.yView = yView || 0;
	
	this.x_start = this.xView;
	this.y_start = this.yView;
        
	//console.log("Creating camera at (" + this.xView + "|" + this.yView + ") size:", cameraWidth, cameraHeight);
        
	// distance from followed object to border before camera starts move
	this.xDeadZone = 0; // min distance to horizontal borders
	this.yDeadZone = 0; // min distance to vertical borders
        
	// viewport dimensions
	this.wView = cameraWidth;
	this.hView = cameraHeight;			
        
	// rectangle that represents the viewport
	this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);				
        
	// rectangle that represents the room's boundary
	this.roomRect = new Game.Rectangle(xRoom, yRoom, roomWidth, roomHeight);
    }

    Camera.prototype.update = function(px_diff_x, px_diff_y)
    {
        this.xView = this.xView + px_diff_x;
	this.yView = this.yView + px_diff_y;
        this.viewportRect.set(this.xView, this.yView);

        var load = {};
	load.left = 0;
	load.top = 0;
	load.right = 0;
	load.bottom = 0;

        if (!this.viewportRect.within(this.roomRect))
	{
            //console.log("--- Not within ---");

            if(this.viewportRect.left < this.roomRect.left)
	    {
		//console.log("left " + this.viewportRect.left + "<" + this.roomRect.left);
                //console.log("load from right");
                load.left = 1;
	    }
            if(this.viewportRect.right > this.roomRect.right)
	    {
		//console.log("right " + this.viewportRect.right + ">" + this.roomRect.right);
                //console.log("load from left");
                load.right = 1;
	    }
            if(this.viewportRect.top < this.roomRect.top)
	    {
		//console.log("top " + this.viewportRect.top + "<" +  this.roomRect.top);
                //console.log("load from bottom");
                load.top = 1;
	    }
            if(this.viewportRect.bottom > this.roomRect.bottom)
	    {
		//console.log("bottom " + this.viewportRect.bottom + ">" + this.roomRect.bottom);
                //console.log("load from top");
                load.bottom = 1;
	    }        
        }
        return load;
    }
    
    // add "class" Camera to our Game object
    Game.Camera = Camera;
})();

// wrapper for "class" Map
(function()
{
    function Map(width, height){
	// map dimensions
	this.width = width;
	this.height = height;
        
	// map texture
	//this.image = null;
    }

    function drawHex(c, x0, y0, fColor, text, terrain, building, unit, marked)
    {
	var image;

	if (building)
	{
	    //console.log("found building");
	    cachePrintBuilding(building);
	    if (building.constructing === 1)
	    {
		image = imgMap['concrete'];
	    }
	    else
	    {
		image = imgMap[building.type];
	    }
	}
	else
	{
	    var str = terrainFromType(terrain);
	    image = imgMap[str];
	}

	/*
	if (tile.construct === 1)
	{
	    image = imgMap['concrete'];
	}
	else if (tile.building)
	{
	    image = imgMap[tile.building];
	}
	else
	{
	    var str = terrainFromType(tile.type);
	    image = imgMap[str];
	}
	*/
	//var str = terrainFromType(terrain);
	//zzz cache with a numeric key?
	//image = imgMap[str];

	c.drawImage(image, x0, y0 - y_offset, size, size);
	if (unit)
	{
	    unitImage = imgMap[unit.type];
	    c.drawImage(unitImage, x0 + 50, y0 - y_offset + 50, 100, 100);
	}

	/*
	if (tile.unit)
	{
	    unitImage = imgMap[tile.unit];
	    //zzz Fix this later.
	    c.drawImage(unitImage, x0 + 50, y0 - y_offset + 50, 100, 100);
	}
	*/
	if (text)
	{
	    c.font = "20px sans-serif";
	    c.fillStyle = fColor;
	    c.fillText(text, x0 + hexagon.h/2, y0 + hexagon.r);
	}

	if (marked)
	{
	    //Start in upper left corner.
	    c.strokeStyle = 'yellow';
	    c.beginPath();
	    c.moveTo(x0 + hexagon.h, y0);
	    c.lineTo(x0 + hexagon.s + hexagon.h, y0 + 1);
	    c.lineTo(x0 + hexagon.s + 2 * hexagon.h, y0 + hexagon.r);
	    c.lineTo(x0 + hexagon.s + hexagon.h, y0 + 2 * hexagon.r);
	    c.lineTo(x0 + hexagon.h, y0 + 2 * hexagon.r);
	    c.lineTo(x0, y0 + hexagon.r);
	    c.stroke();
	    c.closePath();
	}
    }
    /*
    function drawHex(c, x0, y0, fColor, text, tile, marked)
    {
	var image;

	if (tile.construct === 1)
	{
	    image = imgMap['concrete'];
	}
	else if (tile.building)
	{
	    image = imgMap[tile.building];
	}
	else
	{
	    var str = terrainFromType(tile.type);
	    image = imgMap[str];
	}

	c.drawImage(image, x0, y0 - y_offset, size, size);

	if (tile.unit)
	{
	    unitImage = imgMap[tile.unit];
	    //zzz Fix this later.
	    c.drawImage(unitImage, x0 + 50, y0 - y_offset + 50, 100, 100);
	}

	if (text)
	{
	    c.font = "20px sans-serif";
	    c.fillStyle = fColor;
	    c.fillText(text, x0 + hexagon.h/2, y0 + hexagon.r);
	}

	if (marked)
	{
	    //Start in upper left corner.
	    c.strokeStyle = 'yellow';
	    c.beginPath();
	    c.moveTo(x0 + hexagon.h, y0);
	    c.lineTo(x0 + hexagon.s + hexagon.h, y0 + 1);
	    c.lineTo(x0 + hexagon.s + 2 * hexagon.h, y0 + hexagon.r);
	    c.lineTo(x0 + hexagon.s + hexagon.h, y0 + 2 * hexagon.r);
	    c.lineTo(x0 + hexagon.h, y0 + 2 * hexagon.r);
	    c.lineTo(x0, y0 + hexagon.r);
	    c.stroke();
	    c.closePath();
	}
    }
    */
    function isMarked(x, y, world_stats)
    {
	if (x == world_stats.x_marked && y == world_stats.y_marked)
	{
	    return 1;
	}
	else
	{
	    return 0;
	}
    }
    /*
    function isMarked(tile, world_stats)
    {
	if (tile.x == world_stats.x_marked && tile.y == world_stats.y_marked)
	{
	    return 1;
	}
	else
	{
	    return 0;
	}
    }
    */

    function drawHexGrid(ctx, world_stats)
    {
	var posx;
	var posy;
	var coord;
	var rows = MAP_ROOM_ROWS;
	var columns = MAP_ROOM_COLS;
	var columnIsOdd = world_stats.x_coord % 2;
	var mod = 0;
	if (columnIsOdd) {
	    mod = 1;
	}
	//console.log("Canvas size w/h:", ctx.canvas.width, ctx.canvas.height);
	//console.log("Using " + rows + " rows and " + columns + " columns" + " in image");

	//Must lay down tiles in rows to get overlapping images right on canvas

	for (var row = 0; row < rows; row++) 
	{
	    for (var col = 0; col < columns; col = col + 2) 
	    {
		var x = col + world_stats.x_coord;
		var y = row + world_stats.y_coord;
		var terrain = cacheGetItem(x, y);
		var building = cacheGetBuilding(x,y);
		var unit = cacheGetUnit(x,y);
		posy = row * 2 * hexagon.r;
		posx = col * (hexagon.s + hexagon.h);
		coord = "(" + x + "," + y + ")";
		drawHex(ctx, posx , posy, "red", coord, terrain, building, unit, isMarked(x, y, world_stats));
	    }

	    for (var col = 1; col < columns; col = col + 2) 
	    {
		var x = col + world_stats.x_coord;
		var y = row + world_stats.y_coord + mod;
		var terrain = cacheGetItem(x, y);
		var building = cacheGetBuilding(x,y);
		var unit = cacheGetUnit(x,y);
		posy = hexagon.r + row * 2 * hexagon.r;
		posx = col * (hexagon.s + hexagon.h);
		coord = "(" + x + "," + y + ")";
		drawHex(ctx, posx , posy, "red", coord, terrain, building, unit, isMarked(x, y, world_stats));
	    }
	}
    }
    
    Map.prototype.generate = function()
    {
	Game.context.canvas.width = this.width;
	Game.context.canvas.height = this.height;
        
	drawHexGrid(Game.context, Game.world_stats);

	//costly
	//this.image = new Image();
	//this.image.src = context.canvas.toDataURL("image/png");
    }
    
    // add "class" Map to our Game object
    Game.Map = Map;    
})();

function doMouseDownBottomCanvas(e)
{
    var rect =  bottomCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    clickedMenuItem(x, y);
}

function mainImpl()
{
    console.log("setup game");

    //simulate database for now

    //Get windows size
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    //alert(x + ' + ' + y);
    
    var canvas = document.getElementById('gameCanvas');
    //Size the canvas based on the window size.
    canvas.width = x;
    canvas.height = y;

    Game.context = canvas.getContext('2d');
    var my_container = document.getElementById('canvasContainer');

    //Test top canvas
    topCanvas = document.getElementById('topCanvas');
    //Size top canvas.
    topCanvas.width = x;
    topCanvas.height = 60; // height of DIV container.
    topContext = topCanvas.getContext('2d');
    addTopMenu(topContext);

    //Test bottom canvas
    bottomCanvas = document.getElementById('bottomCanvas');
    //Size bottom canvas.
    bottomCanvas.width = x;    
    bottomCanvas.height = 220; // height of DIV container.
    bottomContext = bottomCanvas.getContext('2d');
    addCityhallMenu(bottomContext);
    
    //var world_stats = {
    Game.world_stats = {
	x_coord: 50,
	y_coord: 50,
	x_marked: -1,
	y_marked: -1
    };

    // setup the room
    Game.room = {
	width: 0,
	height: 0,
	map: new Game.Map(0, 0)
    };    
    getDimensions();

    // setup the magic camera !!!
    // room starts at (0,0) px
    var camera_start_x = 0;
    var camera_start_y = 0;
    var camera = new Game.Camera(camera_start_x, camera_start_y, 
				 my_container.offsetWidth, my_container.offsetHeight,
				 0, 0, Game.room.width, Game.room.height);

    //Entry point for credentials and socket communication.
    if (!checkCookie())
    {
	$("#login").show();
    }
    
    // Game map update function
    var updateMap = function(px_diff_x, px_diff_y, hex_diff_x, hex_diff_y, world_stats)
    {
        var outside = 0;
	var load = camera.update(px_diff_x, px_diff_y);
       
	//drag left
        if (load.left)
        {
	    world_stats.x_coord = world_stats.x_coord - hex_diff_x
            if (world_stats.x_coord + MAP_ROOM_COLS > MAP_WORLD_COLS)
            {
                console.log("Bounce against right world wall");
                world_stats.x_coord = MAP_WORLD_COLS - MAP_ROOM_COLS;
            }
        }
	//drag right
        if (load.right)
        {
	    world_stats.x_coord = world_stats.x_coord - hex_diff_x;
            if (world_stats.x_coord < 0)
            {
                console.log("Bounce against left world wall");
                world_stats.x_coord = 0;
            }
        }
	//drag bottom
        if (load.bottom)
        {
	    world_stats.y_coord = world_stats.y_coord - hex_diff_y
            if (world_stats.y_coord < 0)
            {
                console.log("Bounce against top world wall");
                world_stats.y_coord = 0;
            }
        }
	//drag top
        if (load.top)
        {
	    world_stats.y_coord = world_stats.y_coord - hex_diff_y;
            if (world_stats.y_coord + MAP_ROOM_ROWS > MAP_WORLD_ROWS)
            {
                console.log("Bounce against bottom world wall");
                world_stats.y_coord = MAP_WORLD_ROWS - MAP_ROOM_ROWS;
            }
        }

	//console.log("world coords:", world_stats.x_coord, world_stats.y_coord);

	//Mark sure there is no negative coordinates
	if (world_stats.x_coord < 0)
	{
	    world_stats.x_coord = 0;
	}
	if (world_stats.y_coord < 0)
	{
	    world_stats.y_coord = 0;
	}

        if (load.left || load.right || load.top || load.bottom) 
	{
	    //Everything in cache now.
	    Game.room.map.generate();
	    outside = 1; //always 1 in this function.
	    
	    /*
	    if (inCache(world_stats)) {
		//console.log("got lands in cache");
		Game.room.map.generate();
		outside = 1;
	    }
	    else {
		console.log("Lands not in cache, fetching ...");
		var slice = getWorldSlice(world_stats.x_coord, world_stats.y_coord);
		socket.emit("slice", {slice:slice});
	    }
	    */
	}
	
	return outside;
    }
    
    Game.mouseDragEvent = function(x_start, y_start, x_stop, y_stop, world_stats)
    {
	var outsideRoom = 0; //outside room
	var px_diff_x = x_stop - x_start;
	var px_diff_y = y_stop - y_start;

	var hex_start = getSelectedHexagon(x_start, y_start, world_stats.x_coord, world_stats.y_coord);
	var hex_stop = getSelectedHexagon(x_stop, y_stop, world_stats.x_coord, world_stats.y_coord);

	var hex_diff_x = hex_stop.x - hex_start.x;
	var hex_diff_y = hex_stop.y - hex_start.y;

	//console.log("drag hex diff", hex_diff_x, hex_diff_y);

	outsideRoom = updateMap(px_diff_x, px_diff_y, hex_diff_x, hex_diff_y, world_stats);
        
	if (outsideRoom)
	{
	    //Snapping back canvas to parent.
	    $('#gameCanvas').css({left:CANVAS_OFFSET,top:CANVAS_OFFSET});
	}
    }

    Game.tileInfoString = function(x, y, type)
    {
	var str = terrainFromType(type) + " " + x + "|" + y;
	/* fix later
	if (tile.building)
	{
	    str = str + " " + tile.building;
	}
	if (tile.construct)
	{
	    str = str + "(constructing)";
	}
	*/
	return str;
    }

    Game.clickedChangeMenu = function(building)
    {
	if (building)
	{
	    if (building.type === 'cityhall')
	    {
		addCityhallMenu(bottomContext);
	    }
	    else if (building.type === 'factory')
	    {
		addFactoryMenu(bottomContext);
	    }
	    else if (building.type === 'barrack')
            {
		addBarrackMenu(bottomContext);
	    }
	    else
	    {
		//add empty menu
		addEmptyMenu(bottomContext);
	    }
	}
    }

    Game.mouseDownEvent = function(px, py)
    {
	//console.log("clicked px", px, py);

	var hex = getSelectedHexagon(px, py, Game.world_stats.x_coord, Game.world_stats.y_coord);
	//console.log("clicked hex", hex.x, hex.y);
	
	Game.world_stats.x_marked = hex.x;
	Game.world_stats.y_marked = hex.y;
	terrain = cacheGetItem(hex.x, hex.y);

	//Info on top menu
	addTopMenu(topContext, Game.tileInfoString(hex.x, hex.y, terrain), 500, 20);

	var building = cacheGetBuilding(hex.x, hex.y);
	var unit = cacheGetUnit(hex.x, hex.y);
	if (unit == null && building != null)
	{
	    Game.clickedChangeMenu(building);
	}
	else if (unit != null && building == null)
	{
	    alert("unit clicked but not handled");
	}
	else if (unit != null && building != null)
	{
	    addBuildingUnitMenu(building.type, unit.type, bottomContext)
	}
	else
	{
	    addEmptyMenu(bottomContext);
	}
	//else no building or unit.
	
	if (editorMode) 
	{
	    var tiles;

	    if (editorData.size == 1)
	    {
		tiles = new Array();
		tile.number = editorData.terrain;
		tiles.push(tile);
	    }
	    else if (editorData.size == 2) // size == 7 tiles
	    {
		tiles = markRing7(hex);
		//Add center
		tile.number = editorData.terrain;
		tiles.push(tile);
		console.log(tiles.length);
	    }
	    else if (editorData.size == 3) // size == 19 tiles
	    {
		//Not implemented yet.
		return;
	    }

	    socket.emit("updateLands", {lands: tiles});
	}
	Game.room.map.generate();
    }
}

function markRing7(hex)
{
    //Starting north west.
    var x_even = hex.x % 2 == 0;
    var tiles = new Array();
    
    if (x_even)
    {
	var tile = cacheGetItem(hex.x - 1, hex.y - 1);
	tile.type = editorData.terrain;
	tiles.push(tile);
	
	tile = cacheGetItem(hex.x, hex.y - 1);
	tile.type = editorData.terrain;
	tiles.push(tile);

	tile = cacheGetItem(hex.x + 1, hex.y - 1);
	tile.type = editorData.terrain;
	tiles.push(tile);

	tile = cacheGetItem(hex.x + 1, hex.y);
	tile.type = editorData.terrain;
	tiles.push(tile);

	tile = cacheGetItem(hex.x, hex.y + 1);
	tile.number = editorData.terrain;
	tiles.push(tile);

	tile = cacheGetItem(hex.x - 1, hex.y);
	tile.type = editorData.terrain;
	tiles.push(tile);
    }
    else
    {
	tile = cacheGetItem(hex.x - 1, hex.y);
	tile.type = editorData.terrain;
	tiles.push(tile);
    
	tile = cacheGetItem(hex.x, hex.y - 1);
	tile.type = editorData.terrain;
	tiles.push(tile);
    
	tile = cacheGetItem(hex.x + 1, hex.y);
	tile.number = editorData.terrain;
	tiles.push(tile);
    
	tile = cacheGetItem(hex.x + 1, hex.y + 1);
	tile.type = editorData.terrain;
	tiles.push(tile);
	    
	tile = cacheGetItem(hex.x, hex.y + 1);
	tile.type = editorData.terrain;
	tiles.push(tile);

	tile = cacheGetItem(hex.x - 1, hex.y + 1);
	tile.type = editorData.terrain;
	tiles.push(tile);
    }

    return tiles;
}

function doneLoading(){
    curImgs++;
    if (curImgs == totalImgs) 
    {
	mainImpl();
    }
}

function loadImage(name, file)
{
    imgMap[name] = new Image();
    imgMap[name].src = file;
    imgMap[name].onload = function(){
	doneLoading();
    }
}

// Game Script
(function()
{
    //Load images
    for(var propertyName in imgFileMap) {
	loadImage(propertyName, imgFileMap[propertyName]);
    }
})();

function getSelectedHexagon(px, py, current_x, current_y)
{
    var column = parseInt(px/(hexagon.s + hexagon.h));    
    var columnIsOdd = column % 2;
    var row = 0;

    if (columnIsOdd)
    {
	row = parseInt((py - hexagon.r)/(2 * hexagon.r));
    }
    else
    {
	row = parseInt(py/(2 * hexagon.r));
    }

    var relColumn = px - column * (hexagon.s + hexagon.h);
    var relRow = 0;

    if (columnIsOdd)
    {
	relRow = (py - (row * 2 * hexagon.r)) - hexagon.r;
    }
    else
    {
	relRow = py - (row * 2 * hexagon.r);
    }
    
    var c = hexagon.r;
    var m = hexagon.r/hexagon.h;

    if (relRow < c - (m * relColumn))
    {
	//console.log("upper triangle");
	column--;
	if (!columnIsOdd)
	{
	    row--;
	}
    }
    else if (relRow > c + (m * relColumn))
    {
	//console.log("bottom triangle");
	column--;
	if (columnIsOdd)
	{
	    row++;
	}
    }

    var total_column = column + current_x;
    var total_row = row + current_y;
    
    if (current_x % 2) {
	if (!(total_column % 2)) {
	    total_row = total_row + 1;
	}
    }

    var clicked = {};
    clicked.x = total_column;
    clicked.y = total_row;
    return clicked;
}

function doMouseDown(e)
{
    var px = e.clientX - my_canvas.offsetLeft;
    var py = e.clientY - my_canvas.offsetTop;

    //console.log("py: " + py + " clientY: " + e.clientY + " offset:" + my_canvas.offsetTop);
    Game.mouseDownEvent(px, py);
}

function outsideCanvas(x_start, y_start, x_stop, y_stop)
{
    //Find if canvas doesn't cover camera area. If so snapback and redraw.
    var outside = 0;
    
    if (x_stop > 0)
    {
	//console.log("*** load canvas from left");
	outside = 1;
    }
    if (x_stop < -(my_canvas.width - my_container.offsetWidth))
    {
	//Check if x is smaller that canvas width - camera width. This is a constant.
	//console.log("*** load canvas from right");
	outside = 1;
    }
    if (y_stop > 0)
    {
	//console.log("*** load canvas from top");
	outside = 1;
    }
    if (y_stop < -(my_canvas.height - my_container.offsetHeight)){
	//Check if y is smaller that canvas height - camera height. This is a constant.
	//console.log("*** load canvas from bottom");
	outside = 1;
    }
    
    return outside;
}

function dragStart(event, ui)
{
    x_start = ui.position.left;
    y_start = ui.position.top;
}

function dragStop(event, ui)
{
    x_stop = ui.position.left;
    y_stop = ui.position.top;
    
    Game.mouseDragEvent(x_start, y_start, x_stop, y_stop, Game.world_stats);
}

function buildTile(x, y, number)
{
    var tile = {};
    //var number =  Math.floor((Math.random()*2)+1);

    tile.x = x;
    tile.y = y;
    tile.number = number;
    
    return tile;
}

function buildKey(x,y)
{
    return parseInt(x) + "_" + parseInt(y);
}

function buildWorld2(rows, cols)
{
    var world = {};
    
    for (i = 0; i < rows; i++)
    {
	for (j = 0; j < cols; j++)
	{
	    world[buildKey(i,j)] = buildTile(i,j,1);
	}
    }
    
    return world;
}

function buildWorld(lands)
{
    var world = {};

    for (i = 0; i < lands.length; i++)
    {
        var land = lands[i];
	world[buildKey(land.x, land.y)] = buildTile(land.x, land.y, land.type);
    }

    return world;
}

/* not used now, everything is in cache
function inCache(world_stats) {
    var tile;

    tile = cacheGetItem(world_stats.x_coord, world_stats.y_coord);
    if (!tile) {
	return 0;
    }
    tile = cacheGetItem(world_stats.x_coord + MAP_ROOM_COLS, world_stats.y_coord);
    if (!tile) {
	return 0;
    }
    tile = cacheGetItem(world_stats.x_coord, world_stats.y_coord + MAP_ROOM_ROWS);
    if (!tile) {
	return 0;
    }
    tile = cacheGetItem(world_stats.x_coord + MAP_ROOM_COLS, world_stats.y_coord + MAP_ROOM_ROWS);
    if (!tile) {
	return 0;
    }
    
    return 1;
}
*/

function getRoomWidth()
{
    //Add some margin to be sure to overlap
    var width = my_container.offsetWidth + HEX_HORIZONTAL * 2;
    return width;
}

function getRoomHeight()
{
    //Add some margin to be sure to overlap
    var height = my_container.offsetHeight + HEX_VERTICAL * 2;
    return height;
}

function getRoomCols()
{
    var cols = Math.floor(getRoomWidth()/(HEX_HORIZONTAL));
    return cols;
}

function getRoomRows()
{
    var rows = Math.floor(getRoomHeight()/HEX_VERTICAL);
    return 2 * rows;
}

function getWorldSlice(x, y)
{
    var slice = {};
    var x_start = x - (MAP_ROOM_COLS * 2);
    var x_stop = x + (MAP_ROOM_COLS * 2);
    var y_start = y - (MAP_ROOM_ROWS *2);
    var y_stop = y + (MAP_ROOM_ROWS *2);

    if (x_start < 0) {
	x_start = 0;
    }
    if (x_stop > MAP_WORLD_COLS) {
	x_stop = MAP_WORLD_COLS;
    }
    if (y_start < 0) {
	y_start = 0;
    }
    if (y_stop > MAP_WORLD_ROWS) {
	y_stop = MAP_WORLD_ROWS;
    }
    
    slice.x_start = x_start;
    slice.x_stop = x_stop;
    slice.y_start = y_start;
    slice.y_stop = y_stop;

    console.log("getWorldSlice: " + slice.x_start + "," + slice.x_stop + "," + slice.y_start + "," + slice.y_stop);

    return slice;
}

function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}


//Set handlers for editor menues.
function initEditorMenu(name)
{
    var ul = document.getElementById(name);
 
    if (name == "size")
    {
	ul.onclick = function(event) {
	    var target = getEventTarget(event);
	    editorData.size = target.id;
	};
    }
    if (name == "terrain")
    {
	ul.onclick = function(event) {
	    var target = getEventTarget(event);
	    editorData.terrain = target.id;
	};
    }
    if (name == "type")
    {
	ul.onclick = function(event) {
	    var target = getEventTarget(event);
	    editorData.type = target.id;
	};
    }
}

//Set handlers for building icons.
function initBuildingIcons(name)
{
    var ul = document.getElementById(name);
    ul.onclick = function(event) {
	    var target = getEventTarget(event);
	    //editorData.size = target.id;
	    alert("clicked ... " + target.id);
	};
}

function setupSystem(editor)
{
    //Event listners
    $("#gameCanvas").draggable();
    $("#gameCanvas").on("dragstart", dragStart);
    $("#gameCanvas").on("dragstop", dragStop);

    if (editor)
    {
	initEditor();
    }
    else
    {
	$("#infotab").show();
	$("#bottomContainer").show();
	//initBuildingIcons("buildFactory");
    }

    //Init client cache
    //cacheInit();
 
    //Mouse down event
    my_canvas.addEventListener("mousedown", doMouseDown, false);

    //Resize browser event
    window.addEventListener('resize', function(event)
    {
        getDimensions();
	Game.room.map.generate();
    });
}

function getDimensions()
{
    Game.room.width = getRoomWidth();
    Game.room.height = getRoomHeight();
    Game.room.map.width = getRoomWidth();
    Game.room.map.height = getRoomHeight();
    MAP_ROOM_COLS = getRoomCols();
    MAP_ROOM_ROWS = getRoomRows();

    console.log("Build room cols/rows: " + MAP_ROOM_COLS + "/" + MAP_ROOM_ROWS + " and px:" + Game.room.width + "/" + Game.room.height);
    console.log("World cache cols/rows: " + MAP_ROOM_COLS * 2 + "/" + MAP_ROOM_ROWS * 2);
}

function initEditor()
{
    //Set editor mode
    editorMode = 1;

    $("#editor_menu").show();

    //Init menus
    initEditorMenu("login");    
    initEditorMenu("size");
    initEditorMenu("terrain");
    initEditorMenu("type");
}

// Name and Email validation Function.
function validation(user, password) {
    //var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (user === '') {// || password === '') {
	alert("Please fill all fields...!!!!!!");
	return false;
    }
    /*
      else if (!(email).match(emailReg)) {
      alert("Invalid Email...!!!!!!");
      return false;
      } else {
    */
    loginData.name = user;

    return true;
}

function submit_credentials() {
    var user = document.getElementById("Username").value;
    var password = document.getElementById("Password").value;
    console.log("submit_credentials " + user + " " + password);
    validate_credentials(user, password);
}

function send_hello()
{
    var character = loginData.name;
    console.log("send_hello " + character);
    socket.emit("hello", {name: character});
}

function validate_credentials(user, password)
{
    if (validation(user, password)) {
	$("#login").hide();
	
	if (socket == 0)
	{
	    //Connect to server
	    initSocket();
	    console.log("init socket");
	}
	else
	{
	    send_hello_with_name(loginData.name);
	}
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");

    if (user != "") {
        //alert("Welcome again " + user + ". Cookie used");
	validate_credentials(user, "");
	return 1;
    } else {
	/*
        user = prompt("Please enter your name:", "");	
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
	*/
	return 0;
    }
}

function terrainFromType(type)
{
    var str = "";

    if (type == 1)
    {
	str = "dirt";
    }
    else if (type == 2)
    {
	str = "forest";
    }
    else if (type == 3)
    {
	str = "water";
    }
    else if (type == 4)
    {
	str = "semi-forest";
    }
    else {
	//zzz default for now is dirt
	str = "dirt";
    }

    return str;
 }