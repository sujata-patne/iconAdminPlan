/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;

exports.getUserData = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection(function(err, connection) {
                    var query = connection.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 18', function (err, Roledata) {
                        // Neat!
                        if (err) {
                            connection.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection.query('SELECT vd_id, vd_name, vd_display_name FROM vendor_detail where vd_is_active = 1', function (err, VendorResult) {
                                // Neat!
                                if (err) {
                                    connection.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var query = connection.query('SELECT * FROM  login_detail', function (err, UserDetail) {
                                        // Neat!
                                        if (err) {
                                            connection.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            var query = connection.query('select * from(select * from login_user_vendor)lv inner join (select vd_id,vd_name from vendor_detail where vd_is_active =1 )v on(v.vd_id = lv.uv_vd_id) inner join (select ld_id from login_detail )l on(l.ld_id = lv.uv_ld_id) ', function (err, UserVendors) {
                                                // Neat!
                                                if (err) {
                                                    connection.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    connection.release();
                                                    res.send({
                                                        UserRole: Roledata,
                                                        VendorData: VendorResult,
                                                        UserData: UserDetail,
                                                        UserVendors: UserVendors,
                                                        RoleUser: req.session.UserRole
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }
}

exports.getEditUserData = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {

                mysql.getConnection(function(err, connection) {
                    var query = connection.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 18', function (err, Roledata) {
                        // Neat!
                        if (err) {
                            connection.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection.query('SELECT vd_id, vd_name, vd_display_name FROM vendor_detail where vd_is_active =1', function (err, VendorResult) {
                                // Neat!
                                if (err) {
                                    connection.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var query = connection.query('SELECT * FROM  login_detail where ld_id = ?', [req.body.ld_id], function (err, UserDetail) {
                                        // Neat!
                                        if (err) {
                                            connection.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            var query = connection.query('SELECT login_user_vendor.uv_id,login_user_vendor.uv_ld_id,login_user_vendor.uv_vd_id,vendor_detail.vd_display_name	,vendor_detail.vd_name FROM login_user_vendor,vendor_detail,login_detail where vendor_detail.vd_is_active =1 and vendor_detail.vd_id =login_user_vendor.uv_vd_id and login_user_vendor.uv_ld_id =? ', [req.body.ld_id], function (err, UserVendors) {
                                                // Neat!
                                                if (err) {
                                                    connection.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    connection.release();
                                                    res.send({
                                                        UserRole: Roledata,
                                                        VendorData: VendorResult,
                                                        UserData: UserDetail,
                                                        UserVendors: UserVendors,
                                                        RoleUser: req.session.UserRole
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }

};

exports.addEditUsers = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection(function(err, connection) {

                    var Ld_id = 1;
                    var query = connection.query('SELECT * FROM login_detail where LOWER(ld_user_id) = ?', [req.body.UserName.toString().toLowerCase()], function (err, result) {
                        if (err) {
                            connection.release();
                            res.status(500).json(err.message);

                        }
                        else {
                            if (!result.length > 0) {
                                var query = connection.query('SELECT *  FROM login_detail where LOWER(ld_email_id) = ?', [req.body.EmailId.toString().toLowerCase()], function (err, result) {
                                    if (err) {
                                        connection.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (!result.length > 0) {
                                            var query = connection.query('SELECT *  FROM login_detail where ld_mobile_no= ?', [req.body.MobileNo], function (err, result) {
                                                if (err) {
                                                    connection.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    if (!result.length > 0) {
                                                        var query = connection.query('SELECT MAX(ld_id) AS id FROM login_detail', function (err, result) {
                                                            if (err) {
                                                                connection.release();
                                                                res.status(500).json(err.message);

                                                            }
                                                            else {
                                                                if (result[0].id != null) {
                                                                    Ld_id = result[0].id + 1;
                                                                }
                                                                var datas = {
                                                                    ld_id: Ld_id,
                                                                    ld_active: 1,
                                                                    ld_user_id: req.body.UserName,
                                                                    ld_user_pwd: 'wakau',
                                                                    ld_user_name: req.body.UserName,
                                                                    ld_display_name: req.body.FullName,
                                                                    ld_email_id: req.body.EmailId,
                                                                    ld_mobile_no: req.body.MobileNo,
                                                                    ld_role: req.body.Role,
                                                                    ld_created_on: new Date(),
                                                                    ld_created_by: 'admin',
                                                                    ld_modified_on: new Date(),
                                                                    ld_modifief_by: 'admin'
                                                                };
                                                                var query = connection.query('INSERT INTO login_detail SET ?', datas, function (err, rightresult) {
                                                                    // Neat!
                                                                    if (err) {
                                                                        connection.release();
                                                                        res.status(500).json(err.message);

                                                                    }
                                                                    else {
                                                                        var vendorlength = req.body.Vendors.length;
                                                                        if (vendorlength > 0) {
                                                                            loop(0);
                                                                            function loop(cnt) {
                                                                                var i = cnt;
                                                                                var query = connection.query('SELECT MAX(uv_id) AS id FROM login_user_vendor', function (err, row) {
                                                                                    if (err) {
                                                                                        connection.release();
                                                                                        res.status(500).json(err.message);
                                                                                    }
                                                                                    else {
                                                                                        var uvid = 1;
                                                                                        if (row[0].id != null) {
                                                                                            uvid = parseInt(row[0].id) + 1;
                                                                                        }
                                                                                        var vendor = {
                                                                                            uv_id: uvid,
                                                                                            uv_ld_id: Ld_id,
                                                                                            uv_vd_id: req.body.Vendors[i],
                                                                                            uv_created_on: new Date(),
                                                                                            uv_created_by: 'admin',
                                                                                            uv_modified_on: new Date(),
                                                                                            uv_modifief_by: 'admin'
                                                                                        }
                                                                                        var query = connection.query('INSERT INTO login_user_vendor SET ?', vendor, function (err, rightresult) {
                                                                                            // Neat!
                                                                                            if (err) {
                                                                                                connection.release();
                                                                                                res.status(500).json(err.message);
                                                                                            }
                                                                                            else {
                                                                                                cnt = cnt + 1;
                                                                                                if (cnt == vendorlength) {
                                                                                                    var query = connection.query('SELECT login_user_vendor.uv_id,login_user_vendor.uv_ld_id,login_user_vendor.uv_vd_id,vendor_detail.vd_display_name	,vendor_detail.vd_name FROM login_user_vendor,vendor_detail where vendor_detail.vd_id =login_user_vendor.uv_vd_id and login_user_vendor.uv_ld_id = ?', [Ld_id], function (err, UserVendors) {
                                                                                                        // Neat!
                                                                                                        if (err) {
                                                                                                            connection.release();
                                                                                                            res.status(500).json(err.message);
                                                                                                        }
                                                                                                        else {
                                                                                                            connection.release();
                                                                                                            res.send({
                                                                                                                Result: 'AddEditUsers',
                                                                                                                UserData: datas,
                                                                                                                UserVendors: UserVendors
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                                else {
                                                                                                    loop(cnt);
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                        else {
                                                                            connection.release();
                                                                            res.send({
                                                                                Result: 'AddEditUsers',
                                                                                UserData: datas,
                                                                                UserVendors: []
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        connection.release();
                                                        res.send({Result: 'MobileNoError'});
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            connection.release();
                                            res.send({Result: 'EmailIdError'});
                                        }
                                    }
                                });
                            }
                            else {
                                connection.release();
                                res.send({Result: 'UserNameError'});
                            }
                        }
                    });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }

}

exports.updateUsers = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection(function(err, connection) {
                    var flag = true;
                    var query = connection.query('SELECT * FROM login_detail where LOWER(ld_user_id) = ?', [req.body.UserName.toString().toLowerCase()], function (err, result) {
                        if (err) {
                            connection.end();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].ld_id != req.body.ld_Id) {
                                    flag = false;
                                }
                            }
                            if (flag) {
                                var query = connection.query('SELECT *  FROM login_detail where LOWER(ld_email_id) = ?', [req.body.EmailId.toString().toLowerCase()], function (err, result) {
                                    if (err) {
                                        connection.end();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            if (result[0].ld_id != req.body.ld_Id) {
                                                flag = false;
                                            }
                                        }
                                        if (flag) {
                                            var query = connection.query('SELECT *  FROM login_detail where ld_mobile_no= ?', [req.body.MobileNo], function (err, result) {
                                                if (err) {
                                                    connection.end();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    if (result.length > 0) {
                                                        if (result[0].ld_id != req.body.ld_Id) {
                                                            flag = false;
                                                        }
                                                    }
                                                    if (flag) {
                                                        for (var i in req.body.DeleteVendor) {
                                                            var query = connection.query('  DELETE FROM login_user_vendor WHERE uv_ld_id= ? and  uv_vd_id =?', [req.body.ld_Id, req.body.DeleteVendor[i]], function (err, row, fields) {
                                                                // Neat!
                                                                if (err) {
                                                                    connection.end();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {

                                                                }
                                                            });
                                                        }
                                                        var query = connection.query('UPDATE login_detail SET ld_user_id=?, ld_user_name=?,ld_display_name=?,ld_email_id=?,ld_mobile_no= ? ,ld_role = ? where ld_id= ?',
                                                            [req.body.UserName, req.body.UserName, req.body.FullName, req.body.EmailId, req.body.MobileNo, req.body.Role, req.body.ld_Id], function (err, result) {
                                                                // Neat!
                                                                if (err) {
                                                                    connection.end();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {

                                                                    var vendorlength = req.body.AddVendor.length;
                                                                    if (vendorlength > 0) {
                                                                        loop(0);
                                                                        function loop(cnt) {
                                                                            var i = cnt;
                                                                            var query = connection.query('SELECT * FROM login_user_vendor where uv_ld_id = ? and uv_vd_id =?', [req.body.ld_Id, req.body.AddVendor[i]], function (err, row) {
                                                                                if (err) {
                                                                                    connection.end();
                                                                                    res.status(500).json(err.message);
                                                                                }
                                                                                else {
                                                                                    if (!row.length > 0) {
                                                                                        var query = connection.query('SELECT MAX(uv_id) AS id FROM login_user_vendor', function (err, row) {
                                                                                            if (err) {
                                                                                                connection.end();
                                                                                                res.status(500).json(err.message);
                                                                                            }
                                                                                            else {
                                                                                                var uvid = 1;
                                                                                                if (row[0].id != null) {
                                                                                                    uvid = parseInt(row[0].id) + 1;
                                                                                                }
                                                                                                var vendor = {
                                                                                                    uv_id: uvid,
                                                                                                    uv_ld_id: req.body.ld_Id,
                                                                                                    uv_vd_id: req.body.AddVendor[i],
                                                                                                    uv_created_on: new Date(),
                                                                                                    uv_created_by: 'admin',
                                                                                                    uv_modified_on: new Date(),
                                                                                                    uv_modifief_by: 'admin'
                                                                                                }
                                                                                                var query = connection.query('INSERT INTO login_user_vendor SET ?', vendor, function (err, rightresult) {
                                                                                                    // Neat!
                                                                                                    if (err) {
                                                                                                        connection.end();
                                                                                                        res.status(500).json(err.message);
                                                                                                    }
                                                                                                    else {
                                                                                                        cnt = cnt + 1;
                                                                                                        if (cnt == vendorlength) {
                                                                                                            connection.end();
                                                                                                            res.send({Result: 'UsersUpdated'});
                                                                                                        }
                                                                                                        else {
                                                                                                            loop(cnt);
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        cnt = cnt + 1;
                                                                                        if (cnt == vendorlength) {
                                                                                            connection.end();
                                                                                            res.send({Result: 'UsersUpdated'});
                                                                                        }
                                                                                        else {
                                                                                            loop(cnt);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                    else {
                                                                        connection.end();
                                                                        res.send({Result: 'UsersUpdated'});
                                                                    }

                                                                }
                                                            });
                                                    }
                                                    else {
                                                        connection.end();
                                                        res.send({Result: 'MobileNoError'});
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            connection.end();
                                            res.send({Result: 'EmailIdError'});
                                        }
                                    }
                                });
                            }
                            else {
                                connection.end();
                                res.send({Result: 'UserNameError'});
                            }
                        }
                    });
                });
           }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }
}

exports.blockUser = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection(function(err, connection) {
                    var query = connection.query('UPDATE login_detail SET ld_active= ? where ld_id= ?',
                        [0, req.body.ld_Id], function (err, result) {
                            // Neat!
                            if (err) {
                                connection.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection.release();
                                res.send({Result: 'BlockUser'});
                            }
                        });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }
}

exports.unBlockUser = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection(function(err, connection) {
                    var query = connection.query('UPDATE login_detail SET ld_active= ? where ld_id= ?',
                        [1, req.body.ld_Id], function (err, result) {
                            // Neat!
                            if (err) {
                                connection.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection.release();
                                res.send({Result: 'UnBlockUser'});
                            }
                        });
                });
            }
            else {
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection.release();
        res.status(500).json(err.message);
    }

}