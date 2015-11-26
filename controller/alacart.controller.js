/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var async = require('async');
var config = require('../config')();
var alacartaManager = require("../models/alacartaModel");
var planListManager = require("../models/planListModel");
var subscriptionManager = require("../models/subscriptionModel");

/**
 * @function getalacartadata
 * @param req
 * @param res
 * @param next
 * @description Get all a-la-cart data with contentType and JetEventIds, operator
 */

exports.getalacartadata = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                //mysql.getConnection('BG', function (err, connection_ikon_bg) {
                    async.parallel({
                        StoreId: function (callback) {
                            callback(err, req.session.Plan_StoreId);
                        },
                        PlanData: function (callback) {
                            alacartaManager.getPlanData( connection_ikon_cms, req.body.planid, function (err, alacart) {
                                callback(err, alacart);
                            });
                        },
                        ContentTypes: function (callback) {
                            planListManager.getContentTypesByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, ContentTypes) {

                                callback(err, ContentTypes)
                            });
                        },
                        DeliveryTypes: function (callback) {
                            alacartaManager.getDeliveryTypes(connection_ikon_cms,  function (err, DeliveryTypes ) {
                                callback(err, DeliveryTypes);
                            });
                        },
                        DurationOptions: function (callback) {
                            alacartaManager.getDurationOptions(connection_ikon_cms,  function (err, DurationOptions ) {
                                callback(err, DurationOptions);
                            });
                        },
                        GeoLocations: function (callback) {
                            alacartaManager.getGeoLocationsByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, GeoLocations ) {
                                callback( err, GeoLocations );
                            });
                        },
                        DistributionChannel: function (callback) {
                            alacartaManager.getDistributionChannelsByStoreId(connection_ikon_cms, req.session.Plan_StoreId, function (err, DistributionChannel ) {
                                callback( err, DistributionChannel );
                            });
                        },
                        /*JetEvents: function (callback) {
                            alacartaManager.getJetEventsByStoreId(connection_ikon_bg, req.session.Plan_StoreId, function (err, JetEvents ) {
                                callback( err, JetEvents );
                            });
                        },*/
                        OperatorDetail: function (callback) {
                            alacartaManager.getOperatorDetail( connection_ikon_cms, function (err, OperatorDetails) {
                                callback( err, OperatorDetails );
                            });
                        },
                        selectedDistributionChannel: function (callback) {
                            alacartaManager.getSelectedDistributionChannelByPlanId( connection_ikon_cms, req.body.planid, function ( err, selectedDistributionChannel ) {
                                callback( err, selectedDistributionChannel );
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
                            //connection_ikon_bg.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            //connection_ikon_bg.release();
                            res.send(results);
                        }
                    });
                })
            //})
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.messagDistributionChannele);
    }
}

/**
 * @function addeditalacart
 * @param req
 * @param res
 * @param next
 * @description add & edit records in a-la-cart data
 */
exports.addeditalacart = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                async.waterfall([
                    function (callback) {
                        alacartaManager.getAlacartPlanByName( connection_ikon_cms, req.body.PlanName.toLowerCase(), function( err, result  ) {
                            if(result.length > 0){
                                callback(err, {'exist':true,'plans':result});
                            }else{
                                callback(err, {'exist':false,'plans':result});
                            }
                        });
                    },
                    function(data, callback){
                        if(data.exist == true && data.plans[0].plan_id != req.body.alacartplanid ){
                            callback(null, {'exist':data.exist,'message': 'Plan Name Must be Unique'});
                        }else{
                            callback(null, {'exist':data.exist});
                        }
                    }
                ],
                function(err, results) {
                    if(results.message){
                        connection_ikon_cms.release();
                        res.send({"success" : false,"message" : results.message});
                    }else{
                        if (req.body.planid) {
                            EditALacart();
                        } else {
                            AddAlacart();
                        }
                        var count = req.body.OperatorDetails.length;

                        var distributionChannellength = req.body.DistributionChannels.length;

                        function EditALacart() {
                            async.waterfall([
                                    function(callback){
                                        //Get alacar plan
                                        alacartaManager.getAlacartPlanByPlanId( connection_ikon_cms, req.body.planid, function (err, alacart) {
                                            callback( err,alacart );
                                        });
                                    },
                                    function (alacart,callback){
                                        if (req.body.OperatorDetails.length > 0) {
                                            var operator = 0;
                                            addEditOperators(connection_ikon_cms, operator,req.body,req.session);

                                            //addEditOperators(operator);
                                        }
                                        callback(null,alacart);
                                    },
                                    function (alacart,callback){
                                        if (distributionChannellength > 0) {
                                            var distributionChannel = 0;
                                            alacartaManager.deleteDistributionChannel( connection_ikon_cms, alacart[0].ap_channel_front, function( err, result ) {
                                                addDistributionChannel(connection_ikon_cms,distributionChannel,alacart[0].ap_channel_front,req.body);

                                                //addDistributionChannel(distributionChannel, alacart[0].ap_channel_front );
                                            })
                                        }
                                        callback(err,alacart);
                                    }
                                ],
                                function(err, results){
                                    if(err){
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }else {
                                        var data = {
                                            ap_plan_name: req.body.PlanName,
                                            ap_caption: req.body.Caption,
                                            ap_description: req.body.Description,
                                            ap_jed_id: req.body.JetId,
                                            ap_cty_id: req.body.CountryId,
                                            ap_content_type: req.body.ContentType,
                                            ap_delivery_type: req.body.DeliveryType,
                                            ap_no_of_stream: req.body.NoOfStream,
                                            ap_stream_duration: req.body.StreamDuration,
                                            ap_stream_dur_type: req.body.StreamDurationType,
                                            ap_stream_setting: req.body.StreamSetting,
                                            ap_modified_on: new Date(),
                                            ap_modified_by: req.session.Plan_UserName
                                        };
                                        //console.log(data)
                                        alacartaManager.updateIcnAlacartPlan( connection_ikon_cms, data, req.body.alacartplanid, function( err , result ) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({
                                                    success: true,
                                                    message: 'A-La-Cart Plan Updated successfully.'
                                                });
                                            }
                                        });
                                    }
                                })
                        }

                        function AddAlacart() {
                            async.waterfall([
                                    function(callback){
                                        //Get alacart plan max id
                                        alacartaManager.getLastInsertedAlacartPlanIdFromMultiSelectMetaDataDetail( connection_ikon_cms, function (err, group) {
                                            callback(err,group);
                                        });
                                    },
                                    function (group,callback){
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
                                    function (group,callback){
                                        if (req.body.OperatorDetails.length > 0) {
                                            var operator = 0;
                                            addEditOperators(connection_ikon_cms, operator,req.body,req.session);
                                           // addEditOperators(operator);
                                        }
                                        callback(null,group);
                                    },
                                    function(group,callback){
                                        //Get subscription plan
                                        alacartaManager.selectLasInsertedSubscriptionPlanIdFromAlacartPlan( connection_ikon_cms, function (err, subMaxId) {
                                            callback(err,{'group_id':group,'ap_id':subMaxId[0].ap_id});
                                        });
                                    }
                                ],
                                function(err, results) {
                                    if (err) {
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    } else {
                                        var data = {
                                            ap_id: results.ap_id != null ? parseInt(results.ap_id + 1) : 1,
                                            ap_ld_id: req.session.Plan_UserId,
                                            ap_st_id: req.session.Plan_StoreId,
                                            ap_plan_name: req.body.PlanName,
                                            ap_caption: req.body.Caption,
                                            ap_description: req.body.Description,
                                            ap_jed_id: req.body.JetId,
                                            ap_content_type: req.body.ContentType,
                                            ap_delivery_type: req.body.DeliveryType,
                                            ap_is_active: 1,
                                            ap_channel_front: results.group_id,
                                            ap_no_of_stream: req.body.NoOfStream,
                                            ap_stream_duration: req.body.StreamDuration,
                                            ap_stream_dur_type: req.body.StreamDurationType,
                                            ap_cty_id: req.body.CountryId,
                                            ap_stream_setting: req.body.StreamSetting,
                                            ap_created_on: new Date(),
                                            ap_created_by: req.session.Plan_UserName,
                                            ap_modified_on: new Date(),
                                            ap_modified_by: req.session.Plan_UserName
                                        }

                                        alacartaManager.createIcnAlacartPlan( connection_ikon_cms, data, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                connection_ikon_cms.release();
                                                res.send({
                                                    success: true,
                                                    message: 'A-La-Cart Plan added successfully.'
                                                });
                                            }
                                        });
                                    }
                                })
                        }
                    }
                })
            });
        }
        else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        connection_ikon_cms.release();
        res.status(500).json(err.message);
    }
}

function addEditOperators(connection_ikon_cms, cnt,data,session) {
    var j = cnt;
    var count = data.OperatorDetails.length;
    subscriptionManager.getOperatorDetails( connection_ikon_cms, data.JetId, data.OperatorDetails[j].partner_id, function( err, disclaimer ) {
        if (err) {
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            if (disclaimer.length > 0) {
                var disclaimerData = {
                    dcl_disclaimer: data.OperatorDetails[j].dcl_disclaimer,
                    dcl_partner_id: data.OperatorDetails[j].partner_id,
                    dcl_st_id: session.Plan_StoreId,
                    dcl_modified_on: new Date(),
                    dcl_modified_by:  session.Plan_UserName
                }
                subscriptionManager.updateOperatorDetails( connection_ikon_cms, disclaimerData, disclaimer[0].dcl_id, function( err, result ) {
                    if (err) {
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
                            dcl_partner_id: data.OperatorDetails[j].partner_id,
                            dcl_st_id: session.Plan_StoreId,
                            dcl_created_by: session.Plan_UserName,
                            dcl_created_on: new Date()
                        }
                        subscriptionManager.createOperatorDetails( connection_ikon_cms, disclaimerData, function( err, result ) {
                            if (err) {
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
