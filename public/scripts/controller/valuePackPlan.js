/**
 * Created by sujata.patne on 15-07-2015.
 */
myApp.controller('valuePackPlanCtrl', function ($scope, $http, ngProgress, $stateParams, Valuepacks) {

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

    // get valuepack data & jet pay id
    Valuepacks.GetValuepackData({ planid: $stateParams.id }, function (valuepacks) {
        $scope.AllJetPayEvents = angular.copy(valuepacks.JetEvents);
        $scope.AllOperatorDetails = angular.copy(valuepacks.OpeartorDetail);
        $scope.PlanData = angular.copy(valuepacks.PlanData);
        console.log(valuepacks);
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.svp_id;
            $scope.PlanName = value.svp_plan_name;
            $scope.Caption = value.svp_caption;
            $scope.Description = value.svp_description;
            $scope.SelectedEventId = value.svp_jed_id;
            $scope.setDownloadLimit = value.svp_download_limit;
            $scope.setDurationLimit = value.svp_duration_limit;
            $scope.SelectedDurationIn = value.svp_durration_type;
            $scope.displayOperators();
        });
    });

    // display operator on change of jet event id
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
            var valuepack = {
                planid: $stateParams.id,
                valuepackplanId: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                JetId: $scope.SelectedEventId,
                DowmloadLimit: $scope.setDownloadLimit,
                DurationLimit: $scope.setDurationLimit,
                DurationIn: $scope.SelectedDurationIn,
                OperatorDetails: $scope.OperatorDetails
            }
            ngProgress.start();
            Valuepacks.AddEditValuepack(valuepack, function (data) {
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

    $scope.durationOptions = [
        { cd_id: 'Hours', cd_name: 'Hours' },
        { cd_id: 'Days', cd_name: 'Days' },
    ]
});