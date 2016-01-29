/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var nodeExcel = require('excel-export');
var async = require("async");
var planListManager = require("../models/planListModel");
var userManager = require("../models/userModel");
var _ = require('underscore');

/**
 * @function getplanlist
 * @param req
 * @param res
 * @param next
 * @decsription get all records of all plans
 */
exports.getplanlist = function (req, res, next) {
    try {
        if (req.session != undefined && req.session.Plan_UserName != undefined && req.session.Plan_StoreId != undefined) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.parallel({
                    ContentTypes: function (callback) {
                        planListManager.getContentTypesByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, ContentTypes) {
                            callback(err, ContentTypes);
                        });
                    },
                    Alacarts: function (callback) {
                        planListManager.getAlaCartPlansByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, Alacarts) {
                            callback(err, Alacarts);
                        });
                    },
                    Subscriptions: function (callback) {
                        planListManager.getSubscriptionPlansByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, Subscriptions ) {
                            callback(err, Subscriptions);
                        });
                    },
                    ValuePacks: function (callback) {
                        planListManager.getValuePackPlansByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, ValuePacks ) {
                            callback(err, ValuePacks);
                        });
                    },
                    Offers: function (callback) {
                        planListManager.getOfferPlansByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, Offers ) {
                            callback(err, Offers);
                        });
                    },
                    allowedPlans: function (callback) {
                        userManager.getSelectedPaymentTypeByStoreId( connection_ikon_cms, req.session.Plan_StoreId, function (err, selectedPaymentType) {
                            //console.log(selectedPaymentType);
                            var paymentTypes = req.cookies.paymentTypes;
                            if (paymentTypes !== undefined && paymentTypes !== '' && paymentTypes.length > 0) {
                                var pricePointTypes = [];
                                _.each(JSON.parse(paymentTypes), function (paymentType1) {
                                    _.filter(selectedPaymentType, function (paymentType2) {
                                        if (paymentType2.cmd_entity_detail == paymentType1.en_id) {
                                            pricePointTypes.push(paymentType1);
                                        }
                                    });
                                })
                            } else {
                                var pricePointTypes = paymentTypes;
                            }
                            //console.log(pricePointTypes);                            process.exit();
                            var data = [];
                            pricePointTypes.forEach(function (paymentType) {
                                if (paymentType.en_description === 'One Time') {
                                    data.push('OneTime');
                                }
                                if (paymentType.en_description === 'Subscriptions') {
                                    data.push('Subscriptions');
                                }
                            })
                            console.log(data)
                            callback(null, data);
                        })


                    },
                    RoleUser: function (callback) {
                        //Get User Role
                        callback(null, req.session.Plan_UserRole);
                    }
                },
                function (err, results) {
                     if (err) {
                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    } else {
                        connection_ikon_cms.release();
                        res.send(results);
                    }
                });
            })
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
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
        if (req.session && req.session.Plan_UserName != undefined && req.session.Plan_StoreId != undefined) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                if (req.body.ContentType == "Subscription") {
                    planListManager.updateSubscriptionPlan( connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            connection_ikon_cms.release();
                            res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                        }
                    });
                }
                else if (req.body.ContentType == "Value Pack") {
                    planListManager.updateValuePackPlan( connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            connection_ikon_cms.release();
                            res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                        }
                    });
                }
                else if (req.body.ContentType == "Offers") {
                    planListManager.updateOfferPlan( connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            connection_ikon_cms.release();
                            res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                        }
                    });
                }
                else {
                    planListManager.updateAlacartaPlan( connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            connection_ikon_cms.release();
                            res.send({ success: true, message: 'Plan ' + req.body.Status + ' successfully.' });
                        }
                    });
                }
            });
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
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
            if (req.session.Plan_UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    if (req.body.ContentType == "Subscription") {
                        planListManager.deleteSusbscriptionPlan( connection_ikon_cms, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                res.send({ success: true, message: 'Subscription Plan deleted successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Value Pack") {
                        planListManager.deleteValuePackPlan( connection_ikon_cms, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                res.send({ success: true, message: 'ValuePack Plan deleted successfully.' });
                            }
                        });
                    }
                    else if (req.body.ContentType == "Offers") {
                        planListManager.deleteOfferPlan( connection_ikon_cms, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                res.send({ success: true, message: 'Offer Plan deleted successfully.' });
                            }
                        });
                    }
                    else {
                        planListManager.deleteAlacartaPlan( connection_ikon_cms, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
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