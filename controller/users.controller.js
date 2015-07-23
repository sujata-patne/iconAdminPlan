/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var nodemailer  = require('nodemailer');
exports.getUserData = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS',function(err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 18', function (err, Roledata) {
                        // Neat!
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            mysql.getConnection('CENTRAL', function (err, connection_central) {
                                var query = connection_central.query('SELECT vd_id, vd_name, vd_display_name FROM vendor_detail', function (err, VendorResult) {
                                    // Neat!
                                    if (err) {
                                        connection_ikon_cms.release();
                                        connection_central.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_central.query('SELECT * FROM  login_detail', function (err, UserDetail) {
                                            // Neat!
                                            if (err) {
                                                connection_ikon_cms.release();
                                                connection_central.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_central.query('select * from(select * from login_user_vendor)lv inner join (select vd_id,vd_name from vendor_detail where vd_is_active =1 )v on(v.vd_id = lv.uv_vd_id) inner join (select ld_id from login_detail )l on(l.ld_id = lv.uv_ld_id) ', function (err, UserVendors) {
                                                    // Neat!
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        connection_central.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        connection_ikon_cms.release();
                                                        connection_central.release();
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
        connection_ikon_cms.release();
        connection_central.release();
        res.status(500).json(err.message);
    }
}

exports.getEditUserData = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS',function(err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 18', function (err, Roledata) {
                        // Neat!
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            mysql.getConnection('CENTRAL', function (err, connection_central) {
                                var query = connection_central.query('SELECT vd_id, vd_name, vd_display_name FROM vendor_detail', function (err, VendorResult) {
                                    // Neat!
                                    if (err) {
                                        connection_ikon_cms.release();
                                        connection_central.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_central.query('SELECT * FROM  login_detail where ld_id = ?', [req.body.ld_id], function (err, UserDetail) {
                                            // Neat!
                                            if (err) {
                                                connection_ikon_cms.release();
                                                connection_central.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_central.query('SELECT login_user_vendor.uv_id,login_user_vendor.uv_ld_id,login_user_vendor.uv_vd_id,vendor_detail.vd_display_name	,vendor_detail.vd_name FROM login_user_vendor,vendor_detail,login_detail where vendor_detail.vd_is_active =1 and vendor_detail.vd_id =login_user_vendor.uv_vd_id and login_user_vendor.uv_ld_id =? ', [req.body.ld_id], function (err, UserVendors) {
                                                    // Neat!
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        connection_central.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        connection_ikon_cms.release();
                                                        connection_central.release();
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
        connection_ikon_cms.release();
        connection_central.release();
        res.status(500).json(err.message);
    }
};

exports.addEditUsers = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CENTRAL', function (err, connection_central) {
                    var Ld_id = 1;
                    var query = connection_central.query('SELECT * FROM login_detail where LOWER(ld_user_id) = ?', [req.body.UserName.toString().toLowerCase()], function (err, result) {
                        if (err) {
                            connection_central.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (!result.length > 0) {
                                var query = connection_central.query('SELECT *  FROM login_detail where LOWER(ld_email_id) = ?', [req.body.EmailId.toString().toLowerCase()], function (err, result) {
                                    if (err) {
                                        connection_central.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (!result.length > 0) {
                                            var query = connection_central.query('SELECT *  FROM login_detail where ld_mobile_no= ?', [req.body.MobileNo], function (err, result) {
                                                if (err) {
                                                    connection_central.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {

                                                    if (!result.length > 0) {
                                                        var query = connection_central.query('SELECT MAX(ld_id) AS id FROM login_detail', function (err, result) {
                                                            if (err) {
                                                                connection_central.release();
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
                                                                    ld_created_by: req.session.UserName,
                                                                    ld_modified_on: new Date(),
                                                                    ld_modifief_by: req.session.UserName
                                                                };

                                                                var query = connection_central.query('INSERT INTO login_detail SET ?', datas, function (err, rightresult) {
                                                                    // Neat!
                                                                    if (err) {
                                                                        connection_central.release();
                                                                        res.status(500).json(err.message);

                                                                    }
                                                                    else {
                                                                            var smtpTransport = nodemailer.createTransport({
                                                                                service: "Gmail",
                                                                                auth: {
                                                                                    user: "jetsynthesis@gmail.com",
                                                                                    pass: "j3tsynthes1s"
                                                                                }
                                                                            });
                                                                            var Message = "";
                                                                            Message += "<table style=\"border-collapse:collapse\" width=\"510\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tbody><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr>";
                                                                            Message += " <tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:22px;font-weight: bold;line-height:24px;text-align:left\">You have requested a New User from Icon";
                                                                            Message += " </td></tr><tr><td></td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Username : " + req.body.UserName;
                                                                            Message += " </td></tr><tr><td style=\"border-collapse:collapse;color:#2d2a26;font-family:helvetica,arial,sans-serif;font-size:15px;font-weight: bold;line-height:24px;text-align:left\">Your Password : " + "wakau";
                                                                            Message += " </td></tr>";
                                                                            Message += " <tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"15\">&nbsp;</td></tr> <tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">";
                                                                            Message += "<a style=\"color:#3d849b;font-weight:bold;text-decoration:none\" href=\"http://192.168.1.21:3040/accountlogin \" target=\"_blank\"><span style=\"color:#3d849b;text-decoration:none\">Click here to login</span></a> and start using Icon. If you have not made any request then you may ignore this email.";
                                                                            Message += "  </td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">If you have any concerns please contact us.</td></tr><tr><td style=\"border-collapse:collapse;font-size:1px;line-height:1px\" width=\"100%\" height=\"25\">&nbsp;</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Thanks,</td></tr><tr><td style=\"border-collapse:collapse;color:#5c5551;font-family:helvetica,arial,sans-serif;font-size:15px;line-height:24px;text-align:left\">Icon Team</td></tr></tbody></table>";
                                                                            var mailOptions = {
                                                                                to: req.body.EmailId,
                                                                                subject: 'New User',
                                                                                html: Message
                                                                            }
                                                                            smtpTransport.sendMail(mailOptions, function (error, response) {
                                                                                if (error) {
                                                                                    connection_central.release();
                                                                                    res.send({
                                                                                        Result: 'AddEditUsers',
                                                                                        UserData: datas,
                                                                                        UserVendors: []
                                                                                    });
                                                                                    res.end("error");
                                                                                } else {
                                                                                    var query = connection_central.query('SELECT MAX(ald_id) AS id FROM admin_log_detail', function (err, result) {
                                                                                        if (err) {
                                                                                            connection_central.release();
                                                                                            res.status(500).json(err.message);
                                                                                        }
                                                                                        else {
                                                                                            if (result[0].id != null) {
                                                                                                New_ald_id = result[0].id + 1;
                                                                                            }
                                                                                            var data = {
                                                                                                ald_id: New_ald_id,
                                                                                                ald_message: req.body.UserName + " as " + req.body.Role + " created successfully, UserId is " + Ld_id + " and Temporary password sent to " + req.body.EmailId,
                                                                                                ald_action: "New " + req.body.Role + " Creation",
                                                                                                ald_created_on: new Date(),
                                                                                                ald_created_by: req.session.UserName,
                                                                                                ald_modified_on: new Date(),
                                                                                                ald_modified_by: req.session.UserName
                                                                                            };
                                                                                            var query = connection_central.query('INSERT INTO admin_log_detail SET ?', data, function (err, result) {
                                                                                                if (err) {
                                                                                                    connection_central.release();
                                                                                                    res.status(500).json(err.message);
                                                                                                }
                                                                                                else {
                                                                                                    connection_central.release();
                                                                                                    res.send({
                                                                                                        Result: 'AddEditUsers',
                                                                                                        UserData: datas,
                                                                                                        UserVendors: []
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        connection_central.release();
                                                        res.send({Result: 'MobileNoError'});
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            connection_central.release();
                                            res.send({Result: 'EmailIdError'});
                                        }
                                    }
                                });
                            }
                            else {
                                connection_central.release();
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
        connection_central.release();
        res.status(500).json(err.message);
    }
}

exports.updateUsers = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CENTRAL', function (err, connection_central) {
                    var flag = true;
                    var query = connection_central.query('SELECT * FROM login_detail where LOWER(ld_user_id) = ?', [req.body.UserName.toString().toLowerCase()], function (err, result) {
                        if (err) {
                            connection_central.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].ld_id != req.body.ld_Id) {
                                    flag = false;
                                }
                            }
                            if (flag) {
                                var query = connection_central.query('SELECT *  FROM login_detail where LOWER(ld_email_id) = ?', [req.body.EmailId.toString().toLowerCase()], function (err, result) {
                                    if (err) {
                                        connection_central.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            if (result[0].ld_id != req.body.ld_Id) {
                                                flag = false;
                                            }
                                        }
                                        if (flag) {
                                            var query = connection_central.query('SELECT *  FROM login_detail where ld_mobile_no= ?', [req.body.MobileNo], function (err, result) {
                                                if (err) {
                                                    connection_central.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    var userData = result;
                                                    if (result.length > 0) {
                                                        if (result[0].ld_id != req.body.ld_Id) {
                                                            flag = false;
                                                        }
                                                    }
                                                    if (flag) {
                                                        var query = connection_central.query('UPDATE login_detail SET ld_user_id=?, ld_user_name=?,ld_display_name=?,ld_email_id=?,ld_mobile_no= ? ,ld_role = ?,ld_modified_on= ?,ld_modifief_by=? where ld_id= ?',
                                                            [req.body.UserName, req.body.UserName, req.body.FullName, req.body.EmailId, req.body.MobileNo, req.body.Role, new Date(), req.session.UserName, req.body.ld_Id], function (err, result) {
                                                            // Neat!
                                                            if (err) {
                                                                connection_central.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                var query = connection_central.query('SELECT MAX(ald_id) AS id FROM admin_log_detail', function (err, result) {
                                                                    if (err) {
                                                                        connection_central.release();
                                                                        res.status(500).json(err.message);
                                                                    }
                                                                    else {
                                                                        if (result[0].id != null) {
                                                                            New_ald_id = result[0].id + 1;
                                                                        }
                                                                        var data = {
                                                                            ald_id: New_ald_id,
                                                                            ald_message: req.body.UserName + " user updated successfully and UserId is " + req.body.ld_Id + ". ",
                                                                            ald_action: "Update User",
                                                                            ald_created_on: new Date(),
                                                                            ald_created_by: req.session.UserName,
                                                                            ald_modified_on: new Date(),
                                                                            ald_modified_by: req.session.UserName
                                                                        };
                                                                        var query = connection_central.query('INSERT INTO admin_log_detail SET ?', data, function (err, result) {
                                                                            if (err) {
                                                                                connection_central.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                connection_central.release();
                                                                                res.send({Result: 'UsersUpdated'});
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        connection_central.release();
                                                        res.send({Result: 'MobileNoError'});
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            connection_central.release();
                                            res.send({Result: 'EmailIdError'});
                                        }
                                    }
                                });
                            }
                            else {
                                connection_central.release();
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
        connection_central.release();
        res.status(500).json(err.message);
    }
}

exports.blockUser = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CENTRAL', function (err, connection_central) {
                    var query = connection_central.query('UPDATE login_detail SET ld_active= ? where ld_id= ?',
                        [0, req.body.ld_Id], function (err, result) {
                            // Neat!
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
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
        connection_central.release();
        res.status(500).json(err.message);
    }
}

exports.unBlockUser = function (req, res) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CENTRAL', function (err, connection_central) {
                    var query = connection_central.query('UPDATE login_detail SET ld_active= ? where ld_id= ?',
                        [1, req.body.ld_Id], function (err, result) {
                            // Neat!
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
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
        connection_central.release();
        res.status(500).json(err.message);
    }
}