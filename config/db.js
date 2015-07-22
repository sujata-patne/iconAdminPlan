/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('mysql');
var config = require('../config')();

var mysql = require('mysql');

//var pool  = mysql.createPool({
//    host: config.db_host,
//    user: config.db_user,
//    password: config.db_pass,
//    database: config.db_name
//});

var poolCluster = mysql.createPoolCluster();

// add configurations
poolCluster.add('PLAN',{
    host: config.db_host_ikon,
    user: config.db_user_ikon,
    password: config.db_pass_ikon,
    database: config.db_name_ikon
}); // anonymous group
//console.log(config);
poolCluster.add('MASTER', {
    host: config.db_host_central,
    user: config.db_user_central,
    password: config.db_pass_central,
    database: config.db_name_central
});

exports.pool = poolCluster;