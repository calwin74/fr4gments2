var TAFFY = require('node-taffydb').TAFFY;
require("nice-console")(console)


var cache = new TAFFY();

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

exports.addLand = function(x, y, type, owner)
{
    cache.insert({x:x, y:y, type:type, owner:owner, building:0, construct:0, removing:0});
}

exports.updateBuilding = function(x, y, building, constructing, removing)
{
    var msg = "cache : updateBuilding " + x + "," + y + " " + building + " " + constructing + " " + removing;
    console.log(msg);
    cache({x:x, y:y}).update({building:building, construct:constructing, removing:removing});
}

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

exports.getSize = function()
{
    var result = cache().get();
    return result.length;
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

