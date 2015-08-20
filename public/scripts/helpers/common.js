/**
 * Created by sujata.patne on 07-08-2015.
 */

function GetDistributionChannel(Distribution) {
    var DataArray = [];
    Distribution.forEach(function (value) {
        console.log(value)
        DataArray.push({ cd_id: value.cd_id, cd_name: value.cd_name, isactive: false });
    });
    return DataArray;
}
