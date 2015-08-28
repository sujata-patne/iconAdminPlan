/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Subscriptions', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.GetSubscriptionData = function (data, success) {
        $http.post(service.baseRestUrl + '/getsubscriptions', data).success(function (items) {
            success(items);
        });
    }

    service.AddEditSubscription = function (data, success) {
        $http.post(service.baseRestUrl + '/addeditsubscription', data).success(function (items) {
            success(items);
        });
    }

    service.getContentTypeData = function (success) {
        $http.get(service.baseRestUrl + '/contentTypeData').success(function (items) {
            success(items);
        });
    }

    return service;
}]);