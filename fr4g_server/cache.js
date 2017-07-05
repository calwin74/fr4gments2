/*
var TAFFY = require('node-taffydb').TAFFY;
*/
require("nice-console")(console)


//var cache = new TAFFY();

//2D Array to hold world matrix. Fix this...
var worldMatrix;
var world_size = 0;

//Map holding all buildings. x_y is key.
var buildingMap = new Object();

//Map holding all building types. Type is key.
var buildingTypeMap = new Object();

//Map holding all unit types. Type is key.
var unitTypeMap = new Object();

//Map holding all units. x_y is key
var unitMap = new Object();

/*
 tile model:
 x         : x coordinate
 y         : y coordinate
 type      : terrain type
 owner     : tile owner
 construct : construction ongoing
 removing  : removing ongoing
 building  : building type
 unit      : unit type
 unitOwner : unit owner
 unitHp    : unit hit points
 unitDp    : unit damage points
 unitAp    : unit armour points
*/


//Allocate worldMatrix
exports.createWorldMatrix = function(size)
{
    worldMatrix = new Array(size);

    //var size = worldMatrix.length;
    console.log("Building world matrix: " + size + " x " + size);

    //This is an array of arrays.
    for (var i = 0; i < size; i++) {
	worldMatrix[i] = new Array(size);
    }
}

exports.getWorldMatrix = function()
{
    return worldMatrix;
}

exports.getSize = function()
{
    var size = worldMatrix.length;
    return size * size;
}


exports.addLand = function(x, y, type)
{
    //cache.insert({x:x, y:y, type:type, owner:owner, building:0, construct:0, removing:0});
    worldMatrix[x][y] = type;
}

/*
exports.updateBuilding = function(x, y, building, constructing, removing)
{
    var msg = "cache : updateBuilding " + x + "," + y + " " + building + " " + constructing + " " + removing;
    console.log(msg);
    cache({x:x, y:y}).update({building:building, construct:constructing, removing:removing});
}
*/

exports.updateItem = function(x, y, tag, value)
{
    cache({x:x, y:y}).update({tag:value});
}

exports.updateUnit = function(x, y, type, owner, hp, dp, ap)
{
    var msg = "cache : updateUnit " + x + "," + y + " " + type + " " + owner;
    console.log(msg);
    cache({x:x, y:y}).update({unit:type, unitOwner:owner, unitHp:hp, unitDp:dp, unitAp:ap});
}


exports.getItem = function(x, y)
{
    //Returns an array. Get the first item.
    var items = cache({x:x, y:y}).get();
    return items[0];
}

exports.getSlice = function(x_start, x_stop, y_start, y_stop)
{ 
    console.log("cache : getSlice");
    var slice = cache( {y:{lte:y_stop}}, {y:{gte:y_start}}, {x:{gte:x_start}}, {x:{lte:x_stop}} ).get();
    return slice;
}


// *** Building ***
exports.createBuilding = function(row) {
    var building = {};
    building.type = row.type;
    building.x = row.x;
    building.y = row.y;
    building.constructing = row.constructing;
    building.removing = row.removing;
    return building;
}

exports.addBuilding = function(building)
{
    buildingMap[createKey(building.x, building.y)] = building;
}

exports.updateBuilding = function(x, y, building, constructing, removing)
{
    var msg = "cache : updateBuilding " + x + "," + y + " " + building + " " + constructing + " " + removing;
    console.log(msg);
    var building = buildingMap[createKey(x,y)];
    building.constructing = constructing;
    building.removing = removing;
    
    //cache({x:x, y:y}).update({building:building, construct:constructing, removing:removing});
}

exports.printBuildings = function()
{
    for (var i in buildingMap)
    {
        console.log(buildingMap[i].type + " " + buildingMap[i].x + " " + buildingMap[i].y);
    }
}

exports.getBuildings = function()
{
    return buildingMap;
}

exports.getBuilding = function(x, y)
{
    return buildingMap[createKey(x,y)];
}

// *** building types ***
exports.createBuildingType = function(row) {
    var building = {};
    
    building.type = row.type;
    building.gold = row.gold;
    building.energy = row.energy;
    building.time = row.time;
    return building;
}

exports.addBuildingType = function(buildingType, type)
{
    buildingTypeMap[type] = buildingType;
}

exports.printBuildingTypes = function()
{
    for (var i in buildingTypeMap)
    {
        console.log(buildingTypeMap[i].type + " " + buildingTypeMap[i].gold + " " + buildingTypeMap[i].energy + " " + buildingTypeMap[i].time);
    }
}

exports.getBuildingType = function(type)
{
    return buildingTypeMap[type];
}

// *** Unit types ***
exports.createUnitType = function(row) {
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

exports.addUnitType = function(unitType, type)
{
    unitTypeMap[type] = unitType;
}

exports.printUnitTypes = function()
{
    for (var i in unitTypeMap) {
        console.log(unitTypeMap[i].type + " " + unitTypeMap[i].gold + " " + unitTypeMap[i].energy + " " + unitTypeMap[i].time);
    }
}

// *** unit ***
exports.createUnit = function(row)
{
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

exports.addUnit = function(unit)
{
    unitMap[createKey(unit.x, unit.y)] = unit;
}

exports.printUnits = function()
{
    for (var i in unitMap) {
        console.log(unitMap[i].type + " " + unitMap[i].x + " " + unitMap[i].y + " " + unitMap[i].owner);
    }
}

exports.getUnits = function()
{
    return unitMap;
}

// *** local functions *** //
function createKey(x, y) {
    var key = x + "_" + y;
    return key;
}