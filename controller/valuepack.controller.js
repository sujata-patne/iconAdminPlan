/**
 * Created by sujata.patne on 13-07-2015.
 */

var mysql = require('../config/db').pool;
var async = require('async');
var config = require('../config')();
var alacartaManager = require("../models/alacartaModel");
var planListManager = require("../models/planListModel");
var valuePackManager = require("../models/valuePackModel");
var subscriptionManager = require("../models/subscriptionModel");
var logger = require("../controller/logger.controller");

/**
 * @function getvaluepack
 * @param req
 * @param res
 * @param next
 * @description get list all value pack plans
 */
exports.getvaluepack = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName != undefined && req.session.Plan_StoreId != undefined) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                if (err) {
                    logger.writeLog('getvaluepack : ' + JSON.stringify(err));
                } else {
                    //mysql.getConnection('BG', function (err, connection_ikon_bg) {
                    async.parallel({
                            StoreId: function (callback) {
                                callback(err, req.session.Plan_StoreId);
                            },
                            PlanData: function (callback) {
                                valuePackManager.getPlanData(connection_ikon_cms, req.body.planid, function (err, valueplan) {
                                    callback(err, valueplan);
                                });
                            },
                            DurationOptions: function (callback) {
                                alacartaManager.getDurationOptions(connection_ikon_cms, function (err, DurationOptions) {
                                    callback(err, DurationOptions);
                                });
                            },
                            GeoLocations: function (callback) {
                                alacartaManager.getGeoLocationsByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, GeoLocations) {
                                    callback(err, GeoLocations);
                                });
                            },
                            /*JetEvents: function (callback) {
                             alacartaManager.getJetEventsByStoreId(connection_ikon_bg, req.session.Plan_StoreId, function (err, JetEvents ) {
                             callback( err, JetEvents );
                             });
                             },*/
                            OperatorDetail: function (callback) {
                                alacartaManager.getOperatorDetail(connection_ikon_cms, function (err, OperatorDetails) { //config.db_name_ikon_bg, config.db_name_ikon_cms,
                                    callback(err, OperatorDetails);
                                });
                            },
                            RoleUser: function (callback) {
                                //Get User Role
                                callback(null, req.session.Plan_UserRole);
                            }
                        },
                        function (err, results) {
                            if (err) {
                                connection_ikon_cms.release();
                                logger.writeLog('getvaluepack : ' + JSON.stringify(err));
                                res.status(500).json(err.message);
                                console.log(err.message)
                            } else {
                                connection_ikon_cms.release();
                                logger.writeLog('getvaluepack : ' + JSON.stringify(results));
                                res.send(results);
                            }
                        });
                }
            })
            //})
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}
/**
 * @function addeditvaluepack
 * @param req
 * @param res
 * @param next
 * @description add new value pack plan and update existing selected value pack plan
 */
exports.addeditvaluepack = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                if(err){
                    logger.writeLog('addeditvaluepack : ' + JSON.stringify(err));
                }else {
                    async.waterfall([
                            function (callback) {
                                valuePackManager.getValuePackPlanByName(connection_ikon_cms, req.body.PlanName.toLowerCase(), function (err, result) {
                                    if (result != undefined && result.length > 0) {
                                        callback(err, {'exist': true, 'plans': result});
                                    } else {
                                        callback(err, {'exist': false, 'plans': result});
                                    }
                                });
                            },
                            function (data, callback) {
                                if (data.exist == true && data.plans[0].plan_id != req.body.valuepackplanId) {
                                    callback(null, {'exist': data.exist, 'message': 'Plan Name Must be Unique'});
                                } else {
                                    callback(null, {'exist': data.exist});
                                }
                            }
                        ],
                        function (err, results) {
                            if (results.message) {
                                connection_ikon_cms.release();
                                logger.writeLog('addeditvaluepack : ' + JSON.stringify(results));

                                res.send({"success": false, "message": results.message});
                            } else {
                                if (req.body.planid) {
                                    EditValuePack();
                                }
                                else {
                                    AddValuePack();
                                }
                                var count = req.body.OperatorDetails.length;

                                function EditValuePack() {
                                    async.waterfall([
                                            function (callback) {
                                                valuePackManager.getValuePackPlanByPlanId(connection_ikon_cms, req.body.valuepackplanId, function (err, result) {
                                                    callback(err, result);
                                                });
                                            },
                                            function (alacart, callback) {
                                                if (req.body.OperatorDetails.length > 0) {
                                                    var operator = 0;
                                                    addEditOperators(connection_ikon_cms, operator, req.body, req.session);

                                                    //addEditOperators(operator);
                                                }
                                                callback(null, alacart);
                                            }/*,
                                             function (alacart,callback){
                                             if (distributionChannellength > 0) {
                                             var distributionChannel = 0;
                                             alacartaManager.deleteDistributionChannel( connection_ikon_cms, alacart[0].ap_channel_front, function( err, result ) {
                                             addDistributionChannel(connection_ikon_cms,distributionChannel,alacart[0].ap_channel_front,req.body);

                                             //addDistributionChannel(distributionChannel, alacart[0].ap_channel_front );
                                             })
                                             }
                                             callback(err,alacart);
                                             }*/
                                        ],
                                        function (err, results) {
                                            if (err) {
                                                logger.writeLog('EditValuePack : ' + JSON.stringify(err));

                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            } else {
                                                var data = {
                                                    vp_plan_name: req.body.PlanName,
                                                    vp_caption: req.body.Caption,
                                                    vp_description: req.body.Description,
                                                    vp_jed_id: req.body.JetId,
                                                    vp_download_limit: req.body.DowmloadLimit,
                                                    vp_duration_limit: req.body.DurationLimit,
                                                    vp_duration_type: req.body.DurationOptions,
                                                    vp_stream_limit: req.body.NoOfStreamContent,
                                                    vp_stream_duration: req.body.StreamDuration,
                                                    vp_stream_setting: req.body.StreamType,
                                                    vp_stream_dur_type: req.body.StreamDurationOptions,
                                                    vp_cty_id: req.body.CountryId,
                                                    vp_modified_on: new Date(),
                                                    vp_modified_by: req.session.Plan_UserName
                                                }
                                                valuePackManager.updateValuePackPlan(connection_ikon_cms, data, req.body.valuepackplanId, function (err, result) {
                                                    if (err) {
                                                        logger.writeLog('updateValuePackPlan : ' + JSON.stringify(err));

                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        valuePackManager.isPlanMappedPackageExist(connection_ikon_cms, req.body.valuepackplanId, function (err, result) {
                                                            if (result.length > 0) {
                                                                updatePackageDate(connection_ikon_cms, 0, result);
                                                            }
                                                        })
                                                        logger.writeLog('updateValuePackPlan : ' + JSON.stringify('Value-Pack Plan Updated successfully.'));

                                                        connection_ikon_cms.release();
                                                        res.send({
                                                            success: true,
                                                            message: 'Value-Pack Plan Updated successfully.'
                                                        });
                                                    }
                                                });
                                            }
                                        })
                                }

                                function updatePackageDate(connection_ikon_cms, cnt, data) {
                                    var j = cnt;
                                    var count = data.length;
                                    valuePackManager.updatePackageDate(connection_ikon_cms, data[j].pvs_sp_pkg_id, function (err, updated) {
                                         if (err) {
                                             logger.writeLog('updatePackageDate : ' + JSON.stringify(err));

                                             connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                            console.log(err.message)
                                        }
                                        else {
                                            cnt++;
                                            if (cnt < count) {
                                                updatePackageDate(connection_ikon_cms, cnt, data);
                                            }
                                        }
                                    });
                                }

                                function AddValuePack() {
                                    async.waterfall([
                                        function (callback) {
                                            //Get alacart plan max id
                                            valuePackManager.getLastInsertedValuePackPlanId(connection_ikon_cms, function (err, result) {
                                                callback(err, result);
                                            });
                                        },
                                        function (group, callback) {
                                            if (req.body.OperatorDetails.length > 0) {
                                                var operator = 0;
                                                addEditOperators(connection_ikon_cms, operator, req.body, req.session);
                                                // addEditOperators(operator);
                                            }
                                            callback(null, group);
                                        },
                                        /*function (group,callback){
                                         if (distributionChannellength > 0) {
                                         var groupID = 1;
                                         if (group[0].group_id != null) {
                                         groupID = parseInt(group[0].group_id) + 1;
                                         }
                                         var distributionChannel = 0;
                                         addDistributionChannel(connection_ikon_cms,distributionChannel,groupID,req.body);

                                         //addDistributionChannel(distributionChannel,groupID);
                                         }
                                         callback(null,groupID);
                                         },
                                         function(group,callback){
                                         //Get subscription plan
                                         alacartaManager.selectLasInsertedSubscriptionPlanIdFromAlacartPlan( connection_ikon_cms, function (err, subMaxId) {
                                         callback(err,{'group_id':group,'ap_id':subMaxId[0].ap_id});
                                         });
                                         }*/
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            logger.writeLog('AddValuePack : ' + JSON.stringify(err));

                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        } else {
                                            var data = {
                                                vp_id: results[0].vp_id != null ? parseInt(results[0].vp_id + 1) : 1,
                                                vp_ld_id: req.session.Plan_UserId,
                                                vp_st_id: req.session.Plan_StoreId,
                                                vp_plan_name: req.body.PlanName,
                                                vp_caption: req.body.Caption,
                                                vp_description: req.body.Description,
                                                vp_jed_id: req.body.JetId,
                                                vp_download_limit: req.body.DowmloadLimit,
                                                vp_duration_limit: req.body.DurationLimit,
                                                vp_duration_type: req.body.DurationOptions,
                                                vp_stream_limit: req.body.NoOfStreamContent,
                                                vp_stream_duration: req.body.StreamDuration,
                                                vp_stream_setting: req.body.StreamType,
                                                vp_cty_id: req.body.CountryId,
                                                vp_stream_dur_type: req.body.StreamDurationOptions,
                                                vp_is_active: 1,
                                                vp_created_on: new Date(),
                                                vp_created_by: req.session.Plan_UserName,
                                                vp_modified_on: new Date(),
                                                vp_modified_by: req.session.Plan_UserName
                                            }

                                            valuePackManager.createValuePackPlan(connection_ikon_cms, data, function (err, result) {
                                                if (err) {
                                                    logger.writeLog('createValuePackPlan : ' + JSON.stringify(err));
                                                    console.log(err.message);
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                    console.log(err)
                                                }
                                                else {
                                                    logger.writeLog('createValuePackPlan : ' + JSON.stringify('Value-Pack Plan added successfully.'));

                                                    connection_ikon_cms.release();
                                                    res.send({
                                                        success: true,
                                                        message: 'Value-Pack Plan added successfully.'
                                                    });
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        });
                }
            })
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}


function addEditOperators(connection_ikon_cms, cnt,data,session) {
    var j = cnt;
    var count = data.OperatorDetails.length;
    subscriptionManager.getOperatorDetails( connection_ikon_cms, data.JetId, data.OperatorDetails[j].partner_name, function( err, disclaimer ) {
        if (err) {
            logger.writeLog('addEditOperators : ' + JSON.stringify(err));

            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            if (disclaimer.length > 0) {
                var disclaimerData = {
                    dcl_disclaimer: data.OperatorDetails[j].dcl_disclaimer,
                    dcl_partner_id: data.OperatorDetails[j].partner_name,
                    dcl_st_id: session.Plan_StoreId,
                    dcl_modified_on: new Date(),
                    dcl_modified_by:  session.Plan_UserName
                }
                subscriptionManager.updateOperatorDetails( connection_ikon_cms, disclaimerData, disclaimer[0].dcl_id, function( err, result ) {
                    if (err) {
                        logger.writeLog('updateOperatorDetails : ' + JSON.stringify(err));

                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    }
                    else {
                        cnt++;
                        if (cnt < count) {
                            addEditOperators(connection_ikon_cms, cnt,data,session);
                        }
                    }
                });
            } else {
                var dclID = 1;
                subscriptionManager.getLastInsertedOperatorId( connection_ikon_cms, function( err, result ) {
                    if (err) {
                        logger.writeLog('getLastInsertedOperatorId : ' + JSON.stringify(err));

                        connection_ikon_cms.release();
                        res.status(500).json(err.message);
                        console.log(err.message)
                    }
                    else {
                        if (result[0].id != null) {
                            dclID = parseInt(result[0].id) + 1;
                        }
                        var disclaimerData = {
                            dcl_id: dclID,
                            dcl_ref_jed_id: data.JetId,
                            dcl_disclaimer: data.OperatorDetails[j].dcl_disclaimer,
                            dcl_partner_id: data.OperatorDetails[j].partner_name,
                            dcl_st_id: session.Plan_StoreId,
                            dcl_created_by: session.Plan_UserName,
                            dcl_created_on: new Date()
                        }
                        subscriptionManager.createOperatorDetails( connection_ikon_cms, disclaimerData, function( err, result ) {
                            if (err) {
                                logger.writeLog('createOperatorDetails : ' + JSON.stringify(err));

                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }
                            else {
                                cnt++;
                                if (cnt < count) {
                                    addEditOperators(connection_ikon_cms, cnt,data,session);
                                    //addEditOperators(cnt);
                                }
                            }
                        });
                    }
                })
            }
        }
    });
}

function addDistributionChannel(connection_ikon_cms,cnt,groupID,data) {
    // function addDistributionChannel(cnt,groupID) {
    var distributionChannellength = data.DistributionChannels.length;

    var cmdID = 1;
    var i = cnt;
    alacartaManager.getLastInsertedDistributionChannelId( connection_ikon_cms, function( err, result ) {
        if (err) {
            logger.writeLog('getLastInsertedDistributionChannelId : ' + JSON.stringify(err));

            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            if (result[0].id != null) {
                cmdID = parseInt(result[0].id) + 1;
            }
            var cmd_data = {
                cmd_id: cmdID,
                cmd_group_id: groupID,
                cmd_entity_type: data.DistributionChannelList[0].cd_cm_id,
                cmd_entity_detail: data.DistributionChannels[i]
            };
            alacartaManager.createDistributionChannel( connection_ikon_cms, cmd_data, function( err, result ) {
                if (err) {
                    logger.writeLog('createDistributionChannel : ' + JSON.stringify(err));

                    connection_ikon_cms.release();
                    res.status(500).json(err.message);
                    console.log(err.message)
                }
                else {
                    cnt++;
                    if (cnt < distributionChannellength) {
                        addDistributionChannel(connection_ikon_cms,cnt,groupID,data)
                        //addDistributionChannel(cnt, groupID);
                    }
                }
            })
        }
    })
    //}
}
