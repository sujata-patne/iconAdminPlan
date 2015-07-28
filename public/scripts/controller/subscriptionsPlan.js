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

    $scope.contentType = 'Subscription';

    // get subscription  & jet events 
    Subscriptions.GetSubscriptionData({ planid: $stateParams.id }, function (SubscriptionData) {
        $scope.AllJetPayEvents = angular.copy(SubscriptionData.JetEvents);
        $scope.AllOperatorDetails = angular.copy(SubscriptionData.OpeartorDetail);
        $scope.PlanData = angular.copy(SubscriptionData.PlanData);
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
            $scope.displayOperators();
        });
    });

    // operator display on change of jet event id
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
                OperatorDetails: $scope.OperatorDetails
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
})