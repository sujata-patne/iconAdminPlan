/**
 * Created by darhamid on 29/10/15.
 */

exports.getPlanData = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT * FROM icn_sub_plan where sp_id =? ', [ planId ],
        function ( err, subscriptionPlanData ) {
            callback( err, subscriptionPlanData );
        }
    );
}

exports.getAlacartPlanByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT sctp.* ' +
                        'FROM subscription_content_type_plan AS sctp ' +
                        'join icn_sub_plan as sp ON sp.sp_id = sctp.sctp_sp_id ' +
                        'WHERE sp.sp_id = ? ', [ planId ],
        function ( err, AlacartaData ) {
            callback( err, AlacartaData );
        }
    );
}

exports.getContentTypeDataByPlanStoreId = function( dbConnection, planStoreId, callback ) {
    dbConnection.query('SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
        'FROM icn_alacart_plan AS plan ' +
        'JOIN catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
        'JOIN multiselect_metadata_detail AS mmd ON mmd.cmd_group_id = plan.ap_channel_front '+
        'WHERE plan.ap_is_active = 1 AND plan.ap_st_id = ? GROUP BY plan.ap_channel_front ', [ planStoreId ],
        function ( err, contentTypeData ) {
            callback( err, contentTypeData );
        }
    );
}

exports.getSelectedDistributionChannelByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd ' +
        'JOIN icn_sub_plan AS subplan ON mmd.cmd_group_id = subplan.sp_channel_front ' +
        'WHERE subplan.sp_id =? ', [planId],
        function( err, selectedDistributionChannel ) {
            callback( err, selectedDistributionChannel );
        }
    );
}

exports.getSubscriptionPlanByName = function( dbConnection, planName, callback ) {
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

exports.getSubscriptionPlanByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('select * from icn_sub_plan where sp_id = ?', [ planId ],
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

exports.deleteSubscriptionPlanFromSubscriptionContentType = function( dbConnection, subplanId, callback ) {
    dbConnection.query('DELETE FROM  subscription_content_type_plan WHERE sctp_sp_id = ? ', [ subplanId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}
exports.isPlanMappedPackageExist = function(dbConnection,planId,callback){
    dbConnection.query('select pss_sp_pkg_id from icn_package_subscription_site where ISNULL(pss_crud_isactive) AND pss_sp_id = ?', [ planId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.updatePackageDate = function( dbConnection, pkgId, callback ) {
    dbConnection.query('UPDATE icn_store_package SET sp_modified_on = ? ' +
                       'WHERE ISNULL(sp_crud_isactive) AND sp_pkg_id = ? ', [ new Date(), pkgId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}
exports.updateIcnSubscriptionPlan = function( dbConnection, data, subplanId, callback ) {
    dbConnection.query('UPDATE icn_sub_plan SET ?' +
            'WHERE sp_id =?', [ data, subplanId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.getLastInsertedSubscriPlanIdFromMultiSelectMetaDataDetail = function( dbConnection, callback ) {
    dbConnection.query('SELECT MAX(cmd_group_id) AS group_id FROM multiselect_metadata_detail',
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.getLastInsertedSubscriPlanId = function( dbConnection, callback ) {
    dbConnection.query('SELECT MAX(sp_id) AS sp_id FROM icn_sub_plan',
        function ( err, result ) {
            callback( err, result );
        }
    );
}
exports.createIcnSubscriptionPlan = function( dbConnection, subscriptionPlanData, callback ) {
    dbConnection.query('INSERT INTO icn_sub_plan SET ?',subscriptionPlanData,
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.createSubscriptionContentType = function( dbConnection, contentTypePlanData, callback ) {

    dbConnection.query('INSERT INTO subscription_content_type_plan SET ?',contentTypePlanData,
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.getOperatorDetails = function( dbConnection, jetId, operatorId, callback ) {
    dbConnection.query('SELECT * FROM icn_disclaimer WHERE dcl_ref_jed_id = ? AND dcl_partner_id = ?',
        [ jetId, operatorId ],
        function ( err, disclaimer ) {
            callback( err, disclaimer );
        }
    );
}

exports.updateOperatorDetails = function( dbConnection, disclaimerData, partnerId, callback ) {
    dbConnection.query('UPDATE icn_disclaimer SET ? where dcl_id = ?',
        [ disclaimerData, partnerId ],
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.getLastInsertedOperatorId = function( dbConnection, callback ) {
    dbConnection.query('SELECT MAX(dcl_id) AS id FROM icn_disclaimer',
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.createOperatorDetails = function( dbConnection, disclaimerData, callback ) {
    dbConnection.query('INSERT INTO icn_disclaimer SET ?',
        disclaimerData,
        function ( err, result ) {
            callback( err, result );
        }
    );
}