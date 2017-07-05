//Handling server communication.

//socket.io
var socket = 0;

function initSocket() {
    var address = getServerAddress();
    console.log("initSocket ", address);
    socket = io.connect(address);
    setEventHandlers();
}

// --- Sending to server ---

function send_hello_with_name(name)
{
    console.log("send_hello " + name);
    socket.emit("hello", {name: name});
}

function serverSendBuild(x, y, building)
{
    var coord = {};
    coord.x = x;
    coord.y = y;    
    var build = {coord:coord, type:building};
    
    console.log("Send build");
    socket.emit("build", build);
}

function serverSendUnitBuild(x, y, unit)
{
    var coord = {};
    coord.x = x;
    coord.y = y;    
    var build = {coord:coord, type:unit};
    
    console.log("Send unit build");
    socket.emit("unit", build);
}

// --- Receiving from server ---

var setEventHandlers = function() {
    socket.on("connect", onSocketConnect);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("hello", onHello);
    //socket.on("lands", onLands);
    socket.on("world", onWorld);    
    socket.on("build", onBuild);
    socket.on("error_msg", onError);
    socket.on("money", onMoneyUpdate);
    socket.on("construct", onConstruct);
    socket.on("unit construct", onUnitConstruct);
    socket.on("civs", onCivsUpdate);
    socket.on("unit build", onUnitBuild);
    /*
    socket.on("new player", onNewPlayer);
    socket.on("move player", onMovePlayer);
    socket.on("remove player", onRemovePlayer);
    socket.on("stats", onStatsUpdate);
    socket.on("hello", onHello);
    socket.on("claim", onClaim);
    socket.on("build", onBuild);
    socket.on("addon", onAddOn);
    socket.on("change army", onChangeArmySize);
    socket.on("error_msg", onError);
    */
};

function onSocketConnect()
{
    console.log("onSocketConnect");
    send_hello();
};

function onSocketDisconnect()
{
    //document.getElementById('server_status').innerHTML = "Server:Off";
    console.log("onSocketDisconnect");
};

function onHello(data)
{
    console.log("onHello");

    if (data.status)
    {
	setCookie("username", loginData.name, 7);
	Game.world_stats.x_coord = data.x_home;
	Game.world_stats.y_coord = data.y_home;
	//var slice = getWorldSlice(Game.world_stats.x_coord, Game.world_stats.y_coord);
	setupSystem(data.editor);
	//socket.emit("slice", {slice:slice});
	
	socket.emit("world");
    }
    else
    {
	alert("failed");
	socket.emit("disconnect");
	$("#login").show();
    }
};

/*
function onLands(data)
{
    console.log("onLands, number of lands:", data.length);
    cacheAddNew(data);
    //drawMap();
};
*/

function onWorld(data)
{
    console.log("onWorld");
    //alert(data);
    cacheAddWorld(data.worldMatrix);
    cacheAddBuildings(data.buildings);
    cachePrintBuildings();
    cacheAddUnits(data.units);
    cachePrintUnits();
    drawMap();
};

function onBuild(data)
{
    var msg = "onBuild " + data.type + " " + data.x + "|" + data.y;
    console.log(msg);
    addTopMenu(topContext, msg, 500, 20);
    cacheUpdateBuilding(data.x, data.y, data.type, 0, 0);
    drawMap();
}

function onMoneyUpdate(data)
{
    var msg = "onMoneyUpdate gold:" + data.gold + "|energy:" + data.energy;
    console.log(msg);
    addTopMenu(topContext, msg, 500, 20);
}

function onConstruct(data)
{
    var msg = "Constructing " + data.type + " on " + data.x + "|" + data.y + " at time:" + data.time;
    console.log(msg);
    addTopMenu(topContext, msg, 500, 20);
    cacheUpdateBuilding(data.x, data.y, data.type, 1, 0);
    drawMap();
}

function onUnitConstruct(data)
{
    var msg = "Training unit " + data.type + " on " + data.x + "|" + data.y + " at time:" + data.time;
    console.log(msg);
    addTopMenu(topContext, msg, 500, 20);
    //cacheUpdateBuilding(data.x, data.y, data.type, 1, 0);
    //drawMap();
}

function onUnitBuild(data)
{
    var msg = "Trained unit " + data.unit;
    console.log(msg);
    addTopMenu(topContext, msg, 500, 20);
    cacheAddUnit(data.x, data.y, data.unit, data.owner, data.hp, data.dp, data.ap)
    drawMap();
}

function onCivsUpdate(data)
{
    var msg = "Civilians update: " + data.civs;
    console.log(msg);
}

function drawMap()
{
    Game.room.map.generate();
    //Snapping back canvas to parent.
    $('#gameCanvas').css({left:CANVAS_OFFSET,top:CANVAS_OFFSET});
}

function onError(data)
{
    addTopMenu(topContext, data.message, 500, 20);
}