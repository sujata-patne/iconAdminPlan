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
    $scope.selectedDistributionChannel = [];
    // get subscription  & jet events 
    Subscriptions.GetSubscriptionData({ planid: $stateParams.id }, function (SubscriptionData) {

        $scope.distributionChannelList = angular.copy(SubscriptionData.DistributionChannel);
        $scope.AllJetPayEvents = angular.copy(SubscriptionData.JetEvents);
        $scope.AllOperatorDetails = angular.copy(SubscriptionData.OpeartorDetail);
        $scope.PlanData = angular.copy(SubscriptionData.PlanData);
        $scope.durationOptions = angular.copy(SubscriptionData.DurationOptions);
        $scope.GeoLocations = angular.copy(SubscriptionData.GeoLocations);
        $scope.ContentTypes = angular.copy(SubscriptionData.ContentTypes);
        $scope.alacartData = angular.copy(SubscriptionData.ContentTypeData);

        $scope.WallpaperPlan = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Wallpaper" && alacart.delivery_type_name == "Download";
        })
        $scope.VideoPlan  = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Video" && alacart.delivery_type_name == "Download";
        })
        $scope.VideoStreaming = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Video" && alacart.delivery_type_name == "Streaming";
        })
        $scope.AudioPlan = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Audio";
        })
        $scope.AudioStreaming = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Audio" && alacart.delivery_type_name == "Streaming";
        })
        $scope.GameAppPlan  = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Games & Apps" && alacart.delivery_type_name == "Download";
        })
        $scope.TextsPlan = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Texts" && alacartDaalacartta.delivery_type_name == "Download";
        })
        $scope.AnimationPlan = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Animation" && alacart.delivery_type_name == "Download";
        })
        $scope.RingTonePlan = $scope.alacartData.filter(function (alacart){
            return alacart.cd_name == "Ringtone" && alacart.delivery_type_name == "Download";
        })
        SubscriptionData.selectedDistributionChannel.forEach(function(data){
            $scope.selectedDistributionChannel.push(data.cmd_entity_detail);
            $scope.distributionChannelArray[data.cmd_entity_detail] = true;
        })
console.log($scope.distributionChannelArray)
console.log($scope.selectedDistributionChannel)
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.sp_id;
            $scope.PlanName = value.sp_plan_name;
            $scope.Caption = value.sp_caption;
            $scope.Description = value.sp_description;
            $scope.SelectedEventId = value.sp_jed_id;
            $scope.offerForDays = value.sp_tnb_days;

            $scope.numContentOffer = value.sp_tnb_free_cnt_limit;
            $scope.limitSingleDay = value.sp_single_day_cnt_limit;
            $scope.fullSubDuration = value.sp_full_sub_cnt_limit;

            $scope.slc_tnb_free_cnt_limit = value.sp_tnb_stream_cnt_limit;
            $scope.slc_single_day_cnt_limit = value.sp_single_day_steam_limit;
            $scope.slc_full_sub_cnt_limit = value.sp_full_sub_stream_limit;

            $scope.sld_tnb_free_cnt_limit = value.sp_tnb_stream_duration;
            $scope.sld_tnb_free_cnt_duration = value.sp_tnb_stream_dur_type;
            $scope.sld_single_day_cnt_limit = value.sp_single_day_stream_dur;
            $scope.sld_single_day_cnt_duration = value.sp_single_day_stream_dur_type;
            $scope.sld_full_sub_cnt_limit = value.sp_full_sub_stream_duration;
            $scope.sld_full_sub_cnt_duration = value.sp_full_sub_stream_dur_type;
            $scope.streamingLimitType = value.sp_stream_setting;

             $scope.subscription_plan_Wallpaper = value.sp_wallpaper_alcrt_id;
             $scope.subscription_plan_Animation = value.sp_animation_alcrt_id;
             $scope.subscription_plan_RingTone = value.sp_ringtone_alcrt_id;
             $scope.subscription_plan_TextArtical = value.sp_text_alcrt_id;
             $scope.subscription_plan_GamesApps = value.sp_game_alcrt_id;
             $scope.subscription_plan_Video = value.sp_video_alcrt_id;
             $scope.subscription_plan_FullSong = value.sp_fullsong_alcrt_id;
             $scope.subscription_plan_stream_video = value.sp_video_alcrt_stream_id;
             $scope.subscription_plan_stream_songs = value.sp_fullsong_alcrt_stream_id;

            $scope.planDuration = value.sp_plan_duration;
            $scope.planDurationOption = value.sp_plan_dur_type;
            $scope.SelectedGeoLocation = value.sp_cty_id;

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

            var subscription = {
                planid: $stateParams.id,
                subplanId: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                JetId: $scope.SelectedEventId,
                offerForDays: $scope.offerForDays,
                numContentOffer: $scope.numContentOffer,
                limitSingleDay: $scope.limitSingleDay,
                fullSubDuration: $scope.fullSubDuration,
                slc_tnb_free_cnt_limit : $scope.slc_tnb_free_cnt_limit,
                slc_single_day_cnt_limit : $scope.slc_single_day_cnt_limit,
                slc_full_sub_cnt_limit : $scope.slc_full_sub_cnt_limit,

                sld_tnb_free_cnt_limit : $scope.sld_tnb_free_cnt_limit,
                sld_tnb_free_cnt_duration : $scope.sld_tnb_free_cnt_duration,
                sld_single_day_cnt_limit : $scope.sld_single_day_cnt_limit,
                sld_single_day_cnt_duration : $scope.sld_single_day_cnt_duration,
                sld_full_sub_cnt_limit : $scope.sld_full_sub_cnt_limit,
                sld_full_sub_cnt_duration : $scope.sld_full_sub_cnt_duration,
                streamingLimitType : $scope.streamingLimitType,
                OperatorDetails: $scope.OperatorDetails,
                DistributionChannelList: $scope.distributionChannelList,
                DistributionChannels: $scope.selectedDistributionChannel,
                geoLocationId : $scope.SelectedGeoLocation,

                subscription_plan_Wallpaper: $scope.subscription_plan_Wallpaper,
                subscription_plan_Animation: $scope.subscription_plan_Animation,
                subscription_plan_RingTone: $scope.subscription_plan_RingTone,
                subscription_plan_TextArtical: $scope.subscription_plan_TextArtical,
                subscription_plan_GamesApps: $scope.subscription_plan_GamesApps,
                subscription_plan_Video: $scope.subscription_plan_Video,
                subscription_plan_FullSong: $scope.subscription_plan_FullSong,
                subscription_plan_stream_video: $scope.subscription_plan_stream_video,
                subscription_plan_stream_songs: $scope.subscription_plan_stream_songs,
                planDuration: $scope.planDuration,
                planDurationOption: $scope.planDurationOption
            }
            console.log(subscription)
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