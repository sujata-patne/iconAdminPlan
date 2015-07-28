/**
 * Created by sujata.patne on 15-07-2015.
 */

myApp.controller('oneTimePlanCtrl', function ($scope, $http, $stateParams, ngProgress, AlaCarts) {

    $('.removeActiveClass').removeClass('active');
    $('#a-la-cart').addClass('active');
    $scope.PlanId = "";
    $scope.ContentTypes = [];
    $scope.PlanData = [];
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

    // get alacart data & jetpay id
    AlaCarts.GetAlacartData({ planid: $stateParams.id }, function (Alacarts) {
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OpeartorDetail);
        $scope.PlanData = angular.copy(Alacarts.PlanData);
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.sap_id;
            $scope.PlanName = value.sap_plan_name;
            $scope.Caption = value.sap_caption;
            $scope.Description = value.sap_description;
            $scope.SelectedContentType = value.sap_content_type;
            $scope.SelectedEventId = value.sap_jed_id;
            $scope.ContentTypeChange();
            $scope.displayOperators();
        });

    });

    //change jetpayid on change of content type
    $scope.ContentTypeChange = function () {
        $scope.JetPayEvent = [];
        $scope.AllJetPayEvents.forEach(function (value) {
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.JetPayEvent.push(value);
            }
        })
    }

    // display operator on change of jet pay id 
    $scope.displayOperators = function () {
        $scope.OperatorDetails = [];
        $scope.AllOperatorDetails.forEach(function (value) {
            if ($scope.SelectedEventId == value.opd_jed_id) {
                $scope.OperatorDetails.push(value);
            }
        })
    }
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible == false;
        if (isValid) {
            var Alacart = {
                planid: $stateParams.id,
                alacartplanid: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                ContentType: $scope.SelectedContentType,
                JetId: $scope.SelectedEventId,
                OperatorDetails: $scope.OperatorDetails
            };
            ngProgress.start();
            AlaCarts.AddEditAlacart(Alacart, function (data) {
                if (data.success) {
                    $scope.success = data.message;
                    $scope.successvisible = true;
                }
                else {
                    $scope.error = data.message;
                    $scope.errorvisible = true;
                }
                ngProgress.complete();
            });
        }
    };
});