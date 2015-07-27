/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
exports.getsubscriptions = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is null', function (err, JetEvents) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_plan.query('SELECT * FROM  (SELECT * FROM  operator_pricepoint_detail where opd_is_active =1 and opd_pp_type ="subscription")alacart inner join (select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is null)jetpay on(alacart.opd_jed_id =jetpay.jed_id)', function (err, OpeartorDetail) {
                                if (err) {
                                    connection_ikon_plan.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    connection_ikon_plan.release();
                                    res.send({
                                        JetEvents: JetEvents,
                                        OpeartorDetail: OpeartorDetail,
                                        RoleUser: req.session.UserRole
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}

exports.addsubscriptions = function (req, res, next) {
    console.log(req.body.OpeartorDetails);
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from site_sub_plan where lower(ssp_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (!result.length > 0) {
                                var query = connection_ikon_plan.query('select max(ssp_id) as id from site_sub_plan', function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var data = {
                                            ssp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                            ssp_vendor_id: null,
                                            ssp_plan_name: req.body.PlanName,
                                            ssp_caption: req.body.Caption,
                                            ssp_description: req.body.Description,
                                            ssp_jed_id: req.body.JetId,
                                            ssp_tnb_days: req.body.TryandBuyOffer,
                                            ssp_tnb_free_cnt_limit: req.body.LimitTBOffer,
                                            ssp_single_day_cnt_limit: req.body.LimitSingleday,
                                            ssp_full_sub_cnt_limit: req.body.TotalDuration,
                                            ssp_is_active: 1,
                                            ssp_created_on: new Date(),
                                            ssp_created_by: req.session.UserName,
                                            ssp_modified_on: new Date(),
                                            ssp_modified_by: req.session.UserName
                                        }
                                        var query = connection_ikon_plan.query('INSERT INTO site_sub_plan SET ?', data, function (err, result) {
                                            if (err) {
                                                connection_ikon_plan.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                if (req.body.OperatorDetails.length > 0) {
                                                    var count = req.body.OperatorDetails.length;
                                                    var cnt = 0;
                                                    req.body.OperatorDetails.forEach(function (value) {
                                                        console.log(value.opd_name, value.opd_id);
                                                        var query = connection_ikon_plan.query('UPDATE operator_pricepoint_detail SET opd_name = ? where opd_id = ?', [value.opd_name, value.opd_id], function (err, result) {
                                                            if (err) {
                                                                connection_ikon_plan.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                cnt++;
                                                                if (cnt == count) {
                                                                    connection_ikon_plan.release();
                                                                    res.send({ success: true, message: 'Sunscription Plan added successfully.' });
                                                                }
                                                            }
                                                        });
                                                    });
                                                }
                                                else {
                                                    connection_ikon_plan.release();
                                                    res.send({ success: true, message: 'Sunscription Plan added successfully.' });
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                connection_ikon_plan.release();
                                res.send({ success: false, message: 'Sunscription Plan Name Must be Unique' });
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}

exports.geteditsubscriptions = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is null', function (err, JetEvents) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_plan.query('SELECT * FROM  (SELECT * FROM  operator_pricepoint_detail where opd_is_active =1 and opd_pp_type ="subscription")alacart inner join (select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is null)jetpay on(alacart.opd_jed_id =jetpay.jed_id)', function (err, OpeartorDetail) {
                                if (err) {
                                    connection_ikon_plan.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var query = connection_ikon_plan.query('SELECT * FROM site_sub_plan where ssp_id =? ', [req.body.planid], function (err, subplan) {
                                        if (err) {
                                            connection_ikon_plan.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({
                                                JetEvents: JetEvents,
                                                OpeartorDetail: OpeartorDetail,
                                                RoleUser: req.session.UserRole,
                                                PlanData: subplan
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}

exports.editsubscriptions = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from site_sub_plan where lower(ssp_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].ssp_id == req.body.subplanId) {
                                    EditSubscriptions();
                                }
                                else {
                                    connection_ikon_plan.release();
                                    res.send({ success: false, message: 'Subscription Plan Name Must be Unique' });
                                }
                            }
                            else {
                                EditALacart();
                            }
                            function EditALacart() {
                                var query = connection_ikon_plan.query(' UPDATE site_sub_plan SET ssp_plan_name=?,ssp_caption=?,ssp_description=?,ssp_jed_id=?,ssp_tnb_days=?,ssp_tnb_free_cnt_limit=?,ssp_single_day_cnt_limit=?,ssp_full_sub_cnt_limit=?,ssp_modified_on=?,ssp_modified_by=? where ssp_id =?', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.JetId, req.body.TryandBuyOffer, req.body.LimitTBOffer, req.body.LimitSingleday, req.body.TotalDuration, new Date(), req.session.UserName, req.body.subplanId], function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (req.body.OperatorDetails.length > 0) {
                                            var count = req.body.OperatorDetails.length;
                                            var cnt = 0;
                                            req.body.OperatorDetails.forEach(function (value) {

                                                var query = connection_ikon_plan.query('UPDATE operator_pricepoint_detail SET opd_name = ? where opd_id = ?', [value.opd_name, value.opd_id], function (err, result) {
                                                    if (err) {
                                                        connection_ikon_plan.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        cnt++;
                                                        if (cnt == count) {
                                                            connection_ikon_plan.release();
                                                            res.send({ success: true, message: 'Subscription Plan Updated successfully.' });
                                                        }
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({ success: true, message: 'Subscription Plan Updated successfully.' });
                                        }
                                    }
                                });
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
        connection_ikon_plan.release();
        res.status(500).json(err.message);
    }
}