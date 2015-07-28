/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
exports.getalacartadata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 2', function (err, ContentTypes) {
                        // Neat!
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                                var query = connection_ikon_plan.query('select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is not null', function (err, JetEvents) {
                                    // Neat!
                                    if (err) {
                                        connection_ikon_plan.release();
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var query = connection_ikon_plan.query('SELECT * FROM  (SELECT * FROM  operator_pricepoint_detail where opd_is_active =1 and opd_pp_type ="alacarte")alacart inner join (select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is not null)jetpay on(alacart.opd_jed_id =jetpay.jed_id)', function (err, OpeartorDetail) {
                                            // Neat!
                                            if (err) {
                                                connection_ikon_plan.release();
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_ikon_plan.query('SELECT * FROM site_alacart_plan where sap_id =? ', [req.body.planid], function (err, alacart) {
                                                    // Neat!
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
                                                            JetEvents: JetEvents,
                                                            OpeartorDetail: OpeartorDetail,
                                                            RoleUser: req.session.UserRole,
                                                            PlanData: alacart
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

exports.addeditalacart = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('PLAN', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from site_alacart_plan where lower(sap_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].sap_id == req.body.alacartplanid) {
                                    if (req.body.planid) {
                                        EditALacart();
                                    }
                                    else {
                                        AddAlacart();
                                    }
                                }
                                else {
                                    res.send({ success: false, message: 'Plan Name Must be Unique' });
                                }
                            }
                            else {
                                if (req.body.planid) {
                                    EditALacart();
                                }
                                else {
                                    AddAlacart();
                                }
                            }
                            function EditALacart() {
                                var query = connection_ikon_plan.query('select * from site_alacart_plan where sap_id = ?', [req.body.alacartplanid], function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            var query = connection_ikon_plan.query('UPDATE site_alacart_plan SET sap_plan_name =?,sap_caption =?,sap_description=?, sap_jed_id=?,sap_content_type=? , sap_modified_on=?,sap_modified_by =? where sap_id =?', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.JetId, req.body.ContentType, new Date(), req.session.UserName, req.body.alacartplanid], function (err, result) {
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
                                                                        res.send({ success: true, message: 'A-La-Cart Plan Updated successfully.' });
                                                                    }
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        connection_ikon_plan.release();
                                                        res.send({ success: true, message: 'A-La-Cart Plan Updated successfully.' });
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            res.send({ success: false, message: 'Invalid A-La-Cart Plan Id.' });
                                        }
                                    }
                                });
                            }
                            function AddAlacart() {
                                var query = connection_ikon_plan.query('select max(sap_id) as id from site_alacart_plan', function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var data = {
                                            sap_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                            sap_vendor_id: null,
                                            sap_plan_name: req.body.PlanName,
                                            sap_caption: req.body.Caption,
                                            sap_description: req.body.Description,
                                            sap_jed_id: req.body.JetId,
                                            sap_content_type: req.body.ContentType,
                                            sap_is_active: 1,
                                            sap_created_on: new Date(),
                                            sap_created_by: req.session.UserName,
                                            sap_modified_on: new Date(),
                                            sap_modified_by: req.session.UserName
                                        }
                                        var query = connection_ikon_plan.query('INSERT INTO site_alacart_plan SET ?', data, function (err, result) {
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
                                                                    res.send({ success: true, message: 'A-La-Cart Plan added successfully.' });
                                                                }
                                                            }
                                                        });
                                                    });
                                                }
                                                else {
                                                    connection_ikon_plan.release();
                                                    res.send({ success: true, message: 'A-La-Cart Plan added successfully.' });
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