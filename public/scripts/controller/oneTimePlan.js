/**
 * Created by sujata.patne on 15-07-2015.
 */
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('oneTimePlanCtrl', function ($scope, $http, ngProgress, AlaCarts) {
    $('.removeActiveClass').removeClass('active');
    $('#a-la-cart').addClass('active');
    $scope.ContentTypes = [];
    $scope.AllJetPayEvents = [];
    $scope.JetPayEvent = [];
    $scope.AllOperatorDetails = [];
    $scope.OperatorDetails = [];
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    AlaCarts.GetAlacartData(function (Alacarts) {
        console.log(Alacarts)
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OpeartorDetail);
    });

    $scope.ContentTypeChange = function () {
        $scope.JetPayEvent = [];
        $scope.AllJetPayEvents.forEach(function (value) {
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.JetPayEvent.push(value);
            }
        })
    }

    $scope.displayOperators = function () {
        $scope.OpeartorDetails = [];
        $scope.AllOperatorDetails.forEach(function (value) {
            if ($scope.SelectedEventId == value.opd_jed_id) {
                $scope.OpeartorDetails.push(value);
            }
        })
    }
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        if (isValid) {
            var Alacart = {
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                ContentType: $scope.SelectedContentType,
                JetId: $scope.SelectedEventId,
                OperatorDetails: $scope.OpeartorDetails
            };
            AlaCarts.AddAlacart(Alacart, function (data) {
                if (data.success) {
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
            });
        }
    };
});

//.state('edit-a-la-cart',{
//    templateUrl: 'partials/edit-a-la-cart-plan.html',
//    controller: 'editOneTimePlanCtrl',
//    url: '/edit-a-la-cart/:id'
//})
myApp.controller('editOneTimePlanCtrl', function ($scope, $http, $stateParams, ngProgress, AlaCarts) {
    
    $('.removeActiveClass').removeClass('active');
    $('#a-la-cart').addClass('active');
    $scope.ContentTypes = [];
    $scope.AllJetPayEvents = [];
    $scope.JetPayEvent = [];
    $scope.AllOperatorDetails = [];
    $scope.OperatorDetails = [];
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    AlaCarts.GetEditAlacartData({ planid: $stateParams.id },function (Alacarts) {
        console.log(Alacarts)
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OpeartorDetail);
    });

    $scope.ContentTypeChange = function () {
        $scope.JetPayEvent = [];
        $scope.AllJetPayEvents.forEach(function (value) {
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.JetPayEvent.push(value);
            }
        })
    }

    $scope.displayOperators = function () {
        $scope.OpeartorDetails = [];
        $scope.AllOperatorDetails.forEach(function (value) {
            if ($scope.SelectedEventId == value.opd_jed_id) {
                $scope.OpeartorDetails.push(value);
            }
        })
    }
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        if (isValid) {
            var Alacart = {
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                ContentType: $scope.SelectedContentType,
                JetId: $scope.SelectedEventId,
                OperatorDetails: $scope.OpeartorDetails
            };
            AlaCarts.AddAlacart(Alacart, function (data) {
                if (data.success) {
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
            });
        }
    };
});