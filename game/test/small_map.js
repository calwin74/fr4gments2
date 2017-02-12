/*
 * Functions used by the map representation. Using JQuery plugins.
 */

$(function() {
  $( "#map_container" ).draggable();

  $( ".front1" ).click(function() {
    alert("click!");
  });
});

// ---------------------------------------------------------------------------
// Code to run on data load

//Create XMLHttpRequest object for all browsers.
var request = false;
var request_delta = false;

try {
    request = new XMLHttpRequest();
} catch (trymicrosoft) {
    try {
	request = new ActiveXObject("Msxml2.XMLHTTP");
   } catch (othermicrosoft) {
	try {
	    request = new ActiveXObject("Microsoft.XMLHTTP");
	} catch (failed) {
	    request = false;
	}  
    }
}

if (!request) {
    alert("Error initializing XMLHttpRequest!");
}

//Read board
loadMapBatch();


//Middle position for board
//This the middle of the board and board creation will be based on this point.
var x_position = 0;
var y_position = 0;
var x_batch_size = 5;
var y_batch_size = 13;

//Initiate TaffyDB
var mapDB = TAFFY();

function loadMapBatch() {
    var url = "map_update.php?x_position=" + escape(x_position) + "&y_position=" + escape(y_position) + "&x_batch_size=" + escape(x_batch_size) + "&y_batch_size=" + escape(y_batch_size);
    request.open("GET", url, true);
    request.onreadystatechange = handleMapUpdate;
    request.send(null);

    updateBoarderXY(x_position, y_position);
}

function handleMapUpdate() {
    if (request.readyState == 4) {
	if (request.status == 200) {
	    var response = request.responseText;
	    
	    // remove all rows from database
	    mapDB().remove();
	    // insert json response into database
	    mapDB.insert(response);
	    // create selection for map based on (x_position|y_position)
	    var records = getBoard();	    
	    //update board
	    updateBoard(records);
	}
	else if (request.status == 404) {
	    alert("Request URL does not exist");
	}
	else {
	    alert("Error: status code is " + request.status);
	}
    }
}

var x_board_min = -3;
var x_board_max = 3;
var y_board_min = -15;
var y_board_max = 15;

function updateBoard(records) {
   var x = x_board_min;
   var y = y_board_max; 

   // loop through records and modify class attributes
   records.each(function (r) {
       var id = x + "_" + y;
       var a_id = "a" + id;
       var b_id = "b" + id;

       //current objects
       var old_a = $("#"+a_id);

       // zzz fix this for edit
       var old_b = $("#"+b_id);                

       //align map
       var br = old_a.hasClass("br");
       var firstodd = old_a.hasClass("firstodd");
       var odd = old_a.hasClass("odd");
       var even = old_a.hasClass("even");
       // zzz fix this for edit
       var edit = old_b.hasClass("edit");       
       var alignment = "";

       //find position classes
       if (br) { 
	   alignment = alignment + " br";
       }
       if (firstodd) {
	   alignment = alignment + " firstodd";
       }
       if (odd) {
	   alignment = alignment + " odd";
       }
       if (even) {
	   alignment = alignment + " even";
       }
       
       //css class hex is always needed for terrain.
       var a_class = alignment + " hex";
       
       if (r.building.length) {
	   a_class = a_class + " " + r.building;
       }
       a_class = a_class + " " + r.terrain;
       
       if (r.friend && r.friend.length) {
	   a_class = a_class + " " + r.friend;
       }

       // Marked tile
       //zzz Must have marked armies for this to work.
       var marked = r.marked;
       
       if (marked.length) {
	   var b_class = alignment + " " + r.marked;
       }
       else {
	   var b_class = alignment +  " " + r.classes;
       }

       var army_class = "";
       
       if (r.army && !isEditor) {
	   army_class = " " + r.army;
           //zzz 
	   //setArmyPower(id, parseInt(r.soldiers) + parseInt(r.engineers), isFoo(r.army));
	   
           /* zzz
	   if (!isFoo(r.army)) {
	       updateArmy(r.soldiers, r.engineers);
	   }
           */
       }
       
       var b_class = alignment + " " + r.classes + army_class;
       
       // The xy coordinate class must always be first in the class attribute list.
       var class_coord = "xy_" + r.x + "_" + r.y;
       if (edit) {
	   var b_class = class_coord + " " + alignment + " " + "edit";
       }
       else {
	   var b_class = class_coord + " " + alignment + " " + r.classes;
       }

       // class attribute
       $("#"+a_id).attr("class", a_class);
       $("#"+b_id).attr("class", b_class);

       //edit x and y ...
       if (x >= x_board_max) {
	   x = x_board_min;
	   y--;
       }
       else {
	   x++;
       }
    })
}