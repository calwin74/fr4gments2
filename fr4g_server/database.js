//Make it simple, stupid simple!!!

require("nice-console")(console)
var mysql = require("mysql");
var site = require('./site.js');


//Site specifics
var db_host = site.getDBHost();
var user = site.getDBUser();
var password = site.getDBPassword();
var db_name = site.getDBName();

module.exports.getConnection = function() {
    // Test connection health before returning it to caller.
    if ((module.exports.connection) && (module.exports.connection._socket)
	&& (module.exports.connection._socket.readable)
	&& (module.exports.connection._socket.writable)) {
        return module.exports.connection;
    }
    console.log(((module.exports.connection) ? "UNHEALTHY SQL CONNECTION; RE" : "") + "CONNECTING TO SQL Server on " + db_host);
    

    var connection = mysql.createConnection({
        host     : db_host,
        user     : user,
        password : password,
        database : db_name,
    });
    connection.connect(function(err) {
        if (err) {
            console.log("SQL CONNECT ERROR: " + err);
        } else {
            console.log("SQL CONNECT SUCCESSFUL.");
        }
    });
    connection.on("close", function (err) {
        console.log("SQL CONNECTION CLOSED.");
    });
    connection.on("error", function (err) {
        console.log("SQL CONNECTION ERROR: " + err);
    });
    module.exports.connection = connection;
    return module.exports.connection;
}

// Open a connection automatically at app startup.
module.exports.getConnection();

// If you've saved this file as database.js, then get and use the
// connection as in the following example:
// var database = require(__dirname + "/database");
// var connection = database.getConnection();
// connection.query(query, function(err, results) { ....