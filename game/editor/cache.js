/*
 Data model is the same as on server side.
*/

var matrix = null;
//Map for buildings, key is (x,y)
var buildingMap = null;
var unitMap = null;


/*
function cacheInit()
{
    //Initiate TaffyDB
    cache = TAFFY();
}

function cacheAddNew(items)
{
    //Remove all.
    cache().remove();
    cache.insert(items);
}

function cacheGetItem(x, y)
{
    //Returns an array. Get the first item.
    var items = cache({x:x, y:y}).get();
    return items[0];
}
*/

function cacheUpdateBuilding(x, y, building, constructing, removing)
{
    cache({x:x, y:y}).update({building:building, construct:constructing, removing:removing});
}

function cacheAddUnit(x, y, unit, owner, hp, dp, ap)
{
    cache({x:x, y:y}).update({unit:unit, unitOwner:owner, unitHp:hp, unitDp:dp, unitAp:ap});
}
/*
function cacheDump()
{
    var items = cache().get();
    console.log(items);
}
*/

// *** World Matrix impl ***
function cacheAddWorld(world)
{
    matrix = world;
}

function cacheGetItem(x, y)
{
    var item = matrix[x][y];
    return item;
}

// *** building cache ***
function cacheAddBuildings(buildings)
{
    buildingMap = buildings;
}

function cachePrintBuilding(building)
{
    //var key = cacheCreateKey(x,y);
    //console.log(key);
    //building = buildingMap[key];
    //console.log(building.type + " " + building.x + " " + building.y + " " + building.constructing);
}

function cachePrintBuildings()
{
    for (var i in buildingMap)
    {
        console.log(buildingMap[i].type + " " + buildingMap[i].x + " " + buildingMap[i].y);
    }
}

function cacheGetBuilding(x,y)
{
    return buildingMap[cacheCreateKey(x,y)];
}

// *** units cache ***
function cacheAddUnits(units)
{
    unitMap = units;
}

function cachePrintUnit(unit)
{
    console.log(unit.type + " " + unit.x + " " + unit.y + " " + unit.owner);
}

function cachePrintUnits()
{
    for (var i in unitMap)
    {
        console.log(unitMap[i].type + " " + unitMap[i].x + " " + unitMap[i].y);
    }
}

function cacheGetUnit(x,y)
{
    return unitMap[cacheCreateKey(x,y)];
}


// *** local functions *** //
//This might be shared with server and client.
function cacheCreateKey(x, y) {
    var key = x + "_" + y;
    return key;
}