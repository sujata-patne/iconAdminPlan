/**
 * Created by sujata.patne on 24-07-2015.
 */
myApp.service('PlanList', ['$http', function ($http) {
    var service = {};
    service.baseRestUrl = 'http://localhost:3000';
    service.GetPlanList = function (success) {
        $http.get(service.baseRestUrl + '/planlist').success(function (items) {
            success(items);
        });
    }

    service.BlockUnBlockPlan = function (data, success) {
        $http.post(service.baseRestUrl + '/blockunblockplan', data).success(function (items) {
            success(items);
        });
    }

    service.DeletePlan = function (data, success) {
        $http.post(service.baseRestUrl + '/deleteplan', data).success(function (items) {
            success(items);
        });
    }

    service.ExportPlan = function (data, success) {
        $http.post(service.baseRestUrl + '/exportplan', data).success(function (items) {
            success(items);
        });
    }
    return service;
}]);