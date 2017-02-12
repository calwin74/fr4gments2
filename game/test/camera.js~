// wrapper for our game "classes", "methods" and "objects"
window.Game = {};

var hexagon = {
    s: 100,  // upper horizontal line
    h: 50,   // horisontal distance to corner
    r: 60    // half hight of hexagon
};

var HEX_HORIZONTAL = hexagon.s + hexagon.h;
var HEX_VERTICAL = 2 * hexagon.r;

var CANVAS_OFFSET = -70;

var MAP_WORLD_ROWS = 500;
var MAP_WORLD_COLS = 500;

var MAP_ROOM_ROWS = 0;
var MAP_ROOM_COLS = 0;

var img = new Array();
img[0] = "../img/dirt.png";
img[1] = "../img/forest.png";

var imgRes = {};
var totalImgs = img.length;
var curImgs = 0;

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
            if(this.viewportRect.left < this.roomRect.left)
	    {
                load.left = 1;
	    }
            if(this.viewportRect.right > this.roomRect.right)
	    {
                load.right = 1;
	    }
            if(this.viewportRect.top < this.roomRect.top)
	    {
                load.top = 1;
	    }
            if(this.viewportRect.bottom > this.roomRect.bottom)
	    {
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
    
    function drawHex(c, x0, y0, fColor, text, tile, marked)
    {
	if (tile.number % 2 == 0)
	{
	    c.drawImage(imgRes[0], x0, y0 - (200 - 2 * hexagon.r), 200, 200);
	}
	else
	{
	    c.drawImage(imgRes[1], x0, y0 - (200 - 2 * hexagon.r), 200, 200);
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
     
    function drawHexGrid(ctx, world_stats)
    {
	var posx;
	var posy;
	var coord;
	var rows = MAP_ROOM_ROWS;
	var columns = MAP_ROOM_COLS;
	
	//Must lay down tiles in rows to get overlapping images right on canvas

	for (row = 0; row < rows; row++) 
	{
	    for (col = 0; col < columns; col = col + 2) 
	    {
		var tile = Game.world[buildKey(col + world_stats.x_coord, row + world_stats.y_coord)];
		posy = row * 2 * hexagon.r;
		posx = col * (hexagon.s + hexagon.h);
		coord = "(" + tile.x + "," + tile.y + ")";
		drawHex(ctx, posx , posy, "red", coord, tile, isMarked(tile, world_stats));
	    }

	    for (col = 1; col < columns; col = col + 2) 
	    {
		var tile = Game.world[buildKey(col + world_stats.x_coord, row + world_stats.y_coord)];
		posy = hexagon.r + row * 2 * hexagon.r;
		posx = col * (hexagon.s + hexagon.h);
		coord = "(" + tile.x + "," + tile.y + ")";
		drawHex(ctx, posx , posy, "red", coord, tile, isMarked(tile, world_stats));
	    }
	}
    }
    
    Map.prototype.generate = function(world_stats, context)
    {
	context.canvas.width = this.width;
	context.canvas.height = this.height;
        
	drawHexGrid(context, world_stats);

	//costly
	//this.image = new Image();
	//this.image.src = context.canvas.toDataURL("image/png");
    }
    
    // draw the map adjusted to camera
    Map.prototype.draw = function(context, xView, yView){					
	// easiest way: draw the entire map changing only the destination coordinate in canvas
	// canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
	// context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
        
	// didactic way:
        
	var sx, sy, dx, dy;
	var sWidth, sHeight, dWidth, dHeight;
	
	context.canvas.width = this.width;
	context.canvas.height = this.height;
        
	// offset point to crop the image
	sx = xView;
	sy = yView;
        
	// dimensions of cropped image
	sWidth =  context.canvas.width;
	sHeight = context.canvas.height;
        
	// if cropped image is smaller than canvas we need to change the source dimensions
	if(this.image.width - sx < sWidth){
	    sWidth = this.image.width - sx;
	}
	if(this.image.height - sy < sHeight){
	    sHeight = this.image.height - sy; 
	}
	
	// location on canvas to draw the croped image
	dx = 0;
	dy = 0;
	// match destination with source to not scale the image
	dWidth = sWidth;
	dHeight = sHeight;									
        
	context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);			
    }
    
    // add "class" Map to our Game object
    Game.Map = Map;    
})();

function mainImpl()
{
    //simulate database for now
    Game.world = new buildWorld(MAP_WORLD_ROWS, MAP_WORLD_COLS);
    console.log("Built world cols/rows: " + MAP_WORLD_COLS + "/" + MAP_WORLD_ROWS);
    
    //Position canvas to be able to drag in different ways.
    $('#gameCanvas').css({left:CANVAS_OFFSET, top:CANVAS_OFFSET});
    
    var canvas = document.getElementById('gameCanvas');
    var context = canvas.getContext('2d'); 
    var my_container = document.getElementById('canvasContainer');
    
    var world_stats = {
	//x_curr: x_curr_start,
	//y_curr: y_curr_start
	x_coord: 0,
	y_coord: 0,
	x_marked: -1,
	y_marked: -1
    };
    
    //zzz handle this in the game instance??? Count on the fly?
    var roomWidth = getRoomWidth();
    var roomHeight = getRoomHeight();
    MAP_ROOM_COLS = getRoomCols();
    MAP_ROOM_ROWS = getRoomRows();
    
    console.log("Build room cols/rows: " + MAP_ROOM_COLS + "/" + MAP_ROOM_ROWS + " and px:" + roomWidth + "/" + roomHeight);
    
    // setup the room
    var room = {
	width: roomWidth,
	height: roomHeight,
	map: new Game.Map(roomWidth, roomHeight, 0, 0)
    };
    
    // paint the canvas
    room.map.generate(world_stats, context);
    
    // setup the magic camera !!!
    // room starts at (0,0) px
    var camera_start_x = 0;
    var camera_start_y = 0;
    
    var camera = new Game.Camera(camera_start_x, camera_start_y, my_container.offsetWidth, my_container.offsetHeight,
				 0, 0, room.width, room.height);
    
    // Game update function
    var update = function(px_diff_x, px_diff_y, hex_diff_x, hex_diff_y)
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

	console.log("world coords:", world_stats.x_coord, world_stats.y_coord);

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
	    room.map.generate(world_stats, context);
	    outside = 1;
	}
	
	return outside;
    }
    
    // Not used ... Game draw function, only needed if handling large image
    /*
    var draw = function()
    {
	// clear the entire canvas
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	// redraw all objects        

	//room.map.draw(context, camera.xView, camera.yView);
        room.map.draw(context, 0, 0);
    }
    */

    Game.mouseDragEvent = function(x_start, y_start, x_stop, y_stop)
    {
	var outsideR = 0; //outside room
	var px_diff_x = x_stop - x_start;
	var px_diff_y = y_stop - y_start;

	var hex_start = getSelectedHexagon(x_start, y_start, world_stats.x_coord, world_stats.y_coord);
	var hex_stop = getSelectedHexagon(x_stop, y_stop, world_stats.x_coord, world_stats.y_coord);

	var hex_diff_x = hex_stop.x - hex_start.x;
	var hex_diff_y = hex_stop.y - hex_start.y;

	outsideR = update(px_diff_x, px_diff_y, hex_diff_x, hex_diff_y);
        
	if (outsideR)
	{
	    //draw(); Not used ...

	    //Snapping back canvas to parent.
	    $('#gameCanvas').css({left:CANVAS_OFFSET,top:CANVAS_OFFSET});
	}
    }

    Game.mouseDownEvent = function(px, py)
    {
	var hex = getSelectedHexagon(px, py, world_stats.x_coord, world_stats.y_coord);
	var tile = Game.world[buildKey(hex.x, hex.y)];
	tile.number = 0;
	
	world_stats.x_marked = tile.x;
	world_stats.y_marked = tile.y;
	room.map.generate(world_stats, context);
    }

    initSocket();
}

function doneLoading(){
    curImgs++;
    if (curImgs == totalImgs) 
    {
	mainImpl();
    }
}

function loadImage(file, count)
{
    imgRes[count] = new Image();
    imgRes[count].src = file;
    imgRes[count].onload = function(){
	doneLoading();
    }
}

// Game Script
(function()
{
    //Load images
    for(i = 0; i < img.length; i++) {
	loadImage(img[i], i);
    }
})();

var my_canvas = document.getElementById('gameCanvas');
var my_container = document.getElementById('canvasContainer');
var x_start, y_start, x_stop, y_stop;

$("#gameCanvas").draggable();
$("#gameCanvas").on("dragstart", dragStart);
$("#gameCanvas").on("dragstop", dragStop);
my_canvas.addEventListener("mousedown", onMouseDown, false);

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
	column--;
	if (!columnIsOdd)
	{
	    row--;
	}
    }
    else if (relRow > c + (m * relColumn))
    {
	column--;
	if (columnIsOdd)
	{
	    row++;
	}
    }
    //else square

    column = column + current_x;
    row = row + current_y;
    
    var clicked = {};
    clicked.x = column;
    clicked.y = row;
    return clicked;
}

function onMouseDown(e)
{
    var px = e.clientX - my_canvas.offsetLeft;
    var py = e.clientY - my_canvas.offsetTop;
    Game.mouseDownEvent(px, py);
}

function outsideCanvas(x_start, y_start, x_stop, y_stop)
{
    //Find if canvas doesn't cover camera area. If so snapback and redraw.
    var outside = 0;
    
    if (x_stop > 0)
    {
	outside = 1;
    }
    if (x_stop < -(my_canvas.width - my_container.offsetWidth))
    {
	//Check if x is smaller that canvas width - camera width. This is a constant.
	outside = 1;
    }
    if (y_stop > 0)
    {
	outside = 1;
    }
    if (y_stop < -(my_canvas.height - my_container.offsetHeight)){
	//Check if y is smaller that canvas height - camera height. This is a constant.
	outside = 1;
    }
    
    return outside;
}

function dragStart(event, ui)
{
    x_start = ui.position.left;
    y_start = ui.position.top;

    //zzz some investigation .... puhh
    //x_start = event.clientX - my_canvas.offsetLeft;
    //y_start = event.clientY - my_canvas.offsetTop;

    //var start_position = position();

    //x_start = ui.offset.left - $(this).offset().left;
}

function dragStop(event, ui)
{
    x_stop = ui.position.left;
    y_stop = ui.position.top;
    
    //x_stop = event.clientX - my_canvas.offsetLeft;
    //y_stop = event.clientY - my_canvas.offsetTop;

    Game.mouseDragEvent(x_start, y_start, x_stop, y_stop);
}

function buildTile(x, y)
{
    var tile = {};
    var number =  Math.floor((Math.random()*2)+1);
    
    tile.x = x;
    tile.y = y;
    tile.number = number;
    
    return tile;
}

function buildKey(x,y)
{
    return parseInt(x) + "_" + parseInt(y);
}

function buildWorld(rows, cols)
{
    var world = {};
    
    for (i = 0; i < rows; i++)
    {
	for (j = 0; j < cols; j++)
	{
	    world[buildKey(i,j)] = buildTile(i,j);
	}
    }
    
    return world;
}

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


var setEventHandlers = function() {
    socket.on("connect", onSocketConnect);
    socket.on("disconnect", onSocketDisconnect);
    /*
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
    */
};

function onSocketConnect() {
    //alert("Connected to socket server");
    //socket.emit("hello", {name: character});
    console.log("onSocketConnect");
};

function onSocketDisconnect() {
    //document.getElementById('server_status').innerHTML = "Server:Off";
    console.log("onSocketDisconnect");
};

function initSocket() {
    var address = getServerAddress();
    console.log("initSocket ", address);
    socket = io.connect(address);
    setEventHandlers();
}