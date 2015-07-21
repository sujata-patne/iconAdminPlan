/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('mysql');
var config = require('../config')();

var mysql = require('mysql');

var pool  = mysql.createPool({
    host: config.db_host,
    user: config.db_user,
    password: config.db_pass,
    database: config.db_name
});

exports.pool = pool;
//console.log(config.db_host)
//console.log(config.db_user)
//console.log(config.db_name)
//module.exports = function(){
//    var connection = mysql.createConnection({
//        host: config.db_host,
//        user: config.db_user,
//        password: config.db_pass,
//        database: config.db_name
//    });
//
//    connection.connect(function (err) {
//        if(!err) {
//            console.log("Database is connected ... \n\n");
//        } else {
//            console.log("Error connecting database ... \n\n");
//        }
//    });
//}