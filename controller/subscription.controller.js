/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var config = require('../config')();
var async = require("async");
/**
 * @function getsubscriptions
 * @param req
 * @param res
 * @param next
 * @description get all records in subscription plan
 */
exports.getsubscriptions = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName && req.session.Plan_StoreId ) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                mysql.getConnection('BG', function (err, connection_ikon_bg) {
                    async.parallel({
                        PlanData: function (callback) {
                            //Get subscription plan data
                            var query = connection_ikon_cms.query('SELECT * FROM icn_sub_plan where sp_id =? ', [req.body.planid], function (err, subplan) {
                                callback(err, subplan);
                            });
                        },
                        AlacartaData: function (callback) {
                            var query = connection_ikon_cms.query('SELECT sctp.* ' +
                                'FROM subscription_content_type_plan AS sctp ' +
                                'join icn_sub_plan as sp ON sp.sp_id = sctp.sctp_sp_id ' +
                                'WHERE sp.sp_id = ? ', [req.body.planid], function (err, AlacartaData) {
                                callback(err, AlacartaData)
                            })
                        },
                        ContentTypes: function (callback) {
                            var query = connection_ikon_cms.query('select cd.*, ct.mct_parent_cnt_type_id, ' +
                                '(SELECT cd_name FROM catalogue_detail as cd1 join catalogue_master as cm1 ON  cm1.cm_id = cd1.cd_cm_id WHERE ct.mct_parent_cnt_type_id = cd1.cd_id) AS parent_name ' +
                                'FROM icn_store As st ' +
                                'INNER JOIN multiselect_metadata_detail as mlm on (mlm.cmd_group_id = st.st_content_type) ' +
                                'INNER JOIN catalogue_detail As cd on mlm.cmd_entity_detail = cd.cd_id ' +
                                'JOIN icn_manage_content_type as ct ON ct.mct_cnt_type_id = cd.cd_id ' +
                                'WHERE st.st_id = ? ', [req.session.Plan_StoreId],  function (err, ContentTypes) {
                                callback(err, ContentTypes);
                            })
                        },
                        DistributionChannel: function (callback) {
                            //Get distribution channels
                            var query = connection_ikon_cms.query('select cd.* FROM catalogue_detail as cd ' +
                                'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                                'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [req.session.Plan_StoreId], function (err, DistributionChannel) {
                                callback(err, DistributionChannel)
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
                        DurationOptions: function (callback) {
                            /** get stream duration list  */
                            var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd ' +
                                'join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
                                callback(err, DurationOptions)
                            })
                        },
                        JetEvents: function (callback) {
                            /*var query = connection_ikon_bg.query('SELECT event.*, master.tmi_content_type as contentType, partner.partner_cty_id as country FROM billing_ef_bgw_event as event '+
                                'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid  '+
                                'JOIN billing_event_family AS family ON family.ef_id = event.ebe_ef_id  '+
                                'JOIN billing_telco_master_event_index AS master ON family.ef_tmi_id = master.tmi_id  '+
                                'JOIN billing_enum_data AS enum ON enum.en_id = master.tmi_pp_classification '+
                                'JOIN billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                'WHERE enum.en_type = "payment_type" AND enum.en_description = "One Time" AND event.ebe_is_valid = 1 AND event.ebe_ai_bgw_id is not null AND info.ai_app_id = ? ' +
                                'GROUP BY event.ebe_ef_id',[req.session.Plan_StoreId], function (err, JetEvents) { //Subscriptions*/
                            var query = connection_ikon_bg.query('SELECT event.*, master.tmi_content_type as contentType, partner.partner_cty_id as country FROM billing_ef_bgw_event as event '+
                                'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid  '+
                                'JOIN billing_event_family AS family ON family.ef_id = event.ebe_ef_id  '+
                                'JOIN billing_telco_master_event_index AS master ON family.ef_tmi_id = master.tmi_id  '+
                                'JOIN billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                'JOIN billing_enum_data AS enum ON enum.en_id = master.tmi_pp_classification '+
                                'WHERE enum.en_type = "payment_type" AND enum.en_description = "One Time" AND event.ebe_is_valid = 1 AND event.ebe_ai_bgw_id is not null AND info.ai_app_id = ? ' +
                                'GROUP BY master.tmi_parent_id',[req.session.Plan_StoreId], function (err, JetEvents) {
                                callback(err, JetEvents)
                            })
                        },
                        OperatorDetail: function (callback) {
                            var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, bge.ebe_ef_id, master.tmi_id,master.tmi_amt,master.tmi_name, partner.partner_name, partner.partner_id, bge.ebe_bgw_id_desc as duration , partner.partner_cty_id as country ' +
                                'FROM '+config.db_name_ikon_bg+'.billing_ef_bgw_event as bge JOIN '+config.db_name_ikon_bg+'.billing_event_family AS bef ON bef.ef_id = bge.ebe_ef_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_telco_master_event_index AS master ON bef.ef_tmi_id = master.tmi_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                'LEFT JOIN '+config.db_name_ikon_cms+'.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = bge.ebe_ef_id AND dis.dcl_partner_id = master.tmi_partner_id ' +
                                'GROUP BY master.tmi_parent_id ', function (err, OperatorDetails) {
                                callback(err, OperatorDetails)
                            })
                        },
                        ContentTypeData: function (callback) {
                            var query = connection_ikon_cms.query('SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
                                'FROM icn_alacart_plan AS plan ' +
                                'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
                                'WHERE plan.ap_st_id = ? ', [req.session.Plan_StoreId], function (err, alacart) {
                                callback(err, alacart)
                            })
                        },
                        selectedDistributionChannel: function (callback) {
                            /** get list of selected distribution channels */
                            var query = connection_ikon_cms.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd ' +
                                'JOIN icn_sub_plan AS subplan ON mmd.cmd_group_id = subplan.sp_channel_front ' +
                                'WHERE subplan.sp_id =? ', [req.body.planid], function (err, selectedDistributionChannel) {
                                callback(err, selectedDistributionChannel)
                            })
                        },
                        RoleUser: function (callback) {
                            //Get User Role
                            callback(null, req.session.Plan_UserRole);
                        }
                    },
                    function (err, results) {
                        //console.log(results.AlacartaData)
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
                });
            });
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
 * @function addeditsubscriptions
 * @param req
 * @param res
 * @param next
 * @description add new subscription plan and update selected subscription plan
 */
exports.addeditsubscriptions = function (req, res, next) {
    try {
        if (req.session && req.session.Plan_UserName) {
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
                        if(data.exist == true && data.plans[0].plan_id != req.body.subplanId){
                            callback(null, {'exist':data.exist,'message': 'Plan Name Must be Unique'});
                        }else{
                            callback(null, {'exist':data.exist});
                        }
                    }
                ],
                function(err, results) {
                    if (results.message) {
                        connection_ikon_cms.release();
                        res.send({"success": false, "message": results.message});
                    } else {
                        if (req.body.planid) {
                            EditSubscriptions();
                        }
                        else {
                            AddSubscriptions();
                        }
                        var count = req.body.OperatorDetails.length;
                        function addEditOperators(cnt) {
                            var j = cnt;
                            var query = connection_ikon_cms.query('SELECT * FROM icn_disclaimer WHERE dcl_ref_jed_id = ? AND dcl_partner_id = ?', [req.body.JetId, req.body.OperatorDetails[j].partner_id], function (err, disclaimer) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
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
                                                console.log(err.message)
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
                                                console.log(err.message)
                                            }
                                            else {
                                                if (result[0].id != null) {
                                                    dclID = parseInt(result[0].id) + 1;
                                                }
                                                var disclaimerData = {
                                                    dcl_id: dclID,
                                                    dcl_ref_jed_id: req.body.JetId,
                                                    dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                                                    dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                                                    dcl_st_id: req.session.Plan_StoreId,
                                                    dcl_created_by: req.session.Plan_UserName,
                                                    dcl_created_on: new Date()
                                                }
                                                var query = connection_ikon_cms.query('INSERT INTO icn_disclaimer SET ?', disclaimerData, function (err, result) {
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

                        var plans = req.body.ContentTypes.length;
                        function addEditPlans(cnt,subPlanId) {
                            var j = cnt;
                            var ContentTypeId = req.body.ContentTypes[j].cd_id;

                            var downloadId = ('download' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].download : '';
                            var streamingId = ('streaming' in data.alacartPlansList[ContentTypeId]) ? data.alacartPlansList[ContentTypeId].streaming : '';


                            var ContentTypePlanData = {
                                sctp_sp_id: subPlanId,
                                sctp_content_type_id: ContentTypeId,
                                sctp_download_id: downloadId,
                                sctp_stream_id: streamingId
                            }
                            var query = connection_ikon_cms.query('INSERT INTO subscription_content_type_plan SET ?', ContentTypePlanData, function (err, result) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err.message)
                                }
                                else {
                                    cnt++;
                                    console.log(cnt +' : '+ plans)
                                    if (cnt < plans) {
                                        addEditPlans(cnt,subPlanId);
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
                                    console.log(err.message)
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

                                    var query = connection_ikon_cms.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                            console.log(err.message)
                                        }
                                        else {
                                            cnt++;
                                            if (cnt < distributionChannellength) {
                                                addDistributionChannel(cnt, groupID);
                                            }
                                        }
                                    })
                                }
                            })
                        }

                        function EditSubscriptions() {
                            async.waterfall([
                                function(callback){
                                    //Get subscription plan
                                    var query = connection_ikon_cms.query('select * from icn_sub_plan where sp_id = ?', [req.body.subplanId], function (err, subscription) {
                                        callback(err,subscription);
                                    });
                                },
                                function (subscription,callback){
                                    if (req.body.OperatorDetails.length > 0) {
                                        var operator = 0;
                                        addEditOperators(operator);
                                    }
                                    callback(null,subscription);
                                },
                                function (subscription,callback){
                                    if (distributionChannellength > 0) {
                                        var distributionChannel = 0;
                                        var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [subscription[0].sp_channel_front], function (err, result) {
                                            addDistributionChannel(distributionChannel, subscription[0].sp_channel_front);
                                        })
                                    }
                                    callback(err,subscription);
                                },
                                function (subscription,callback){
                                    if (plans > 0 && req.body.atCostFreePaid === 'paid') {
                                        var contentType = 0;
                                        var query = connection_ikon_cms.query('DELETE FROM  subscription_content_type_plan WHERE sctp_sp_id = ? ', [req.body.subplanId], function (err, result) {
                                            addEditPlans(contentType, req.body.subplanId);
                                        })
                                    }
                                    callback(err,subscription);
                                }
                            ],
                            function(err, results){
                                //console.log(results)
                                if(err){
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                }else{
                                    var data = {
                                        sp_plan_name: req.body.PlanName,
                                        sp_caption: req.body.Caption,
                                        sp_description: req.body.Description,
                                        sp_jed_id: req.body.JetId,
                                        sp_tnb_days: req.body.offerForDays,

                                        sp_tnb_free_cnt_limit: req.body.numContentOffer,
                                        sp_single_day_cnt_limit: req.body.limitSingleDay,
                                        sp_full_sub_cnt_limit: req.body.fullSubDuration,
                                        sp_tnb_stream_cnt_limit: req.body.slc_tnb_free_cnt_limit,
                                        sp_single_day_steam_limit: req.body.slc_single_day_cnt_limit,
                                        sp_single_day_stream_dur: req.body.sld_single_day_cnt_limit,
                                        sp_single_day_stream_dur_type: req.body.sld_single_day_cnt_duration,

                                        sp_tnb_stream_duration: req.body.sld_tnb_free_cnt_limit,
                                        sp_tnb_stream_dur_type: req.body.sld_tnb_free_cnt_duration,

                                        sp_full_sub_stream_limit: req.body.slc_full_sub_cnt_limit,
                                        sp_full_sub_stream_duration: req.body.sld_full_sub_cnt_limit,
                                        sp_full_sub_stream_dur_type: req.body.sld_full_sub_cnt_duration,
                                        sp_stream_setting: req.body.streamingLimitType,

                                        sp_cty_id: req.body.geoLocationId,
                                        sp_is_active: 1,
                                        sp_plan_duration: req.body.planDuration,
                                        sp_plan_dur_type: req.body.planDurationOption,

                                        sp_modified_on: new Date(),
                                        sp_modified_by: req.session.Plan_UserName
                                    }
                                    var query = connection_ikon_cms.query(' UPDATE icn_sub_plan SET ?' +
                                        'WHERE sp_id =?', [data, req.body.subplanId], function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            connection_ikon_cms.release();
                                            res.send({ success: true, message: 'Subscription Plan Updated successfully.' });
                                        }
                                    });
                                }
                            });
                        }

                        function AddSubscriptions() {
                            async.waterfall([
                                function(callback){
                                    //Get subscription plan
                                    var query = connection_ikon_cms.query('SELECT MAX(cmd_group_id) AS group_id FROM multiselect_metadata_detail', function (err, group) {
                                        callback(err,group);
                                    });
                                },
                                function (group,callback){
                                    if (req.body.OperatorDetails.length > 0) {
                                        var operator = 0;
                                        addEditOperators(operator);
                                    }
                                    callback(null,group);
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

                                function(group,callback){
                                    //Get subscription plan
                                    var query = connection_ikon_cms.query('SELECT MAX(sp_id) AS sp_id FROM icn_sub_plan', function (err, subMaxId) {
                                        callback(err,group,subMaxId);
                                    });
                                },
                                function (group,subMaxId,callback){
                                    if (plans > 0 && req.body.atCostFreePaid === 'paid') {
                                        var contentType = 0;
                                        var sp_id = subMaxId[0].sp_id != null ?  parseInt(subMaxId[0].sp_id + 1) : 1;
                                        addEditPlans(contentType, sp_id);
                                    }
                                    callback(null,{'group_id':group,'sp_id':subMaxId[0].sp_id});
                                }
                            ],
                            function(err, results) {
                                 if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                } else {
                                    var data = {
                                        sp_id: results.sp_id != null ? parseInt(results.sp_id + 1) : 1,
                                        sp_ld_id: req.session.Plan_UserId,
                                        sp_st_id: req.session.Plan_StoreId,
                                        sp_plan_name: req.body.PlanName,
                                        sp_caption: req.body.Caption,
                                        sp_description: req.body.Description,
                                        sp_jed_id: req.body.JetId,
                                        sp_tnb_days: req.body.offerForDays,

                                        sp_tnb_free_cnt_limit: req.body.numContentOffer,
                                        sp_single_day_cnt_limit: req.body.limitSingleDay,
                                        sp_full_sub_cnt_limit: req.body.fullSubDuration,

                                        sp_channel_front : results.group_id,
                                        sp_tnb_stream_cnt_limit: req.body.slc_tnb_free_cnt_limit,
                                        sp_single_day_steam_limit: req.body.slc_single_day_cnt_limit,
                                        sp_single_day_stream_dur: req.body.sld_single_day_cnt_limit,
                                        sp_single_day_stream_dur_type: req.body.sld_single_day_cnt_duration,

                                        sp_tnb_stream_duration: req.body.sld_tnb_free_cnt_limit,
                                        sp_tnb_stream_dur_type: req.body.sld_tnb_free_cnt_duration,

                                        sp_full_sub_stream_limit: req.body.slc_full_sub_cnt_limit,
                                        sp_full_sub_stream_duration: req.body.sld_full_sub_cnt_limit,
                                        sp_full_sub_stream_dur_type: req.body.sld_full_sub_cnt_duration,
                                        sp_stream_setting: req.body.streamingLimitType,

                                        sp_cty_id: req.body.geoLocationId,
                                        sp_is_active: 1,
                                        sp_plan_duration: req.body.planDuration,
                                        sp_plan_dur_type: req.body.planDurationOption,

                                        /*sp_wallpaper_alcrt_id: req.body.subscription_plan_Wallpaper,
                                        sp_animation_alcrt_id: req.body.subscription_plan_Animation,
                                        sp_ringtone_alcrt_id: req.body.subscription_plan_RingTone,
                                        sp_text_alcrt_id: req.body.subscription_plan_TextArtical,
                                        sp_game_alcrt_id: req.body.subscription_plan_GamesApps,
                                        sp_video_alcrt_id: req.body.subscription_plan_Video,
                                        sp_fullsong_alcrt_id: req.body.subscription_plan_FullSong,
                                        sp_video_alcrt_stream_id: req.body.subscription_plan_stream_video,
                                        sp_fullsong_alcrt_stream_id: req.body.subscription_plan_stream_songs,*/

                                        sp_created_on: new Date(),
                                        sp_created_by: req.session.Plan_UserName,
                                        sp_modified_on: new Date(),
                                        sp_modified_by: req.session.Plan_UserName
                                    }
                                    var query = connection_ikon_cms.query('INSERT INTO icn_sub_plan SET ?', data, function (err, result) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            connection_ikon_cms.release();
                                            res.send({ success: true, message: 'Sunscription Plan added successfully.' });
                                        }
                                    });
                                }
                            });
                        }
                    }
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