/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Subscriptions', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.GetSubscriptionData = function (success) {
        $http.get(service.baseRestUrl + '/subscriptions').success(function (items) {
            success(items);
        });
    }

    service.AddSubscription = function (data, success) {
        $http.post(service.baseRestUrl + '/subscriptions', data).success(function (items) {
            success(items);
        });
    }

    service.GetEditSubscriptionData = function (data, success) {
        $http.post(service.baseRestUrl + '/editsubscriptiondata', data).success(function (items) {
            success(items);
        });
    }

    service.EditSubscription = function (data, success) {
        $http.post(service.baseRestUrl + '/editsubscription', data).success(function (items) {
            success(items);
        });
    }


    return service;
}]);