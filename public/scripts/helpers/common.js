/**
 * Created by sujata.patne on 07-08-2015.
 */
function GetDistributionChannel(Distribution) {
    var DataArray = [];
    Distribution.forEach(function (value) {
        DataArray.push({ cd_id: value.cd_id, cd_name: value.cd_name, isactive: true });
    });
    return Distribution;
}