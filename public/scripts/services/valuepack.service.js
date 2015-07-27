/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('Valuepacks', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.GetValuepackData = function (success) {
        $http.get(service.baseRestUrl + '/valuepack').success(function (items) {
            success(items);
        });
    }

    service.AddValuepack = function (data, success) {
        $http.post(service.baseRestUrl + '/valuepack', data).success(function (items) {
            success(items);
        });
    }

    service.GetEditValuepackData = function (data, success) {
        $http.post(service.baseRestUrl + '/editvaluepackdata', data).success(function (items) {
            success(items);
        });
    }

    service.EditValuepack = function (data, success) {
        $http.post(service.baseRestUrl + '/editvaluepack', data).success(function (items) {
            success(items);
        });
    }


    return service;
}]);