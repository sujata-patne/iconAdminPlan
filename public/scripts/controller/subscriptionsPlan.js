/**
 * Created by sujata.patne on 15-07-2015.
 */
myApp.controller('subscriptionsPlanCtrl', function ($scope, $http, ngProgress, $stateParams, Subscriptions) {
    $('.removeActiveClass').removeClass('active');
    $('#subscriptions').addClass('active');
    $scope.PlanId = "";
    $scope.AllJetPayEvents = [];
    $scope.AllOperatorDetails = [];
    $scope.PlanData = [];
    $scope.OperatorDetails = [];
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');
    $scope.distributionChannelArray = [];
    $scope.contentType = 'Subscription';

    // get subscription  & jet events 
    Subscriptions.GetSubscriptionData({ planid: $stateParams.id }, function (SubscriptionData) {
        $scope.distributionChannelList = angular.copy(SubscriptionData.DistributionChannel);
        $scope.AllJetPayEvents = angular.copy(SubscriptionData.JetEvents);
        $scope.AllOperatorDetails = angular.copy(SubscriptionData.OpeartorDetail);
        $scope.PlanData = angular.copy(SubscriptionData.PlanData);
        $scope.durationOptions = angular.copy(SubscriptionData.DurationOptions);
        $scope.GeoLocations = angular.copy(SubscriptionData.GeoLocations);
        $scope.WallpaperPlan = [
            {cd_id:1,cd_name:'Single WP @ 4 INR'},
            {cd_id:2,cd_name:'Single WP @ 5 INR'},
            {cd_id:3,cd_name:'Single WP @ 8 INR'}
        ];
        $scope.AnimationPlan = [
            {cd_id:1,cd_name:'Single Ani @ 4 INR'},
            {cd_id:2,cd_name:'Single Ani @ 6 INR'},
            {cd_id:3,cd_name:'Single Ani @ 8 INR'}
        ];
        $scope.RingTonePlan = [
            {cd_id:1,cd_name:'Single RT @ 4 INR'},
            {cd_id:2,cd_name:'Single RT @ 5 INR'},
            {cd_id:3,cd_name:'Single RT @ 8 INR'}
        ];
        $scope.TextArticalPlan = [
            {cd_id:1,cd_name:'Single TA @ 4 INR'},
            {cd_id:2,cd_name:'Single TA @ 6 INR'},
            {cd_id:3,cd_name:'Single TA @ 8 INR'}
        ];
        $scope.GameAppPlan = [
            {cd_id:1,cd_name:'Single GA @ 4 INR'},
            {cd_id:2,cd_name:'Single GA @ 6 INR'},
            {cd_id:3,cd_name:'Single GA @ 8 INR'}
        ];
        $scope.VideoPlan = [
            {cd_id:1,cd_name:'Single Vid @ 4 INR'},
            {cd_id:2,cd_name:'Single Vid @ 6 INR'},
            {cd_id:3,cd_name:'Single Vid @ 8 INR'}
        ];
        $scope.SongsPlan = [
            {cd_id:1,cd_name:'Single FS @ 4 INR'},
            {cd_id:2,cd_name:'Single FS @ 6 INR'},
            {cd_id:3,cd_name:'Single FS @ 8 INR'}
        ];

        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.ssp_id;
            $scope.PlanName = value.ssp_plan_name;
            $scope.Caption = value.ssp_caption;
            $scope.Description = value.ssp_description;
            $scope.SelectedEventId = value.ssp_jed_id;
            $scope.offerForDays = value.ssp_tnb_days;
            $scope.numContentOffer = value.ssp_tnb_free_cnt_limit;
            $scope.limitSingleDay = value.ssp_single_day_cnt_limit;
            $scope.fullSubDuration = value.ssp_full_sub_cnt_limit;
            SubscriptionData.selectedDistributionChannel.forEach(function(data){
                $scope.selectedDistributionChannel.push(data.cmd_entity_detail);
                $scope.distributionChannelArray[data.cmd_entity_detail] = true;
            })
            $scope.displayOperators();
        });
    });

    $scope.stateChanged = function (id) {
        if($scope.distributionChannelArray[id] === true){
            $scope.selectedDistributionChannel.push(id);
        }
        if($scope.distributionChannelArray[id] === false){
            var idx = $scope.selectedDistributionChannel.indexOf($scope.distributionChannelArray[id]);
            $scope.selectedDistributionChannel.splice(idx, 1);
        }
    };
    // operator display on change of jet event id
    $scope.displayOperators = function () {
        $scope.OperatorDetails = [];
        $scope.AllOperatorDetails.forEach(function (value) {
            if ($scope.SelectedEventId == value.opd_jed_id) {
                $scope.OperatorDetails.push(value);
            }
        })
    }
    $scope.displayOperators = function () {
        $scope.OperatorDetails = [];
        $scope.AllOperatorDetails.forEach(function (value) {
            if ($scope.SelectedEventId == value.bta_ef_id) {
                $scope.OperatorDetails.push(value);
            }
        })
        console.log($scope.OperatorDetails)
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
            $scope.distributionChannelList.forEach(function (val) {
                if (val.isactive == true) {
                    $scope.selectedDistributionChannel.push(val.cd_id);
                }
            });
            var subscription = {
                planid: $stateParams.id,
                subplanId: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                JetId: $scope.SelectedEventId,
                TryandBuyOffer: $scope.offerForDays,
                LimitTBOffer: $scope.numContentOffer,
                LimitSingleday: $scope.limitSingleDay,
                TotalDuration: $scope.fullSubDuration,
                OperatorDetails: $scope.OperatorDetails,
                DistributionChannels: $scope.selectedDistributionChannel
            }
            ngProgress.start();
            Subscriptions.AddEditSubscription(subscription, function (data) {
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

    /*$scope.geoLocationChange = function(){
        var currency = '';
        $scope.GeoLoction.forEach(function (value) {
            if ($scope.SelectedGeoLocation == value.cd_id) {
                currency = value.cd_cur;
            }
        });
        $scope.selectedCurrency = currency;
    }*/

    /*// toggle selection for a given distributionChannel by name
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
    };*/
    $scope.atCostFreePaid = 'paid';
    $scope.streamingLimitType = 1;
})