/**
 * Created by sujata.patne on 13-07-2015.
 */
var mysql = require('../config/db').pool;
/**
 * @function getofferdata
 * @param req
 * @param res
 * @param next
 * @description get list all offer plans
 */


exports.getofferdata = function (req, res, next) {
    try {
        var v_distibution_channels;
        if (req.session) {
            if (req.session.UserName) {
                mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                    var query = connection_ikon_cms.query("SELECT cd.* FROM catalogue_detail cd, catalogue_master cm WHERE cd.cd_cm_id = cm.cm_id AND cm_name = 'Channel Distribution'", function (err, DistributionChannel) {
                        if (err) {
                            connection_ikon_cms.release();
                            res.status(500).json(err.message);
                        }
                        else {
                            v_distibution_channels = DistributionChannel;
                            if(req.body.planid){
                                var query = connection_ikon_cms.query("SELECT * FROM `icn_offer_plan` WHERE op_id = ?",[req.body.planid], function (err, result) {
                                    if(err){
                                        connection_ikon_cms.release();
                                        res.status(500).json(err.message);
                                    }else{

                                        var query = connection_ikon_cms.query("SELECT mmd.* FROM multiselect_metadata_detail AS mmd JOIN icn_offer_plan AS offer ON mmd.cmd_group_id = offer.op_channel_front where offer.op_id = ?",[req.body.planid],function(err,selectedDistributionChannel){
                                            if(err){
                                                connection_ikon_cms.release();
                                                res.status(500).json(err.message);
                                            }else{
                                                  connection_ikon_cms.release();
                                                  res.send({ row : result, selectedDistributionChannel : selectedDistributionChannel,DistributionChannel : v_distibution_channels });
                                            }
                                        });
                                      
                                    }
                                });
                            }else{
                                  res.send({
                                    DistributionChannel: DistributionChannel,
                                    UserRole: req.session.UserRole
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
        if (req.session != undefined && req.session.UserName != undefined) {
           mysql.getConnection('CMS', function (err, connection_ikon_cms) {
                  var query = connection_ikon_cms.query("SELECT op_id as id FROM `icn_offer_plan` WHERE lower(op_plan_name) = ?",[req.body.PlanName.toLowerCase()],function (err, result) {
                        if(err){
                            connection_ikon_cms.release();
                            res.status(500).json(err.message); 
                        }else{
                            if(result.length > 0){
                                connection_ikon_cms.release();
                                res.send({"success" : false,"message" : "Offer Name already exists"}); 
                            }else{
                                    var query = connection_ikon_cms.query("SELECT MAX(op_id) as id FROM `icn_offer_plan`", function (err, result) {
                                                    if(err){  
                                                        connection_ikon_cms.release();
                                                        res.status(500).json(err.message); 
                                                    }else{
                                                         v_op_id = result[0].id != null ? parseInt(result[0].id + 1) : 1;

                                                         //Query to select max from multiselect :
                                                         var query = connection_ikon_cms.query("SELECT MAX(cmd_group_id) as group_id FROM `multiselect_metadata_detail`", function (err, result) {
                                                            v_group_id = result[0].group_id != null ? parseInt(result[0].group_id + 1) : 1;
                                                            if(err){ 
                                                                     connection_ikon_cms.release();
                                                                     res.status(500).json(err.message);
                                                            }else{
                                                                var query = connection_ikon_cms.query("SELECT cm_id as master_id FROM `catalogue_master` WHERE cm_name = 'Channel Distribution' ", function (err, result) {
                                                                    if(err){
                                                                         connection_ikon_cms.release();
                                                                         res.status(500).json(err.message);
                                                                     }else{
                                                                        v_master_id = result[0].master_id;
                                                                        if(v_distibution_channels.length > 0){
                                                                            var count = req.body.DistributionChannels.length;
                                                                            var cnt = 0;
                                                                            loop(0);

                                                                            function loop(cnt) {
                                                                                var i = cnt;
                                                                                var query = connection_ikon_cms.query("SELECT MAX(cmd_id) as cmd_id FROM `multiselect_metadata_detail`", function (err, result) {
                                                                                    if(err){
                                                                                         connection_ikon_cms.release();
                                                                                         res.status(500).json(err.message);
                                                                                    }else{
                                                                                        //Get MAx cmd id for multiselect rows
                                                                                          v_cmd_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                                                                          var data = {
                                                                                            cmd_id : v_cmd_id,
                                                                                            cmd_group_id : v_group_id,
                                                                                            cmd_entity_type : v_master_id,
                                                                                            cmd_entity_detail : v_distibution_channels[i]
                                                                                          }
                                                                                          //Insert into multiselect
                                                                                           var query = connection_ikon_cms.query('INSERT INTO `multiselect_metadata_detail` SET ?', data, function (err, result) {
                                                                                                if(err){
                                                                                                     connection_ikon_cms.release();
                                                                                                      res.status(500).json(err.message);

                                                                                                }else{
                                                                                                    cnt = cnt + 1;
                                                                                                    if(cnt == count){
                                                                                                        //insert into offer plan
                                                                                                         var data = {
                                                                                                                op_id : v_op_id,
                                                                                                                op_ld_id : 1,
                                                                                                                op_st_id : 1,
                                                                                                                op_plan_name : req.body.PlanName,
                                                                                                                op_caption : req.body.Caption,
                                                                                                                op_description : req.body.Description,
                                                                                                                op_buy_item : req.body.Buyitems,
                                                                                                                op_free_item : req.body.GetFreeItems,
                                                                                                                op_channel_front : v_group_id,
                                                                                                                op_is_active : 1
                                                                                                           }
                                                                                                             var query = connection_ikon_cms.query('INSERT INTO `icn_offer_plan` SET ?', data, function (err, result) {
                                                                                                                if(err){ 
                                                                                                                    connection_ikon_cms.release();
                                                                                                                    res.status(500).json(err.message);
                                                                                                                } else{
                                                                                                                    connection_ikon_cms.release();
                                                                                                                    res.send({"success" : true, "message": "Offer Plan successfully added."});
                                                                                                                }
                                                                                                             });
                                                                                                    }else{
                                                                                                        loop(cnt);
                                                                                                    }
                                                                                                }
                                                                                           }); 
                                                                                    }
                                                                                });
                                                                            }
                                                                        }//If length > 0
                                                                    }//
                                                                });
                                                            }    
                                                         });
                                                    } //err
                                                 });
                            }
                       }
                  });
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
            if (req.session != undefined && req.session.UserName != undefined) {
                    mysql.getConnection('CMS', function (err, connection_ikon_plan) {
                                        //To check whether id exists : 
                                         var query = connection_ikon_plan.query('select * from icn_offer_plan where op_id = ?', [v_op_id], function (err, result) {
                                            if (err) {
                                                 connection_ikon_plan.release();
                                                 res.status(500).json(err.message);
                                            }else{
                                                if (result.length > 0) {
                                                    v_group_id = result[0].op_channel_front;
                                                   //Delete previous records from multiselect :                                                
                                                   var query = connection_ikon_plan.query('DELETE FROM multiselect_metadata_detail WHERE cmd_group_id = ?', [v_group_id], function (err, result) {
                                                   if(err){
                                                        connection_ikon_plan.release();
                                                        res.status(500).json(err.message);
                                                   }else{
                                                    var query = connection_ikon_plan.query("SELECT cm_id as master_id FROM `catalogue_master` WHERE cm_name = 'Channel Distribution' ", function (err, result) {
                                                        if(err){ 
                                                            connection_ikon_plan.release();
                                                            res.status(500).json(err.message);
                                                        } else{
                                                             v_master_id = result[0].master_id;
                                                             if(v_distibution_channels.length > 0){
                                                                    var count = req.body.DistributionChannels.length;
                                                                    var cnt = 0;
                                                                    loop(0);

                                                                    function loop(cnt) {
                                                                        var i = cnt;
                                                                        var query = connection_ikon_plan.query("SELECT MAX(cmd_id) as cmd_id FROM `multiselect_metadata_detail`", function (err, result) {
                                                                            if(err){
                                                                                connection_ikon_plan.release();
                                                                                res.status(500).json(err.message);
                                                                            }else{
                                                                                //Get MAx cmd id for multiselect rows
                                                                                  v_cmd_id = result[0].cmd_id != null ? parseInt(result[0].cmd_id + 1) : 1;
                                                                                  var data = {
                                                                                    cmd_id : v_cmd_id,
                                                                                    cmd_group_id : v_group_id,
                                                                                    cmd_entity_type : v_master_id,
                                                                                    cmd_entity_detail : v_distibution_channels[i]
                                                                                  }
                                                                                  //Insert into multiselect
                                                                                   var query = connection_ikon_plan.query('INSERT INTO `multiselect_metadata_detail` SET ?', data, function (err, result) {
                                                                                        if(err){
                                                                                            connection_ikon_plan.release();
                                                                                            res.status(500).json(err.message);

                                                                                        }else{
                                                                                            cnt = cnt + 1;
                                                                                            if(cnt == count){
                                                                                                //insert into offer plan
                                                                                                 var query = connection_ikon_plan.query('UPDATE icn_offer_plan SET op_plan_name=?,op_caption=?,op_description=?,op_buy_item=?,op_free_item=?,op_is_active=?  WHERE op_id=? ', [req.body.PlanName, req.body.Caption, req.body.Description, req.body.Buyitems,req.body.GetFreeItems, 1, req.body.offerplanId], function (err, result) {
                                                                                                 if(err){
                                                                                                      console.log("INN 8");
                                                                                                      connection_ikon_plan.release();
                                                                                                      res.status(500).json(err.message);
                                                                                                 }else{
                                                                                                         connection_ikon_plan.release();
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
                                                                                   }); 
                                                                            }
                                                                        });
                                                                    }//loop
                                                                }//if
                                                             }//else
                                                         }); //query     
                                                      } //else
                                                    });                                              
                                                }//if
                                             }//else
                                         });
                            }); //conn
                          }else{
                             res.redirect('/accountlogin');
                          }
                }catch(err){
                    res.status(500).json(err.message);
                }
    };
                            
