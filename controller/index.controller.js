/**
 * Created by sujata.patne on 7/7/2015.
 */

var mysql = require('../config/db').pool;
var config = require('../config')();
var nodemailer = require('nodemailer');
var userManager = require('../models/userModel');
var crypto = require('crypto');
algorithm = 'aes-256-ctr', //Algorithm used for encrytion
    password = 'd6F3Efeq'; //Encryption password

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


var _ = require('underscore');

function getDate(val) {
    var d = new Date(val);
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var selectdate = Pad("0", dt, 2) + '/' + Pad("0", month, 2)  + '/' + year;
    return selectdate;
}

function getTime(val) {
    var d = new Date(val);
    var minite = d.getMinutes();
    var hour = d.getHours();
    var second = d.getSeconds();
    var selectdate = Pad("0", hour, 2) + ':' + Pad("0", minite, 2) + ':' + Pad("0", second, 2);
    return selectdate;
}
function Pad(padString, value, length) {
    var str = value.toString();
    while (str.length < length)
        str = padString + str;

    return str;
}

/**
 * @function pages
 * @param req
 * @param res
 * @param next
 * @description get list of menus with related pages
 */
exports.pages = function (req, res, next) {
    var role;
    var paymentTypes = [];
    if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId) {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
           // mysql.getConnection('BG', function (err, connection_ikon_bg) {
            userManager.getSelectedPaymentTypeByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, selectedPaymentType) {
                role = req.session.Plan_UserRole;
                paymentTypes = req.cookies.paymentTypes;
                if(paymentTypes !== undefined && paymentTypes !== '' && paymentTypes.length > 0) {
                    var pricePointTypes = [];
                    _.each(JSON.parse(paymentTypes), function (paymentType1) {
                        _.filter(selectedPaymentType, function (paymentType2) {
                            if(paymentType2.cmd_entity_detail == paymentType1.en_id){
                                pricePointTypes.push(paymentType1);
                            }
                        });
                    })
                }else{
                   var pricePointTypes = paymentTypes;
                }
                //partner_payment_type
                var pageData = getPages(role,pricePointTypes);
                res.render('index', { title: 'Express', username: req.session.Plan_FullName, Pages: pageData, userrole: req.session.Plan_UserType, lastlogin: " " + getDate(req.session.Plan_lastlogin) + " " + getTime(req.session.Plan_lastlogin) });
            })
        })
    // })
}
    else {
        res.redirect('/accountlogin');
    }
}

/**
 * @function login
 * @param req
 * @param res
 * @param next
 * @description user can login
 */
exports.login = function (req, res, next) {
    if(req.cookies.plan_remember == 1 && req.cookies.plan_username != '' ){
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            userManager.getUserDetails( connection_ikon_cms, decrypt(req.cookies.plan_username), decrypt(req.cookies.plan_password), function( err, row ){
                if (err) {
                    res.render('account-login', { error: 'Error in database connection' });
                } else {
                    if (row.length > 0) {
                        if (row[0].ld_active == 1) {
                            if(row[0].ld_role == 'Store Manager') {
                                connection_ikon_cms.release();
                                var session = req.session;
                                session.Plan_UserId = row[0].ld_id;
                                session.Plan_UserRole = row[0].ld_role;
                                session.Plan_UserName = row[0].ld_user_name;
                                session.Plan_Password = row[0].ld_user_pwd;
                                session.Plan_Email = row[0].ld_email_id;
                                session.Plan_FullName = row[0].ld_display_name;
                                session.Plan_lastlogin = row[0].ld_last_login;
                                session.Plan_UserType = row[0].ld_user_type;
                                session.Plan_StoreId = row[0].su_st_id;
                                if (req.session) {
                                    if (req.session.Plan_UserName) {
                                        if (req.session.Plan_StoreId) {
                                            res.redirect("/");
                                        }
                                        else {
                                            res.redirect("/accountlogin");
                                        }
                                    }
                                    else {
                                        res.render('account-login', { error: '' });
                                    }
                                }
                                else {
                                    res.render('account-login', { error: '' });
                                }
                            }
                        }
                    }
                }
            });
        });
    }else if (req.session) {
        if (req.session.Plan_UserName) {
            if (req.session.Plan_StoreId) {
                res.redirect("/#/planlist");
            }
            else {

                res.redirect("/accountlogin");

            }
        }
        else {
            res.render('account-login', { error: '' });
        }
    }
    else {
        res.render('account-login', { error: '' });
    }
}
//exports.login = function (req, res, next) {
//    if (req.session) {
//        if (req.session.Plan_UserName) {
//            if (req.session.Plan_StoreId) {
//                res.redirect("/planlist");
//            }
//            else {
//                res.redirect("/planlist");
//            }
//        }
//        else {
//            res.render('account-login', { error: '' });
//        }
//    }
//    else {
//        res.render('account-login', { error: '' });
//    }
//}
/**
 * @function logout
 * @param req
 * @param res
 * @param next
 * @description user can logout
 */
exports.logout = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.Plan_UserName) {
                if (req.session.Plan_StoreId) {

                    req.session.Plan_UserId = null;
                    req.session.Plan_UserRole = null;
                    req.session.Plan_UserName = null;
                    req.session.Plan_Password = null;
                    req.session.Plan_Email = null;
                    req.session.Plan_FullName = null;
                    req.session.Plan_lastlogin = null;
                    req.session.Plan_UserType = null;
                    req.session.Plan_StoreId = null;

                    res.clearCookie('plan_remember');
                    res.clearCookie('plan_username');
                    res.clearCookie('plan_password');

                    res.redirect('/accountlogin');
                }
                else {
                    res.redirect('/accountlogin');
                }
            }else{
                res.redirect('/accountlogin');
            }
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (error) {
        res.render('account-login', { error: error.message });
    }
}
/**
 * @function authenticate
 * @param req
 * @param res
 * @param next
 * @description user is authenticated
 */
exports.authenticate = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_ikon_cms) {
            if(req.body.rememberMe){
                var minute = 10080 * 60 * 1000;
                res.cookie('plan_remember', 1, { maxAge: minute });
                res.cookie('plan_username', encrypt(req.body.username), { maxAge: minute });
                res.cookie('plan_password', encrypt(req.body.password), { maxAge: minute });
            }
            userAuthDetails(connection_ikon_cms,req.body.username,req.body.password,req,res);
        });
    }
    catch (error) {
        res.render('account-login', { error: 'Error in database connection' });
    }
}


function userAuthDetails(dbConnection, username,password,req,res){
    userManager.getUserDetails( dbConnection, username, password, function( err, row ){
        if (err) {
            res.render('account-login', { error: 'Error in database connection' });
        } else {
            if (row.length > 0) {
                if (row[0].ld_active == 1) {
                    if(row[0].ld_role == 'Store Manager') {
                        var session = req.session;
                        session.Plan_UserId = row[0].ld_id;
                        session.Plan_UserRole = row[0].ld_role;
                        session.Plan_UserName = req.body.username;
                        session.Plan_Password = req.body.password;
                        session.Plan_Email = row[0].ld_email_id;
                        session.Plan_FullName = row[0].ld_display_name;
                        session.Plan_lastlogin = row[0].ld_last_login;
                        session.Plan_UserType = row[0].ld_user_type;
                        session.Plan_StoreId = row[0].su_st_id;//coming from new store's user table.
                        userManager.updateLastLoggedIn( dbConnection, row[0].ld_id ,function(err,response){
                            if(err){
                                dbConnection.release();
                            }else{
                                dbConnection.release();
                                res.redirect('/');
                            }
                        })
                    } else {
                        dbConnection.release();
                        res.render('account-login', { error: 'Only Store Admin/Manager are allowed to login' });
                    }
                }
                else {
                    dbConnection.release();
                    res.render('account-login', { error: 'Your account has been disable' });
                }
            } else {
                dbConnection.release();
                if( req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length == 0 ) {
                    res.render('account-login', {error: 'Please enter username and password'});
                }else if(req.body.username != undefined && req.body.username.length != 0  &&  req.body.password.length == 0 ){
                    res.render('account-login', {error: 'Please enter password'});
                }
                else if(req.body.username != undefined && req.body.username.length == 0  &&  req.body.password.length != 0){
                    res.render('account-login', {error: 'Please enter username'});
                }
                else {
                    res.render('account-login', {error: 'Invalid Username / Password'});
                }
            }
        }
    });
}

/**
 * #function getPages
 * @param role
 * @returns json array
 * @description get list of pages allowed as per user-role
 */
function getPages(role, selectedPaymentType) {
    if (role == "Super Admin" || role == "Store Manager") {
        var pagesjson = [];
        pagesjson.push( { 'pagename': 'Plan List', 'href': 'plan-list', 'id': 'plan-list', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] } );
        if(selectedPaymentType != undefined && selectedPaymentType != null && selectedPaymentType.length > 0) {
            selectedPaymentType.forEach(function (paymentType) {
                if (paymentType.en_description === 'One Time') {
                    pagesjson.push({
                        'pagename': 'A La Cart Plan',
                        'href': 'a-la-cart',
                        'id': 'a-la-cart',
                        'class': 'fa fa-briefcase',
                        'submenuflag': '0',
                        'sub': []
                    });
                }
                if (paymentType.en_description === 'Subscriptions') {
                    pagesjson.push({
                        'pagename': 'Subscriptions Plan',
                        'href': 'subscriptions',
                        'id': 'subscriptions',
                        'class': 'fa fa-briefcase',
                        'submenuflag': '0',
                        'sub': []
                    });
                }
            })
        }
        pagesjson.push(
            { 'pagename': 'Value Pack Plan', 'href': 'value-pack', 'id': 'value-pack', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Offer Plan', 'href': 'offer-plan', 'id': 'offer-plan', 'class': 'fa fa-briefcase', 'submenuflag': '0', 'sub': [] },
            { 'pagename': 'Change Password', 'href': 'changepassword', 'id': 'changepassword', 'class': 'fa fa-align-left', 'submenuflag': '0', 'sub': [] }
        );
        return pagesjson;
    }
}
/**
 * @function viewForgotPassword
 * @param req
 * @param res
 * @param next
 * @description display forgot password page
 */
exports.viewForgotPassword = function (req, res, next) {
    //req.session = null;
    req.session.Plan_UserId = null;
    req.session.Plan_UserRole = null;
    req.session.Plan_UserName = null;
    req.session.Plan_Password = null;
    req.session.Plan_Email = null;
    req.session.Plan_FullName = null;
    req.session.Plan_lastlogin = null;
    req.session.Plan_UserType = null;
    req.session.Plan_StoreId = null;
    res.render('account-forgot', { error: '', msg: '' });
}
/**
 * @function forgotPassword
 * @param req
 * @param res
 * @param next
 * @description get forgot password for user
 */
exports.forgotPassword = function (req, res, next) {
    try {
        mysql.getConnection('CMS', function (err, connection_central) {
            userManager.getUserDetailsByUserIdByEmail( connection_central, req.body.userid, req.body.emailid, function( err, row, fields ) {
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
                            to: session.Plan_Email,//'sujata.patne@jetsynthesys.com',
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
/**
 * @function viewChangePassword
 * @param req
 * @param res
 * @param next
 * @description displays change password page
 */
exports.viewChangePassword = function (req, res, next) {
    //req.session = null;
    req.session.Plan_UserId = null;
    req.session.Plan_UserRole = null;
    req.session.Plan_UserName = null;
    req.session.Plan_Password = null;
    req.session.Plan_Email = null;
    req.session.Plan_FullName = null;
    req.session.Plan_lastlogin = null;
    req.session.Plan_UserType = null;
    req.session.Plan_StoreId = null;
    res.render('account-changepassword', { error: '' });
}
/**
 * @function changePassword
 * @param req
 * @param res
 * @description process change password request
 */
exports.changePassword = function (req, res) {
    try {
        if (req.session) {
            if (req.session.Plan_UserName) {
                var session = req.session;
                mysql.getConnection('CMS', function (err, connection_central) {
                    if (req.body.oldpassword == req.session.Plan_Password) {
                        userManager.updateIcnUserDetails( connection_central, req.body.newpassword, new Date(), req.session.Plan_UserId, function( err, result ) {
                            if (err) {
                                connection_central.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                req.session.Plan_Password = req.body.newpassword;
                                var smtpTransport = nodemailer.createTransport({
                                    service: "Gmail",
                                    auth: {
                                        user: "jetsynthesis@gmail.com",
                                        pass: "j3tsynthes1s"
                                    }
                                });
                                var mailOptions = {
                                    to: req.session.Plan_Email,
                                    subject: 'Change Password',
                                    html: "<p>Hi, " + req.session.Plan_UserName + " <br />This is your password: " + req.body.newpassword + "</p>"
                                }
                                smtpTransport.sendMail(mailOptions, function (error, response) {
                                    if (error) {
                                        connection_central.release();
                                        console.log(error);
                                        res.end("error");
                                    } else {
                                        connection_central.release();
                                        res.send({ success: true, message: 'Password updated successfully. Please check your mail.' });

                                        //res.render('changepassword', { success: true, message: 'Password updated successfully. Please check your mail.' });
                                        //res.end("sent");
                                    }
                                });
                            }
                        });
                    }
                    else {
                        connection_central.release();
                        res.send({ success: false, message: 'Old Password does not match.' });
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
        res.status(500).json(err.message);
    }
};
