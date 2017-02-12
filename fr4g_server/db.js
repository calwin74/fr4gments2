//Make it simple, stupid simple!!!

var mysql = require('mysql');
var database = require('./database');
require("nice-console")(console)

//Verbose
var verbose = 0;

exports.getVersion = function(callback) {
    var query = "select @@version";
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getVersion :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });
}

exports.getUsers = function(callback) {
    var query = "select username,password from users";
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getUsers :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });    
}

exports.getLands = function(callback) {
    var query = "select * from lands";
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getLands :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });
}

exports.getLandSlice = function(x1, x2, y1, y2, callback) {
    var query = "select * from lands where x >= " + x1 + " and x <= " + x2 + " and y >= " + y1 + " and y <= " + y2;
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getLandSlice :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });
}

exports.getBuildings = function(callback) {
    var query = "select * from buildings";
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getBuildings :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });
}

exports.getUnits = function(callback) {
    var query = "select * from units";
    var connection = database.getConnection();
    connection.query(query, function(err, results, fields) {
	if (err) {
	    handleError(err, "Error in getUnits :" + query);
	}
	else {
	    //Callback function returns employees array.
	    callback(results);
	}
    });
}

exports.addToBuildQueue = function(x, y, name, deadline, action) {
    var query = "insert into build_queue values ('" + name + "'," + x + "," + y + ",'" + deadline + "','" + action + "')";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    var msg = "Error in addToBuildQueue: :" + query;
	    handleError(err, msg);
        }
    });
}

exports.getBuilds = function(callback) {
    var query = "select * from build_queue order by due_time asc";

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getBuilds :" + query);
        }
        else {
            callback(rows);
        }        
     });
}

exports.removeFromBuildQueue = function(x, y, name) {
    var query = "delete from build_queue where name = '" + name + "' and x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeFromBuildQueue :" + query);
        }
    });
}

exports.addToActionQueue = function(x, y, name, deadline, action, addinfo) {
    var query = "insert into action_queue values ('" + name + "'," + x + "," + y + ",'" + deadline + "'," + action + "," + addinfo + ")";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    var msg = "Error in addToActionQueue: :" + query;
	    handleError(err, msg);
        }
    });
}

exports.removeFromActionQueue = function(x, y, name) {
    var query = "delete from action_queue where name = '" + name + "' and x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeFromActionQueue :" + query);
        }
    });
}

exports.removeFromActionQueueByName = function(name) {
    var query = "delete from action_queue where name = '" + name + "'";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeFromActionQueueByName :" + query);
        }
    });
}

exports.getActions = function(callback) {
    var query = "select * from action_queue order by due_time asc";

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getActions :" + query);
        }
        else {
            callback(rows);
        }        
     });
}

exports.addToUnitQueue = function(x, y, name, deadline, type, my_id) {
    var query = "insert into unit_queue values ('" + name + "'," + x + "," + y + ",'" + deadline + "','" + type + "'," + my_id + ")";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in addToUnitQueue :" + query);
        }
    });
}

exports.removeFromUnitQueue = function(x, y, name, my_id) {
    var query = "delete from unit_queue where name = '" + name + "' and x = " + x + " and y = " + y + " and my_id = " + my_id;
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeFromUnitQueue :" + query);
        }
    });
}

exports.removeFromUnitQueueByName = function(name) {
    var query = "delete from unit_queue where name = '" + name + "'";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeFromUnitQueueByName :" + query);
        }
    });
}

exports.getFromUnitQueue = function(callback) {
    var query = "select * from unit_queue order by due_time asc";

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getUnits :" + query);
        }
        else {
            callback(rows);
        }        
     });
}

exports.moveCharacter = function(x, y, name) {
    var query = "update characters set x = " + x + ", y = " + y + " where name = '" + name +"'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in getCharacter :" + query);
        }
    });
}

exports.getPopulations = function(now, callback) {
    var query = "select * from population where civilians_time <= '" + now + "' order by civilians_time ASC";
    
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getPopulations :" + query);
        }
        else {
            callback(rows);
        }        
     });
}

exports.getPopulationByOwner = function(owner, callback) {
    var query = "select * from population where owner = '" + owner + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getPopulationByOwner :" + query);
        }
        else {
            callback(rows, owner);
        }        
    });
}

exports.updatePopulation = function(owner, time, civilians) {
    var query = "update population set civilians = " + civilians + ", civilians_time = '" + time + "' where owner = '" + owner + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updatePopulation :" + query);
        }
    });
}

exports.updateCivilians = function(owner, civilians) {
    var query = "update population set civilians = " + civilians + " where owner = '" + owner + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateCivilians :" + query);
        }
    });
}

exports.updateTreasury = function(owner, time, gold, energy) {
    //the time is not used.
    var query = "update treasury set gold = " + gold + ", energy = " + energy + ", gold_time = '" + time + "' where character_name = '" + owner + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();    
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateTreasury :" + query);
        }
    });
}

exports.getCharacterByName = function(name, civilians, callback) {
    var query = "select * from characters where name = '" + name + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getCharacterByName :" + query);
        }
        else {
	    if (rows.length == 1) {
		callback(rows, civilians);
	    }
        }        
    });
}

exports.updateGarrison = function(name, type) {
    var query = "update garrison set " + type + " = " + type + " + 1 where name = '" + name + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateGarrison :" + query);
        }
    });
}

exports.updateGarrisonTroops = function(name, soldiers, engineers) {
    var query = "update garrison set soldier = " + soldiers + ", engineer = " + engineers + " where name = '" + name + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateGarrisonTroops :" + query);
        }
    });
}

exports.updateCharacterTroops = function(name, soldiers, engineers) {
    var query = "update characters set soldiers = " + soldiers + ", engineers = " + engineers + " where name = '" + name + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateCharacterTroops :" + query);
        }
    });
}

exports.getLandsFromOwner = function(owner, civilians, units, tax, gold, energy, refineries, callback) {
    var query = "select * from lands where owner = '" + owner + "'";
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getLandFromOwner :" + query);
        }
        else {
	    callback(rows, owner, civilians, units, tax, gold, energy, refineries);
        }        
    });
}

exports.updateLandOwner = function(x, y, name) {
    var query = "update lands set owner = '" + name + "' where x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateLandOwner :" + query);
        }
    });
}

exports.updateLandType = function(x, y, type) {
    var query = "update lands set type = " + type + " where x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateLandType:query");
        }
    });
}

exports.updateLandToxic = function(x, y, toxic) {
    var query = "update lands set toxic = " + toxic + " where x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in updateLandToxic :" + query);
        }
    });
}

exports.addUnit = function(type, x, y, hp, dp, ap, owner) {
    var query = "insert into units values ('" + type + "'," + x +
    "," + y + "," + hp + "," + dp + "," + ap + "," + "'" + owner + "')";   
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in addUnits :" + query);
        }
    });
}

exports.addBuilding = function(type, x, y, constructing, removing) {
    var query = "insert into buildings values ('" + type + "'," + x +
    "," + y + "," + constructing + "," + removing + ")";   
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in addBuilding :" + query);
        }
    });
}

exports.removeBuilding = function(x, y) {
    var query = "delete from buildings where x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in removeBuilding :" + query);
        }
    });
}

exports.buildingDone = function(x, y) {
    var query = "update buildings set constructing = 0 where x = " + x + " and y = " + y;
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in buildingDone :" + query);
        }
    });
}

exports.incrementRefineries = function(name) {
    var query = "update treasury set refineries = refineries + 1 where character_name = '" + name + "'";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err) {
        if (err) {
	    handleError(err, "Error in incrementRefineries :" + query);
        }
    });
}

 exports.getResourcesForBuild = function(name, build, coord, callback) {
    var query = "select t.*, p.civilians from treasury t, population p where t.character_name = '" + name + "' and p.owner = '" + name + "'";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getResourcesForBuild :" + query);
        }
        else {
	    if (rows.length == 1) {
		callback(rows, name, build, coord);
	    }
        }        
    });
}

exports.getBuildingTypes = function(callback) {
    var query = "select * from building_types";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getBuildingTypes :" + query);
        }
        else {
            callback(rows);
        }        
    });
}

exports.getUnitTypes = function(callback) {
    var query = "select * from unit_types";
    if (verbose)
	console.log(query);
    
    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getUnitTypes :" + query);
        }
        else {
            callback(rows);
        }        
    });
}

exports.getStuff = function(name, callback) {
    var query = "select c.soldiers, c.engineers, g.soldier, g.engineer, t.* from characters c, garrison g, treasury t where c.name = '" + name + "' and g.name = '" + name + "' and t.character_name = '" + name + "'";
    
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getStuff :" + query);
        }
        else {
            callback(rows);
        }        
    });
}

exports.getBlocks = function(x, y, callback) {
    var query = "select c.* from characters c where c.x = " + x + " and c.y = " + y;
    
    if (verbose)
	console.log(query);

    var connection = database.getConnection();
    connection.query(query, function(err, rows, fields) {
        if (err) {
	    handleError(err, "Error in getBlocks :" + query);
        }
        else {
            callback(rows);
        }        
    });
}

function handleError(err, text) {
     var message;

     message = getCurrentTime() + text;
     console.log(message);
     console.log(err);
};

exports.getTime = function() {
    return getCurrentTime();
};

function getCurrentTime() {
    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + "-"
	+ (currentdate.getMonth()+1) + "-"
	+ currentdate.getDate() + " "
	+ currentdate.getHours() + ":"  
	+ currentdate.getMinutes() + ":" 
	+ currentdate.getSeconds() + " ";
    
    return datetime;
};