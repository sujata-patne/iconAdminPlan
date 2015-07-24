/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('../config/db').pool;
var nodemailer = require('nodemailer');

exports.pages = function (req, res, next) {
    var role;

    var pagesjson = [
        //{ 'pagename': 'Dashboard', 'href': 'dashboard','id':'dashboard', 'class': 'fa fa-dashboard', 'submenuflag': '0', 'sub': [] },
        //{ 'pagename': 'Add/Edit User', 'href': 'users','id':'addedituser', 'class': 'fa fa-user', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Plan List', 'href': 'plan-list', 'id': 'plan-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'A La Cart Plan', 'href': 'a-la-cart', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Subscriptions Plan', 'href': 'subscriptions', 'id': 'subscriptions', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Value Pack Plan', 'href': 'value-pack', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
        { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
    ];

    if (req.session) {
        if (req.session.UserName) {
            role = req.session.UserRole;
            var pageData = getPages(role);
            res.render('index', { title: 'Express', username: req.session.UserName, Pages: pageData, userrole: req.session.UserRole });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    else {
        res.redirect('/accountlogin');
    }
}

exports.login = function (req, res, next) {
    req.session = null;
    res.render('account-login', { error: '' });
}

exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CENTRAL', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM login_detail where BINARY ld_user_id= ? and BINARY ld_user_pwd = ? ', [req.body.username, req.body.password], function (err, row, fields) {
                if (err) {
                    res.render('account-login', { error: 'Error in database connection.' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            var session = req.session;
                            session.UserId = row[0].ld_id;
                            session.UserRole = row[0].ld_role;
                            session.UserName = req.body.username;
                            session.Password = req.body.password;
                            connection_central.release();
                            res.redirect('/');
                        }
                        else {
                            connection_central.release();
                            res.render('account-login', { error: 'Your account has been disable.' });
                        }
                    } else {
                        connection_central.release();
                        res.render('account-login', { error: 'Invalid Username / Password.' });
                    }
                }
            });
        })
    }
    catch (error) {
        res.render('account-login', { error: 'Error in database connection.' });
    }
}

function getPages(role) {

    if (role == "Super Admin") {
        var pagesjson = [
            //{ 'pagename': 'Add/Edit User', 'href': 'users','id':'addedituser', 'class': 'fa fa-user', 'submenuflag': '0', 'sub': [] },
             { 'pagename': 'Plan List', 'href': 'plan-list', 'id': 'plan-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'A La Cart Plan', 'href': 'a-la-cart', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Subscriptions Plan', 'href': 'subscriptions', 'id': 'subscriptions', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Value Pack Plan', 'href': 'value-pack', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];

        return pagesjson;
    }
    else if (role == "Content Mgr.") {
        var pagesjson = [
             { 'pagename': 'Plan List', 'href': 'plan-list', 'id': 'plan-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'A La Cart Plan', 'href': 'a-la-cart', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Subscriptions Plan', 'href': 'subscriptions', 'id': 'subscriptions', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Value Pack Plan', 'href': 'value-pack', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];
        return pagesjson;
    }
    else if (role == "Moderator") {
        var pagesjson = [
             { 'pagename': 'Plan List', 'href': 'plan-list', 'id': 'plan-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'A La Cart Plan', 'href': 'a-la-cart', 'id': 'a-la-cart', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Subscriptions Plan', 'href': 'subscriptions', 'id': 'subscriptions', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Value Pack Plan', 'href': 'value-pack', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Change Password', 'href': '#change-password', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        ];
        return pagesjson;
    }
}

exports.GetDashBoardData = function (req, res) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            if (req.session) {
                if (req.session.UserName) {
                    if (req.session.UserRole == "Content Mgr.") {
                        var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id IN (1,2)', function (err, FileStatus) {
                            if (err) {
                                console.log(err.message);
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                mysql.getConnection('CENTRAL', function (err, connection_central) {
                                    var query = connection_central.query('select * from (select * from vendor_detail where vd_is_active =1) vd inner join (select * from vendor_profile)vp on (vd.vd_id =vp.vp_vendor_id) inner join (select * from login_user_vendor)uv on (vd.vd_id =uv.uv_vd_id and uv_ld_id =?)', [req.session.UserId], function (err, Vendors) {
                                        if (err) {
                                            console.log(err.message);
                                            connection_central.release();
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            if (Vendors.length > 0) {
                                                var VendorArray = [];
                                                for (var i in Vendors) {
                                                    VendorArray.push(Vendors[i].vd_id);
                                                }
                                                var query = connection_ikon_cms.query('SELECT * FROM content_metadata WHERE cm_property_id is null  and cm_is_active =1 and cm_vendor in(' + VendorArray.toString() + ')', function (err, Property) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        connection_central.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        var PropertyArray = [];
                                                        for (var i in Property) {
                                                            PropertyArray.push(Property[i].cm_id);
                                                        }
                                                        if (PropertyArray.length > 0) {
                                                            var query = connection_ikon_cms.query('SELECT cm_state,count(*) as count FROM content_metadata WHERE cm_property_id is not null  and cm_is_active =1 and cm_vendor in(' + VendorArray.toString() + ') and cm_property_id in(' + PropertyArray.toString() + ') group by cm_state', function (err, StatusFiles) {
                                                                if (err) {
                                                                    console.log(err.message);
                                                                    connection_ikon_cms.release();
                                                                    connection_central.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    var query = connection_ikon_cms.query('SELECT * FROM (SELECT cm_vendor, cm_content_type, COUNT( * ) as count FROM  `content_metadata` WHERE  `cm_property_id` IS NOT NULL and cm_is_active=1 and cm_vendor in(' + VendorArray.toString() + ') AND cm_state =4 GROUP BY  `cm_vendor` ,  `cm_content_type`)cm LEFT OUTER JOIN (SELECT vd_id,vd_name FROM vendor_detail where vd_is_active =1)vendor ON ( cm.cm_vendor = vendor.vd_id )', function (err, VendorFiles) {
                                                                        if (err) {
                                                                            console.log(err.message);
                                                                            connection_ikon_cms.release();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            connection_ikon_cms.release();
                                                                            res.send({
                                                                                FileStatus: FileStatus,
                                                                                StatusFiles: StatusFiles,
                                                                                VendorFiles: VendorFiles,
                                                                                Vendors: Vendors
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.send({
                                                                FileStatus: FileStatus,
                                                                StatusFiles: [],
                                                                VendorFiles: [],
                                                                Vendors: Vendors
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                res.send({
                                                    FileStatus: FileStatus,
                                                    StatusFiles: [],
                                                    VendorFiles: [],
                                                    Vendors: []
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id IN (1,2)', function (err, FileStatus) {
                            if (err) {
                                console.log(err.message);
                                connection_ikon_cms.release();
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                var query = connection_central.query('SELECT * FROM  vendor_detail where vd_is_active =1', function (err, Vendors) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_central.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (Vendors.length > 0) {
                                            var VendorArray = [];
                                            for (var i in Vendors) {
                                                VendorArray.push(Vendors[i].vd_id);
                                            }
                                            var query = connection_ikon_cms.query('SELECT * FROM content_metadata WHERE cm_property_id is null  and cm_is_active =1 and cm_vendor in(' + VendorArray.toString() + ')', function (err, Property) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {
                                                    var PropertyArray = [];
                                                    for (var i in Property) {
                                                        PropertyArray.push(Property[i].cm_id);
                                                    }
                                                    if (PropertyArray.length > 0) {
                                                        var query = connection_ikon_cms.query('SELECT cm_state,count(*) as count FROM content_metadata WHERE cm_property_id is not null  and cm_is_active =1 and cm_vendor in(' + VendorArray.toString() + ') and cm_property_id in(' + PropertyArray.toString() + ') group by cm_state', function (err, StatusFiles) {
                                                            if (err) {
                                                                console.log(err.message);
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                var query = connection_ikon_cms.query('SELECT * FROM (SELECT cm_vendor, cm_content_type, COUNT( * ) as count FROM  `content_metadata` WHERE  `cm_property_id` IS NOT NULL and cm_is_active=1 and cm_vendor in(' + VendorArray.toString() + ') AND cm_state =4 GROUP BY  `cm_vendor` ,  `cm_content_type`)cm LEFT OUTER JOIN (SELECT vd_id,vd_name FROM vendor_detail where vd_is_active =1)vendor ON ( cm.cm_vendor = vendor.vd_id )', function (err, VendorFiles) {
                                                                    if (err) {
                                                                        console.log(err.message);
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    }
                                                                    else {
                                                                        connection_ikon_cms.release();
                                                                        res.send({
                                                                            FileStatus: FileStatus,
                                                                            StatusFiles: StatusFiles,
                                                                            VendorFiles: VendorFiles,
                                                                            Vendors: Vendors
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.send({
                                                            FileStatus: FileStatus,
                                                            StatusFiles: [],
                                                            VendorFiles: [],
                                                            Vendors: Vendors
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            res.send({
                                                FileStatus: FileStatus,
                                                StatusFiles: [],
                                                VendorFiles: [],
                                                Vendors: []
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                else {
                    res.redirect('/accountlogin');
                }
            }
            else {
                res.redirect('/accountlogin');
            }
        })
    }
    catch (err) {
        connection_ikon_cms.release();
        connection_central.release();
        console.log(err.message);
        res.status(500).json(err.message);
    }
};

exports.viewForgotPassword = function (req, res, next) {
    req.session = null;
    res.render('account-forgot', { error: '', msg: '' });
}

exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CENTRAL', function (err, connection_central) {
            var query = connection_central.query('SELECT * FROM login_detail where BINARY ld_user_id= ? and BINARY ld_email_id = ? ', [req.body.userid, req.body.emailid], function (err, row, fields) {
                if (err) {
                    res.render('account-forgot', { error: 'Error in database connection.', msg: '' });
                }
                else {
                    if (row.length > 0) {

                        var smtpTransport = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "jetsynthesis@gmail.com",
                                pass: "j3tsynthes1s"
                            }
                        });
                        var mailOptions = {
                            to: 'sujata.patne@jetsynthesys.com',
                            subject: 'Forgot Password',
                            html: "<p>Hi, " + row[0].ld_user_id + " <br />This is your password: " + row[0].ld_user_pwd + "</p>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                res.end("error");
                            } else {
                                connection_central.release();
                                res.render('account-forgot', { error: '', msg: 'Please check your mail. Password successfully sent to your email' });
                                res.end("sent");
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.render('account-forgot', { error: 'Invalid UserId / EmailId.', msg: '' });
                    }
                }
            });
        });
    }
    catch (err) {
        connection_central.end();
        res.render('account-forgot', { error: 'Error in database connection.' });
    }
}

exports.viewChangePassword = function (req, res, next) {
    req.session = null;
    res.render('account-changepassword', { error: '' });
}

exports.changePassword = function (req, res) {
    console.log(req.body.newpassword)
    try {
        if (req.session) {
            if (req.session.UserName) {
                var session = req.session;
                mysql.getConnection('CENTRAL', function (err, connection_central) {
                    if (req.body.oldpassword == session.Password) {
                        var query = connection_central.query('UPDATE login_detail SET ld_user_pwd=?, ld_modified_on=? WHERE ld_id=?', [req.body.newpassword, new Date(), session.UserId], function (err, result) {
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_central.release();
                                session.Password = req.body.newpassword;
                                res.send({ Result: 'Success' });
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.send({ Result: 'OldpasswordError' });
                    }
                })
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
        connection_central.end();
        res.status(500).json(err.message);
    }
};
