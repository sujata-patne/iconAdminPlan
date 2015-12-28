/**
 * Created by sujata.patne on 22-12-2015.
 */
exports.isPlanMappedPackageExist = function(dbConnection,planId,callback){
    dbConnection.query('select paos_sp_pkg_id from icn_package_alacart_offer_site where ISNULL(paos_crud_isactive) AND paos_op_id = ?', [ planId ],
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