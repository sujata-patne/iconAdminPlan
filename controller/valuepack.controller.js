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
                mysql.getConnection('BG', function (err, connection_ikon_bg) {
                    async.parallel({
                        StoreId: function (callback) {
                            callback(err, req.session.Plan_StoreId);
                        },
                        PlanData: function (callback) {
                            valuePackManager.getPlanData( connection_ikon_cms, req.body.planid, function ( err, valueplan ) {
                                callback(err, valueplan);
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
                        JetEvents: function (callback) {
                            alacartaManager.getJetEventsByStoreId(connection_ikon_bg, req.session.Plan_StoreId, function (err, JetEvents ) {
                                callback( err, JetEvents );
                            });
                        },
                        OperatorDetail: function (callback) {
                            alacartaManager.getOperatorDetail( connection_ikon_bg, config.db_name_ikon_bg, config.db_name_ikon_cms, function (err, OperatorDetails) {
                                callback( err, OperatorDetails );
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
                            connection_ikon_bg.release();
                            res.status(500).json(err.message);
                            console.log(err.message)
                        } else {
                            connection_ikon_cms.release();
                            connection_ikon_bg.release();
                            res.send(results);
                        }
                    });
                })
            })
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
                async.waterfall([
                    function (callback) {
                        valuePackManager.getValuePackPlanByName( connection_ikon_cms, req.body.PlanName.toLowerCase(), function( err, result  ) {
                            if( result != undefined && result.length > 0){
                                callback(err, {'exist':true,'plans':result});
                            }else{
                                callback(err, {'exist':false,'plans':result});
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
                        res.send({"success": false, "message": results.message});
                    } else {
                        if (req.body.planid) {
                            EditValuePack();
                        }
                        else {
                            AddValuePack();
                        }
                        var count = req.body.OperatorDetails.length;

                        function addEditOperators(cnt) {
                            var j = cnt;
                            subscriptionManager.getOperatorDetails( connection_ikon_cms, data.JetId, data.OperatorDetails[j].partner_id, function( err, disclaimer ) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    if (disclaimer.length > 0) {
                                        var disclaimerData = {
                                            dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                                            dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                                            dcl_st_id: req.session.Plan_StoreId,
                                            dcl_modified_on: new Date(),
                                            dcl_modified_by: req.session.Plan_UserName
                                        }
                                        subscriptionManager.updateOperatorDetails( connection_ikon_cms, disclaimerData, disclaimer[0].dcl_id, function( err, result ) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                cnt++;
                                                if (cnt < count) {
                                                    addEditOperators(cnt);
                                                }
                                            }
                                        });
                                    } else {
                                        var dclID = 1;
                                        subscriptionManager.getLastInsertedOperatorId( connection_ikon_cms, function( err, result ) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {
                                                if (result[0].id != null) {
                                                    dclID = parseInt(result[0].id) + 1;
                                                }
                                                var disclaimer = {
                                                    dcl_id: dclID,
                                                    dcl_ref_jed_id: req.body.JetId,
                                                    dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                                                    dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                                                    dcl_st_id: req.session.Plan_StoreId,
                                                    dcl_created_by: req.session.Plan_UserName,
                                                    dcl_created_on: new Date(),
                                                }
                                                subscriptionManager.createOperatorDetails( connection_ikon_cms, disclaimer, function( err, result ) {
                                                    if (err) {
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        cnt++;
                                                        if (cnt < count) {
                                                            addEditOperators(cnt);
                                                        }
                                                    }
                                                });
                                            }
                                        })
                                    }
                                }
                            });
                        }

                        function EditValuePack() {
                            valuePackManager.getValuePackPlanByPlanId( connection_ikon_cms, req.body.valuepackplanId, function (err, result ) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    if (result.length > 0) {
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
                                        valuePackManager.updateValuePackPlan( connection_ikon_cms, data, req.body.valuepackplanId, function (err, result) {
                                            if (err) {
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }
                                            else {

                                                connection_ikon_cms.release();
                                                res.send({
                                                    success: true,
                                                    message: 'Value-Pack Plan Updated successfully.'
                                                });

                                            }
                                        });
                                    }
                                    else {
                                        connection_ikon_cms.release();
                                        res.send({success: false, message: 'Invalid Value-Pack Plan Id.'});
                                    }
                                }
                            });
                        }

                        function AddValuePack() {
                            valuePackManager.getLastInsertedValuePackPlanId( connection_ikon_cms, function (err, result) {
                                if (err) {
                                    console.log(err.message);
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    var data = {
                                        vp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
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
                                    valuePackManager.createValuePackPlan( connection_ikon_cms, data, function( err, result ) {
                                        if (err) {
                                            console.log(err.message);
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                            console.log(err)
                                        }
                                        else {
                                            connection_ikon_cms.release();
                                            res.send({
                                                success: true,
                                                message: 'Value-Pack Plan added successfully.'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            })
        }else {
            res.redirect('/accountlogin');
        }
    }
    catch (err) {
        res.status(500).json(err.message);
    }
}