//Make it simple, stupid simple!!!

/* Site specifics */
var HOST = 'localhost';
var USER = 'root';
var PASSWORD = 'aaa123';
var DATABASE = "fr4gments";

exports.getDBHost = function() {
    return HOST;
}

exports.getDBUser = function() {
    return USER;
}

exports.getDBPassword = function() {
    return PASSWORD;
}

exports.getDBName = function() {
    return DATABASE;
}

