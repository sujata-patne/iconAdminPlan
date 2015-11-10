/**
 * Created by darhamid on 28/10/15.
 */
exports.getSelectedPaymentTypeByStoreId = function( dbConnection, db_name_ikon_cms ,db_name_ikon_bg, Plan_StoreId, callback ) {
    dbConnection.query('select mlm.* from '+db_name_ikon_cms+'.icn_store as st ' +
        'inner join '+db_name_ikon_cms+'.multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_payment_type) ' +
        //'inner join '+db_name_ikon_bg+'.billing_enum_data AS bed ON bed.en_id = mlm.cmd_entity_detail AND bed.en_type in ("payment_type") ' +
        'WHERE st.st_id =? ORDER BY mlm.cmd_entity_detail ', [Plan_StoreId],
        function (err, selectedPaymentType) {
            callback( err, selectedPaymentType );
        }
    );
}

exports.getUserDetails = function( dbConnection, userName, password, callback ) {
    dbConnection.query('SELECT * FROM icn_login_detail AS user ' +
                        'JOIN icn_store_user AS store_user ON user.ld_id = store_user.su_ld_id ' +
                        'where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ', [userName, password],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}

exports.getUserDetailsByUserIdByEmail = function( dbConnection, userId, emailId, callback ) {
    dbConnection.query('SELECT * FROM icn_login_detail where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', [userId, emailId],
        function (err, row, fields) {
            callback( err, row, fields );
        }
    );
}

exports.updateIcnUserDetails = function( dbConnection, newPassword, updatedOn, userId, callback ) {
    dbConnection.query('UPDATE icn_login_detail SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', [newPassword, updatedOn, userId],
        function (err, result ) {
            callback( err, result );
        }
    );
}