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
    $scope.GeoLoction = [
        {cd_id:1,cd_name:'India',cd_cur:'INR'},
        {cd_id:2,cd_name:'US',cd_cur:'USD'},
        {cd_id:3,cd_name:'UK',cd_cur:'EUR'}
    ];
    // get alacart data & jetpay id
    AlaCarts.GetAlacartData({ planid: $stateParams.id }, function (Alacarts) {
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        //$scope.AllGeoLactions = angular.copy(Alacarts.GeoLocations);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OpeartorDetail);
        $scope.PlanData = angular.copy(Alacarts.PlanData);
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.sap_id;
            $scope.PlanName = value.sap_plan_name;
            $scope.Caption = value.sap_caption;
            $scope.Description = value.sap_description;
            $scope.SelectedContentType = value.sap_content_type;
            $scope.SelectedEventId = value.sap_jed_id;
            $scope.SelectedDeliveryType = value.delivery_type || 2;
            $scope.ContentTypeChange();
            $scope.displayOperators();
        });

    });

    //change jetpayid,geoLocation,deliveryType on change of content type
    $scope.ContentTypeChange = function () {
        $scope.JetPayEvent = [];
        $scope.AllJetPayEvents.forEach(function (value) {
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.JetPayEvent.push(value);
            }
        });
        /*This will be implemented for future chnages.*/
        /*$scope.GeoLoction = [];
        $scope.AllGeoLactions.forEach(function (value){
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.GeoLoction.push(value);
            }
        })*/
        if($scope.SelectedContentType == 9 || $scope.SelectedContentType == 10){
            $scope.deliveryType = [
                {cd_id:1,cd_name:'Download'},
                {cd_id:2,cd_name:'Streaming'}
            ];
        }else{
            $scope.deliveryType = [
                {cd_id:1,cd_name:'Download'}
            ];
        }
    }

    $scope.geoLocationChange = function(){
        var currency = '';
        $scope.GeoLoction.forEach(function (value) {
            if ($scope.SelectedGeoLocation == value.cd_id) {
                currency = value.cd_cur;
            }
        });
        $scope.selectedCurrency = currency;
    }
    // Distribution Channel
    $scope.distributionChannelList = ['Web', 'Mobile Web', 'App', 'TV'];

    // selected Distribution Channel
    $scope.selectedDistributionChannel = [];

    // toggle selection for a given distributionChannel by name
    $scope.toggleDistributionChannelSelection = function toggleSelection(distributionChannel) {
        var idx = $scope.selectedDistributionChannel.indexOf(distributionChannel);
        // is currently selected
        if (idx > -1) {
            $scope.selectedDistributionChannel.splice(idx, 1);
        }
        // is newly selected
        else {
            $scope.selectedDistributionChannel.push(distributionChannel);
        }
    };

    $scope.durationOptions = [
        { cd_id: 'Min', cd_name: 'Min' },
        { cd_id: 'Hours', cd_name: 'Hours' },
        { cd_id: 'Days', cd_name: 'Days' },
        { cd_id: 'Week', cd_name: 'Week' },
        { cd_id: 'Month', cd_name: 'Month' },
        { cd_id: 'Year', cd_name: 'Year' }
    ];
    $scope.deliveryTypeChange = function(){
        if($scope.SelectedDeliveryType == 2){
            $scope.streamingSetting = true;
        }else{
            $scope.streamingSetting = false;
        }
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
        $scope.errorvisible = false;
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