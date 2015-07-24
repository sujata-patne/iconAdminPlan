/**
 * Created by sujata.patne on 14-07-2015.
 */
myApp.service('AlaCarts', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.GetAlacartData = function(success){
        $http.get(service.baseRestUrl + '/alacart').success(function (items) {
            success(items);
        });
    }

    service.AddAlacart = function(data,success){
        $http.post(service.baseRestUrl + '/alacart', data).success(function (items) {
            success(items);
        });
    }
    

    return service;
}]);