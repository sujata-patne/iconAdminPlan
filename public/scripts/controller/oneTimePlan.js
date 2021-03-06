/**
 * Created by sujata.patne on 15-07-2015.
 */
myApp.controller('oneTimePlanCtrl', function ($scope,$state,$window, $http, $stateParams, ngProgress, AlaCarts) {

    $('.removeActiveClass').removeClass('active');
    $('#a-la-cart').addClass('active');
    $scope.CurrentPage = $state.current.name;
    $scope.PageTitle = $state.current.name == "edit-a-la-cart" ? "Edit " : "Add ";

    $scope.PlanId = "";
    $scope.ContentTypes = [];
    $scope.PlanData = [];
    $scope.AllJetPayEvents = [];

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

    AlaCarts.GetAlacartData({ planid: $stateParams.id }, function (Alacarts) {
        $scope.StoreId = angular.copy(Alacarts.StoreId);

        $scope.distributionChannelList = angular.copy(Alacarts.DistributionChannel);
        $scope.ContentTypes = angular.copy(Alacarts.ContentTypes);
        $scope.GeoLocations = angular.copy(Alacarts.GeoLocations);
        console.log($scope.GeoLocations)
        //$scope.AllJetPayEvents = angular.copy(Alacarts.JetEvents);
        $scope.durationOptions = angular.copy(Alacarts.DurationOptions);
        $scope.AllOperatorDetails = angular.copy(Alacarts.OperatorDetail);
        $scope.PlanData = angular.copy(Alacarts.PlanData);
        $scope.AllDeliveryType = angular.copy(Alacarts.DeliveryTypes);
        Alacarts.selectedDistributionChannel.forEach(function(data){
            $scope.selectedDistributionChannel.push(data.cmd_entity_detail);
            $scope.distributionChannelArray[data.cmd_entity_detail] = true;
        })

        $scope.getJetPayDetailsByStoreId($scope.StoreId);

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
            $scope.streamNoOfContentLimit =  value.ap_no_of_stream || null;
            $scope.streamDurationLimit = value.ap_stream_duration || null;
            $scope.SelectedDurationType = value.ap_stream_dur_type;
            $scope.streamingLimitType = value.ap_stream_setting;

            $scope.ContentTypeChange();
            // $scope.displayJetEvents();
            // $scope.displayOperators();
            $scope.deliveryTypeChange();
        });

    });

    //change jetpayid,geoLocation,deliveryType on change of content type
    $scope.ContentTypeChange = function () {
        var contentTypeData = '';
        $scope.ContentTypes.forEach(function(type) {
            if($scope.SelectedContentType == type.cd_id){
                contentTypeData = type;
            }
        })
        if( $scope.SelectedContentType == contentTypeData.cd_id && (contentTypeData.parent_name == 'Audio' || contentTypeData.parent_name == 'Video')){
            $scope.deliveryType = $scope.AllDeliveryType;
        }else{
            $scope.deliveryType = $scope.AllDeliveryType.filter(function (type){
                return type.cd_name == "Download";
            })
        }
    }

    $scope.deliveryTypeChange = function(){
        $scope.deliveryType.forEach(function(type) {
            if( $scope.SelectedDeliveryType == type.cd_id && type.cd_name == "Download"){
                $scope.streamingSetting = false;
            }else{
                $scope.streamingSetting = true;
            }
        })
    }
    $scope.streamingLimitTypeChange = function(){
        if($scope.streamingLimitType == 2){
            $scope.streamDurationLimit = '';
            $scope.durationOptions = '';
        }else{
            $scope.streamNoOfContentLimit = '';
        }
    }
    $scope.$watch('SelectedEventId',function() {
        $scope.getOperatorDetails();
    })
    $scope.$watch('SelectedGeoLocation',function() {
        $scope.JetPayEvent = [];
        if ($scope.jetPayDetials && $scope.jetPayDetials.length > 0) {
            $scope.jetPayDetials.forEach(function (value) {
                if (value.country != null && $scope.SelectedGeoLocation == value.country) {
                    $scope.JetPayEvent.push(value);
                }
            })
        }
    })


    // display operator on change of jet pay id
    /*$scope.displayOperators = function () {
     $scope.OperatorDetails = [];
     $scope.AllOperatorDetails.forEach(function (value) {
     if ($scope.SelectedEventId == value.ebe_ef_id ) { //&& $scope.SelectedGeoLocation == value.country
     $scope.OperatorDetails.push(value);
     }
     })
     }*/

    /*$scope.displayJetEvents = function () {
     $scope.JetPayEvent = [];
     $scope.AllJetPayEvents.forEach(function (value) {
     if ($scope.SelectedGeoLocation == value.country  ) {
     $scope.JetPayEvent.push(value);
     }
     })
     }*/
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    $scope.stateChanged = function (id) {
        if($scope.distributionChannelArray[id] === true){
            $scope.selectedDistributionChannel.push(id);
        }
        if($scope.distributionChannelArray[id] !== true){
            var idx = $scope.selectedDistributionChannel.indexOf(id);
            $scope.selectedDistributionChannel.splice(idx, 1);
        }
    };

    $scope.$watch(function(){
        return $scope.streamNoOfContentLimit = ($scope.streamingLimitType == 2) ? '': $scope.streamNoOfContentLimit;
    }, function(newvalue, oldvalue){},true);

    $scope.$watch(function(){
        return $scope.streamDurationLimit = ($scope.streamingLimitType == 1) ? '': $scope.streamDurationLimit;
    }, function(newvalue, oldvalue){},true);

    $scope.$watch(function(){
        return $scope.SelectedDurationType = ($scope.streamingLimitType == 1) ? '': $scope.SelectedDurationType;
    }, function(newvalue, oldvalue){},true);

    $scope.getOperatorDetails = function(){
        $scope.OperatorDetails = [];
        if ($scope.jetPayDetials && $scope.jetPayDetials.length > 0) {
            $scope.jetPayDetials.forEach(function (value) {
                if ($scope.SelectedEventId == value.ebe_ai_bgw_id) { //ebe_ef_id&& $scope.SelectedGeoLocation == value.country
                    //_.filter($scope.AllOperatorDetails, function (operator) {
                    $scope.AllOperatorDetails.forEach(function (operator) {
                        if(value.ebe_ai_bgw_id == operator.dcl_ref_jed_id && value.partner_name == operator.dcl_partner_id){
                            //ebe_ef_id  //if(value.ebe_ai_bgw_id == operator.dcl_ref_jed_id){ //ebe_ef_id
                            value.dcl_disclaimer = operator.dcl_disclaimer;
                        }
                    })
                    $scope.OperatorDetails.push(value);
                }
            })
        }
    }
    $scope.getJetPayDetailsByStoreId = function(storeId){
        AlaCarts.getJetPayDetailsByStoreId(storeId, function (jetPayDetials){
            $scope.jetPayDetials = angular.copy(jetPayDetials);
            $scope.JetPayEvent = [];
            if ($scope.jetPayDetials && $scope.jetPayDetials.length > 0) {

                $scope.jetPayDetials.forEach(function (value) {
                    if (value.country != null && $scope.SelectedGeoLocation == value.country) {
                        $scope.JetPayEvent.push(value);
                    }
                })
            }
            $scope.getOperatorDetails();
        })
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
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
            DistributionChannelList: $scope.distributionChannelList,
            DistributionChannels: $scope.selectedDistributionChannel,
            NoOfStream: $scope.streamNoOfContentLimit || null,
            StreamDuration: $scope.streamDurationLimit || null,
            StreamDurationType: $scope.SelectedDurationType || null,
            CountryId: $scope.SelectedGeoLocation,
            StreamSetting: $scope.streamingLimitType || null
        };

        if (isValid) {
            ngProgress.start();
            AlaCarts.AddEditAlacart(Alacart, function (data) {
                    if (data.success) {
                        if ($scope.CurrentPage == "edit-a-la-cart") {
                            $state.go('a-la-cart');// = "#a-la-cart";
                        }else{
                            $state.reload();
                        }
                        toastr.success(data.message)
                        //$scope.success = data.message;
                        $scope.successvisible = true;
                    }
                    else {
                        toastr.error(data.message)
                        //$scope.error = data.message;
                        $scope.errorvisible = true;
                    }
                    ngProgress.complete();
                },
                function (error) {
                    $scope.error = error;
                    $scope.errorvisible = true;
                    ngProgress.complete();
                });
        }
    };
});