/**
 * Created by sujata.patne on 14-07-2015.
 */
myApp.service('AlaCarts', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
	
	service.GetAlacartData = function(data,success){
	    $http.post(service.baseRestUrl + '/getalacart', data).success(function (items) {
            success(items);
        });
    }
	
	service.AddEditAlacart = function(data,success){
	    $http.post(service.baseRestUrl + '/addeditalacart', data).success(function (items) {
            success(items);
        });
    }
    

    return service;
}]);