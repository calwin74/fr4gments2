/*
 Data model is the same as on server side.
*/

//var cache = null;
var matrix = null;

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

//Matrix impl
function cacheAddWorld(world)
{
    matrix = world;
}

function cacheGetItem(x, y)
{
    var item = matrix[x][y];
    return item;
}
