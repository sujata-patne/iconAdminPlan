/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Valuepacks', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.GetValuepackData = function (data, success) {
        $http.post(service.baseRestUrl + '/getvaluepack', data).success(function (items) {
            success(items);
        });
    }
    service.getJetPayDetailsByStoreId = function(storeId,success){
        /*$.ajax({
            method: "POST",
            dataType: "json",
            data: data,
            url: 'http://192.168.1.168:8060/BillingUtilService/GetStoreDetailsAla',
            success: function(items){
                alert(items)
            }
        });*/

        $http.post('http://192.168.1.168:8060/BillingUtilService/GetStoreDetailsAla?Store='+storeId).success(function (items) {
            success(items);
        });
    }
    service.AddEditValuepack = function (data, success) {
        $http.post(service.baseRestUrl + '/addeditvaluepack', data).success(function (items) {
            success(items);
        });
    }


    return service;
}]);