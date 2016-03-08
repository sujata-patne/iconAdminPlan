/**
 * Created by Pratik.Mehta .
 */
var mysql = require('../config/db').pool;
var async = require("async");
var offerManager = require("../models/offerModel");
var logger = require("../controller/logger.controller");

/**
 * @function getofferdata
 * @param req
 * @param res
 * @param next
 * @description get list all offer plans
 */
exports.getofferdata = function (req, res, next) {
    try {
        if (req.session != undefined && req.session.Plan_UserName != undefined) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                if (err) {
                    logger.writeLog('getofferdata : ' + JSON.stringify(err));
                } else {
                    async.parallel({
                            StoreId: function (callback) {
                                callback(err, req.session.Plan_StoreId);
                            },
                            DistributionChannel: function (callback) {
                                //Get Distribution channels
                                var query = connection_ikon_cms.query('select cd.* FROM catalogue_detail as cd ' +
                                    'LEFT JOIN catalogue_master as cm ON cm.cm_id = cd.cd_cm_id ' +
                                    'LEFT JOIN multiselect_metadata_detail as m ON cd.cd_id = m.cmd_entity_detail ' +
                                    'LEFT JOIN icn_store as s ON m.cmd_group_id = s.st_front_type ' +
                                    'WHERE cm.cm_name in ("Channel Distribution") AND s.st_id = ? ', [req.session.Plan_StoreId], function (err, DistributionChannel) {
                                    callback(err, DistributionChannel);
                                });
                            },
                            row: function (callback) {
                                //Get offer plan details for edit mode :
                                var query = connection_ikon_cms.query("SELECT * FROM `icn_offer_plan` WHERE op_id = ?", [req.body.planid], function (err, result) {
                                    callback(err, result);
                                });
                            },
                            selectedDistributionChannel: function (callback) {
                                //Get selected distribution channels from multiselect:
                                var query = connection_ikon_cms.query("SELECT mmd.* FROM multiselect_metadata_detail AS mmd JOIN icn_offer_plan AS offer ON mmd.cmd_group_id = offer.op_channel_front where offer.op_id = ?", [req.body.planid], function (err, selectedDistributionChannel) {
                                    callback(err, selectedDistributionChannel);
                                });
                            },
                            UserRole: function (callback) {
                                //Get User Role :
                                callback(null, req.session.Plan_UserRole);
                            }
                        },
                    function (err, results) {
                        if (err) {
                            logger.writeLog('getofferdata : ' + JSON.stringify(err));
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        } else {
                            logger.writeLog('getofferdata : ' + JSON.stringify(results));
                            connection_ikon_cms.release();
                            res.send(results);
                        }
                    });
                }
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


exports.addOffer = function(req,res,next){
    try {
        var v_op_id;
        var v_cmd_id;
        var v_group_id;
        var v_master_id;
        var v_distibution_channels = req.body.DistributionChannels;
        if (req.session != undefined && req.session.Plan_UserName != undefined) {
           mysql.getConnection('CMS', function (err, connection_ikon_cms) {
               if (err) {
                   logger.writeLog('addOffer : ' + JSON.stringify(err));
               } else {
                   async.parallel({
                           //Check Whether Offer Exists :
                           OfferExists: function (callback) {
                               connection_ikon_cms.query("SELECT op_id as id FROM `icn_offer_plan` WHERE lower(op_plan_name) = ?", [req.body.PlanName.toLowerCase()], function (err, result) {
                                   if (result.length > 0) {
                                       callback(err, true);
                                   } else {
                                       callback(null);
                                   }
                               });
                           },
                           //Get Max offer id :
                           MaxOfferId: function (callback) {
                               var query = connection_ikon_cms.query("SELECT MAX(op_id) as id FROM `icn_offer_plan`", function (err, result) {
                                   v_op_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;
                                   callback(err, v_op_id);
                               });
                           },
                           //Get Max group id :
                           MaxGroupId: function (callback) {
                               var query = connection_ikon_cms.query("SELECT MAX(cmd_group_id) as group_id FROM `multiselect_metadata_detail`", function (err, result) {
                                   v_group_id = result[0].group_id != null ? parseInt(result[0].group_id + 1) : 1;
                                   callback(err, v_group_id);
                               });
                           },
                           //Get Master id for channel distribution
                           MasterId: function (callback) {
                               var query = connection_ikon_cms.query("SELECT cm_id as master_id FROM `catalogue_master` WHERE cm_name = 'Channel Distribution' ", function (err, result) {
                                   v_master_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                   callback(err, v_master_id);
                               });
                           }
                       },
                   function (err, async_results) {
                       if (async_results.OfferExists) {
                           logger.writeLog('addOffer : ' + JSON.stringify("Another offer with the same name exists"));
                           connection_ikon_cms.release();
                           res.send({"success": false, "message": "Another offer with the same name exists"});
                       }
                       else {
                           var count = req.body.DistributionChannels.length;
                           var cnt = 0;
                           loop(0);
                           function loop(cnt) {
                               var i = cnt;
                               var query = connection_ikon_cms.query("SELECT MAX(cmd_id) as cmd_id FROM `multiselect_metadata_detail`", function (err, result) {
                                   if (err) {
                                       logger.writeLog('addOffer : ' + JSON.stringify(err));
                                       connection_ikon_cms.release();
                                       res.status(500).json(err.message);
                                   } else {
                                       //Get MAx cmd id for multiselect rows
                                       v_cmd_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                       var data = {
                                           cmd_id: v_cmd_id,
                                           cmd_group_id: async_results.MaxGroupId,
                                           cmd_entity_type: async_results.MasterId,
                                           cmd_entity_detail: v_distibution_channels[i]
                                       }
                                       //Insert into multiselect
                                       var query = connection_ikon_cms.query('INSERT INTO `multiselect_metadata_detail` SET ?', data, function (err, result) {
                                           if (err) {
                                               logger.writeLog('addOffer : ' + JSON.stringify(err));
                                               connection_ikon_cms.release();
                                               res.status(500).json(err.message);
                                           } else {
                                               cnt = cnt + 1;
                                               if (cnt == count) {
                                                   //insert into offer plan
                                                   var data = {
                                                       op_id: v_op_id,
                                                       op_ld_id: req.session.Plan_UserId,
                                                       op_st_id: req.session.Plan_StoreId,
                                                       op_plan_name: req.body.PlanName,
                                                       op_caption: req.body.Caption,
                                                       op_description: req.body.Description,
                                                       op_buy_item: req.body.Buyitems,
                                                       op_free_item: req.body.GetFreeItems,
                                                       op_channel_front: async_results.MaxGroupId,
                                                       op_is_active: 1,
                                                       op_created_on: new Date(),
                                                       op_created_by: req.session.Plan_UserName,
                                                       op_modified_on: new Date(),
                                                       op_modified_by: req.session.Plan_UserName
                                                   }
                                                   var query = connection_ikon_cms.query('INSERT INTO `icn_offer_plan` SET ?', data, function (err, result) {
                                                       if (err) {
                                                           logger.writeLog('addOffer : ' + JSON.stringify(err));
                                                           connection_ikon_cms.release();
                                                           res.status(500).json(err.message);
                                                       } else {
                                                           connection_ikon_cms.release();
                                                           logger.writeLog('addOffer : ' + JSON.stringify("Offer Plan successfully added."));
                                                           res.send({
                                                               "success": true,
                                                               "message": "Offer Plan successfully added."
                                                           });
                                                       }
                                                   });
                                               } else {
                                                   loop(cnt);
                                               } //else
                                           }//else
                                       }); //query insert into multiselect..
                                   }
                               });
                           } //loop;
                       }//else
                   });
               }
           }); 
        }else{
            res.redirect('/accountlogin');
        }    
    }catch (err) {
        res.status(500).json(err.message);
    }
} // getOfferData

/**
 * @function editoffer
 * @param req
 * @param res
 * @param next
 * @description update existing selected offer plan
 */
exports.editOffer = function (req, res, next) {
    try {
        var v_distibution_channels = req.body.DistributionChannels;
        var v_plan_name = req.body.PlanName.toLowerCase();
        var v_op_id = req.body.offerplanId;
        if (req.session != undefined && req.session.Plan_UserName != undefined) {
            mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                if(err){
                    logger.writeLog('editOffer : ' + JSON.stringify(err));
                }else{
                    async.parallel({
                            OfferExists: function(callback){
                                var query = connection_ikon_cms.query("SELECT op_id as id FROM `icn_offer_plan` WHERE lower(op_plan_name) = ? AND op_id != ?",[req.body.PlanName.toLowerCase(),v_op_id], function (err, result) {
                                    if(result.length > 0){
                                        callback(err,true);
                                    }else{
                                        callback(err,false);
                                    }
                                });
                            },
                            MasterId : function(callback){
                                var query = connection_ikon_cms.query("SELECT cm_id as master_id FROM `catalogue_master` WHERE cm_name = 'Channel Distribution' ", function (err, result) {
                                    v_master_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                    callback(err,v_master_id);
                                });
                            },
                            MaxGroupId : function(callback){
                                var query = connection_ikon_cms.query('select * from icn_offer_plan where op_id = ?', [v_op_id], function (err, result) {
                                    if(err){
                                        callback(err);
                                    }else{
                                        if (result.length > 0){
                                            v_group_id = result[0].op_channel_front;
                                            var query = connection_ikon_cms.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [v_group_id], function (err, result) {
                                                if(err){
                                                    callback(err)
                                                }else{
                                                    callback(null,v_group_id);
                                                };
                                            });
                                        }
                                    }

                                });
                            }
                        },
                    function(err,async_results){
                            if(err){
                                logger.writeLog('editOffer : ' + JSON.stringify(err));
                                connection_ikon_cms.release();
                                res.status(500).json(err.message);
                            }else{
                                if(async_results.OfferExists){
                                    logger.writeLog('editOffer : ' + JSON.stringify("Another offer with the same name exists"));
                                    connection_ikon_cms.release();
                                    res.send({"success" : false,"message" : "Another offer with the same name exists"});
                                }else{
                                    if(async_results.MaxGroupId != null){
                                        var v_distibution_channels = req.body.DistributionChannels;
                                        var count = v_distibution_channels.length;
                                        var cnt = 0;
                                        loop(0);
                                        function loop(cnt) {
                                            var i = cnt;
                                            var query = connection_ikon_cms.query("SELECT MAX(cmd_id) as cmd_id FROM `multiselect_metadata_detail`", function (err, result) {
                                                if(err){
                                                    logger.writeLog('editOffer : ' + JSON.stringify(err));
                                                    connection_ikon_cms.release();
                                                    res.status(500).json(err.message);
                                                }else{
                                                    //Get MAx cmd id for multiselect rows
                                                    v_cmd_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                                    var data = {
                                                        cmd_id : v_cmd_id,
                                                        cmd_group_id : async_results.MaxGroupId,
                                                        cmd_entity_type : async_results.MasterId,
                                                        cmd_entity_detail : v_distibution_channels[i]
                                                    }
                                                    //Insert into multiselect
                                                    var query = connection_ikon_cms.query('INSERT INTO `multiselect_metadata_detail` SET ?', data, function (err, result) {
                                                        if(err){
                                                            logger.writeLog('editOffer : ' + JSON.stringify(err));
                                                            connection_ikon_cms.release();
                                                            res.status(500).json(err.message);
                                                        }else{
                                                            cnt = cnt + 1;
                                                            if(cnt == count){
                                                                //insert into offer plan
                                                                var query = connection_ikon_cms.query('UPDATE icn_offer_plan SET op_plan_name=?,op_caption=?,op_description=?,op_buy_item=?,op_free_item=?,op_is_active=?  WHERE op_id=? ', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.Buyitems,req.body.GetFreeItems, 1, req.body.offerplanId], function (err, result) {
                                                                    if(err){
                                                                        logger.writeLog('editOffer : ' + JSON.stringify(err));
                                                                        connection_ikon_cms.release();
                                                                        res.status(500).json(err.message);
                                                                    }else{
                                                                        offerManager.isPlanMappedPackageExist(connection_ikon_cms, req.body.offerplanId, function (err, result) {
                                                                            if(result.length > 0) {
                                                                                updatePackageDate(connection_ikon_cms,0,result);
                                                                            }
                                                                        })
                                                                        logger.writeLog('editOffer : ' + JSON.stringify('Offer Plan Updated successfully.'));
                                                                        connection_ikon_cms.release();
                                                                        res.send({
                                                                            success: true,
                                                                            message: 'Offer Plan Updated successfully.'
                                                                        });
                                                                    }
                                                                });
                                                            }else{
                                                                loop(cnt);
                                                            }
                                                        }
                                                    }); //query
                                                } //else
                                            });
                                        }//loop
                                    }//if
                                }//else
                            }
                        });//async end
                }
            }); //conn
          }else{
             res.redirect('/accountlogin');
          }
}catch(err){
    res.status(500).json(err.message);
}
};

function updatePackageDate(connection_ikon_cms, cnt, data) {
    var j = cnt;
    var count = data.length;
    offerManager.updatePackageDate(connection_ikon_cms, data[j].paos_sp_pkg_id, function (err, updated) {
        if (err) {
            logger.writeLog('updatePackageDate : ' + JSON.stringify(err));
            connection_ikon_cms.release();
            res.status(500).json(err.message);
            console.log(err.message)
        }
        else {
            cnt++;
            if (cnt < count) {
                updatePackageDate(connection_ikon_cms, cnt,data);
            }
        }
    });
}