/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('mysql');
var config = require('../config')();

var poolCluster = mysql.createPoolCluster();

// add configurations
poolCluster.add('BG',{
    host: config.db_host_ikon_bg,
    user: config.db_user_ikon_bg,
    password: config.db_pass_ikon_bg,
    database: config.db_name_ikon_bg
});
poolCluster.add('CMS', {
    host: config.db_host_ikon_cms,
    user: config.db_user_ikon_cms,
    password: config.db_pass_ikon_cms,
    database: config.db_name_ikon_cms
});
/*poolCluster.add('CENTRAL', {
    host: config.db_host_central,
    user: config.db_user_central,
    password: config.db_pass_central,
    database: config.db_name_central
});*/

exports.pool = poolCluster;