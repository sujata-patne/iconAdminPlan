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
    $scope.selectedDistributionChannel = [];
    $scope.distributionChannelArray = [];
    // get alacart data & jetpay id
    AlaCarts.GetAlacartData({ planid: $stateParams.id }, function (Alacarts) {
        console.log(Alacarts)
        //console.log(Alacarts.DistributionChannel)
        $scope.distributionChannelList = angular.copy(Alacarts.DistributionChannel);
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.GeoLocations = angular.copy(Alacarts.GeoLocations);
        $scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        $scope.durationOptions = angular.copy(Alacarts.DurationOptions);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OpeartorDetails);
        $scope.PlanData = angular.copy(Alacarts.PlanData);
        Alacarts.selectedDistributionChannel.forEach(function(data){
            $scope.selectedDistributionChannel.push(data.cmd_entity_detail);
            $scope.distributionChannelArray[data.cmd_entity_detail] = true;
        })
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.ap_id;
            $scope.PlanName = value.ap_plan_name;
            $scope.Caption = value.ap_caption;
            $scope.Description = value.ap_description;
            $scope.SelectedContentType = value.ap_content_type;
            $scope.SelectedEventId = value.ap_jed_id;
            $scope.SelectedDeliveryType = value.ap_delivery_type || 2;
            $scope.SelectedDurationIn = value.ap_stream_dur_type || 'Min';
            $scope.SelectedGeoLocation = value.ap_cty_id;

            $scope.ContentTypeChange();
            $scope.displayOperators();
        });

    });

    //change jetpayid,geoLocation,deliveryType on change of content type
    $scope.ContentTypeChange = function () {
        /*$scope.JetPayEvent = [];
        $scope.AllJetPayEvents.forEach(function (value) {
            if (value.jed_content_type == $scope.SelectedContentType) {
                $scope.JetPayEvent.push(value);
            }
        });*/
        /*This will be implemented for future changes.*/
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
            $scope.streamingLimitType = 1;
        }else{
            $scope.deliveryType = [
                {cd_id:1,cd_name:'Download'}
            ];

        }
    }

    /*$scope.geoLocationChange = function(){
        var currency = '';
        $scope.GeoLoction.forEach(function (value) {
            if ($scope.SelectedGeoLocation == value.cd_id) {
                currency = value.cd_cur;
            }
        });
        $scope.selectedCurrency = currency;
    }*/

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
            if ($scope.SelectedEventId == value.dcl_ref_jed_id) {
                $scope.OperatorDetails.push(value);
            }
        })
    }
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    $scope.stateChanged = function (id) {
        if($scope.distributionChannelArray[id] === true){
            $scope.selectedDistributionChannel.push(id);
        }
        if($scope.distributionChannelArray[id] === false){
            var idx = $scope.selectedDistributionChannel.indexOf($scope.distributionChannelArray[id]);
            $scope.selectedDistributionChannel.splice(idx, 1);
        }
        console.log($scope.selectedDistributionChannel)
    };

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        console.log(isValid)
        $scope.successvisible = false;
        $scope.errorvisible = false;
        var Alacart = {
            planid: $stateParams.id,
            alacartplanid: $scope.PlanId,
            PlanName: $scope.PlanName,
            DeliveryType: $scope.SelectedDeliveryType,
            Caption: $scope.Caption,
            Description: $scope.Description,
            ContentType: $scope.SelectedContentType,
            JetId: $scope.SelectedEventId,
            OperatorDetails: $scope.OperatorDetails,
            DistributionChannels: $scope.selectedDistributionChannel,
            NoOfStream: $scope.streamNoOfContentLimit,
            StreamDuration: $scope.streamDurationLimit,
            StreamDurationType: $scope.SelectedDurationType,
            CountryId: $scope.SelectedGeoLocation,
            StreamSetting: $scope.streamingLimitType
        };
        //console.log(Alacart)
        if (isValid) {
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