/**
 * Created by sujata.patne on 11-09-2015.
 */
exports.getKeywords = function(dbConnection, callback){
    dbConnection.query('select cm.* from catalogue_master AS cm where cm.cm_name in ("Search Keywords") order by cm.cm_id ', function (err, keywords) {
        callback(err, keywords)
    });
}

exports.getRules = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Rules") order by cm.cm_id ', function (err, rules) {
        callback(err, rules)
    });
}

exports.getLanguages = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Languages") order by cm.cm_id ', function (err, languages) {
        callback(err, languages)
    });
}

exports.getGenres = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Genres") order by cm.cm_id ', function (err, genres) {
        callback(err, genres)
    });
}

exports.getSubGenres = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Sub Genres") order by cm.cm_id ', function (err, subgenres) {
        callback(err, subgenres)
    });
}

exports.getMood = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Mood") order by cm.cm_id ', function (err, mood) {
        callback(err, mood)
    });
}

exports.getSinger = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Singers") order by cm.cm_id ', function (err, singer) {
        callback(err, singer)
    });
}

exports.getMusicDirectors = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Music Directors") order by cm.cm_id ', function (err, musicdirector) {
        callback(err, musicdirector)
    });
}

exports.getNudity = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Nudity") order by cm.cm_id ', function (err, adult) {
        callback(err, adult)
    });
}

exports.getPhotographer = function(dbConnection, callback){
    dbConnection.query('select cm.*,cd.cd_id, cd.cd_name from catalogue_master AS cm ' +
        'join catalogue_detail as cd on cm.cm_id = cd.cd_cm_id where cm.cm_name in ("Photographer") order by cm.cm_id ', function (err, photographer) {
        callback(err, photographer)
    });
}

// exports.getVendor = function(dbConnection, callback){
//     dbConnection.query('SELECT vd_id AS cd_id, vd_name AS cd_name, (select cm.cm_id FROM catalogue_master AS cm WHERE cm.cm_name in ("Vendor") )as cm_id ' +
//         'FROM icn_vendor_detail WHERE vd_is_active = 1 ', function (err, vendor) {
//         callback(err, vendor)
//     });
// }
exports.getVendor = function(dbConnection,storeId, callback){
    dbConnection.query('SELECT ivd.vd_id as cd_id,ivd.vd_name as cd_name , mlm.cmd_entity_type as cm_id  FROM icn_store st ' +
    'inner join   multiselect_metadata_detail mlm on (mlm.cmd_group_id = st.st_vendor) ' +
    'join icn_vendor_detail ivd on ivd.vd_id =  mlm.cmd_entity_detail ' +
    'WHERE st.st_id = ? and ivd.vd_is_active = 1 ',[storeId], function (err, vendor) {
        callback(err, vendor)
    });
}
exports.getActorActress = function(dbConnection, callback){
    dbConnection.query('SELECT distinct cd.cd_id, cd.cd_name, cd.cd_cm_id as cm_id FROM catalogue_detail AS cd ' +
        'inner join catalogue_master as cm on (cm.cm_id = cd.cd_cm_id) ' +
        'inner join multiselect_metadata_detail as mmd ON ( cd.cd_desc = mmd.cmd_group_id && cd.cd_cm_id = mmd.cmd_entity_type ) ' +
        'inner join catalogue_detail as role on (role.cd_id  = mmd.cmd_entity_detail) ' +
        'where cm.cm_name="Celebrity" and role.cd_name in ("Actress","Actor")', function (err, actor_actress) {
        callback(err, actor_actress)
    });
}

exports.getProperty = function(dbConnection, callback){
    dbConnection.query('select cm.* from catalogue_master AS cm WHERE cm.cm_name in ("Property") order by cm.cm_id ', function (err, property) {
        callback(err, property)
    });
}
exports.getContentTitle = function(dbConnection, callback){
    dbConnection.query('select cm.* from catalogue_master AS cm WHERE cm.cm_name in ("Content Title") order by cm.cm_id ', function (err, title) {
        callback(err, title)
    });
}
exports.getContentId = function(dbConnection, callback){
    dbConnection.query('select cm.* from catalogue_master AS cm WHERE cm.cm_name in ("Content Ids") order by cm.cm_id ', function (err, id) {
        callback(err, id)
    });
}
exports.getReleaseYear = function(dbConnection, callback){
    dbConnection.query('select cm.* from catalogue_master AS cm WHERE cm.cm_name in ("Property Release Year") order by cm.cm_id ', function (err, id) {
        callback(err, id)
    });
}
exports.getLastSearchCriteriaId = function( dbConnection, callback ) {
    var query = dbConnection.query("SELECT MAX(pcr_id) as pcr_id FROM `icn_pack_content_rule` ", function ( err, response ) {
        var pcrId = response[0].pcr_id != null ? parseInt(response[0].pcr_id + 1) : 1;

        callback( err,pcrId );
    });
}
exports.saveSearchCriteria = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO `icn_pack_content_rule` SET ? ",data, function (err, response) {
        callback(err,response);
    });
}
exports.searchContentsExist = function(dbConnection, data, callback){
    dbConnection.query("SELECT pc.* FROM icn_pack_content AS pc WHERE pc_pct_id = ? AND pc_cm_id = ? AND ISNULL(pc_crud_isactive)  ",
        [data.pc_pct_id, data.pc_cm_id],function (err, result) {
            if(result.length > 0){
                callback(err,result);
            }else{
                callback(err,false);
            }
        });
}
exports.insertSearchContents = function(dbConnection, data, callback){
    var query = dbConnection.query("INSERT INTO `icn_pack_content` SET ? ",data, function (err, response) {
        if (err) {
            dbConnection.release();
            res.status(500).json(err.message);
        } else {
            dbConnection.query("SELECT pct.* FROM icn_pack_content_type AS pct WHERE pct_id = ? AND ISNULL(pct_crud_isactive)  ",
                [data.pc_pct_id],function (err, result) {
                    if(result.length > 0){
                        dbConnection.query("UPDATE `icn_pack_content_type` SET pct_modified_on = NOW() WHERE pct_id = ? ",[data.pc_pct_id], function (err, data) {

                        })
                    }
                });

            callback(err,response);
        }
    })
}
exports.saveSearchContents = function(dbConnection, data, callback){
    //console.log(data.pc_pct_id +' : '+ data.pc_cm_id)
    dbConnection.query("SELECT pc.* FROM icn_pack_content AS pc WHERE pc_pct_id = ? AND pc_cm_id = ? AND ISNULL(pc_crud_isactive) ",
        [data.pc_pct_id, data.pc_cm_id],function (err, result) {
            if(result.length > 0){
                callback(null,false);
            }else{
                var query = dbConnection.query("INSERT INTO `icn_pack_content` SET ? ",data, function (err, response) {
                    callback(err,response);
                });
            }
        });
}

exports.isDeletedContents = function(dbConnection, data, callback) {
    dbConnection.query("SELECT pc.* FROM icn_pack_content AS pc WHERE pc_pct_id = ? AND pc_cm_id = ? AND pc_crud_isactive IS NOT NULL ",
        [data.pc_pct_id, data.pc_cm_id], function (err, result) {
            if (err) {
                dbConnection.release();
                res.status(500).json(err.message);
            }else{
                if(result && result.length > 0){
                    callback(err,true);
                }else{
                    callback(err,false);
                }
            }
        })
}
exports.isPublishedContents = function(dbConnection, data, callback) {
    dbConnection.query("SELECT pc.* FROM icn_pack_content AS pc WHERE pc_pct_id = ? AND pc_cm_id = ? AND pc_ispublished IS NOT NULL AND ISNULL(pc_crud_isactive) ",
        [data.pc_pct_id, data.pc_cm_id], function (err, result) {
            if (err) {
                dbConnection.release();
                res.status(500).json(err.message);
            }else{
                if(result && result.length > 0){
                    callback(err,true);
                }else{
                    callback(err,false);
                }
            }
        })
}

exports.updateInsertSearchContents = function(dbConnection, data, callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET ? WHERE pc_pct_id = ? AND pc_cm_id = ? AND pc_ispublished IS NOT NULL ", [data, data.pc_pct_id, data.pc_cm_id], function (err, response) {
        if (err) {
            dbConnection.release();
            res.status(500).json(err.message);
        }else{
            var newdata = {
                pc_pct_id: data.pc_pct_id,
                pc_cm_id: data.pc_cm_id,
                pc_arrange_seq: data.pc_arrange_seq,
                pc_ispublished: data.pc_ispublished
            }
            var query = dbConnection.query("INSERT INTO `icn_pack_content` SET ? ", newdata, function (err, response) {
                callback(err,response);
            })
        }
    })
}

exports.updateSearchContents = function(dbConnection, data, callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET ? WHERE pc_pct_id = ? AND pc_cm_id = ? ", [data, data.pc_pct_id, data.pc_cm_id], function (err, result) {
        if (err) {
            dbConnection.release();
        } else {
            var query = dbConnection.query("UPDATE `icn_pack_content_type` SET pct_modified_on = NOW() WHERE pct_id = ? ",[data.pc_pct_id], function (err, response) {
                if(err){
                    dbConnection.release();
                }
            });
            callback(err,result);
        }
    })
}
exports.getSavedContents = function(dbConnection, pctId, callback){
    var celebrity = '(SELECT cd1.cd_name FROM catalogue_detail AS cd1 ' +
        'JOIN catalogue_master AS cm1 ON (cd1.cd_cm_id = cm1.cm_id) ' +
        'WHERE cm1.cm_name="Celebrity" AND cd1.cd_id = cmd.cm_celebrity ) AS celebrity ';

    var uploadedFiles = '(SELECT SUBSTRING_INDEX(group_concat(cf.cf_url), ",", -2) from content_files as cf where pc.pc_cm_id = cf.cf_cm_id and '+
        ' cf_template_id = (select ct_group_id from content_template where ct_param_value = "ANY" order by ct_id desc limit 1 ) '+
        ' Limit 1) as uploadedFiles , ';


    dbConnection.query("SELECT pc.*, cmd.*, cmd1.cm_title AS property,cmd1.cm_release_year AS releaseYear, "+uploadedFiles+" "+celebrity+" FROM icn_pack_content AS pc " +
        "JOIN content_metadata As cmd ON cmd.cm_id = pc.pc_cm_id " +
        "INNER JOIN content_metadata as cmd1 ON cmd1.cm_id = cmd.cm_property_id " +
        "WHERE ISNULL(cmd1.cm_property_id) AND pc_pct_id = ? AND ISNULL(pc.pc_crud_isactive) ", [pctId],function (err, result) {
        callback(err,result);
    });
}

exports.getPackDetails = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pk.*, pct.pct_cnt_type AS contentTypeId, cd.cd_name as displayName," +
        "(select cd.cd_name from catalogue_detail as cd "+
        " WHERE cd.cd_id = (select mct_parent_cnt_type_id from icn_manage_content_type where mct_cnt_type_id = contentTypeId Limit 1) ) "+
        " as parent_type, (select cd1.cd_name from catalogue_detail cd1 where cd1.cd_id = pct.pct_cnt_type Limit 1 ) as type FROM icn_packs AS pk " +
        "JOIN icn_pack_content_type AS pct ON pk.pk_id = pct.pct_pk_id " +
        "JOIN catalogue_detail AS cd ON cd.cd_id = pk.pk_cnt_display_opt " +
        " WHERE pct.pct_id = ? ", [pctId],function (err, result) { //pct_is_active = 1 AND
        callback(err,result);
    });
}

exports.getPackContentSequence = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pc.* FROM icn_pack_content AS pc " +
        "WHERE pc.pc_pct_id = ? AND ISNULL(pc.pc_crud_isactive) ", [pctId],function (err, result) {
        callback(err,result);
    });
}

exports.getPackSearchDetails = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pct.pct_cnt_type AS contentTypeId,pct.pct_nxt_rule_duration as duration, pcr.*, cm.* FROM icn_packs AS pk " +
        "JOIN icn_pack_content_type AS pct ON pk.pk_id = pct.pct_pk_id " +
        "JOIN icn_pack_content_rule AS pcr ON pcr.pcr_pct_id = pct.pct_id " +
        "JOIN catalogue_master AS cm ON cm.cm_id = pcr.pcr_metadata_type " +
        " WHERE pct.pct_id = ? AND ISNULL(pcr.pcr_crud_isactive) ", [pctId],function (err, result) { //pct_is_active = 1 AND
        callback(err,result);
    });
}

exports.getSearchCriteriaResult = function(dbConnection,searchData,callback) {

    var whereStr = ' ISNULL(cmd1.cm_property_id) AND cmd.cm_state = 4  ';
    var limitstr = '';
    if (searchData.limitCount) {
        limitstr = ' LIMIT '+searchData.limitCount;
    }
    if (searchData.contentTypeId) {
        whereStr += ' AND cmd.cm_content_type = ' + searchData.contentTypeId;
    }

    if (searchData.Content_Title && searchData.Content_Title != '') {
        var searchIn = '';
        if (searchData.searchWhereTitle == 'start') {
            searchIn = ' LIKE "' + searchData.Content_Title + '%"'
        }
        else if (searchData.searchWhereTitle == 'end') {
            searchIn = ' LIKE "%' + searchData.Content_Title + '"'
        }
        else if (searchData.searchWhereTitle == 'anywhere') {
            searchIn = ' LIKE "%' + searchData.Content_Title + '%"'
        }
        else if (searchData.searchWhereTitle == 'exact') {
            searchIn = ' LIKE "' + searchData.Content_Title + '"'
        }
        whereStr += ' AND cmd.cm_title ' + searchIn;
    }
    if (searchData.releaseYearStart != null && searchData.releaseYearEnd != null) {
        //whereStr += ' SELECT cmd2.cm_release_year FROM content_metadata AS cmd2 WHERE ISNULL(cmd2.cm_property_id) AND cmd.cm_property_id = cmd2.cm_id
        whereStr += ' AND cmd1.cm_release_year BETWEEN ' + searchData.releaseYearStart + ' AND ' + searchData.releaseYearEnd;
    }
    if (searchData.Property && searchData.Property != '') {
        var searchIn = '';
        if (searchData.searchWherePropertyTitle == 'start') {
            searchIn = ' AND p.cm_title LIKE "' + searchData.Property + '%"'
        }
        else if (searchData.searchWherePropertyTitle == 'end') {
            searchIn = ' AND p.cm_title LIKE "%' + searchData.Property + '"'
        }
        else if (searchData.searchWherePropertyTitle == 'anywhere') {
            searchIn = ' AND p.cm_title LIKE "%' + searchData.Property + '%"'
        }
        else if (searchData.searchWherePropertyTitle == 'exact') {
            searchIn = ' AND p.cm_title LIKE "' + searchData.Property + '"'
        }
        whereStr += ' AND cmd.cm_property_id IN ( SELECT p.cm_id FROM content_metadata AS p WHERE ISNULL(p.cm_property_id) ' + searchIn + ' ) ';
    }
    if (searchData.Content_Ids && searchData.Content_Ids != '') {
        var Content_Ids = searchData.Content_Ids.replace(/(^[,\s]+)|([,\s]+$)/g, '');

        whereStr += ' AND cmd.cm_id IN (' + Content_Ids + ') ';
    }
    if (searchData.Vendor && searchData.Vendor != null) {
        whereStr += ' AND cmd.cm_vendor = ' + searchData.Vendor;
    }
    if (searchData.Keywords  && searchData.Keywords != '' ) {
        var keywords = searchData.Keywords.split(',')
            .map(function (element) {
                return "'" + String(element).trim() + "'"
            }).join(" ,");
        whereStr += ' AND cmd.cm_key_words IN ( SELECT group_concat( distinct mmd.cmd_group_id) FROM catalogue_detail AS kcd ' +
            'JOIN catalogue_master AS kcm ON kcd.cd_cm_id = kcm.cm_id ' +
            'JOIN multiselect_metadata_detail AS mmd ON mmd.cmd_entity_detail = kcd.cd_id ' +
            'WHERE kcm.cm_name = "Search Keywords" AND cd_name IN (' + keywords + ') )';
    }
    if (searchData.Language && searchData.Language != null) {
        whereStr += ' AND cmd.cm_language = ' + searchData.Language;
    }
    if (searchData.Actor_Actress && searchData.Actor_Actress != null) {
        whereStr += ' AND cmd.cm_celebrity = ' + searchData.Actor_Actress;
    }
    if (searchData.Genres && searchData.Genres != null) {
        whereStr += ' AND cmd.cm_genre = ' + searchData.Genres;
    }
    if (searchData.Sub_Genres && searchData.Sub_Genres != null) {
        whereStr += ' AND cmd.cm_sub_genre = ' + searchData.Sub_Genres;
    }
    if (searchData.Mood && searchData.Mood != null) {
        whereStr += ' AND cmd.cm_mood = ' + searchData.Mood;
    }
    if (searchData.Photographer && searchData.Photographer != null) {
        whereStr += ' AND cmd.cm_protographer = ' + searchData.Photographer;
    }

    if(searchData.Singers && searchData.Singers != null){
        whereStr += ' AND cmd.cm_singer = ' + searchData.Singers;
    }
    if(searchData.Music_Directors && searchData.Music_Directors != null){
        whereStr += ' AND cmd.cm_music_director = ' + searchData.Music_Directors;
    }

    if(searchData.Nudity && searchData.Nudity != null){
        whereStr += ' AND cmd.cm_nudity = ' + searchData.Nudity;
    }

    var celebrity = '(SELECT cd1.cd_name FROM catalogue_detail AS cd1 ' +
        'JOIN catalogue_master AS cm1 ON (cd1.cd_cm_id = cm1.cm_id) ' +
        'WHERE cm1.cm_name="Celebrity" AND cd1.cd_id = cmd.cm_celebrity ) AS celebrity ';


    //Rule based most downloaded :
    if(searchData.ruleName == 'MostDownloaded'){
        whereStr += ' AND cmd.cm_id IN ( SELECT cd_cmd_id FROM siteuser.content_download ORDER BY cd_download_count desc) ';
    }
    if(searchData.ruleName == 'MostViewedContent'){
        whereStr += ' AND cmd.cm_id IN ( SELECT cd_cmd_id FROM siteuser.content_download ORDER BY cd_download_count desc) ';
    }
    if(searchData.ruleName == 'MostClicked'){
        whereStr += ' AND cmd.cm_id IN ( SELECT cd_cmd_id FROM siteuser.content_download ORDER BY cd_download_count desc) ';
    }

    var query = dbConnection.query('SELECT cmd.*,cmd1.cm_title AS property, cmd1.cm_release_year AS releaseYear, '+celebrity+' , ' +
        '(SELECT cf.cf_url_base FROM content_files as cf WHERE cmd.cm_id = cf.cf_cm_id and cf_url_base NOT LIKE "%3gp" Limit 1) AS contentUrl,' +
        '(SELECT cft_thumbnail_img_browse FROM content_files_thumbnail WHERE cft_cm_id = cmd.cm_id Limit 1 ) as new_thumb_url  from content_metadata As cmd ' +
        'INNER join content_metadata as cmd1 ON cmd1.cm_id = cmd.cm_property_id WHERE ' + whereStr + limitstr , function (err, result) {
        callback(err,result);
    })
}

exports.searchCriteriaExist = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pcr.* FROM icn_pack_content_rule AS pcr " +
            "WHERE pcr_pct_id  = ? AND ISNULL(pcr_crud_isactive) ",
        [pctId],function (err, result) {
            if(result && result.length > 0){
                callback(err,true);
            }else{
                callback(err,false);
            }
        });
}
exports.addSearchCriteriaField = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO icn_pack_content_rule SET ? ",data, function (err, response) {
        callback(err,response);
    });
}
exports.deleteSearchCriteria = function(dbConnection,pctId,callback){

    var query = dbConnection.query("UPDATE icn_pack_content_rule SET pcr_crud_isactive = ? WHERE pcr_pct_id = ? ", [pctId, pctId], function (err, response) {
        callback(err,response);
    });
}
exports.existSearchCriteriaField = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pcr.* FROM icn_pack_content_rule AS pcr " +
            "WHERE pcr_pct_id  = ? AND ISNULL(pcr_crud_isactive) ",
        [pctId], function (err, result) {
            if(result && result.length > 0){
                callback(err,true);
            }else{
                callback(err,false);
            }
        });
}
exports.deleteSearchCriteriaField = function(dbConnection,pctId,callback){

    var query = dbConnection.query("UPDATE icn_pack_content_rule SET pcr_crud_isactive = ? WHERE pcr_pct_id = ?  AND ISNULL(pcr_crud_isactive) ", [pctId,pctId], function (err, response) {
        //console.log("delete : "+response)
        callback(err,true);
    });

//dbConnection.query("SELECT pcr.* FROM icn_pack_content_rule AS pcr WHERE pcr_pct_id  = ? AND pcr_metadata_type = ? AND pcr_metadata_search_criteria = ? AND ISNULL(pcr_crud_isactive) ",

}

exports.deleteSearchedContent = function(dbConnection,pctId,callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET pc_crud_isactive = ? WHERE pc_pct_id = ? and pc_ispublished != 1 ", [pctId, pctId], function (err, response) {

        callback(err,response);

    })
}
exports.deletePackContents = function(dbConnection, data, callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET pc_crud_isactive = ? WHERE pc_pct_id = ? AND pc_cm_id = ? ", [data.pc_pct_id,data.pc_pct_id, data.pc_cm_id], function (err, result) {

        callback(err,result);

    })
}
exports.deleteUnwantedPackContents = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET pc_crud_isactive = ? WHERE pc_pct_id = ? " +
        "AND pc_cm_id = ? ", [data.pc_pct_id,data.pc_pct_id, data.pc_cm_id], function (err, response) {

        callback(err,response);

    })
}

exports.getPackContents = function(dbConnection,pctId,callback){
    var query = dbConnection.query("SELECT * FROM icn_pack_content WHERE pc_pct_id = ? AND ISNULL(pc_crud_isactive) ", [pctId], function (err, response) {

        callback(err,response);

    });
}
exports.getUnwantedPackContents = function(dbConnection,pctId, data,callback){
    var query = dbConnection.query("SELECT group_concat(pc_cm_id) as contents FROM icn_pack_content WHERE pc_pct_id = ? AND pc_cm_id NOT IN ("+data+") AND ISNULL(pc_crud_isactive) ", [pctId], function (err, response) {
        callback(err,response);
    });
}
exports.updatePackData = function(dbConnection,data,callback){
    var query = dbConnection.query("UPDATE icn_packs SET ? WHERE pk_id = ? ", [data, data.pk_id], function (err, response) {
        callback(err,response);
    });
}

exports.getPulishedContentIds = function( dbConnection, pctId, data, callback ) {
    dbConnection.query("SELECT group_concat( pc.pc_cm_id ) AS contentIds FROM icn_pack_content AS pc WHERE pc_pct_id = ? AND pc_cm_id IN (" + data + ") AND pc_ispublished IS NOT NULL AND ISNULL(pc_crud_isactive) ",
        [pctId], function( err, result ) {
            callback( err,result );
        })
}

exports.deletePackContentsByIds = function(dbConnection, pctId, contentIds , callback){
    var query = dbConnection.query("UPDATE icn_pack_content SET pc_crud_isactive = ? WHERE pc_pct_id = ? AND pc_cm_id IN ("+ contentIds +") ", [pctId, pctId], function (err, result) {
        callback(err,result);
    });
}

exports.deleteUnwantedPackContentsByContentIds = function(dbConnection, pctId, contentIds , callback){
    var query = dbConnection.query("DELETE FROM icn_pack_content WHERE pc_pct_id = ? AND pc_cm_id IN ("+ contentIds +") ", [pctId], function (err, result) {
        callback(err,result);
    });
}


exports.getSearchCriteriaByPackContentTypeId = function(dbConnection,pctId,callback){
    dbConnection.query("SELECT pcr.* FROM icn_pack_content_rule AS pcr " +
            "WHERE pcr_pct_id  = ? AND ISNULL(pcr_crud_isactive) ",
        [pctId],function (err, result) {
            callback(err,result);
        });
}

exports.deletePackContentsForCron = function(dbConnection, pctId, callback){
    var query = dbConnection.query("DELETE FROM icn_pack_content WHERE pc_pct_id = ? ", [pctId], function (err, result) {

        callback(err,result);

    })
}


exports.savePackContentForCron = function(dbConnection,data,callback){
    var query = dbConnection.query("INSERT INTO `icn_pack_content` SET ? ",data, function (err, response) {
        callback(err,response);
    });
}

exports.updateContentTypeForDuration = function(dbConnection,data, whereData,callback){
    var moment = require('moment');
    // console.log("DATE IN MODEL :: "+data.pct_nxt_rule_exe_date);
    var now = moment(new Date());
    var nxt_rule_date = now.add(data.pct_nxt_rule_duration,'days').format('YYYY-MM-DD');
    var query = dbConnection.query("UPDATE `icn_pack_content_type` SET pct_nxt_rule_duration = ?, pct_nxt_rule_exe_date = ? WHERE pct_pk_id = ? AND pct_id = ?", [data.pct_nxt_rule_duration,nxt_rule_date, whereData.pct_pk_id, whereData.pct_id], function (err, response) {
        callback(err,response);
    });
}