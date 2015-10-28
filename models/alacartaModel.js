/**
 * Created by darhamid on 28/10/15.
 */
var config = require('../config')();

exports.getPlanData = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT * FROM icn_alacart_plan where ap_id =? ', [planId],
        function ( err, alacartData ) {
            callback(err, alacartData )
        }
    );
}

exports.getDeliveryTypes = function( dbConnection, callback ) {
   dbConnection.query('select cd.* from catalogue_detail as cd ' +
                        'join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Delivery Type")',
       function( err,deliveryTypes ) {
            callback( err, deliveryTypes );
       }
   );
}

exports.getDurationOptions = function( dbConnection, callback ) {
    dbConnection.query('select cd.* from catalogue_detail as cd ' +
                        'join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")',
        function( err, durationOptions ) {
            callback( err, durationOptions );
        }
    );
}

exports.getGeoLocationsByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT DISTINCT(`cd_id`) as geoID, `cd_name` as geoName FROM `multiselect_metadata_detail` AS m ' +
                        'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ' +
                        'LEFT JOIN catalogue_detail AS cd ON cd.cd_id = m.cmd_entity_detail ' +
                        'LEFT JOIN catalogue_master AS cm ON cm.cm_id = cd.cd_cm_id ' +
                        'WHERE cm.cm_name IN ("global_country_list") and s.st_id = ? ', [storeId],
        function ( err, geoLocations ) {
            callback( err, geoLocations )
        }
    );
}

exports.getDistributionChannelsByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('select cd.* FROM catalogue_detail as cd ' +
                        'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                        'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                        'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                        'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [storeId],
        function( err, distributionChannel ) {
            callback( err, distributionChannel );
        }
    );
}

exports.getJetEventsByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT event.*, master.tmi_content_type as contentType, partner.partner_cty_id as country FROM billing_ef_bgw_event as event '+
                        'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid  '+
                        'JOIN billing_event_family AS family ON family.ef_id = event.ebe_ef_id  '+
                        'JOIN billing_telco_master_event_index AS master ON family.ef_tmi_id = master.tmi_id  '+
                        'JOIN billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                        'JOIN billing_enum_data AS enum ON enum.en_id = master.tmi_pp_classification '+
                        'WHERE ' +
                            'enum.en_type = "payment_type" AND ' +
                            'enum.en_description = "One Time" AND ' +
                            'event.ebe_is_valid = 1 AND ' +
                            'event.ebe_ai_bgw_id is not null ' +
                            'AND info.ai_app_id = ? ' +
                        'GROUP BY ' +
                            'master.tmi_parent_id', [storeId],
        function( err, jetEvents ) {
            callback( err, jetEvents  );
        }
    );
}

exports.getOperatorDetail = function( dbConnection, db_name_ikon_bg, db_name_ikon_cms, callback ) {
    dbConnection.query('SELECT dis.dcl_id,dis.dcl_disclaimer, bge.ebe_ef_id, master.tmi_id,master.tmi_amt,master.tmi_name, partner.partner_name, partner.partner_id, partner.partner_cty_id as country ' +
        'FROM '+config.db_name_ikon_bg+'.billing_ef_bgw_event as bge JOIN '+config.db_name_ikon_bg+'.billing_event_family AS bef ON bef.ef_id = bge.ebe_ef_id ' +
        'JOIN '+config.db_name_ikon_bg+'.billing_telco_master_event_index AS master ON bef.ef_tmi_id = master.tmi_id ' +
        'JOIN '+config.db_name_ikon_bg+'.billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
        'LEFT JOIN '+config.db_name_ikon_cms+'.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = bge.ebe_ef_id AND dis.dcl_partner_id = master.tmi_partner_id ' +
        'GROUP BY master.tmi_parent_id ',
        function ( err, operatorDetails ) {
            callback( err, operatorDetails );
        }
    );
}

exports.getSelectedDistributionChannelByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd ' +
        'JOIN icn_alacart_plan AS alplan ON mmd.cmd_group_id = alplan.ap_channel_front ' +
        'WHERE alplan.ap_id =? ', [planId],
        function( err, selectedDistributionChannel ) {
            callback( err, selectedDistributionChannel );
        }
    );
}

exports.getAlacartPlanByName = function( dbConnection, planName, callback ) {
    dbConnection.query('(select alacart.ap_id as plan_id from icn_alacart_plan as alacart where lower(alacart.ap_plan_name) = ? ) '+
                        ' UNION ' +
                            '(select subscription.sp_id as plan_id from icn_sub_plan AS subscription where lower(subscription.sp_plan_name) = ? ) ' +
                        ' UNION ' +
                            '(select valupack.vp_id as plan_id from icn_valuepack_plan as valupack where lower(valupack.vp_plan_name) = ? ) ',
            [ planName, planName, planName ],
        function (err, result) {
            callback( err, result );
        }
    );
}

exports.getAlacartPlanByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('select * from icn_alacart_plan where ap_id = ?', [ planId ],
        function ( err, alacartPlan ) {
            callback( err, alacartPlan );
        }
    );
}

exports.deleteDistributionChannel = function( dbConnection, channelId, callback ) {
    dbConnection.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [ channelId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.updateIcnAlacartPlan = function( dbConnection, data, planId, callback ) {
    dbConnection.query('UPDATE icn_alacart_plan SET ? where ap_id =?', [ data, planId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.getLastInsertedAlacartPlanIdFromMultiSelectMetaDataDetail = function( dbConnection, callback ) {
    dbConnection.query('SELECT MAX(cmd_group_id) AS group_id FROM multiselect_metadata_detail',
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.selectLasInsertedSubscriptionPlanIdFromAlacartPlan = function( dbConnection, callback ) {
    dbConnection.query('select max(ap_id) as ap_id from icn_alacart_plan',
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.createIcnAlacartPlan = function( dbConnection, alacartData, callback ) {
    dbConnection.query('INSERT INTO icn_alacart_plan SET ?', alacartData,
        function (err, result) {
            callback(err, result);
        }
    );
}