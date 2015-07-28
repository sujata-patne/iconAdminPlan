/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;

exports.getvaluepack = function (req, res, next) {
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
                                    var query = connection_ikon_plan.query('SELECT * FROM site_valuepack_plan where svp_id =? ', [req.body.planid], function (err, subplan) {
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

exports.addeditvaluepack = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from site_valuepack_plan where lower(svp_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].svp_id == req.body.valuepackplanId) {
                                    if (req.body.planid) {
                                        EditValuePack();
                                    }
                                    else {
                                        AddValuePack();
                                    }
                                }
                                else {
                                    connection_ikon_plan.release();
                                    res.send({ success: false, message: 'Value-Pack Plan Name Must be Unique' });
                                }
                            }
                            else {
                                if (req.body.planid) {
                                    EditValuePack();
                                }
                                else {
                                    AddValuePack();
                                }
                            }
                            function EditValuePack() {
                                var query = connection_ikon_plan.query('select * from site_valuepack_plan where svp_id = ?', [req.body.valuepackplanId], function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            var query = connection_ikon_plan.query('UPDATE site_valuepack_plan SET svp_plan_name=?,svp_caption=?,svp_description=?,svp_jed_id=?,svp_download_limit=?,svp_duration_limit=?,svp_durration_type=?,svp_modified_on=?,svp_modified_by=? WHERE svp_id =?', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.JetId, req.body.DowmloadLimit, req.body.DurationLimit, req.body.DurationIn, new Date(), req.session.UserName, req.body.valuepackplanId], function (err, result) {
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
                                                                        res.send({ success: true, message: 'Value-Pack Plan Updated successfully.' });
                                                                    }
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        connection_ikon_plan.release();
                                                        res.send({ success: true, message: 'Value-Pack Plan Updated successfully.' });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({ success: false, message: 'Invalid Value-Pack Plan Id.' });
                                        }
                                    }
                                });
                            }

                            function AddValuePack() {
                                var query = connection_ikon_plan.query('select max(svp_id) as id from site_valuepack_plan', function (err, result) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var data = {
                                            svp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                            svp_vendor_id: null,
                                            svp_plan_name: req.body.PlanName,
                                            svp_caption: req.body.Caption,
                                            svp_description: req.body.Description,
                                            svp_jed_id: req.body.JetId,
                                            svp_download_limit: req.body.DowmloadLimit,
                                            svp_duration_limit: req.body.DurationLimit,
                                            svp_durration_type: req.body.DurationIn,
                                            svp_is_active: 1,
                                            svp_created_on: new Date(),
                                            svp_created_by: req.session.UserName,
                                            svp_modified_on: new Date(),
                                            svp_modified_by: req.session.UserName
                                        }
                                        var query = connection_ikon_plan.query('INSERT INTO site_valuepack_plan SET ?', data, function (err, result) {
                                            if (err) {
                                                console.log(err.message);
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
                                                                console.log(err.message);
                                                                connection_ikon_plan.release();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                cnt++;
                                                                if (cnt == count) {
                                                                    connection_ikon_plan.release();
                                                                    res.send({ success: true, message: 'Value-Pack Plan added successfully.' });
                                                                }
                                                            }
                                                        });
                                                    });
                                                }
                                                else {
                                                    connection_ikon_plan.release();
                                                    res.send({ success: true, message: 'Value-Pack Plan added successfully.' });
                                                }
                                            }
                                        });
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