/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
/**
 * @function getalacartadata
 * @param req
 * @param res
 * @param next
 * @description Get all a-la-cart data with contentType and JetEventIds, operator
 */
exports.getalacartadata = function (req, res, next) {
    try {
        if (req.session) {
            if (req.session.UserName) {
                /**
                 * connect to CMS DB
                 */
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM icn_alacart_plan where ap_id =? ', [req.body.planid], function (err, alacart) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                            console.log(err)
                        }
                        else {
                            /**
                             * Get content type list
                             */
                            var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("content type")', function (err, ContentTypes) {
                                if (err) {
                                    connection_ikon_cms.release();
                                    res.status(500).json(err.message);
                                    console.log(err)
                                }
                                else {
                                    /**
                                     * get stream duration list
                                     */
                                    var query = connection_ikon_cms.query('select cd.* from catalogue_detail as cd join catalogue_master as cm ON cm.cm_id = cd.cd_cm_id WHERE cm.cm_name in("Stream Duration")', function (err, DurationOptions) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                            res.status(500).json(err.message);
                                            console.log(err)
                                        }
                                        else {
                                            /**
                                             * get country list
                                             */
                                            var query = connection_ikon_cms.query('SELECT DISTINCT(`cmd_entity_detail`) as geoID, UCASE(`cd_name`) as geoName FROM `multiselect_metadata_detail` AS m ' +
                                            'LEFT JOIN `icn_store` AS s ON m.cmd_group_id = s.st_country_distribution_rights ' +
                                            'LEFT JOIN catalogue_detail AS cd ON cd.cd_id = m.cmd_entity_detail ' +
                                            'LEFT JOIN catalogue_master AS cm ON cm.cm_id = m.cmd_entity_type WHERE s.st_id = ? ', [req.session.StoreId], function (err, GeoLocations) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                    console.log(err);
                                                }
                                                else {
                                                    /**
                                                     * get channel distribution list
                                                     */
                                                    var query = connection_ikon_cms.query('select cd.* FROM catalogue_detail as cd ' +
                                                        'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                                        'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                                        'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                                                        'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [req.session.StoreId], function (err, DistributionChannel) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                            console.log(err)
                                                        }
                                                        else {
                                                            /**
                                                             * connect to Billing Gateway DB
                                                             */
                                                            mysql.getConnection('BG', function (err, connection_ikon_bg) {
                                                                var query = connection_ikon_bg.query('select * from billing_ef_bgw_event where ebe_is_valid = 1 and ebe_ai_bgw_id is not null', function (err, JetEvents) {
                                                                    if (err) {
                                                                        connection_ikon_bg.release();
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        /**
                                                                         * get operator details
                                                                         */
                                                                        var query = connection_ikon_bg.query('SELECT dis.dcl_id,dis.dcl_disclaimer, alacart.bta_ef_id, alacart.bta_id,alacart.bta_name,alacart.bta_amt, partner.partner_name, partner.partner_id FROM billing_gateway.billing_ef_bgw_event as event ' +
                                                                            'JOIN billing_gateway.billing_telco_alacarte_detail AS alacart ON alacart.bta_ef_id = event.ebe_ef_id ' +
                                                                            'JOIN billing_gateway.billing_partner AS partner ON partner.partner_id = alacart.bta_partner_id ' +
                                                                            'left JOIN ikon_cms.icn_disclaimer AS dis ON dis.dcl_ref_jed_id = alacart.bta_ef_id AND dis.dcl_partner_id = alacart.bta_partner_id', function (err, OperatorDetails) {
                                                                            if (err) {
                                                                                connection_ikon_bg.release();
                                                                                connection_ikon_cms.release();
                                                                                res.status(500).json(err.message);
                                                                                console.log(err)
                                                                            }
                                                                            else {
                                                                                /**
                                                                                 * get list of selected distribution channels
                                                                                 */
                                                                                var query = connection_ikon_cms.query('SELECT mmd.* FROM multiselect_metadata_detail AS mmd JOIN icn_alacart_plan AS alplan ON mmd.cmd_group_id = alplan.ap_channel_front where alplan.ap_id =? ', [req.body.planid], function (err, selectedDistributionChannel) {
                                                                                    // Neat!
                                                                                    if (err) {
                                                                                        connection_ikon_bg.release();
                                                                                        connection_ikon_cms.release();
                                                                                        res.status(500).json(err.message);
                                                                                    }
                                                                                    else {
                                                                                        res.send({
                                                                                            ContentTypes: ContentTypes,
                                                                                            GeoLocations: GeoLocations,
                                                                                            DistributionChannel: DistributionChannel,
                                                                                            JetEvents: JetEvents,
                                                                                            selectedDistributionChannel: selectedDistributionChannel,
                                                                                            DurationOptions: DurationOptions,
                                                                                            OpeartorDetails: OperatorDetails,
                                                                                            RoleUser: req.session.UserRole,
                                                                                            PlanData: alacart
                                                                                        });
                                                                                    }
                                                                                })
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                })
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
        connection_ikon_cms.release();
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
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                    var query = connection_ikon_plan.query('select * from icn_alacart_plan where lower(ap_plan_name) = ?', [req.body.PlanName.toLowerCase()], function (err, result) {
                        if (err) {
                            connection_ikon_plan.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_plan.query('select cm.* from catalogue_master as cm WHERE cm.cm_name in("Channel Distribution")', function (err, DistributionChannel) {
                                if (result.length > 0) {
                                    if (result[0].ap_id == req.body.alacartplanid) {
                                        if (req.body.planid) {
                                            EditALacart();
                                        }
                                        else {
                                            AddAlacart();
                                        }
                                    }
                                    else {
                                        res.send({success: false, message: 'Plan Name Must be Unique'});
                                    }
                                }
                                else {
                                    if (req.body.planid) {
                                        EditALacart();
                                    }
                                    else {
                                        AddAlacart();
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
                                                console.log(req.body.OperatorDetails[j].dcl_id)
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

                                function EditALacart() {
                                    var query = connection_ikon_plan.query('select * from icn_alacart_plan where ap_id = ?', [req.body.planid], function (err, alacart) {
                                        if (err) {
                                            connection_ikon_plan.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
                                            if (alacart.length > 0) {
                                                if (req.body.OperatorDetails.length > 0) {
                                                    var operator = 0;
                                                    addEditOperators(operator);
                                                }
                                                var distributionChannellength = req.body.DistributionChannels.length;
                                                if (distributionChannellength > 0) {
                                                    var query = connection_ikon_plan.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [alacart[0].ap_channel_front], function (err, result) {
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
                                                                            cmd_group_id: alacart[0].ap_channel_front,
                                                                            cmd_entity_type: DistributionChannel[0].cm_id,
                                                                            cmd_entity_detail: req.body.DistributionChannels[i]
                                                                        };
                                                                        //console.log(cmd_data)
                                                                        var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_plan.end();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                cnt = cnt + 1;
                                                                                if (distributionChannellength == cnt) {
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
                                                                                        ap_modified_by: req.session.UserName
                                                                                    };
                                                                                    //console.log(data)
                                                                                    var query = connection_ikon_plan.query('UPDATE icn_alacart_plan SET ? where ap_id =?', [data, req.body.alacartplanid], function (err, result) {
                                                                                        if (err) {
                                                                                            connection_ikon_plan.release();
                                                                                            res.status(500).json(err.message);
                                                                                        }
                                                                                        else {
                                                                                            connection_ikon_plan.release();
                                                                                            res.send({
                                                                                                success: true,
                                                                                                message: 'A-La-Cart Plan Updated successfully.'
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                                else {
                                                                                    addDistributionChannel(cnt);
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
                                                res.send({success: false, message: 'Invalid A-La-Cart Plan Id.'});
                                            }
                                        }
                                    });
                                }

                                function AddAlacart() {
                                    var query = connection_ikon_plan.query('select max(ap_id) as id from icn_alacart_plan', function (err, alacartData) {
                                        if (err) {
                                            connection_ikon_plan.release();
                                            res.status(500).json(err.message);
                                        }
                                        else {
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
                                                                cmd_entity_type:DistributionChannel[0].cm_id,
                                                                cmd_entity_detail: req.body.DistributionChannels[i]
                                                            };
                                                            //console.log(cmd_data)
                                                            var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                                if (err) {
                                                                    connection_ikon_plan.end();
                                                                    res.status(500).json(err.message);
                                                                }
                                                                else {
                                                                    cnt = cnt + 1;
                                                                    if (cnt == distributionChannellength) {
                                                                        var data = {
                                                                            ap_id: alacartData[0].id != null ? parseInt(alacartData[0].id + 1) : 1,
                                                                            ap_ld_id: req.session.UserId,
                                                                            ap_st_id: req.session.StoreId,
                                                                            ap_plan_name: req.body.PlanName,
                                                                            ap_caption: req.body.Caption,
                                                                            ap_description: req.body.Description,
                                                                            ap_jed_id: req.body.JetId,
                                                                            ap_content_type: req.body.ContentType,
                                                                            ap_delivery_type: req.body.DeliveryType,
                                                                            ap_is_active: 1,
                                                                            ap_channel_front: groupID,
                                                                            ap_no_of_stream: req.body.NoOfStream,
                                                                            ap_stream_duration: req.body.StreamDuration,
                                                                            ap_stream_dur_type: req.body.StreamDurationType,
                                                                            ap_cty_id: req.body.CountryId,
                                                                            ap_stream_setting: req.body.StreamSetting,
                                                                            ap_created_on: new Date(),
                                                                            ap_created_by: req.session.UserName,
                                                                            ap_modified_on: new Date(),
                                                                            ap_modified_by: req.session.UserName
                                                                        }

                                                                        var query = connection_ikon_plan.query('INSERT INTO icn_alacart_plan SET ?', data, function (err, result) {
                                                                            if (err) {
                                                                                connection_ikon_plan.release();
                                                                                res.status(500).json(err.message);
                                                                            }
                                                                            else {
                                                                                connection_ikon_plan.release();
                                                                                res.send({
                                                                                    success: true,
                                                                                    message: 'A-La-Cart Plan added successfully.'
                                                                                });
                                                                            }
                                                                        });
                                                                    } else {
                                                                        addDistributionChannel(cnt)
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            }
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
        res.status(500).json(err.message);
    }
}
