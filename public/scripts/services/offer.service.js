/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Offers', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = '';

    service.GetOfferData = function (data, success) {
        $http.post(service.baseRestUrl + '/getofferdata', data).success(function (items) {
            success(items);
        });
    }

    service.AddOffer = function (data, success) {
        $http.post(service.baseRestUrl + '/addoffer', data).success(function (items) {
            success(items);
        });
    }

    service.EditOffer = function (data, success) {
        $http.post(service.baseRestUrl + '/editoffer', data).success(function (items) {
            success(items);
        });
    }

    return service;
}]);