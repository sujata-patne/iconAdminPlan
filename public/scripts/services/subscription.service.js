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
        $http.get('http://103.43.2.10/BillingUtilService/GetStoreDetails?Store='+storeId).success(function (items) {
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