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