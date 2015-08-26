/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
/**
 * @function getvaluepack
 * @param req
 * @param res
 * @param next
 * @description get list all value pack plans
 */
exports.getvaluepack = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('SELECT * FROM icn_valuepack_plan where vp_id =? ', [req.body.planid], function (err, subplan) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                            console.log(err)
                        }
                        else {
                            var query = connection_ikon_plan.query('SELECT dis.dcl_disclaimer, alacart.bta_ef_id, alacart.bta_id,alacart.bta_name,alacart.bta_amt, partner.partner_name, partner.partner_id FROM billing_gateway.billing_ef_bgw_event as event ' +
                                'JOIN billing_gateway.billing_telco_alacarte_detail AS alacart ON alacart.bta_ef_id = event.ebe_ef_id ' +
                                'JOIN billing_gateway.billing_partner AS partner ON partner.partner_id = alacart.bta_partner_id ' +
                                'left JOIN ikon_cms.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = alacart.bta_ef_id AND dis.dcl_partner_id = alacart.bta_partner_id', function (err, OperatorDetails) {
                                if (err) {
                                    connection_ikon_plan.release();
                                    res.status(500).json(err.message);
                                    console.log(err)
                                }
                                else {
                                    /**
                                     * get stream duration list
                                     */
                                    var query = connection_ikon_plan.query('select cd.* from catalogue_detail as cd join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
                                        if (err) {
                                            connection_ikon_plan.release();
                                            res.status(500).json(err.message);
                                            console.log(err)
                                        }
                                        else {
                                            var query = connection_ikon_plan.query('SELECT DISTINCT(`cmd_entity_detail`) as geoID, UCASE(`cd_name`) as geoName FROM `multiselect_metadata_detail` AS m ' +
                                                'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ' +
                                                'LEFT JOIN catalogue_detail AS cd ON cd.cd_id = m.cmd_entity_detail ' +
                                                'LEFT JOIN catalogue_master AS cm ON cm.cm_id = m.cmd_entity_type WHERE s.st_id = ? ', [req.session.StoreId], function (err, GeoLocations) {
                                                if (err) {
                                                    connection_ikon_plan.release();
                                                    res.status(500).json(err.message);
                                                    console.log(err)
                                                }
                                                else {
                                                    mysql.getConnection('BG', function (err, connection_ikon_bg) {
                                                        var query = connection_ikon_bg.query('select * from billing_ef_bgw_event where ebe_is_valid = 1 and ebe_ai_bgw_id is not null', function (err, JetEvents) {
                                                            //var query = connection_ikon_plan.query('select * from jetpay_event_detail where jed_is_valid = 1 and jed_content_type is null', function (err, JetEvents) {
                                                            if (err) {
                                                                connection_ikon_plan.release();
                                                                connection_ikon_bg.release();
                                                                res.status(500).json(err.message);

                                                            }
                                                            else {
                                                                connection_ikon_plan.release();
                                                                connection_ikon_bg.release();
                                                                res.send({
                                                                    JetEvents: JetEvents,
                                                                    GeoLocations: GeoLocations,
                                                                    OpeartorDetail: OperatorDetails,
                                                                    DurationOptions: DurationOptions,
                                                                    RoleUser: req.session.UserRole,
                                                                    PlanData: subplan
                                                                });
                                                            }
                                                        })
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            });
                        }
                    })
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
 * @function addeditvaluepack
 * @param req
 * @param res
 * @param next
 * @description add new value pack plan and update existing selected value pack plan
 */
exports.addeditvaluepack = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from icn_valuepack_plan where lower(vp_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                            console.log(err)
                        }
                        else {
                            if (req.body.OperatorDetails.length > 0) {
                                var operator = 0;
                                addEditOperators(operator);
                            }
                            if (result.length > 0) {
                                if (result[0].vp_id == req.body.valuepackplanId) {
                                    if (req.body.planid) {
                                        EditValuePack();
                                    }
                                    else {
                                        AddValuePack();
                                    }
                                }
                                else {
                                    connection_ikon_plan.release();
                                    res.send({ success: false, message: 'Value-Pack Plan Name Must be Unique' });
                                }
                            }
                            else {
                                if (req.body.planid) {
                                    EditValuePack();
                                }
                                else {
                                    AddValuePack();
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
                                                        dcl_created_on: new Date(),
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
                            function EditValuePack() {
                                var query = connection_ikon_plan.query('select * from icn_valuepack_plan where vp_id = ?', [req.body.valuepackplanId], function (err, result) {
                                    if (err) {
                                        connection_ikon_plan.release();
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
                                                vp_stream_setting:req.body.StreamType,
                                                vp_stream_dur_type:req.body.StreamDurationOptions,
                                                vp_cty_id: req.body.CountryId,
                                                vp_modified_on: new Date(),
                                                vp_modified_by: req.session.UserName
                                            }
                                            var query = connection_ikon_plan.query('UPDATE icn_valuepack_plan SET ? WHERE vp_id =?', [data, req.body.valuepackplanId], function (err, result) {
                                                if (err) {
                                                    connection_ikon_plan.release();
                                                    res.status(500).json(err.message);
                                                }
                                                else {

                                                    connection_ikon_plan.release();
                                                    res.send({ success: true, message: 'Value-Pack Plan Updated successfully.' });

                                                }
                                            });
                                        }
                                        else {
                                            connection_ikon_plan.release();
                                            res.send({ success: false, message: 'Invalid Value-Pack Plan Id.' });
                                        }
                                    }
                                });
                            }

                            function AddValuePack() {
                                var query = connection_ikon_plan.query('select max(vp_id) as id from icn_valuepack_plan', function (err, result) {
                                    if (err) {
                                        console.log(err.message);
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        var data = {
                                            vp_id: result[0].id != null ? parseInt(result[0].id + 1) : 1,
                                            vp_ld_id: req.session.UserId,
                                            vp_st_id: req.session.StoreId,
                                            vp_plan_name: req.body.PlanName,
                                            vp_caption: req.body.Caption,
                                            vp_description: req.body.Description,
                                            vp_jed_id: req.body.JetId,
                                            vp_download_limit: req.body.DowmloadLimit,
                                            vp_duration_limit: req.body.DurationLimit,
                                            vp_duration_type: req.body.DurationOptions,
                                            vp_stream_limit: req.body.NoOfStreamContent,
                                            vp_stream_duration: req.body.StreamDuration,
                                            vp_stream_setting:req.body.StreamType,
                                            vp_cty_id: req.body.CountryId,
                                            vp_stream_dur_type:req.body.StreamDurationOptions,
                                            vp_is_active: 1,
                                            vp_created_on: new Date(),
                                            vp_created_by: req.session.UserName,
                                            vp_modified_on: new Date(),
                                            vp_modified_by: req.session.UserName
                                        }
                                        console.log(data)
                                        var query = connection_ikon_plan.query('INSERT INTO icn_valuepack_plan SET ?', data, function (err, result) {
                                            if (err) {
                                                console.log(err.message);
                                                connection_ikon_plan.release();
                                                res.status(500).json(err.message);
                                                console.log(err)
                                            }
                                            else {

                                                connection_ikon_plan.release();
                                                res.send({ success: true, message: 'Value-Pack Plan added successfully.' });

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