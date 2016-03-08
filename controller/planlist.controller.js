/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var nodeExcel = require('excel-export');
var async = require("async");
var planListManager = require("../models/planListModel");
var userManager = require("../models/userModel");
var logger = require("../controller/logger.controller");
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
                if (err) {
                    logger.writeLog('getplanlist : ' + JSON.stringify(err));
                } else {
                    async.parallel({
                            ContentTypes: function (callback) {
                                planListManager.getContentTypesByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, ContentTypes) {
                                    //logger.writeLog('getContentTypesByStoreId : '+ JSON.stringify(ContentTypes));
                                    callback(err, ContentTypes);
                                });
                            },
                            Alacarts: function (callback) {
                                planListManager.getAlaCartPlansByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, Alacarts) {
                                    //logger.writeLog('Alacarts : '+ JSON.stringify(Alacarts));
                                    callback(err, Alacarts);
                                });
                            },
                            Subscriptions: function (callback) {
                                planListManager.getSubscriptionPlansByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, Subscriptions) {
                                    //logger.writeLog('Subscriptions : '+ JSON.stringify(Subscriptions));
                                    callback(err, Subscriptions);
                                });
                            },
                            ValuePacks: function (callback) {
                                planListManager.getValuePackPlansByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, ValuePacks) {
                                    //logger.writeLog('ValuePacks : '+ JSON.stringify(ValuePacks));
                                    callback(err, ValuePacks);
                                });
                            },
                            Offers: function (callback) {
                                planListManager.getOfferPlansByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, Offers) {
                                    //logger.writeLog('Offers : '+ JSON.stringify(Offers));
                                    callback(err, Offers);
                                });
                            },
                            allowedPlans: function (callback) {
                                userManager.getSelectedPaymentTypeByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, selectedPaymentType) {
                                    var paymentTypes = req.cookies.paymentTypes;
                                    logger.writeLog('cookie paymentTypes : '+req.cookies.paymentTypes);
                                    logger.writeLog('store paymentchannel : ' + JSON.stringify(selectedPaymentType));
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
                                    logger.writeLog('store pricePointTypes : '+ JSON.stringify(pricePointTypes));

                                    var data = [];
                                    if (pricePointTypes !== undefined && pricePointTypes !== '' && pricePointTypes.length > 0) {
                                        pricePointTypes.forEach(function (paymentType) {
                                            if (paymentType.en_description === 'One Time') {
                                                data.push('OneTime');
                                            }
                                            if (paymentType.en_description === 'Subscriptions') {
                                                data.push('Subscriptions');
                                            }
                                        })
                                    } else {
                                        data.push('OneTime');
                                        data.push('Subscriptions');
                                    }
                                    logger.writeLog('allowedPlans : '+ JSON.stringify(data));
                                    callback(null, data);
                                })


                            },
                            RoleUser: function (callback) {
                                //Get User Role
                                logger.writeLog('RoleUser : ' + JSON.stringify(req.session.Plan_UserRole));
                                callback(null, req.session.Plan_UserRole);
                            }
                        },
                    function (err, results) {
                            if (err) {
                                connection_ikon_cms.release();
                                logger.writeLog('error : ' + JSON.stringify(err));
                                res.status(500).json(err.message);
                                console.log(err.message)
                            } else {
                                logger.writeLog('getplanlist  : ' + JSON.stringify(results));
                                connection_ikon_cms.release();
                                res.send(results);
                            }
                        });
                }
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
                if (err) {
                    logger.writeLog('deleteplan : ' + JSON.stringify(err));
                } else {
                    if (req.body.ContentType == "Subscription") {
                        planListManager.updateSubscriptionPlan(connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                            if (err) {
                                logger.writeLog('updateSubscriptionPlan  : ' + JSON.stringify(err));
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                logger.writeLog('updateSubscriptionPlan  : ' + JSON.stringify(result));

                                res.send({success: true, message: 'Plan ' + req.body.Status + ' successfully.'});
                            }
                        });
                    }
                    else if (req.body.ContentType == "Value Pack") {
                        planListManager.updateValuePackPlan(connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                            if (err) {
                                logger.writeLog('updateValuePackPlan  : ' + JSON.stringify(err));
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                logger.writeLog('updateValuePackPlan  : ' + JSON.stringify(result));
                                res.send({success: true, message: 'Plan ' + req.body.Status + ' successfully.'});
                            }
                        });
                    }
                    else if (req.body.ContentType == "Offers") {
                        planListManager.updateOfferPlan(connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                logger.writeLog('updateOfferPlan  : ' + JSON.stringify(err));
                                res.status(500).json(err.message);
                            }
                            else {
                                logger.writeLog('updateOfferPlan  : ' + JSON.stringify(result));
                                connection_ikon_cms.release();
                                res.send({success: true, message: 'Plan ' + req.body.Status + ' successfully.'});
                            }
                        });
                    }
                    else {
                        planListManager.updateAlacartaPlan(connection_ikon_cms, req.body.active, req.body.PlanId, function (err, result) {
                            if (err) {
                                connection_ikon_cms.release();
                                logger.writeLog('updateAlacartaPlan  : ' + JSON.stringify(err));
                                res.status(500).json(err.message);
                            }
                            else {
                                connection_ikon_cms.release();
                                logger.writeLog('updateAlacartaPlan  : ' + JSON.stringify(result));
                                res.send({success: true, message: 'Plan ' + req.body.Status + ' successfully.'});
                            }
                        });
                    }
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
                    if (err) {
                        logger.writeLog('deleteplan : ' + JSON.stringify(err));
                    } else {
                        if (req.body.ContentType == "Subscription") {
                            planListManager.deleteSusbscriptionPlan(connection_ikon_cms, req.body.PlanId, function (err, result) {
                                if (err) {
                                    logger.writeLog('deleteSusbscriptionPlan  : ' + JSON.stringify(err));

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    connection_ikon_cms.release();
                                    logger.writeLog('deleteSusbscriptionPlan  : ' + JSON.stringify(result));

                                    res.send({success: true, message: 'Subscription Plan deleted successfully.'});
                                }
                            });
                        }
                        else if (req.body.ContentType == "Value Pack") {
                            planListManager.deleteValuePackPlan(connection_ikon_cms, req.body.PlanId, function (err, result) {
                                if (err) {
                                    logger.writeLog('deleteValuePackPlan  : ' + JSON.stringify(err));

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    connection_ikon_cms.release();
                                    logger.writeLog('deleteValuePackPlan  : ' + JSON.stringify(result));

                                    res.send({success: true, message: 'ValuePack Plan deleted successfully.'});
                                }
                            });
                        }
                        else if (req.body.ContentType == "Offers") {
                            planListManager.deleteOfferPlan(connection_ikon_cms, req.body.PlanId, function (err, result) {
                                if (err) {
                                    logger.writeLog('deleteOfferPlan  : ' + JSON.stringify(err));

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    connection_ikon_cms.release();
                                    logger.writeLog('deleteOfferPlan  : ' + JSON.stringify(result));

                                    res.send({success: true, message: 'Offer Plan deleted successfully.'});
                                }
                            });
                        }
                        else {
                            planListManager.deleteAlacartaPlan(connection_ikon_cms, req.body.PlanId, function (err, result) {
                                if (err) {
                                    logger.writeLog('deleteAlacartaPlan  : ' + JSON.stringify(err));

                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    logger.writeLog('deleteAlacartaPlan  : ' + JSON.stringify(result));

                                    connection_ikon_cms.release();
                                    res.send({success: true, message: 'A-La-Cart Plan deleted successfully.'});
                                }
                            });
                        }
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
        logger.writeLog('exportplan  : '+ JSON.stringify(error));
        console.log(error.message);
    }
};