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
        $http.get('http://192.168.3.67:8234/jetpayAPI/GetStoreDetails?STORE='+storeId).success(function (items) {
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