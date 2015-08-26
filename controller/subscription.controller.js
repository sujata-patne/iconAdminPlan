/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
/**
 * @function getsubscriptions
 * @param req
 * @param res
 * @param next
 * @description get all records in subscription plan
 */
exports.getsubscriptions = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    //var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE  cd_cm_id = 4', function (err, DistributionChannel) {
                    var query = connection_ikon_plan.query('select cd.* FROM catalogue_detail as cd ' +
                        'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                        'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                        'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                        'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [req.session.StoreId], function (err, DistributionChannel) {

                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            mysql.getConnection('BG', function (err, connection_ikon_bg) {
                                var query = connection_ikon_bg.query('select * from billing_ef_bgw_event where ebe_is_valid = 1 and ebe_ai_bgw_id is not null', function (err, JetEvents) {
                                    if (err) {
                                        connection_ikon_bg.release();
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                        console.log(err)
                                    }
                                    else {
                                        var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, alacart.bta_ef_id, alacart.bta_id,alacart.bta_name,alacart.bta_amt, partner.partner_name, partner.partner_id FROM billing_gateway.billing_ef_bgw_event as event ' +
                                            'JOIN billing_gateway.billing_telco_alacarte_detail AS alacart ON alacart.bta_ef_id = event.ebe_ef_id ' +
                                            'JOIN billing_gateway.billing_partner AS partner ON partner.partner_id = alacart.bta_partner_id ' +
                                            'left JOIN ikon_cms.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = alacart.bta_ef_id AND dis.dcl_partner_id = alacart.bta_partner_id', function (err, OpeartorDetail) {
                                            if (err) {
                                                connection_ikon_plan.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                var query = connection_ikon_plan.query('SELECT * FROM icn_sub_plan where sp_id =? ', [req.body.planid], function (err, subplan) {
                                                    if (err) {
                                                        connection_ikon_plan.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        connection_ikon_plan.release();
                                                        res.send({
                                                            JetEvents: JetEvents,
                                                            DistributionChannel: DistributionChannel,
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
                            })
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
/**
 * @function addeditsubscriptions
 * @param req
 * @param res
 * @param next
 * @description add new subscription plan and update selected subscription plan
 */
exports.addeditsubscriptions = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from icn_sub_plan where lower(sp_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            if (result.length > 0) {
                                if (result[0].sp_id == req.body.subplanId) {
                                    if (req.body.planid) {
                                        EditSubscriptions();
                                    }
                                    else {
                                        AddSubscriptions();
                                    }
                                }
                                else {
                                    connection_ikon_plan.release();
                                    res.send({ success: false, message: 'Subscription Plan Name Must be Unique' });
                                }
                            }
                            else {
                                if (req.body.planid) {
                                    EditSubscriptions();
                                }
                                else {
                                    AddSubscriptions();
                                }
                            }
                            function EditSubscriptions() {
                                var query = connection_ikon_plan.query('select * from icn_sub_plan where sp_id = ?', [req.body.subplanId], function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            var query = connection_ikon_plan.query(' UPDATE icn_sub_plan SET sp_plan_name=?,sp_caption=?,sp_description=?,sp_jed_id=?,sp_tnb_days=?,sp_tnb_free_cnt_limit=?,sp_single_day_cnt_limit=?,sp_full_sub_cnt_limit=?,sp_modified_on=?,sp_modified_by=? where sp_id =?', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.JetId, req.body.TryandBuyOffer, req.body.LimitTBOffer, req.body.LimitSingleday, req.body.TotalDuration, new Date(), req.session.UserName, req.body.subplanId], function (err, result) {
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
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({ success: false, message: 'Invalid Subscription Plan Id.' });
                                        }
                                    }
                                });
                            }

                            function AddSubscriptions() {
                                var query = connection_ikon_plan.query('select max(sp_id) as id from icn_sub_plan', function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var data = {
                                            sp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                            sp_vendor_id: null,
                                            sp_plan_name: req.body.PlanName,
                                            sp_caption: req.body.Caption,
                                            sp_description: req.body.Description,
                                            sp_jed_id: req.body.JetId,
                                            sp_tnb_days: req.body.TryandBuyOffer,
                                            sp_tnb_free_cnt_limit: req.body.LimitTBOffer,
                                            sp_single_day_cnt_limit: req.body.LimitSingleday,
                                            sp_full_sub_cnt_limit: req.body.TotalDuration,
                                            sp_is_active: 1,
                                            sp_created_on: new Date(),
                                            sp_created_by: req.session.UserName,
                                            sp_modified_on: new Date(),
                                            sp_modified_by: req.session.UserName
                                        }
                                        var query = connection_ikon_plan.query('INSERT INTO icn_sub_plan SET ?', data, function (err, result) {
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