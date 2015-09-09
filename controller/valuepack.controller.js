/**
 * Created by sujata.patne on 13-07-2015.
 */

var mysql = require('../config/db').pool;
var async = require('async');
var config = require('../config')();
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
                        PlanData: function (callback) {
                            var query = connection_ikon_cms.query('SELECT * FROM icn_valuepack_plan where vp_id =? ', [req.body.planid], function (err, valueplan) {
                                callback(err, valueplan)
                            })
                        },
                        DurationOptions: function (callback) {
                            var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd ' +
                                'JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
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
                        JetEvents: function (callback) {
                            var query = connection_ikon_bg.query('SELECT event.* FROM billing_ef_bgw_event as event '+
                                'JOIN billing_app_info as info ON event.ebe_ai_bgw_id = info.ai_bg_eventid  '+
                                'JOIN billing_event_family AS family ON family.ef_id = event.ebe_ef_id  '+
                                'JOIN billing_telco_master_event_index AS master ON family.ef_tmi_id = master.tmi_id  '+
                                'JOIN billing_enum_data AS enum ON enum.en_id = master.tmi_pp_classification '+
                                'WHERE enum.en_type = "payment_type" AND enum.en_description = "Subscriptions" AND event.ebe_is_valid = 1 AND event.ebe_ai_bgw_id is not null AND info.ai_app_id = ? ' +
                                'GROUP BY event.ebe_ef_id',[req.session.Plan_StoreId], function (err, JetEvents) {
                                callback(err, JetEvents)
                            })
                        },
                        OperatorDetail: function (callback) {
                            var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, bge.ebe_ef_id, master.tmi_id,master.tmi_amt,master.tmi_name, partner.partner_name, partner.partner_id, bge.ebe_bgw_id_desc as duration, partner.partner_cty_id as country ' +
                                'FROM '+config.db_name_ikon_bg+'.billing_ef_bgw_event as bge JOIN '+config.db_name_ikon_bg+'.billing_event_family AS bef ON bef.ef_id = bge.ebe_ef_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_telco_master_event_index AS master ON bef.ef_tmi_id = master.tmi_id ' +
                                'JOIN '+config.db_name_ikon_bg+'.billing_partner AS partner ON partner.partner_id = master.tmi_partner_id ' +
                                'LEFT JOIN '+config.db_name_ikon_cms+'.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = bge.ebe_ef_id AND dis.dcl_partner_id = master.tmi_partner_id ' +
                                'GROUP BY master.tmi_parent_id ', function (err, OperatorDetails) {
                                callback(err, OperatorDetails)
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
                        var query = connection_ikon_cms.query('(select alacart.ap_id as plan_id from icn_alacart_plan as alacart where lower(alacart.ap_plan_name) = ? ) '+
                            ' UNION ' +
                            '(select subscription.sp_id as plan_id from icn_sub_plan AS subscription where lower(subscription.sp_plan_name) = ? ) ' +
                            ' UNION ' +
                            '(select valupack.vp_id as plan_id from icn_valuepack_plan as valupack where lower(valupack.vp_plan_name) = ? ) ', [req.body.PlanName.toLowerCase(),req.body.PlanName.toLowerCase(),req.body.PlanName.toLowerCase()], function (err, result) {
                            if (result.length > 0) {
                                callback(err, {'exist': true, 'plans': result});
                            } else {
                                callback(err, {'exist': false, 'plans': result});
                            }
                        })
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
                                            dcl_modified_by: req.session.Plan_UserName
                                        }
                                        var query = connection_ikon_cms.query('UPDATE icn_disclaimer SET ? where dcl_id = ?', [disclaimerData, disclaimer[0].dcl_id], function (err, result) {
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
                                                    dcl_created_on: new Date(),
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

                        function EditValuePack() {
                            var query = connection_ikon_cms.query('select * from icn_valuepack_plan where vp_id = ?', [req.body.valuepackplanId], function (err, result) {
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
                                        var query = connection_ikon_cms.query('UPDATE icn_valuepack_plan SET ? WHERE vp_id =?', [data, req.body.valuepackplanId], function (err, result) {
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
                            var query = connection_ikon_cms.query('select max(vp_id) as id from icn_valuepack_plan', function (err, result) {
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
                                    var query = connection_ikon_cms.query('INSERT INTO icn_valuepack_plan SET ?', data, function (err, result) {
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