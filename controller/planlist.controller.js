/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var nodeExcel = require('excel-export');
/**
 * @function getplanlist
 * @param req
 * @param res
 * @param next
 * @decsription get all records of all plans
 */
exports.getplanlist = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 2', function (err, ContentTypes) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                                var query = connection_ikon_plan.query('SELECT * FROM icn_alacart_plan', function (err, Alacarts) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_plan.query('SELECT * FROM icn_sub_plan', function (err, Subscriptions) {
                                            if (err) {
                                                connection_ikon_plan.release();
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_ikon_plan.query('SELECT * FROM icn_valuepack_plan', function (err, ValuePacks) {
                                                    if (err) {
                                                        connection_ikon_plan.release();
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        var query = connection_ikon_plan.query('SELECT * FROM icn_offer_plan', function (err, Offers) {
                                                            if(err){
                                                                connection_ikon_plan.release();
                                                                connection_ikon_cms.release();
                                                                res.status(500).json(err.message);
                                                            }else{
                                                                connection_ikon_plan.release();
                                                                connection_ikon_cms.release();
                                                                res.send({
                                                                    ContentTypes: ContentTypes,
                                                                    Alacarts: Alacarts,
                                                                    Subscriptions: Subscriptions,
                                                                    ValuePacks: ValuePacks,
                                                                    Offers: Offers,
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
        connection_ikon_plan.release();
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}
/**
 * @function blockunblockplan
 * @param req
 * @param res
 * @param next
 * @description block and unblock selected plan
 */
exports.blockunblockplan = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    if (req.body.ContentType == "Subscription") {
                        var query = connection_ikon_plan.query('UPDATE icn_sub_plan set sp_is_active= ? where sp_id =?', [req.body.active, req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Value Pack") {
                        var query = connection_ikon_plan.query('UPDATE icn_valuepack_plan set vp_is_active= ? where vp_id =?', [req.body.active, req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Offers") {
                        var query = connection_ikon_plan.query('UPDATE icn_offer_plan set op_is_active = ? where op_id =?', [req.body.active, req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                            }
                        });
                    }
                    else {
                        var query = connection_ikon_plan.query('UPDATE icn_alacart_plan set ap_is_active= ? where ap_id =?', [req.body.active, req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                            }
                        });
                    }
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}
/**
 * @function deleteplan
 * @param req
 * @param res
 * @param next
 * @description deleted selected plan
 */
exports.deleteplan = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    if (req.body.ContentType == "Subscription") {
                        var query = connection_ikon_plan.query('Delete From icn_sub_plan  where sp_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Subscription Plan deleted successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Value Pack") {
                        var query = connection_ikon_plan.query('Delete From icn_valuepack_plan where vp_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'ValuePack Plan deleted successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Offers") {
                        var query = connection_ikon_plan.query('Delete From icn_offer_plan where op_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'Offer Plan deleted successfully.' });
                            }
                        });
                    }
                    else {
                        var query = connection_ikon_plan.query('Delete From icn_alacart_plan where ap_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'A-La-Cart Plan deleted successfully.' });
                            }
                        });
                    }
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}
/**
 * @function exportplan
 * @param req
 * @param res
 * @description process plan list for download in to excel/xml format
 */
exports.exportplan = function (req, res) {
    try {
        var conf = {};
        conf.cols = [{
            caption: 'Sr No.',
            captionStyleIndex: 1,
            type: 'number',
            width: 10
        }, {
            caption: 'Plan Id.',
            captionStyleIndex: 1,
            type: 'number',
            width: 10
        }, {
            caption: 'Plan Name',
            type: 'string',
            width: 30
        }, {
            caption: 'Content Type',
            type: 'string',
            width: 30
        }, {
            caption: 'Created On',
            type: 'string',
            width: 30
        }, {
            caption: 'Active',
            type: 'string',
            width: 30
        }];
        var rows = [];
        var cnt = 1;

        req.body.PlanList.forEach(function (data) {
            var plan = [];
            plan.push(cnt);
            plan.push(data.planid);
            plan.push(data.planname);
            plan.push(data.contenttype);
            plan.push(data.created_on);
            plan.push(data.active == 0 ? 'blocked' : 'active');
            rows.push(plan);
            cnt++;
        })
        conf.rows = rows;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=PlanList.xlsx");
        res.end(result, 'binary');
    }
    catch (error) {
        console.log(error.message);
    }
};