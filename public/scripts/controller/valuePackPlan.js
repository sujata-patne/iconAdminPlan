/**
 * Created by sujata.patne on 15-07-2015.
 */
myApp.controller('valuePackPlanCtrl', function ($scope, $state, ngProgress, $stateParams, Valuepacks) {
    $('.removeActiveClass').removeClass('active');
    $('#value-pack').addClass('active');
    $scope.contentType = 'Value Pack';
    $scope.PlanId = "";
    $scope.AllJetPayEvents = [];
    $scope.AllOperatorDetails = [];
    $scope.OperatorDetails = [];
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.isCheckboxSelected = "";
    //$scope.SelectedStreamType = 1;
    $scope.setDurationLimit = 1;
    $scope.CurrentPage = $state.current.name;
    $scope.PageTitle = $state.current.name == "edit-value-pack" ? "Edit " : "Add ";

    // get valuepack data & jet pay id
    Valuepacks.GetValuepackData({ planid: $stateParams.id }, function (valuepacks) {
        $scope.StoreId = angular.copy(valuepacks.StoreId);

        //$scope.AllJetPayEvents = angular.copy(valuepacks.JetEvents);
        $scope.AllOperatorDetails = angular.copy(valuepacks.OperatorDetail);
        $scope.durationOptions = angular.copy(valuepacks.DurationOptions);
        $scope.getJetPayDetailsByStoreId($scope.StoreId); //{Store: $scope.StoreId}
        $scope.durationOptions.forEach(function(option){
            if(option.cd_name === 'Months'){
                $scope.selectedDurationOptions = option.cd_id;
            }
        })
        $scope.PlanData = angular.copy(valuepacks.PlanData);
        $scope.GeoLocations = angular.copy(valuepacks.GeoLocations);
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.vp_id;
            $scope.PlanName = value.vp_plan_name;
            $scope.Caption = value.vp_caption;
            $scope.Description = value.vp_description;
            $scope.SelectedEventId = value.vp_jed_id;
            $scope.setDownloadLimit = value.vp_download_limit;
            $scope.setDurationLimit = value.vp_duration_limit;
            $scope.streamDurationOptions = value.vp_stream_dur_type;
            $scope.SelectedStreamType = value.vp_stream_setting;
            $scope.SelectedGeoLocation = value.vp_cty_id;
            $scope.numberOfContent = value.vp_stream_limit;
            $scope.streamingDurationLimit = value.vp_stream_duration;
            $scope.selectedDurationOptions = value.vp_duration_type;            ;
            //  $scope.displayJetEvents();
            //  $scope.displayOperators();
        });
    });

    $scope.getJetPayDetailsByStoreId = function(storeId){
        Valuepacks.getJetPayDetailsByStoreId(storeId, function (jetPayDetials){
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

    $scope.$watch(function(){
        return $scope.numberOfContent = ($scope.SelectedStreamType == 2) ? '': $scope.numberOfContent;
    }, function(newvalue, oldvalue){},true);

    $scope.$watch(function(){
        return $scope.streamingDurationLimit = ($scope.SelectedStreamType == 1) ? '': $scope.streamingDurationLimit;
    }, function(newvalue, oldvalue){},true);

    $scope.$watch(function(){
        return $scope.streamDurationOptions = ($scope.SelectedStreamType == 1) ? '': $scope.streamDurationOptions;
    }, function(newvalue, oldvalue){},true);

    $scope.isNumber = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if( (isNaN(String.fromCharCode(key)) && key !=8 )||key == 32) e.preventDefault();
    }
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
    /*$scope.geoLocationChange = function () {
     var currency = '';
     $scope.GeoLoction.forEach(function (value) {
     if ($scope.SelectedGeoLocation == value.cd_id) {
     currency = value.cd_cur;
     }
     });
     $scope.selectedCurrency = currency;
     }*/
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
    // display operator on change of jet event id
    /*$scope.displayOperators = function () {
     $scope.OperatorDetails = [];
     $scope.AllOperatorDetails.forEach(function (value) {
     if ($scope.SelectedEventId == value.ebe_ef_id ) { //&& $scope.SelectedGeoLocation == value.country
     $scope.OperatorDetails.push(value);
     }
     })
     //console.log($scope.OperatorDetails)
     }
     $scope.displayJetEvents = function () {
     $scope.JetPayEvent = [];
     $scope.AllJetPayEvents.forEach(function (value) {
     //console.log($scope.SelectedContentType +' : '+ value.contentType)
     if ($scope.SelectedGeoLocation == value.country  ) {
     $scope.JetPayEvent.push(value);
     }
     })
     //console.log($scope.JetPayEvent)
     }*/
    $scope.resetForm = function () {
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            var valuepack = {
                planid: $stateParams.id,
                valuepackplanId: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                JetId: $scope.SelectedEventId,
                DowmloadLimit: $scope.setDownloadLimit || null,
                DurationLimit: $scope.setDurationLimit || null,
                StreamType: $scope.SelectedStreamType || null,
                CountryId: $scope.SelectedGeoLocation,
                OperatorDetails: $scope.OperatorDetails,
                NoOfStreamContent: $scope.numberOfContent || null,
                StreamDuration: $scope.streamingDurationLimit || null,
                DurationOptions: $scope.selectedDurationOptions || null,
                StreamDurationOptions: $scope.streamDurationOptions || null
            }
            //console.log(valuepack)
            ngProgress.start();
            Valuepacks.AddEditValuepack(valuepack, function (data) {
                if (data.success) {
                    if ($scope.CurrentPage == "edit-value-pack") {
                        $state.go('value-pack'); //"#subscriptions";
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
            });
        }
    };
});