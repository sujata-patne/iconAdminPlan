/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var nodeExcel = require('excel-export');

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
                            mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                                var query = connection_ikon_plan.query('SELECT * FROM site_alacart_plan', function (err, Alacarts) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_plan.query('SELECT * FROM site_sub_plan', function (err, Subscriptions) {
                                            if (err) {
                                                connection_ikon_plan.release();
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_ikon_plan.query('SELECT * FROM site_valuepack_plan', function (err, ValuePacks) {
                                                    if (err) {
                                                        connection_ikon_plan.release();
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        connection_ikon_plan.release();
                                                        connection_ikon_cms.release();
                                                        res.send({
                                                            ContentTypes: ContentTypes,
                                                            Alacarts: Alacarts,
                                                            Subscriptions: Subscriptions,
                                                            ValuePacks: ValuePacks,
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
        connection_ikon_plan.release();
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

exports.blockunblockplan = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    if (req.body.ContentType == "Subscription") {
                        var query = connection_ikon_plan.query('UPDATE site_sub_plan set ssp_is_active= ? where ssp_id =?', [req.body.active, req.body.PlanId], function (err, result) {
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
                    else if (req.body.ContentType == "ValuePack") {
                        var query = connection_ikon_plan.query('UPDATE site_valuepack_plan set svp_is_active= ? where svp_id =?', [req.body.active, req.body.PlanId], function (err, result) {
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
                        var query = connection_ikon_plan.query('UPDATE site_alacart_plan set sap_is_active= ? where sap_id =?', [req.body.active, req.body.PlanId], function (err, result) {
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

exports.deleteplan = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    if (req.body.ContentType == "Subscription") {
                        var query = connection_ikon_plan.query('Delete From site_sub_plan  where ssp_id =?', [req.body.PlanId], function (err, result) {
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
                    else if (req.body.ContentType == "ValuePack") {
                        var query = connection_ikon_plan.query('Delete From site_valuepack_plan where svp_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'ValuePack Plan delete successfully.' });
                            }
                        });
                    }
                    else {
                        var query = connection_ikon_plan.query('Delete From site_alacart_plan where sap_id =?', [req.body.PlanId], function (err, result) {
                            if (err) {
                                connection_ikon_plan.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: true, message: 'A-La-Cart Plan delete successfully.' });
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

exports.exportplan = function (req, res) {
    try{
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