/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
var common = require('../helpers/common');
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
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query('SELECT * FROM icn_alacart_plan where ap_id =? ', [req.body.planid], function (err, alacart) {
                        // Neat!
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE cd_cm_id = 2', function (err, ContentTypes) {
                                if (err) {
                                    connection_ikon_cms.release();
                                }
                                else {
                                    var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE cd_cm_id = 32', function (err, DurationOptions) {
                                        if (err) {
                                            connection_ikon_cms.release();
                                        }
                                        else {
                                            var query = connection_ikon_cms.query('SELECT * FROM catalogue_detail AS cd JOIN icn_disclaimer AS dis ON cd.cd_id = dis.dcl_partner_id WHERE cd.cd_cm_id = 33', function (err, OperatorDetails) {
                                                if (err) {
                                                    connection_ikon_cms.release();
                                                }
                                                else {
                                                    var query = connection_ikon_cms.query('(SELECT `cty_id` as geoID,`cty_name` as geoName FROM `icn_country` where isnull(`cty_region_id`)) union (SELECT `cty_region_id` as geoID, `cty_region_name`  as geoName FROM `icn_country` where `cty_region_id` IS NOT NULL group by `cty_region_id`)', function (err, GeoLocations) {
                                                        if (err) {
                                                            connection_ikon_cms.release();
                                                        }
                                                        else {
                                                            var query = connection_ikon_cms.query('SELECT * FROM  catalogue_detail WHERE cd_cm_id = 4', function (err, DistributionChannel) {
                                                                if (err) {
                                                                    connection_ikon_cms.release();
                                                                }
                                                                else {
                                                                    mysql.getConnection('BG', function (err, connection_ikon_bg) {
                                                                        var query = connection_ikon_bg.query('select * from billing_ef_bgw_event where ebe_is_valid = 1 and ebe_ai_bgw_id is not null', function (err, JetEvents) {
                                                                            if (err) {
                                                                                connection_ikon_bg.release();
                                                                                connection_ikon_cms.release();
                                                                            }
                                                                            else {
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
    //console.log(req.body)
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
                                    res.send({ success: false, message: 'Plan Name Must be Unique' });
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
                            function EditALacart() {
                                var query = connection_ikon_plan.query('select * from icn_alacart_plan where ap_id = ?', [req.body.planid], function (err, results) {
                                    if (err) {
                                        connection_ikon_plan.release();
                                        res.status(500).json(err.message);
                                    }
                                    else {
                                        if (result.length > 0) {
                                            var distributionChannellength = req.body.DistributionChannels.length;
                                            if (distributionChannellength > 0) {

                                                var query = connection_ikon_plan.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [results[0].ap_channel_front], function (err, result) {
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
                                                                        cmd_group_id: results[0].ap_channel_front,
                                                                        cmd_entity_type: 4,//catalog_master
                                                                        cmd_entity_detail: req.body.DistributionChannels[i]
                                                                    };
                                                                    var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                                        if (err) {
                                                                            connection_ikon_plan.end();
                                                                            res.status(500).json(err.message);
                                                                        }
                                                                        else {
                                                                            cnt = cnt + 1;
                                                                            if (distributionChannellength == cnt) {
                                                                                var query = connection_ikon_plan.query('UPDATE icn_alacart_plan SET ' +
                                                                                    'ap_plan_name =?,' +
                                                                                    'ap_caption =?,' +
                                                                                    'ap_description=?, ' +
                                                                                    'ap_jed_id=?,' +
                                                                                    'ap_content_type=? , ' +
                                                                                    'ap_modified_on=?,' +
                                                                                    'ap_modified_by =? ' +
                                                                                    'where ap_id =?', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.JetId, req.body.ContentType, new Date(), req.session.UserName, req.body.alacartplanid], function (err, result) {
                                                                                    if (err) {
                                                                                        connection_ikon_plan.release();
                                                                                        res.status(500).json(err.message);
                                                                                    }
                                                                                    else {
                                                                                        if (req.body.OperatorDetails.length > 0) {
                                                                                            var count = req.body.OperatorDetails.length;
                                                                                            var cnt = 0;
                                                                                            req.body.OperatorDetails.forEach(function (value) {
                                                                                                var query = connection_ikon_plan.query('UPDATE icn_disclaimer SET dcl_disclaimer = ? where dcl_id = ?', [value.dcl_disclaimer, value.dcl_id], function (err, result) {
                                                                                                    if (err) {
                                                                                                        connection_ikon_plan.release();
                                                                                                        res.status(500).json(err.message);
                                                                                                    }
                                                                                                    else {
                                                                                                        cnt++;
                                                                                                        if (cnt == count) {
                                                                                                            connection_ikon_plan.release();
                                                                                                            res.send({
                                                                                                                success: true,
                                                                                                                message: 'A-La-Cart Plan Updated successfully.'
                                                                                                            });
                                                                                                        }
                                                                                                    }
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            connection_ikon_plan.release();
                                                                                            res.send({
                                                                                                success: true,
                                                                                                message: 'A-La-Cart Plan Updated successfully.'
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                addDistributionChannel(cnt)
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
                                            res.send({ success: false, message: 'Invalid A-La-Cart Plan Id.' });
                                        }
                                    }
                                });
                            }
                            function AddAlacart() {
                                //console.log('test - ' + req.body.DistributionChannels)
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
                                        if (distributionChannellength > 0) {
                                            addDistributionChannel(0);
                                            function addDistributionChannel(cnt){
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
                                                        //console.log(req.body.DistributionChannels)
                                                        var cmd_data = {
                                                            cmd_id: cmdID,
                                                            cmd_group_id: groupID,
                                                            cmd_entity_type: 4,//catalog_master
                                                            cmd_entity_detail: req.body.DistributionChannels[i]
                                                        };
                                                        var query = connection_ikon_plan.query('INSERT INTO multiselect_metadata_detail SET ?', cmd_data, function (err, result) {
                                                            if (err) {
                                                                connection_ikon_plan.end();
                                                                res.status(500).json(err.message);
                                                            }
                                                            else {
                                                                cnt = cnt + 1;
                                                                if(cnt == distributionChannellength){
                                                                    var data = {
                                                                        ap_id: alacartData[0].id != null ? parseInt(alacartData[0].id + 1) : 1,
                                                                        ap_ld_id: req.session.UserId,
                                                                        ap_st_id: null,
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
                                                                            if (req.body.OperatorDetails.length > 0) {
                                                                                var count = req.body.OperatorDetails.length;
                                                                                var cnt = 0;
                                                                                req.body.OperatorDetails.forEach(function (value) {
                                                                                    var query = connection_ikon_plan.query('UPDATE icn_disclaimer SET dcl_disclaimer = ? where dcl_id = ?', [value.dcl_disclaimer, value.dcl_id], function (err, result) {
                                                                                        if (err) {
                                                                                            connection_ikon_plan.release();
                                                                                            res.status(500).json(err.message);
                                                                                        }
                                                                                        else {
                                                                                            cnt++;
                                                                                            if (cnt == count) {
                                                                                                connection_ikon_plan.release();
                                                                                                res.send({ success: true, message: 'A-La-Cart Plan added successfully.' });
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                            else {
                                                                                connection_ikon_plan.release();
                                                                                res.send({ success: true, message: 'A-La-Cart Plan added successfully.' });
                                                                            }
                                                                        }
                                                                    });

                                                                }else{
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
