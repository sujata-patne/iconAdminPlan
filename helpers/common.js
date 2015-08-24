/**
 * Created by sujata.patne on 17-08-2015.
 */
var mysql = require('../config/db').pool;

getContentTypes = function(callback){
    mysql.getConnection('CMS', function (err, connection_ikon_cms) {
        var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 2', function (err, ContentTypes) {
            if (err) {
                connection_ikon_cms.release();
            }
            else {
                connection_ikon_cms.release();
                //console.log(ContentTypes);
                callback(ContentTypes);
            }
        });
    });
}
getGeoLocations = function(callback){
    mysql.getConnection('CMS', function (err, connection_ikon_cms) {
        var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 3', function (err, countryList) {
            if (err) {
                connection_ikon_cms.release();
            }
            else {
                connection_ikon_cms.release();
                callback(countryList);
            }
        });
    });
}

getDistributionChannel = function(callback){
    mysql.getConnection('CMS', function (err, connection_ikon_cms) {
        var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 4', function (err, DistributionChannel) {
            if (err) {
                connection_ikon_cms.release();
            }
            else {
                connection_ikon_cms.release();
                //console.log(DistributionChannel);
                callback(DistributionChannel);
            }
        });
    });
}

getJetEvents = function(){
    mysql.getConnection('BG', function (err, connection_ikon_bg) {
        var query = connection_ikon_bg.query('select * from billing_ef_bgw_event where ebe_is_valid = 1 and ebe_ai_bgw_id is not null', function (err, JetEvents) {
            if (err) {
                connection_ikon_bg.release();
            }
            else {
                connection_ikon_bg.release();
                //console.log(JetEvents);
                return JetEvents;
            }
        });
    });
}
getOperatorDetails = function(){
    mysql.getConnection('BG', function (err, connection_ikon_bg) {
        var query = connection_ikon_bg.query('SELECT * FROM  (SELECT * FROM  operator_pricepoint_detail where opd_is_active =1 and opd_pp_type ="alacarte")alacart inner join (select * from jetpay_event_detail where ebe_is_valid = 1 and ebe_ai_bgw_id is not null)jetpay on(alacart.opd_jed_id =jetpay.jed_id)', function (err, OpeartorDetail) {
            if (err) {
                connection_ikon_bg.release();
            }
            else {
                connection_ikon_bg.release();
                //console.log(OpeartorDetail);
                return OpeartorDetail;
            }
        });
    });
}