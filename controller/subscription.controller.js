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
                    var query = connection_ikon_plan.query('SELECT * FROM icn_sub_plan where sp_id =? ', [req.body.planid], function (err, subplan) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            /**
                             * Get content type list
                             */
                            var query = connection_ikon_plan.query('select cd.* FROM catalogue_detail as cd ' +
                                'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_content_type ' +
                                'WHERE cm.cm_name in ("Content Type") AND s.st_id = ? ', [req.session.StoreId], function (err, ContentTypes) {
                                if (err) {
                                    connection_ikon_plan.release();
                                    res.status(500).json(err.message);
                                    console.log(err)
                                }
                                else {
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
                                            /**
                                             * get country list
                                             */
                                            var query = connection_ikon_plan.query('SELECT DISTINCT(`cmd_entity_detail`) as geoID, UCASE(`cd_name`) as geoName FROM `multiselect_metadata_detail` AS m ' +
                                                'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ' +
                                                'LEFT JOIN catalogue_detail AS cd ON cd.cd_id = m.cmd_entity_detail ' +
                                                'LEFT JOIN catalogue_master AS cm ON cm.cm_id = m.cmd_entity_type WHERE s.st_id = ? ', [req.session.StoreId], function (err, GeoLocations) {
                                                //console.log(GeoLocations)
                                                if (err) {
                                                    connection_ikon_plan.release();
                                                    res.status(500).json(err.message);
                                                    console.log(err);
                                                } else {
                                                    /**
                                                     * get stream duration list
                                                     */
                                                    var query = connection_ikon_plan.query('select cd.* from catalogue_detail as cd ' +
                                                        'join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
                                                        if (err) {
                                                            connection_ikon_plan.release();
                                                            res.status(500).json(err.message);
                                                            console.log(err)
                                                        } else {
                                                            mysql.getConnection('BG', function (err, connection_ikon_bg) {
                                                                var query = connection_ikon_bg.query('select bge.* FROM billing_telco_master_event_index AS master ' +
                                                                    'JOIN billing_event_family AS bef ON bef.ef_tmi_id = master.tmi_id ' +
                                                                    'JOIN billing_ef_bgw_event AS bge ON bef.ef_id = bge.ebe_ef_id ' +
                                                                    'WHERE ebe_is_valid = 1 and ebe_ai_bgw_id is not null ' +
                                                                    'GROUP BY master.tmi_parent_id', function (err, JetEvents) {
                                                                    if (err) {
                                                                        connection_ikon_bg.release();
                                                                        connection_ikon_plan.release();
                                                                        res.status(500).json(err.message);
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, bge.ebe_ef_id, master.tmi_id,master.tmi_amt,master.tmi_name, partner.partner_name, partner.partner_id ' +
                                                                            'FROM billing_gateway.billing_ef_bgw_event as bge JOIN billing_gateway.billing_event_family AS bef ON bef.ef_id = bge.ebe_ef_id ' +
                                                                            'JOIN billing_gateway.billing_telco_master_event_index AS master ON bef.ef_tmi_id = master.tmi_id ' +
                                                                            'JOIN billing_gateway.billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                                                            'left JOIN ikon_cms.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = bge.ebe_ef_id AND dis.dcl_partner_id = master.tmi_partner_id ' +
                                                                            'GROUP BY master.tmi_parent_id ', function (err, OpeartorDetail) {
                                                                            if (err) {
                                                                                connection_ikon_plan.release();
                                                                                connection_ikon_bg.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                var query = connection_ikon_plan.query('SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
                                                                                    'FROM icn_alacart_plan AS plan ' +
                                                                                    'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
                                                                                    'WHERE plan.ap_st_id = ? ', [req.session.StoreId], function (err, alacart) {
                                                                                    if (err) {
                                                                                        connection_ikon_plan.release();
                                                                                        res.status(500).json(err.message);
                                                                                        console.log(err)
                                                                                    } else {
                                                                                        /**
                                                                                         * get list of selected distribution channels
                                                                                         */
                                                                                        var query = connection_ikon_plan.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd ' +
                                                                                            'JOIN icn_sub_plan AS subplan ON mmd.cmd_group_id = subplan.sp_channel_front ' +
                                                                                            'WHERE subplan.sp_id =? ', [req.body.planid], function (err, selectedDistributionChannel) {
                                                                                            // Neat!
                                                                                            if (err) {
                                                                                                connection_ikon_bg.release();
                                                                                                connection_ikon_plan.release();
                                                                                                res.status(500).json(err.message);
                                                                                            }
                                                                                            else {
                                                                                                connection_ikon_bg.release();
                                                                                                connection_ikon_plan.release();

                                                                                                res.send({
                                                                                                    JetEvents: JetEvents,
                                                                                                    DistributionChannel: DistributionChannel,
                                                                                                    OpeartorDetail: OpeartorDetail,
                                                                                                    ContentTypes: ContentTypes,
                                                                                                    GeoLocations: GeoLocations,
                                                                                                    DurationOptions: DurationOptions,
                                                                                                    RoleUser: req.session.UserRole,
                                                                                                    PlanData: subplan,
                                                                                                    selectedDistributionChannel: selectedDistributionChannel,
                                                                                                    ContentTypeData: alacart
                                                                                                });
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    });
                                }
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
        connection_ikon_bg.release();
        res.status(500).json(err.message);
    }
}

/**
 * get content Type wise alacart data
 */
exports.getAlacartContentType = function (req, res, next){

    mysql.getConnection('CMS', function (err, connection_ikon_plan) {
        /**
         * Get content type list
         */
            var query = connection_ikon_plan.query('SELECT cd.cd_name, plan.*, (SELECT cd_name FROM catalogue_detail WHERE cd_id = plan.ap_delivery_type) AS delivery_type_name ' +
            'FROM icn_alacart_plan AS plan ' +
            'join catalogue_detail as cd ON plan.ap_content_type = cd.cd_id ' +
            'WHERE plan.ap_st_id = ? ', [req.session.StoreId], function (err, alacart) {
            if (err) {
                connection_ikon_plan.release();
                res.status(500).json(err.message);
                console.log(err)
            } else {
                connection_ikon_plan.release();
                res.send(alacart);
            }
        })
    })
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
                            var count = req.body.OperatorDetails.length;
                            function addEditOperators(cnt) {
                                var j = cnt;
                                var query = connection_ikon_plan.query('SELECT * FROM icn_disclaimer WHERE dcl_ref_jed_id = ? AND dcl_partner_id = ?', [req.body.JetId, req.body.OperatorDetails[j].partner_id], function (err, disclaimer) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (disclaimer.length > 0) {
                                            var disclaimer = {
                                                dcl_disclaimer: req.body.OperatorDetails[j].dcl_disclaimer,
                                                dcl_partner_id: req.body.OperatorDetails[j].partner_id,
                                                dcl_st_id: req.session.StoreId,
                                                dcl_modified_on: new Date(),
                                                dcl_modified_by:  req.session.UserName,
                                            }
                                            //console.log(req.body.OperatorDetails[j].dcl_id)
                                            var query = connection_ikon_plan.query('UPDATE icn_disclaimer SET ? where dcl_id = ?', [disclaimer,req.body.OperatorDetails[j].dcl_id], function (err, result) {
                                                if (err) {
                                                    connection_ikon_plan.release();
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
                                            var query = connection_ikon_plan.query('SELECT MAX(dcl_id) AS id FROM icn_disclaimer', function (err, result) {
                                                if (err) {
                                                    connection_ikon_plan.release();
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
                                                        dcl_st_id: req.session.StoreId,
                                                        dcl_created_by: req.session.UserName,
                                                        dcl_created_on: new Date()
                                                    }
                                                    var query = connection_ikon_plan.query('INSERT INTO icn_disclaimer SET ?', disclaimer, function (err, result) {
                                                        if (err) {
                                                            connection_ikon_plan.release();
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

                            function EditSubscriptions() {
                                var query = connection_ikon_plan.query('select * from icn_sub_plan where sp_id = ?', [req.body.subplanId], function (err, subscription) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (subscription.length > 0) {
                                            if (req.body.OperatorDetails.length > 0) {
                                                var operator = 0;
                                                addEditOperators(operator);
                                            }
                                            var distributionChannellength = req.body.DistributionChannels.length;
                                            if (distributionChannellength > 0) {
                                                var query = connection_ikon_plan.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [subscription[0].sp_channel_front], function (err, result) {
                                                    if (err) {
                                                        connection_ikon_plan.release();
                                                        res.status(500).json(err.message);
                                                    }
                                                    else {
                                                        addDistributionChannel(0);
                                                        function addDistributionChannel(cnt) {
                                                            var cmdID = 1;
                                                            var i = cnt;
                                                            var query = connection_ikon_plan.query('SELECT MAX(cmd_id) AS id FROM multiselect_metadata_detail', function (err, result) {
                                                                if (err) {
                                                                    connection_ikon_plan.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    if (result[0].id != null) {
                                                                        cmdID = parseInt(result[0].id) + 1;
                                                                    }
                                                                    var cmd_data = {
                                                                        cmd_id: cmdID,
                                                                        cmd_group_id: subscription[0].sp_channel_front,
                                                                        cmd_entity_type: req.body.DistributionChannelList[0].cd_cm_id,
                                                                        cmd_entity_detail: req.body.DistributionChannels[i]
                                                                    };
                                                                    console.log(cmd_data)
                                                                    var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                                        if (err) {
                                                                            connection_ikon_plan.end();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            cnt++;
                                                                            if (cnt < distributionChannellength) {
                                                                                addDistributionChannel(cnt);
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

                                                                                    sp_wallpaper_alcrt_id: req.body.subscription_plan_Wallpaper,
                                                                                    sp_animation_alcrt_id: req.body.subscription_plan_Animation,
                                                                                    sp_ringtone_alcrt_id: req.body.subscription_plan_RingTone,
                                                                                    sp_text_alcrt_id: req.body.subscription_plan_TextArtical,
                                                                                    sp_game_alcrt_id: req.body.subscription_plan_GamesApps,
                                                                                    sp_video_alcrt_id: req.body.subscription_plan_Video,
                                                                                    sp_fullsong_alcrt_id: req.body.subscription_plan_FullSong,
                                                                                    sp_video_alcrt_stream_id: req.body.subscription_plan_stream_video,
                                                                                    sp_fullsong_alcrt_stream_id: req.body.subscription_plan_stream_songs,
                                                                                    sp_modified_on: new Date(),
                                                                                    sp_modified_by: req.session.UserName
                                                                                }
                                                                                var query = connection_ikon_plan.query(' UPDATE icn_sub_plan SET ?' +
                                                                                    'WHERE sp_id =?', [data, req.body.subplanId], function (err, result) {
                                                                                    if (err) {
                                                                                        connection_ikon_plan.release();
                                                                                        res.status(500).json(err.message);
                                                                                    }
                                                                                    else {
                                                                                        connection_ikon_plan.release();
                                                                                        res.send({ success: true, message: 'Subscription Plan Updated successfully.' });

                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }


                                                    }
                                                })
                                            }
                                        }
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({ success: false, message: 'Invalid Subscription Plan Id.' });
                                        }
                                    }
                                });
                            }

                            function AddSubscriptions() {
                                var distributionChannellength = req.body.DistributionChannels.length;

                                var groupID = 1;
                                var query = connection_ikon_plan.query('SELECT MAX(cmd_group_id) AS group_id FROM multiselect_metadata_detail', function (err, group) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (group[0].group_id != null) {
                                            groupID = parseInt(group[0].group_id) + 1;
                                        }
                                    }
                                })
                                if (req.body.OperatorDetails.length > 0) {
                                    var operator = 0;
                                    addEditOperators(operator);
                                }
                                if (distributionChannellength > 0) {
                                    addDistributionChannel(0);
                                    function addDistributionChannel(cnt) {
                                        var cmdID = 1;
                                        var i = cnt;
                                        var query = connection_ikon_plan.query('SELECT MAX(cmd_id) AS id FROM multiselect_metadata_detail', function (err, result) {
                                            if (err) {
                                                connection_ikon_plan.release();
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
                                                console.log(cmd_data)
                                                var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                    if (err) {
                                                        connection_ikon_plan.end();
                                                        res.status(500).json(err.message);
                                                    } else {
                                                        cnt++;
                                                        if (cnt < distributionChannellength) {
                                                            addDistributionChannel(cnt);
                                                        }else{
                                                            var query = connection_ikon_plan.query('select max(sp_id) as id from icn_sub_plan', function (err, result) {
                                                                if (err) {
                                                                    connection_ikon_plan.release();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    var data = {
                                                                        sp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                                                        sp_ld_id: req.session.UserId,
                                                                        sp_st_id: req.session.StoreId,
                                                                        sp_plan_name: req.body.PlanName,
                                                                        sp_caption: req.body.Caption,
                                                                        sp_description: req.body.Description,
                                                                        sp_jed_id: req.body.JetId,
                                                                        sp_tnb_days: req.body.offerForDays,

                                                                        sp_tnb_free_cnt_limit: req.body.numContentOffer,
                                                                        sp_single_day_cnt_limit: req.body.limitSingleDay,
                                                                        sp_full_sub_cnt_limit: req.body.fullSubDuration,

                                                                        sp_channel_front : groupID,
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

                                                                        sp_wallpaper_alcrt_id: req.body.subscription_plan_Wallpaper,
                                                                        sp_animation_alcrt_id: req.body.subscription_plan_Animation,
                                                                        sp_ringtone_alcrt_id: req.body.subscription_plan_RingTone,
                                                                        sp_text_alcrt_id: req.body.subscription_plan_TextArtical,
                                                                        sp_game_alcrt_id: req.body.subscription_plan_GamesApps,
                                                                        sp_video_alcrt_id: req.body.subscription_plan_Video,
                                                                        sp_fullsong_alcrt_id: req.body.subscription_plan_FullSong,
                                                                        sp_video_alcrt_stream_id: req.body.subscription_plan_stream_video,
                                                                        sp_fullsong_alcrt_stream_id: req.body.subscription_plan_stream_songs,

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
                                                                            connection_ikon_plan.release();
                                                                            res.send({ success: true, message: 'Sunscription Plan added successfully.' });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
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