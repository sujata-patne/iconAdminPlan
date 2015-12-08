/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Subscriptions', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';
    service.GetSubscriptionData = function (data, success) {
        $http.post(service.baseRestUrl + '/getsubscriptions', data).success(function (items) {
            success(items);
        });
    }
    service.getJetPayDetailsByStoreId = function(storeId,success){
        $http.post('http://192.168.1.168:8060/BillingUtilService/GetStoreDetails?Store='+storeId).success(function (items) {
            success(items);
        });
    }

    service.AddEditSubscription = function (data, success) {
        $http.post(service.baseRestUrl + '/addeditsubscription', data).success(function (items) {
            success(items);
        });
    }

    return service;
}]);