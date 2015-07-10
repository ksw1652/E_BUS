/**
 * Created by airnold on 15. 4. 22..
 */


var con = require('./mysql_config');
var mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 400,
    host     : con.database.host,
    user     : con.database.user,
    password : con.database.password,
    database : con.database.dbname
});

module.exports = pool;