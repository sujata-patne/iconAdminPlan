/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var async = require('async');
var config = require('../config')();
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
                mysql.getConnection('BG', function (err, connection_ikon_bg) {
                    async.parallel({
                        PlanData: function (callback) {
                            var query = connection_ikon_cms.query('SELECT * FROM icn_alacart_plan where ap_id =? ', [req.body.planid], function (err, alacart) {
                                callback(err, alacart)
                            })
                        },
                        ContentTypes: function (callback) {
                            var query = connection_ikon_cms.query('select cd.*, ct.mct_parent_cnt_type_id, ' +
                                '(SELECT cd_name FROM catalogue_detail as cd1 join catalogue_master as cm1 ON  cm1.cm_id = cd1.cd_cm_id WHERE ct.mct_parent_cnt_type_id = cd1.cd_id) AS parent_name ' +
                                'from icn_store As st ' +
                                'inner join multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
                                'inner join catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
                                'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
                                'WHERE st.st_id = ? ', [req.session.Plan_StoreId], function (err, ContentTypes) {
                                callback(err, ContentTypes)
                            })
                        },
                        DeliveryTypes: function (callback) {
                            var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Delivery Type")', function (err, DeliveryTypes) {
                                callback(err, DeliveryTypes)
                            })
                        },
                        DurationOptions: function (callback) {
                            var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
                                callback(err, DurationOptions)
                            })
                        },
                        GeoLocations: function (callback) {
                            var query = connection_ikon_cms.query('SELECT DISTINCT(`cd_id`) as geoID, `cd_name` as geoName FROM `multiselect_metadata_detail` AS m ' +
                                'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ' +
                                'LEFT JOIN catalogue_detail AS cd ON cd.cd_id = m.cmd_entity_detail ' +
                                'LEFT JOIN catalogue_master AS cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name IN ("global_country_list") and s.st_id = ? ', [req.session.Plan_StoreId], function (err, GeoLocations) {
                                callback(err, GeoLocations)
                            })
                        },
                        DistributionChannel: function (callback) {
                            var query = connection_ikon_cms.query('select cd.* FROM catalogue_detail as cd ' +
                                'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                                'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [req.session.Plan_StoreId], function (err, DistributionChannel) {
                                callback(err, DistributionChannel)
                            })
                        },
                        JetEvents: function (callback) {
                            var query = connection_ikon_bg.query('SELECT event.* FROM billing_ef_bgw_event as event '+
                            'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid  '+
                            'JOIN billing_event_family AS family ON family.ef_id = event.ebe_ef_id  '+
                            'JOIN billing_telco_master_event_index AS master ON family.ef_tmi_id = master.tmi_id  '+
                            'JOIN billing_enum_data AS enum ON enum.en_id = master.tmi_pp_classification '+
                            'WHERE enum.en_type = "payment_type" AND enum.en_description = "One Time" AND event.ebe_is_valid = 1 AND event.ebe_ai_bgw_id is not null AND info.ai_app_id = ? ' +
                            'GROUP BY event.ebe_ef_id',[req.session.Plan_StoreId], function (err, JetEvents) {
                            /*var query = connection_ikon_bg.query('SELECT event.* FROM billing_ef_bgw_event as event ' +
                                'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid ' +
                                'JOIN billing_telco_alacarte_detail AS alacart ON alacart.bta_ef_id = event.ebe_ef_id ' +
                                'WHERE event.ebe_is_valid = 1 and event.ebe_ai_bgw_id is not null ' +
                                'AND info.ai_app_id = ? GROUP BY event.ebe_ef_id', [req.session.Plan_StoreId], function (err, JetEvents) {*/
                                callback(err, JetEvents)
                            })
                        },
                        OperatorDetail: function (callback) {
                            /*var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, alacart.bta_ef_id, alacart.bta_id,alacart.bta_name,alacart.bta_amt, partner.partner_name, partner.partner_id ' +
                                'FROM ' + config.db_name_ikon_bg + '.billing_ef_bgw_event as event ' +
                                'JOIN ' + config.db_name_ikon_bg + '.billing_telco_alacarte_detail AS alacart ON alacart.bta_ef_id = event.ebe_ef_id ' +
                                'JOIN ' + config.db_name_ikon_bg + '.billing_partner AS partner ON partner.partner_id = alacart.bta_partner_id ' +
                                'left JOIN ' + config.db_name_ikon_cms + '.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = alacart.bta_ef_id AND dis.dcl_partner_id = alacart.bta_partner_id', function (err, OperatorDetails) {*/
                            var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, bge.ebe_ef_id, master.tmi_id,master.tmi_amt,master.tmi_name, partner.partner_name, partner.partner_id, partner.partner_cty_id as country ' +
                                'FROM '+config.db_name_ikon_bg+'.billing_ef_bgw_event as bge JOIN '+config.db_name_ikon_bg+'.billing_event_family AS bef ON bef.ef_id = bge.ebe_ef_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_telco_master_event_index AS master ON bef.ef_tmi_id = master.tmi_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                'LEFT JOIN '+config.db_name_ikon_cms+'.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = bge.ebe_ef_id AND dis.dcl_partner_id = master.tmi_partner_id ' +
                                'GROUP BY master.tmi_parent_id ', function (err, OperatorDetails) {
                                callback(err, OperatorDetails)
                            })
                        },
                        selectedDistributionChannel: function (callback) {
                            var query = connection_ikon_cms.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd ' +
                                'JOIN icn_alacart_plan AS alplan ON mmd.cmd_group_id = alplan.ap_channel_front ' +
                                'WHERE alplan.ap_id =? ', [req.body.planid], function (err, selectedDistributionChannel) {
                                callback(err, selectedDistributionChannel)
                            })
                        },
                        RoleUser: function (callback) {
                            //Get User Role
                            callback(null, req.session.Plan_UserRole);
                        }
                    },
                    function (err, results) {
                        //console.log(results.OperatorDetails)
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
                        var query = connection_ikon_cms.query('(select alacart.ap_id as plan_id from icn_alacart_plan as alacart where lower(alacart.ap_plan_name) = ? ) '+
                        ' UNION ' +
                        '(select subscription.sp_id as plan_id from icn_sub_plan AS subscription where lower(subscription.sp_plan_name) = ? ) ' +
                        ' UNION ' +
                        '(select valupack.vp_id as plan_id from icn_valuepack_plan as valupack where lower(valupack.vp_plan_name) = ? ) ', [req.body.PlanName.toLowerCase(),req.body.PlanName.toLowerCase(),req.body.PlanName.toLowerCase()], function (err, result) {
                            if(result.length > 0){
                                callback(err, {'exist':true,'plans':result});
                            }else{
                                callback(err, {'exist':false,'plans':result});
                            }
                        })
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
                        }
                        else {
                            AddAlacart();
                        }
                        var count = req.body.OperatorDetails.length;
                        function addEditOperators(cnt) {
                            var j = cnt;
                            var query = connection_ikon_cms.query('SELECT * FROM icn_disclaimer WHERE dcl_ref_jed_id = ? AND dcl_partner_id = ?', [req.body.JetId, req.body.OperatorDetails[j].partner_id], function (err, disclaimer) {
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
                                            dcl_modified_by:  req.session.Plan_UserName
                                        }
                                        var query = connection_ikon_cms.query('UPDATE icn_disclaimer SET ? where dcl_id = ?', [disclaimerData,disclaimer[0].dcl_id], function (err, result) {
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
                                        var query = connection_ikon_cms.query('SELECT MAX(dcl_id) AS id FROM icn_disclaimer', function (err, result) {
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
                                                    dcl_created_on: new Date()
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO icn_disclaimer SET ?', disclaimer, function (err, result) {
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

                        var distributionChannellength = req.body.DistributionChannels.length;
                        function addDistributionChannel(cnt,groupID) {
                            var cmdID = 1;
                            var i = cnt;
                            var query = connection_ikon_cms.query('SELECT MAX(cmd_id) AS id FROM multiselect_metadata_detail', function (err, result) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }
                                else {
                                    if (result[0].id != null) {
                                        cmdID = parseInt(result[0].id) + 1;
                                    }
                                    var cmd_data = {
                                        cmd_id: cmdID,
                                        cmd_group_id: groupID,
                                        cmd_entity_type: req.body.DistributionChannelList[0].cd_cm_id,
                                        cmd_entity_detail: req.body.DistributionChannels[i]
                                    };
                                    //console.log(cmd_data)
                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.end();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            cnt = cnt + 1;
                                            if (cnt < distributionChannellength ) {
                                                addDistributionChannel(cnt, groupID);
                                            }
                                        }
                                    })
                                }
                            })
                        }

                        function EditALacart() {
                            async.waterfall([
                                    function(callback){
                                        //Get alacar plan
                                        var query = connection_ikon_cms.query('select * from icn_alacart_plan where ap_id = ?', [req.body.planid], function (err, alacart) {
                                            callback(err,alacart);
                                        });
                                    },
                                    function (alacart,callback){
                                        if (req.body.OperatorDetails.length > 0) {
                                            var operator = 0;
                                            addEditOperators(operator);
                                        }
                                        callback(null,alacart);
                                    },
                                    function (alacart,callback){
                                        if (distributionChannellength > 0) {
                                            var distributionChannel = 0;
                                            var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [alacart[0].ap_channel_front], function (err, result) {
                                                addDistributionChannel(distributionChannel, alacart[0].ap_channel_front);
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
                                        var query = connection_ikon_cms.query('UPDATE icn_alacart_plan SET ? where ap_id =?', [data, req.body.alacartplanid], function (err, result) {
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
                                        var query = connection_ikon_cms.query('SELECT MAX(cmd_group_id) AS group_id FROM multiselect_metadata_detail', function (err, group) {
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
                                            addDistributionChannel(distributionChannel,groupID);
                                        }
                                        callback(null,groupID);
                                    },
                                    function (group,callback){
                                        if (req.body.OperatorDetails.length > 0) {
                                            var operator = 0;
                                            addEditOperators(operator);
                                        }
                                        callback(null,group);
                                    },
                                    function(group,callback){
                                        //Get subscription plan
                                        var query = connection_ikon_cms.query('select max(ap_id) as ap_id from icn_alacart_plan', function (err, subMaxId) {
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

                                        var query = connection_ikon_cms.query('INSERT INTO icn_alacart_plan SET ?', data, function (err, result) {
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
