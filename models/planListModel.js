/**
 * Created by darhamid on 28/10/15.
 */
exports.getContentTypesByStoreId = function( dbConnection, storeId, callback ) {
   /* dbConnection.query('select cd.*, ct.mct_parent_cnt_type_id from icn_store As st ' +
        'inner join multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
        'inner join catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
        'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
        'WHERE st.st_id = ? GROUP BY cd.cd_id ', [storeId],
        function (err, contentTypes) {
            callback(err, contentTypes);
        }
    );*/
    dbConnection.query('select cd.cd_name as parent_name, mct.mct_parent_cnt_type_id, content.* from catalogue_detail as cd '+
        'inner join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id AND cm_name in("Content Type") '+
        'inner join icn_manage_content_type AS mct on mct.mct_parent_cnt_type_id = cd.cd_id '+
        'inner join catalogue_detail AS content on(mct.mct_cnt_type_id = content.cd_id)',
        function (err, contentTypes) {
            callback(err, contentTypes);
        }
    );
}


exports.getAlaCartPlansByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT plan.* FROM icn_alacart_plan AS plan '+
        'JOIN icn_store AS st ON st.st_id = plan.ap_st_id ' +
        'WHERE st.st_id = ? ', [storeId],
        function (err, alacarts ) {
            callback(err, alacarts );
        }
    );
}

exports.getSubscriptionPlansByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT plan.* FROM icn_sub_plan AS plan '+
        'JOIN icn_store AS st ON st.st_id = plan.sp_st_id ' +
        'WHERE st.st_id = ? ', [storeId],
        function (err, subscriptions ) {
            callback(err, subscriptions );
        }
    );
}

exports.getValuePackPlansByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT plan.* FROM icn_valuepack_plan AS plan '+
        'JOIN icn_store AS st ON st.st_id = plan.vp_st_id ' +
        'WHERE st.st_id = ? ', [storeId],
        function (err, subscriptions ) {
            callback(err, subscriptions );
        }
    );
}

exports.getOfferPlansByStoreId = function( dbConnection, storeId, callback ) {
    dbConnection.query('SELECT plan.* FROM icn_offer_plan AS plan '+
        'JOIN icn_store AS st ON st.st_id = plan.op_st_id ' +
        'WHERE st.st_id = ? ', [storeId],
        function (err, subscriptions ) {
            callback(err, subscriptions );
        }
    );
}

exports.updateSubscriptionPlan = function( dbConnection, active, planId , callback ) {
    dbConnection.query('UPDATE icn_sub_plan set sp_is_active= ? where sp_id =? ', [ active, planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.updateAlacartaPlan = function( dbConnection, active, planId , callback ) {
    dbConnection.query('UPDATE icn_alacart_plan set ap_is_active= ? where ap_id =?', [ active, planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.updateValuePackPlan = function( dbConnection, active, planId , callback ) {
    dbConnection.query('UPDATE icn_valuepack_plan set vp_is_active= ? where vp_id =?', [ active, planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.updateOfferPlan = function( dbConnection, active, planId , callback ) {
    dbConnection.query('UPDATE icn_offer_plan set op_is_active = ? where op_id =?', [ active, planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.deleteSubscriptionPlan = function( dbConnection,  planId , callback ) {
    dbConnection.query('Delete From icn_sub_plan  where sp_id =?', [ planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.deleteAlacartaPlan = function( dbConnection,  planId , callback ) {
    dbConnection.query('Delete From icn_alacart_plan where ap_id =?', [ planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.deleteValuePackPlan = function( dbConnection,  planId , callback ) {
    dbConnection.query('Delete From icn_valuepack_plan where vp_id =?', [ planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}

exports.deleteOfferPlan = function( dbConnection,  planId , callback ) {
    dbConnection.query('Delete From icn_offer_plan where op_id =?', [ planId ],
        function (err, result ) {
            callback(err, result );
        }
    );
}
