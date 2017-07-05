/*
 Menues are implemented here.
*/

//Defines for menu layout.
var MENU_ITEM_1 = 50;
var MENU_ITEM_2 = 250;
var MENU_ITEM_3 = 450;
var MENU_ITEM_4 = 650;
var MENU_ITEM_5 = 850;

var menu = new Array();

function addMenuItem(x, y, length, height, image, name)
{
    var menuItem = {
	x: x,
	y: y,
	length: length,
	height: height,
	image: image,
	name: name
    };
    
    menu.push(menuItem);
}

function drawMenu(ctx)
{
    var i;
    for(i = 0; i < menu.length; i++)
    {
	var item = menu[i];
	ctx.drawImage(item.image, item.x, item.y, item.length, item.height);
    }

    //Mouse down event
    bottomCanvas.addEventListener("mousedown", doMouseDownBottomCanvas, false);
}

function insideBox(item, px, py)
{
    var inside = 0;
    //alert("insideBox " + px + " " + py + " item.x " + item.x + " item.y " + item.y);
    
    if ((px >= item.x) && (px <= (item.x + item.length)) && (py >= item.y) && (py <= (item.y + item.height)))
    {
	inside = 1;
    }
    return inside;
}

function clickedMenuItem(px, py)
{
    var i;
    for(i = 0; i < menu.length; i++)
    {
	item = menu[i];
	if (insideBox(item, px, py))
	{
	    console.log("inside box");
	    handleMenuItem(item);
	    break;
	}
    }
}

function handleMenuItem(item)
{
    var x = Game.world_stats.x_marked;
    var y = Game.world_stats.y_marked;

    if (( item.name == "concrete") ||
       (item.name == "barrack") || (item.name == "bunker") ||
       (item.name == "refinery")|| (item.name == "factory") )
    {
	var msg = "building " + item.name + " on " + x + "|" + y;
	addTopMenu(topContext, msg, 500, 20);
	serverSendBuild(x, y, item.name);
    }
    else if (item.name == "build")
    {
	addConstructMenu(bottomContext);
	addTopMenu(topContext);
    }
    else if (item.name == "cityhall")
    {
	addCityhallMenu(bottomContext);
	addTopMenu(topContext);
    }
    else if ( (item.name == "soldier") || (item.name == "engineer") ||
	      (item.name == "artillery") )
    {
	var msg = "training " + item.name + " on " + x + "|" + y;
	addTopMenu(topContext, msg, 500, 20);
	serverSendUnitBuild(x, y, item.name);
    }
    else
    {
	alert("clicked unknown type");
    }
}

function initBottomMenu(ctx, name)
{
    //Empty current menu array.
    menu.length = 0;
    //Clear context.
    ctx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);

    bottomContext.font = "20px sans-serif";
    bottomContext.fillStyle = "red";
    bottomContext.fillText(name, 10, 20);
}

function addCityhallMenu(ctx)
{
    initBottomMenu(ctx, "Cityhall Menu");

    addMenuItem(MENU_ITEM_1, 50, 100, 100, imgMap['buildbuildings'], "build");

    drawMenu(ctx);
}

function addConstructMenu(ctx)
{
    initBottomMenu(ctx, "Construct Menu");

    addMenuItem(MENU_ITEM_1, 50, 100, 100, imgMap['factory_com'], "factory");
    addMenuItem(MENU_ITEM_2, 50, 100, 100, imgMap['barrack_com'], "barrack");
    addMenuItem(MENU_ITEM_3, 50, 100, 100, imgMap['bunker_com'], "bunker");
    addMenuItem(MENU_ITEM_4, 50, 100, 100, imgMap['refinery_com'], "refinery");
    addMenuItem(MENU_ITEM_5, 50, 100, 100, imgMap['move_com'], "cityhall");
    
    drawMenu(ctx);
}

function addBarrackMenu(ctx)
{
    initBottomMenu(ctx, "Barrack Menu");

    addMenuItem(MENU_ITEM_1, 50, 100, 100, imgMap['soldier_com'], "soldier");
    addMenuItem(MENU_ITEM_2, 50, 100, 100, imgMap['engineer'], "engineer");

    drawMenu(ctx);
}

function addFactoryMenu(ctx)
{
    initBottomMenu(ctx, "Factory Menu");

    addMenuItem(MENU_ITEM_1, 50, 100, 100, imgMap['artillery_com'], "artillery");

    drawMenu(ctx);
}

function addBuildingUnitMenu(building, unit, ctx)
{
    var string = building + ' ' + unit;
    initBottomMenu(ctx, string);

    addMenuItem(MENU_ITEM_1, 50, 100, 100, imgMap['factory_com'], "building_choice");
    addMenuItem(MENU_ITEM_2, 50, 100, 100, imgMap['soldier_com'], "unit_choice");

    drawMenu(ctx);
}

function addEmptyMenu(ctx)
{
    initBottomMenu(ctx, "Empty Menu");

    drawMenu(ctx);
}

function addTopMenu(ctx, msg, x, y)
{
    ctx.clearRect(0, 0, topCanvas.width, topCanvas.height);

    topContext.font = "20px sans-serif";
    topContext.fillStyle = "red";
    topContext.fillText("Info Menu", 10, 20);

    if (msg && x && y)
    {
	topContext.fillText(msg, x, y);
    }
}