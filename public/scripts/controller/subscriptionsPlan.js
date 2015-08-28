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
    $scope.getContentTypeData = Subscriptions.getContentTypeData(function (alacartData) {
        $scope.WallpaperPlan = alacartData.filter(function (alacart){
            return alacart.cd_name == "Wallpaper" && alacart.delivery_type_name == "Download";
        })
        $scope.VideoPlan  = alacartData.filter(function (alacart){
            return alacart.cd_name == "Video" && alacart.delivery_type_name == "Download";
        })
        $scope.VideoStreaming = alacartData.filter(function (alacart){
            return alacart.cd_name == "Video" && alacart.delivery_type_name == "Streaming";
        })
        $scope.AudioPlan = alacartData.filter(function (alacart){
            return alacart.cd_name == "Audio";
        })
        $scope.AudioStreaming = alacartData.filter(function (alacart){
            return alacart.cd_name == "Audio" && alacart.delivery_type_name == "Streaming";
        })
        $scope.GameAppPlan  = alacartData.filter(function (alacart){
            return alacart.cd_name == "Games & Apps" && alacart.delivery_type_name == "Download";
        })
        $scope.TextsPlan = alacartData.filter(function (alacart){
            return alacart.cd_name == "Texts" && alacartDaalacartta.delivery_type_name == "Download";
        })
        $scope.AnimationPlan = alacartData.filter(function (alacart){
            return alacart.cd_name == "Animation" && alacart.delivery_type_name == "Download";
        })
        $scope.RingTonePlan = alacartData.filter(function (alacart){
            return alacart.cd_name == "Ringtone" && alacart.delivery_type_name == "Download";
        })
    })

    // get subscription  & jet events 
    Subscriptions.GetSubscriptionData({ planid: $stateParams.id }, function (SubscriptionData) {

        $scope.distributionChannelList = angular.copy(SubscriptionData.DistributionChannel);
        $scope.AllJetPayEvents = angular.copy(SubscriptionData.JetEvents);
        $scope.AllOperatorDetails = angular.copy(SubscriptionData.OpeartorDetail);
        $scope.PlanData = angular.copy(SubscriptionData.PlanData);
        $scope.durationOptions = angular.copy(SubscriptionData.DurationOptions);
        $scope.GeoLocations = angular.copy(SubscriptionData.GeoLocations);
        $scope.ContentTypes = angular.copy(SubscriptionData.ContentTypes);

        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.sp_id;
            $scope.PlanName = value.sp_plan_name;
            $scope.Caption = value.sp_caption;
            $scope.Description = value.ss_description;
            $scope.SelectedEventId = value.sp_jed_id;
            $scope.offerForDays = value.sp_tnb_days;
            $scope.numContentOffer = value.sp_tnb_free_cnt_limit;
            $scope.limitSingleDay = value.ss_single_day_cnt_limit;
            $scope.fullSubDuration = value.sp_full_sub_cnt_limit;
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
            if ($scope.SelectedEventId == value.ebe_ef_id) {
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



    $scope.atCostFreePaid = 'paid';
    $scope.streamingLimitType = 1;
})