/**
 * Created by darhamid on 29/10/15.
 */
exports.getPlanData = function( dbConnection, planId, callback ) {
    dbConnection.query('SELECT * FROM icn_valuepack_plan where vp_id =? ', [ planId ],
        function ( err, valuePackData ) {
            callback( err, valuePackData );
        }
    );
}
exports.getValuePackPlanByName = function( dbConnection, planName, callback ) {
    dbConnection.query('select alacart.ap_id as plan_id from icn_alacart_plan as alacart where lower(alacart.ap_plan_name) = ? ) '+
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

exports.getValuePackPlanByPlanId = function( dbConnection, planId, callback ) {
    dbConnection.query('select * from icn_valuepack_plan where vp_id = ?', [ planId ],
        function ( err, valuePackData ) {
            callback( err, valuePackData );
        }
    );
}

exports.isPlanMappedPackageExist = function(dbConnection,planId,callback){
    dbConnection.query('select pvs_sp_pkg_id from icn_package_value_pack_site where ISNULL(pvs_crud_isactive) AND pvs_vp_id = ?', [ planId ],
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
exports.updateValuePackPlan = function( dbConnection, data, valuePackPlanId, callback ) {
    dbConnection.query('UPDATE icn_valuepack_plan SET ? WHERE vp_id =?', [ data, valuePackPlanId ],
        function ( err, valuePackData ) {
            callback( err, valuePackData );
        }
    );
}

exports.getLastInsertedValuePackPlanId = function( dbConnection, callback ) {
    dbConnection.query('select max(vp_id) as vp_id from icn_valuepack_plan',
        function ( err, result ) {
            callback( err, result );
        }
    );
}

exports.createValuePackPlan = function( dbConnection, valuePackData, callback ) {
    dbConnection.query('INSERT INTO icn_valuepack_plan SET ?', valuePackData,
        function ( err, result ) {
            callback( err, result );
        }
    );
}