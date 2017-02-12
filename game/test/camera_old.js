
	// wrapper for our game "classes", "methods" and "objects"
	window.Game = {};

        var hexagon = {
	    s: 108,  // upper horizontal line
	    h: 51,   // horisontal distance to corner
	    r: 73.5  // half hight of hexagon
        };

        var HEX_HORIZONTAL = hexagon.s + 2 * hexagon.h;
        var HEX_VERTICAL = 1.5 * hexagon.r;

	var MAP_ORIGIN_X = 20;
	var MAP_ORIGIN_Y = 20;

        var MAP_WORLD_ROWS = 500;
        var MAP_WORLD_COLS = 500;

        var MAP_ROOM_ROWS = 40;
        var MAP_ROOM_COLS = 20;

	//zzz fix location and functionality
	var img = new Array();
	img[0] = "../img/dirt1.png";
	img[1] = "../img/dirtveg1.png";

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
		
            Rectangle.prototype.overlaps = function(r) {
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
                
                console.log("Creating camera at (" + this.xView + "|" + this.yView + ") size:", cameraWidth, cameraHeight);
                
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

            Camera.prototype.update = function(x, y)
	    {
                console.log("old coordinates: " + this.xView + "|" + this.yView)
                // (x,y) is upper left corner
                this.xView = this.xView + x;
                this.yView = this.yView + y;
                
		var load = {};
		load.left = 0;
		load.top = 0;
		load.right = 0;
		load.bottom = 0;
		
                // update viewportRect
                this.viewportRect.set(this.xView, this.yView);

		//Check if camera leaves the room and load is needed.
                if (!this.viewportRect.within(this.roomRect))
                {
                    console.log("*** Not within room ***");
                    
                    //handle not within ...
                    if(this.viewportRect.left < this.roomRect.left)
                    {
                        console.log("left " + this.viewportRect.left + "<" + this.roomRect.left);
			load.left = 1;
                        //this.xView = this.roomRect.left;
                    }
                    if(this.viewportRect.top < this.roomRect.top)
                    {
                        console.log("top " + this.viewportRect.top + "<" +  this.roomRect.top);
			load.top = 1;
                        //this.yView = this.roomRect.top;
                    }
                    if(this.viewportRect.right > this.roomRect.right)
                    {
                        console.log("right " + this.viewportRect.right + ">" + this.roomRect.right);
			load.right = 1;
                        //this.xView = this.roomRect.right - this.wView;
                    }
                    if(this.viewportRect.bottom > this.roomRect.bottom)
                    {
                        console.log("bottom " + this.viewportRect.bottom + ">" + this.roomRect.bottom);
			load.bottom = 1;
                        //this.yView = this.roomRect.bottom - this.hView;
                    }
                }
                    
                console.log("updated coordinates: " + this.xView + "|" + this.yView);
                
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
                 this.image = null;
             }

             function drawHex(c, x0, y0, tColor, sColor, fColor, text, tile)
             {
                 
                 c.strokeStyle = sColor;
                 c.beginPath();
                 c.moveTo(x0, y0);
                 c.lineTo(x0 + hexagon.s, y0);
                 c.lineTo(x0 + hexagon.s + hexagon.h, y0 + hexagon.r);
                 c.lineTo(x0 + hexagon.s, y0 + 2 * hexagon.r);
                 c.lineTo(x0, y0 + 2 * hexagon.r);
                 c.lineTo(x0 - hexagon.h, y0 + hexagon.r);
                 
                 if (tColor)
                 {
                     c.fillStyle = tColor;
                     c.fill();
                 }

                 if (tile.number % 2 == 0)
                 {
                     c.drawImage(imgRes[0], x0 - hexagon.h, y0, hexagon.s * 2, hexagon.r * 2);
                 }
                 else
                 {
                     c.drawImage(imgRes[1], x0 - hexagon.h, y0, hexagon.s * 2, hexagon.r * 2);
                 }
                 
                 c.closePath();
                 c.stroke();
                 
                 if (text)
                 {
                     c.font = "20px sans-serif";
                     c.fillStyle = fColor;
                     c.fillText(text, x0 + hexagon.h/2, y0 + hexagon.r);
                 }
             }

             function drawHexGrid(ctx, x_coord, y_coord)
             {
                 var posx;
                 var posy;
                 var coord;
		 var x = MAP_ORIGIN_X;
		 var y = MAP_ORIGIN_Y;

                 //var rows = ctx.canvas.height/(HEX_VERTICAL);
                 //var rows = 41;
		 var rows = MAP_ROOM_ROWS;
		 
                 //var columns = ctx.canvas.width/HEX_HORIZONTAL;
                 var columns = MAP_ROOM_COLS

                 console.log("Canvas size h/w:", ctx.canvas.width, ctx.canvas.height);
                 console.log("Using " + rows + " rows and " + columns + " columns" + " in image");

                 for (row = 0; row < rows; row++) 
                 {
                     //we space the hexagons on each line next column being on the row below 
                     for (col = 0; col < columns; col++) 
                     {
			 var tile = Game.world[buildKey(col + x_coord, row + y_coord)];
                         posy =   y + row * hexagon.r;
                         posx  = (row & 1 ) * (hexagon.h + hexagon.s) + x + 2 * col  * (hexagon.s + hexagon.h);
                         coord = "(" + tile.x + "," + tile.y + ")";
                         drawHex(ctx, posx , posy, null, "black", "red", coord, tile);
                     }
                 }
             }

             Map.prototype.generate = function(world){
                 var ctx = document.createElement("canvas").getContext("2d");
                 ctx.canvas.width = this.width;
                 ctx.canvas.height = this.height;
                 
		 //zzz should not be fixed.
                 drawHexGrid(ctx, world.x_curr, world.y_curr);
                 
                 this.image = new Image();
                 this.image.src = ctx.canvas.toDataURL("image/png");
                 
                 // clear context
                 ctx = null;
             }
                
             // draw the map adjusted to camera
             Map.prototype.draw = function(context, xView, yView){					
                 // easiest way: draw the entire map changing only the destination coordinate in canvas
                 // canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
                 // context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
                 
                 // didactic way:
                 
                 var sx, sy, dx, dy;
                 var sWidth, sHeight, dWidth, dHeight;
                 
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

        function initGame()
        {
            // prepare our game canvas
            console.log("init game");

	    var worldWidth = MAP_WORLD_COLS * HEX_HORIZONTAL;
	    var worldHight = MAP_WORLD_ROWS * HEX_VERTICAL;

	    Game.world = new buildWorld(MAP_WORLD_ROWS, MAP_WORLD_COLS);
	    console.log("Built world cols/rows: " + MAP_WORLD_COLS + "/" + MAP_WORLD_ROWS + " and px:" + worldWidth + "/" + worldHight);

	    var roomWidth = MAP_ROOM_COLS * HEX_HORIZONTAL;
	    var roomHight = MAP_ROOM_ROWS * HEX_VERTICAL;

	    console.log("Built room cols/rows: " + MAP_ROOM_COLS + "/" + MAP_ROOM_ROWS + " and px:" + roomWidth + "/" + roomHight);

            //Position canvas to be able to drag in different ways.
            $('#gameCanvas').css({left:0, top:0});
            
            var canvas = document.getElementById('gameCanvas');
            var context = canvas.getContext('2d'); 
            var my_container = document.getElementById('canvasContainer');

            // setup an object that represents the world
            var world = {
                width: worldWidth,
                height: worldHight,
		//zzz change to coord, this is no px
		x_curr: 0,
		y_curr: 0
            };
            
            // setup an object that represents the room
            var room = {
                width: roomWidth,
                height: roomHight,
		map: new Game.Map(roomWidth, roomHight, 0, 0)
            };
            
            // generate a large image texture for the room
            room.map.generate(world);
            
            // setup the magic camera !!!
	    // room starts at (0,0)
            var camera = new Game.Camera(1000, 1000, my_container.offsetWidth, my_container.offsetHeight,
                                         0, 0, room.width, room.height);
            
            // Game update function
            var update = function(diff_x, diff_y){
		var load = camera.update(diff_x, diff_y);
		var outside = 0;

		if (load.left)
		{
		    world.x_curr = world.x_curr - 15;
		}
		if (load.right)
		{
		    world.x_curr = world.x_curr + 15;
		}
		if (load.topp)
		{
		    world.y_curr = world.y_curr - 15;
		}
		if (load.bottom)
		{
		    world.y_curr = world.y_curr + 15;
		}
		
		if (load.left || load.right || load.top || load.bottom) 
		{
		    room.map.generate(world);
		    outside = 0;
		}

		return outside;
            }
            
            // Game draw function
            var draw = function()
                {
                    // clear the entire canvas
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // redraw all objects
                    console.log("camera draw view:", camera.xView, camera.yView);
                    room.map.draw(context, camera.xView, camera.yView);		
		}
            
            Game.mouseEvent = function(x_start, y_start, x_stop, y_stop)
                {
                    var outsideC = 0; //Outside Canvas
                    var outsideR = 0; //Outside Room
                    var x_diff = x_start - x_stop;
                    var y_diff = y_start - y_stop;
                    
                    console.log("canvas start position:", x_start, y_start);          
                    console.log("canvas end position:", x_stop, y_stop);
		    
                    outsideC = outsideCanvas(x_start, y_start, x_stop, y_stop);
                    outsideR = update(x_diff, y_diff);
                    
		    //zzz merge together ???
                    if (outsideC || outsideR){
                        draw();
                    }
                    
                    if (outsideC || outsideR){
                        console.log("update map");
                        //Snapping back canvas to parent.
                        console.log("snap back to grid");
                        $('#gameCanvas').css({left:0,top:0});
                    }
		}

            Game.init = function(){
                draw();
            }
        }

        function doneLoading(){
            curImgs++;
	    if (curImgs == totalImgs) 
            {
                initGame();
            }
	}

        function loadImage(file, count){
            imgRes[count] = new Image();
            imgRes[count].src = file;
            imgRes[count].onload = function(){
	        doneLoading();
            }
	}

        // Game Script
	(function(){
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

        function outsideCanvas(x_start, y_start, x_stop, y_stop)
        {
            //Find if canvas doesn't cover camera area. If so snapback and redraw.
            var outside = 0;

            if (x_stop > 0)
            {
                console.log("*** load from left");
                outside = 1;
            }
            if (x_stop < -(my_canvas.width - my_container.offsetWidth))
            {
                //Check if x is smaller that canvas width - camera width. This is a constant.
                console.log("*** load from right");
                outside = 1;
            }
            if (y_stop > 0){
                console.log("*** load from top");
                outside = 1;
            }
            if (y_stop < -(my_canvas.height - my_container.offsetHeight)){
                //Check if y is smaller that canvas height - camera height. This is a constant.
                console.log("*** load from bottom");
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

            Game.mouseEvent(x_start, y_start, x_stop, y_stop);
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

	// start the game when page is loaded
	window.onload = function(){
            Game.init();
	}
