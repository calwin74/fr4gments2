//Make it simple, stupid simple!!!

var db = require('./db.js');
var cache = require('./cache.js');
var io = require('socket.io');
require("nice-console")(console)
var socket;

//Array holding all connections.
var connections = new Array();

//2D Array to hold world matrix. Fix this...
//var worldMatrix = new Array(101);

//Array hold all users
var users = new Array();

//Map holding all building types. Type is key.
//var buildingTypeMap = new Object();

//Map holding all unit types. Type is key.
//var unitTypeMap = new Object();

//Map holding all units. x_y is key
//zzz remove
//var unitMap = new Object();

//Map holding all buildings. x_y is key.
//zzz Remove
//var buildingMap = new Object();

//Globals ...

//Action enum
var NO_ACTION = 0;
var MOVE_ACTION = 1;
var MOVE_ACTION_LAST = 2;
/*
var CLAIM_ACTION = 3;
var BUILD_CONSTRUCTION_ACTION = 4;
var BUILD_BARRACK_ACTION = 5;
var BUILD_FACTORY_ACTION = 6;
var BUILD_CITYHALL_ACTION = 7;
var BUILD_REFINERY_ACTION = 8;
var BUILD_BUNKER_ACTION = 9;
var BUILD_FACTORY_A1_ACTION = 10;
var BUILD_FACTORY_A2_ACTION = 11;
*/

//Unit enum
var BUILD_SOLDIER_ACTION = 1;
var BUILD_ENGINEER_ACTION = 2;
var BUILD_ARTILLERY_ACTION = 3;

//Times
var MOVE_TIME = 5; //5s
var CLAIM_TIME = 5; //5s
var STARTUP_POLL_INTERVAL = 1000; //1s
var DB_POLL_ACTION_INTERVAL = 1000; //1s
var DB_POLL_BUILD_INTERVAL = 1000; //1s
var DB_POLL_UNIT_INTERVAL = 1000; //1s
var DB_POLL_STATS_INTERVAL = 5000; //5s
var GAME_TIME_UNIT = 60; //60s

var CIVILIANS_MAX = 20;
var NATIVITY = 0.1;
var NO_BUILD_TYPE = "No build type";
var REFINERY_OUTPUT = 5;
var DEFAULT_ENERGY_OUTPUT = 1;

//Verbose
var verbose = 0;

//Init flags
var initLands = 0;
var initUsers = 0;
var initBuildingTypes = 0;
var initUnitTypes = 0;

function init() {

    var message = "Init server at " + db.getTime();
    console.log(message);

    message = "Node version: " + process.version;
    console.log(message);

    db.getVersion(function(results) {
        console.log("mysql: ", results[0]);    
    });

    //cache.createWorldMatrix(worldSize);

    cacheData();

    //Wait for server to start.
    PollStartUp();
};

//Allocate wordMatrix
/*
function createMatrix(worldMatrix)
{
    var size = worldMatrix.length;
    console.log("Building world matrix: " + size + " x " + size);

    //This is an array of arrays.
    for (var i = 0; i < size; i++) {
	worldMatrix[i] = new Array(size);
    }
}
*/

function cacheData()
{
    console.log("Start caching data.");
    //Cache all lands.
    db.getLands(addLands);
    //Cache all users
    db.getUsers(addUsers);
    //Cache all building types
    db.getBuildingTypes(addBuildingTypes);
    //Cache all unit types
    db.getUnitTypes(addUnitTypes);
}

function createUser(row) {
    var user = {};
    
    user.username = row.username;
    user.password = row.password;
    return user;
}

function addUsers(rows) {
    for (var i in rows) {
        var user = createUser(rows[i]);
        users.push(user);
    }

    console.log("--- users ---");
    for (var i in users) {
        console.log(users[i].username);
    }
    initUsers = 1;
}

/*
function createBuilding(row) {
    var building = {};
    
    building.type = row.type;
    building.x = row.x;
    building.y = row.y;
    building.constructing = row.constructing;
    building.removing = row.removing;
    return building;
}
*/

function addBuildings(rows)
{
    for (var i in rows) {
	var row = rows[i];
	var building = cache.createBuilding(row);
	cache.addBuilding(building);
	//buildingMap[createKey(building.x, building.y)] = building;
	//cache.updateBuilding(row.x, row.y, row.type, row.constructing, row.removing);
    }

    console.log("--- buildings ---");
    cache.printBuildings();
    db.getUnits(addUnits);
}

function addLands(rows)
{
    var n_rows = rows.length;
    var world_size = Math.sqrt(n_rows);
    cache.createWorldMatrix(world_size);

    for (var i in rows) {
	var row = rows[i];
	//cache.addLand(row.x, row.y, row.type, row.owner);
	cache.addLand(row.x, row.y, row.type);
	//worldMatrix[row.x][row.y] = row.type;
    }
    console.log("Cached " + cache.getSize() + " land tiles.");
    db.getBuildings(addBuildings);    
}

/*
function createBuildingTypes(row) {
    var building = {};
    
    building.type = row.type;
    building.gold = row.gold;
    building.energy = row.energy;
    building.time = row.time;
    return building;
}
*/

function addBuildingTypes(rows) {
    for (var i in rows) {
        var buildingType = cache.createBuildingType(rows[i]);
	cache.addBuildingType(buildingType, rows[i].type);
	//buildingTypeMap[rows[i].type] = buildingType;
        //buildingTypes.push(building);
    }

    console.log("--- building types ---");
    cache.printBuildingTypes();
    /*
    for (var i in buildingTypeMap) {
        console.log(buildingTypeMap[i].type + " " + buildingTypeMap[i].gold + " " + buildingTypeMap[i].energy + " " + buildingTypeMap[i].time);
    }
    */
    initBuildingTypes = 1;
}

/*
function createUnitType(row) {
    var unit = {};
    
    unit.type = row.type;
    unit.gold = row.gold;
    unit.energy = row.energy;
    unit.upkeep_gold = row.upkeep_gold;
    unit.upkeep_energy = row.upkeep_energy;
    unit.building = row.building;
    unit.time = row.time;
    unit.hp = row.hp;
    unit.dp = row.dp;
    unit.ap = row.ap;

    return unit;
}
*/
function addUnitTypes(rows) {
    for (var i in rows) {
        var unitType = cache.createUnitType(rows[i]);
	//unitTypeMap[rows[i].type] = unitType;
	cache.addUnitType(unitType, rows[i].type);
    }

    console.log("--- unit types ---");
    
    cache.printUnitTypes();
    /*
    for (var i in unitTypeMap) {
        console.log(unitTypeMap[i].type + " " + unitTypeMap[i].gold + " " + unitTypeMap[i].energy + " " + unitTypeMap[i].time);
    }
    */
    initUnitTypes = 1;
}

/*
function createUnit(row) {
    var unit = {};
    
    unit.type = row.type;
    unit.hp = row.hp;
    unit.dp = row.dp;
    unit.ap = row.ap;
    unit.x = row.x;
    unit.y = row.y;
    unit.owner = row.owner;

    return unit;
}
*/
/*
function createKey(x, y) {
    var key = x + "_" + y;
    return key;
}
*/
function addUnits(rows){
    for (var i in rows) {
	//zzz unitMap really needed?
        var unit = cache.createUnit(rows[i]);
	cache.addUnit(unit);
	//unitMap[createKey(unit.x, unit.y)] = unit;
	//var unitType = unitTypeMap[row.type];
	//cache.updateUnit(row.x, row.y, row.type, row.name, unitType.hp, unitType.ap, unitType.dp);
    }

    console.log("--- units ---");
    cache.printUnits();
    /*
    for (var i in unitMap) {
        console.log(unitMap[i].type + " " + unitMap[i].x + " " + unitMap[i].y + " " + unitMap[i].owner);
    }
    */

    //Init lands done.
    initLands = 1;
}

function createStats(name, civilians, calc) {
    db.getStuff(name, function(stuff) {
	var units = {};
	units.c_soldiers = stuff[0].soldiers;
	units.g_soldiers = stuff[0].soldier;
	units.c_engineers = stuff[0].engineers;
	units.g_engineers = stuff[0].engineer;

        calculateCivilians(civilians, units, stuff[0].tax, name, stuff[0].gold, stuff[0].energy, stuff[0].refineries, calc);
    });
}

function DBPollStats() {
    var now = new Date();

    db.getPopulations(dateToString(now), function(rows) {
        var calc = 1;
        for (var i in rows) {
            createStats(rows[i].owner, rows[i].civilians, calc);
        }
    });
    
    setTimeout(DBPollStats, DB_POLL_STATS_INTERVAL);
}

function calcCost(soldiers, engineers) {
    var soldier = unitTypeMap["soldier"];
    var engineer = unitTypeMap["engineer"];
    var cost = soldiers * soldier.upkeep_gold + engineers * engineer.upkeep_gold;
    return cost;
}

//Calc decides if to calculate or not.
function calculateCivilians(civilians, units, tax, owner, gold, energy, refineries, calc) {
    db.getLandsFromOwner(owner, civilians, units, tax, gold, energy, refineries, function(lands, owner, civilians, units, tax, gold, energy, refineries) {
        if (lands.length == 0) {
	    return;
        }

	var soldiers = units.c_soldiers + units.g_soldiers;
	var engineers = units.c_engineers + units.g_engineers;
	
        if (calc) {
	    var toxic_sum = 0;
            for (var i in lands) {
                toxic_sum += lands[i].toxic;
            }
            var toxic_avg = toxic_sum/lands.length;
            var delta = (1 - tax/100) * ((CIVILIANS_MAX - toxic_avg)/CIVILIANS_MAX) * NATIVITY;
	
            var max_value = (CIVILIANS_MAX * lands.length) - toxic_sum - soldiers;
            var new_civilians = 0;

            if(civilians >= max_value){
                // more civilians then max, no growth
                new_civilians = civilians;
            }     
            else if(delta + civilians <= max_value){
                // normal growth
                new_civilians = delta + civilians;            
            }
            else{
                // max value...
                new_civilians = max_value;
            }
        }
        else {
            new_civilians = civilians;
        }

	if (verbose)
	    console.log("new civilians:", new_civilians);
        
        var income = (new_civilians * tax/100);
        var soldier = unitTypeMap["soldier"];        
        var cost = calcCost(soldiers, engineers);
        var new_gold = 0;
        var new_energy = 0;

        if (calc) {
            new_gold = gold + income - cost;
            new_energy = energy + DEFAULT_ENERGY_OUTPUT + refineries * REFINERY_OUTPUT ;
        }
        else {
            new_gold = gold;
            new_energy = energy;
        }
	
	if (verbose) {
	    console.log("new gold:", new_gold);
            console.log("income:", income);
            console.log("cost:", cost);
	    console.log("energy:", energy);
            console.log("new energy:", new_energy);
            console.log("refineries:", refineries);	    
        }

        if (calc) {
            var now = new Date();
            now.setSeconds(now.getSeconds() + GAME_TIME_UNIT);
            db.updatePopulation(owner, dateToString(now), new_civilians);
            db.updateTreasury(owner, dateToString(now), new_gold, new_energy); //gold_time not used.
        }

        //Send stats update to logged on users.
	var connection = connectionByName(owner);
	if (connection) {
            var stats = {civs:Math.floor(new_civilians),energy:new_energy,gold:Math.floor(new_gold),income:Math.floor(income),cost:Math.floor(cost),soldiers:units.g_soldiers,engineers:units.g_engineers};
	    connection.emit("stats", stats);
	}
    });
}

function PollStartUp()
{
    if (initLands && initUsers && initBuildingTypes && initUnitTypes)
    {
	console.log("Server ready for clients.");
	socket = io.listen(8079);
	socket.configure(function()
	{
	    //socket.set("transports", ["websocket"]);
	    socket.set("log level", 2);
	});
	setEventHandlers();
    
	DBPollActions();
	DBPollBuilds();
	DBPollUnits();
	//DBPollStats();
    }
    else {
	setTimeout(PollStartUp, STARTUP_POLL_INTERVAL);
    }
}

function DBPollActions() {
    var now = new Date();

    db.getActions(function(rows) {
        for (var i in rows) {
            if (now >= new Date(rows[i].due_time)) {
                handleAction(rows[i]);
            }
        }
	rows = null;
	now = null;
    });

    setTimeout(DBPollActions, DB_POLL_ACTION_INTERVAL);
}

function DBPollBuilds() {
    var now = new Date();

    db.getBuilds(function(rows) {
        for (var i in rows) {
            if (now >= new Date(rows[i].due_time)) {
                handleBuild(rows[i]);
            }
        }
	rows = null;
	now = null;
    });

    setTimeout(DBPollBuilds, DB_POLL_BUILD_INTERVAL);
}

function DBPollUnits() {
    var now = new Date();

    db.getFromUnitQueue(function(rows) {
        for (var i in rows) {
            if (now >= new Date(rows[i].due_time)) {
                handleUnit(rows[i]);
            }
        }
    });

    setTimeout(DBPollUnits, DB_POLL_UNIT_INTERVAL);
}

//Detect any blocking object.
//  - foo army
//  - foo building
function detectBlocks(x, y, name, last) {
    db.getBlocks(x, y, function(stuff) {
	if (stuff.length) {
	    // handle block
	    // zzz more stuff to detect ...
	    var msg = stuff[0].name + " is in the way ...";
	    sendError(name, msg);
	    //remove pending moves
	    db.removeFromActionQueueByName(name);	    
	}
	else {
	    moveCharacter(x, y, name, last);
	}
    });    
}

function moveCharacter(x, y, name, last) {
    //update database
    db.moveCharacter(x, y, name);
    //emit data to all connections about move
    var move = {x:x, y:y, name:name, end:last};

    for (var i = 0; i < connections.length; i++) {
	connections[i].emit("move player", move);
    }

    //remove action
    db.removeFromActionQueue(x, y, name);
}

function handleAction(row) {
    if ((row.type == MOVE_ACTION) || (row.type == MOVE_ACTION_LAST)) {
	var last = 0;

	if (row.type == MOVE_ACTION_LAST) {
	    last = 1;
	}
	
	detectBlocks(row.x, row.y, row.name, last);
    }
    else {
	console.log("No known action type.");
    }
}

function handleBuild(row) {
    db.buildingDone(row.x, row.y);
    cache.updateBuilding(row.x, row.y, row.type, 0, 0);
    db.removeFromBuildQueue(row.x, row.y, row.name);
    sendBuild(row.name, row.x, row.y, row.type);
    /* //Remove 
    var build = {x:row.x, y:row.y, type:row.type, name:row.name};
    for (var i = 0; i < connections.length; i++) {
	connections[i].emit("build", build);
    }
    */
}

function handleUnit(row) {
    //zzz remove garrison ? db.updateGarrison(row.name, type);
    var unitType = unitTypeMap[row.type];
    db.addUnit(row.type, row.x, row.y, unitType.hp, unitType.dp, unitType.ap, row.name);
    console.log("Trained " + row.type);
    db.removeFromUnitQueue(row.x, row.y, row.name, row.my_id);
    cache.updateUnit(row.x, row.y, row.type, row.name, unitType.hp, unitType.ap, unitType.dp);
    sendUnitBuild(row.name, row.x, row.y, row.type, unitType.hp, unitType.dp, unitType.ap);
}

var setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);    
};

function onSocketConnection(client) {
    //Add to connection list
    connections.push(client);

    /*
    if (verbose)
	console.log("Player has connected");
    */
    client.on("disconnect", function() {
	onClientDisconnect(client);
    });

    client.on("hello", function(data) {
        onHello(client, data);
    });

    client.on("slice", function(data) {
        onSlice(client, data);
    });

    client.on("world", function(data) {
        onWorld(client, data);
    });

    client.on("updateLands", function(data) {
	onUpdateLands(data.lands);
    });
    client.on("build", function(data) {
        onBuild(client, data);
    });
    client.on("unit", function(data) {
        onUnit(client, data);
    });
    /*
    client.on("move", function(data) {
        onMovePlayer(client, data);
    });
    client.on("hello", function(data) {
        onHello(client, data);
    });
    client.on("cancel move", function(data) {
        onCancelMove(client, data);
    });
    client.on("claim", function(data) {
        onClaim(client, data);
    });
    client.on("change a g", function(data) {
        onArmyGarrisonChange(client, data);
    });
    */
};

function onUpdateLands(lands) {
    for (i = 0; i < lands.length; i++)
    {
        var land = lands[i];
	//console.log(land.x, land.y, land.number);
	db.updateLandType(land.x, land.y, land.number);
    }
}

function onHello(client, data) {
    client.name = data.name;
    console.log("hello from " + client.name);
    var status = 0;
    var editor = 0;
    var client_username = client.name.toUpperCase();
    var x_home = 50;
    var y_home = 50;

    console.log("client username " + client_username);

    for (var i = 0; i < users.length; i++) {
	username = (users[i].username).toUpperCase();
	console.log("user " + username);

	if (client_username == username)
	{
	    console.log("Authenticated ");
	    status = 1;
	    if (client_username === "EDITOR")
	    {
		console.log("Editor authenticated");
		editor = 1;
	    }
	}
    }

    if (!status)
    {
	console.log("Unknown user, disconnecting");
    } 

    client.emit("hello", {"status":status, "editor":editor, "x_home":x_home, "y_home":y_home});

    /*
    if (client.name == "editor" || client.name == "Editor" || client.name == "mattias" || client.name == "Mattias" || client.name == "andreas" || client.name == "Andreas") {
	console.log("Authenticated ");
	status = 1;	
	if (client.name == "editor") {
	    editor = 1;
	}
    }
    else {
	console.log("Unknown user, disconnecting");
    }
    */
    //client.emit("hello", {"status":status, "editor":editor});

    /*
    if (data.name != null) {
	db.getPopulationByOwner(data.name, function(rows, name) {
	    var connection = connectionByName(name);	
	    if (connection) {
	        connection.emit("hello", init);
	    }

            var calc = 0; //No calculation
            createStats(name, rows[0].civilians, calc);
	});
    }
    */
};

function onSlice(client, data) {
    console.log("onSlice from " + client.name);

    var slice = data.slice;

    console.log("slice is " + slice.x_start + "," + slice.x_stop + "," + slice.y_start + "," + slice.y_stop);
    var result = cache.getSlice(slice.x_start, slice.x_stop, slice.y_start, slice.y_stop);
    console.log("number of lands:", result.length);
    client.emit("lands", result);
    /*
    db.getLandSlice(slice.x_start, slice.x_stop, slice.y_start, slice.y_stop, function(rows) {
	    console.log("number of lands:", rows.length);
	    client.emit("lands", rows);
	});
    */
};

function onWorld(client, data) {
    console.log("onWorld from " + client.name);
    var world = {};
    world.worldMatrix = cache.getWorldMatrix();
    world.buildings = cache.getBuildings();
    world.units = cache.getUnits();
    client.emit("world", world);
};

function onClientDisconnect(client) {
    console.log("onClientDisconnect");
    //Remove client from connection list.
    connections.splice(connections.indexOf(client), 1);

    /*
    var connection = connectionById(client.id);

    if (!connection) {
	if (vervose) {
	    var info = "Connection not found " + client.id;
	    console.log(info);
	}
	return;
    }

    connections.splice(connections.indexOf(connection), 1);
    if (verbose)
	console.log("Connection disconnected:", connection.name);
    */
};

function onMovePlayer(client, data) {
    var moves = data.steps.split(",");
    var now = new Date();
    var last = moves.length - 1;

    for (var i = 0; i < moves.length; i++) {
        var move = moves[i].split("|");
	var action = MOVE_ACTION;

        now.setSeconds(now.getSeconds() + MOVE_TIME);
	if (i == last) {
	    action = MOVE_ACTION_LAST;
	}
        db.addToActionQueue(move[0], move[1], client.name, dateToString(now), action, 0);
    }
};

function onCancelMove(client, data) {
    db.removeFromActionQueueByName(client.name);
};

function onClaim(client, data) {
    var coord = data.coord;
    var type = "claim";

    var now = new Date();
    now.setSeconds(now.getSeconds() + CLAIM_TIME);
    db.addToActionQueue(coord[0], coord[1], client.name, dateToString(now), CLAIM_ACTION, 0);
}

function onBuild(client, data) {
    console.log("onBuild " + data.coord.x + " " + data.coord.y);

    //Check cache if building already exists.
    var building = cache.getBuilding(data.coord.x, data.coord.y);
    //var item = cache.getItem(data.coord.x, data.coord.y);
    //if (item.building) {
    if (building)
    {
	var msg = "Building already exists here (" + data.coord.x + "," + data.coord.y + ").";
	sendError(client.name, msg);
	console.log(msg);
    }
    else {
	db.getResourcesForBuild(client.name, data.type, data.coord, verifyBuild);
    }
}

function onUnit(client, data) {
    //Check cache if unit already exists.
    var item = cache.getItem(data.coord.x, data.coord.y);
    if (item.unit)
    {
	var msg = "Unit already exists here (" + data.coord.x + "," + data.coord.y + ").";
	sendError(client.name, msg);
	console.log(msg);
    }
    else
    {
	db.getResourcesForBuild(client.name, data.type, data.coord, verifyUnit);
    }
}
function onArmyGarrisonChange(client, data) {
    db.updateCharacterTroops(client.name, data.a_sol, data.a_eng);
    db.updateGarrisonTroops(client.name, data.g_sol, data.g_eng);

    var army = {name:client.name, soldiers:data.a_sol, engineers:data.a_eng};
    for (var i = 0; i < connections.length; i++) {
	connections[i].emit("change army", army);
    }
}

function connectionById(id) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].id == id) {
            return connections[i];
	}
    };

    return false;
};

function connectionByName(name) {
    for (var i = 0; i < connections.length; i++) {
	if (name == connections[i].name) {
	    return connections[i];
	}
    };

    return false;
}
/*
function getUnitAction(unit) {
    if (unit == "soldier") return BUILD_SOLDIER_ACTION;
    if (unit == "engineer") return BUILD_ENGINEER_ACTION;
    if (unit == "artillery") return BUILD_ARTILLERY_ACTION;
    //No match
    return NO_ACTION;
}

function getTypeFromUnit(action) {
    if (action == BUILD_SOLDIER_ACTION) return "soldier";
    if (action == BUILD_ENGINEER_ACTION) return "engineer";
    if (action == BUILD_ARTILLERY_ACTION) return "artillery";
    
    //No match
    return NO_BUILD_TYPE;
}
*/
function sendError(name, error) {
    var connection = connectionByName(name);
    
    console.log(error);
    
    if (connection) {
	var error = {message:error}
	connection.emit("error_msg", error);
    }
}

function sendUnitConstruct(name, coord, type, time) {
    var connection = connectionByName(name);
    if (connection) {
        var unit = {x:coord.x, y:coord.y, type:type, time:time};
        connection.emit("unit construct", unit);
    }
}

function sendBuild(name, x, y, type) {
    var build = {x:x, y:y, type:type, name:name};
    for (var i = 0; i < connections.length; i++) {
	connections[i].emit("build", build);
    }
}

function sendUnitBuild(name, x, y, unit, hp, dp, ap) {
    var connection = connectionByName(name);
    if (connection) {
        var unit = {unit:unit, x:x, y:y, owner:name, hp:hp, dp:dp, ap:ap};
        connection.emit("unit build", unit);
    }
}

function sendMoney(name, gold, energy) {
    var connection = connectionByName(name);
    if (connection) {
        var money = {energy:energy,gold:Math.floor(gold)};
        connection.emit("money", money);
    }
}

function sendCivilians(name, civilians) {
    var connection = connectionByName(name);
    if (connection) {
        var civs = {civs:Math.floor(civilians)};
        connection.emit("civs", civs);
    }
}

function verifyBuild(resource, name, build, coord) {
    var gold = resource[0].gold;
    var energy = resource[0].energy;
    //var building = buildingTypeMap[build];
    var building = cache.getBuildingType(build);
    var new_gold = gold - building.gold;
    var new_energy = energy - building.energy;

    console.log("verifyBuild " + new_gold);

    if ((new_gold > 0) && (new_energy > 0)) {
        doBuild(name, build, coord, new_gold, new_energy, building.time);
    }
    else {
        sendError(name, "Not enough resources to build");
    }
}

//zzz This is not failsafe, async calls are not evaluated.
function doBuild(name, type, coord, new_gold, new_energy, time) {
    var now = new Date();
    now.setSeconds(now.getSeconds() + time);

    cache.updateBuilding(coord.x, coord.y, type, 1, 0);

    //cache.updateItem(coord.x, coord.y, "building", type);
    //cache.updateItem(coord.x, coord.y, "construct", 1);

    db.updateTreasury(name, dateToString(now), new_gold, new_energy);
    db.addToBuildQueue(coord.x, coord.y, name, dateToString(now), type);
    db.addBuilding(type, coord.x, coord.y, 1, 0); //constructing
   
    var construct = {x:coord.x, y:coord.y, name:name, type:type, time:time};
    //Update all users.
    for (var i = 0; i < connections.length; i++) {
	connections[i].emit("construct", construct);
    }

    sendMoney(name, new_gold, new_energy);
}

function verifyUnit(resource, name, type, coord) {
    var gold = resource[0].gold;
    var energy = resource[0].energy;
    var civilians = resource[0].civilians;
    var unit = unitTypeMap[type];
    var new_gold = gold - unit.gold;
    var new_energy = energy - unit.energy;

    if ((new_gold > 0) && (new_energy > 0) && (civilians > 0)) {
	var new_civilians = civilians - 1;
        doBuildUnit(name, type, coord, new_gold, new_energy, new_civilians, unit.time);
    }
    else {
        sendError(name, "Not enough resources to build unit");
    }
}

function doBuildUnit(name, type, coord, new_gold, new_energy, new_civilians, time) {
    var now = new Date();
    now.setSeconds(now.getSeconds() + time);

    /* This might be a performance trick later.
    var action = getUnitAction(type);
    if (action == NO_ACTION) {
	console.log(client.name + " builds unknown unit");
	sendError(name, "Unknown unit type.");
	return;
    }
    */

    db.updateTreasury(name, dateToString(now), new_gold, new_energy);
    db.updateCivilians(name, new_civilians);
    var uniqueish = new Date().getUTCMilliseconds();
    db.addToUnitQueue(coord.x, coord.y, name, dateToString(now), type, uniqueish);

    sendUnitConstruct(name, coord, type, time);
    sendMoney(name, new_gold, new_energy);
    sendCivilians(name, new_civilians);
}

function dateToString(now) {
    var year = now.getFullYear();
    var month =  now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var strMinutes;
    var strSeconds;
    
    //handle single digits
    if (minutes < 10) {
        strMinutes = "0" + minutes.toString();
    }
    else {
        strMinutes = minutes.toString();
    }

    if (seconds < 10) {
        strSeconds = "0" + seconds.toString();
    }
    else {
        strSeconds = seconds.toString();
    }

    var dateString = year + "-" + month + "-" + day + " " + hours + ":" + strMinutes + ":" + strSeconds;

    return dateString;
}

setTimeout(init, 3000);
