/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Offers', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';

    service.GetOfferData = function (data, success) {
        $http.post(service.baseRestUrl + '/getofferdata', data).success(function (items) {
            success(items);
        });
    }

    service.AddEditOffer = function (data, success) {
        $http.post(service.baseRestUrl + '/addeditoffer', data).success(function (items) {
            success(items);
        });
    }


    return service;
}]);