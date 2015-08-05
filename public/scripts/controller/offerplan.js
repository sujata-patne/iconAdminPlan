/**
* Created by sujata.patne on 15-07-2015.
*/
myApp.controller('offerPlanCtrl', function ($scope, $http, ngProgress, $stateParams, Offers) {

     

    $('.removeActiveClass').removeClass('active');
    $('#offer-plan').addClass('active');
    $scope.contentType = 'Offer Plan';
    $scope.PlanId = "";
    $scope.success = "";
    $scope.successvisible = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    function GetDistributionChannel(Distribution) {
        var DataArray = [];
        Distribution.forEach(function (value) {
            DataArray.push({ cd_id: value.cd_id, cd_name: value.cd_name, isactive: false });
        });
        console.log(DataArray);
        return Distribution;
    }

    // get valuepack data & jet pay id
    Offers.GetOfferData({ planid: $stateParams.id }, function (offer) {
        $scope.DistributionChannels = GetDistributionChannel(angular.copy(offer.DistributionChannel));
        $scope.PlanData = [];
        $scope.PlanData.forEach(function (value) {
            $scope.PlanId = value.svp_id;
            $scope.PlanName = value.svp_plan_name;
            $scope.Caption = value.svp_caption;
            $scope.Description = value.svp_description;
            $scope.Buyitems = 1;
            $scope.Getfreeitems = 2;
            $scope.SelectedChannel = [12, 13];
        });
    });


    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            var SelectedChannel = [];
            $scope.DistributionChannels.forEach(function (val) {
                if (val.isactive == true) {
                    SelectedChannel.push(val.cd_id);
                }
            });
            var offer = {
                planid: $stateParams.id,
                offerplanId: $scope.PlanId,
                PlanName: $scope.PlanName,
                Caption: $scope.Caption,
                Description: $scope.Description,
                Buyitems: $scope.Buyitems,
                GetFreeItems: $scope.Getfreeitems,
                DistributionChannels: SelectedChannel
            }
            console.log(offer);
            //ngProgress.start();
            //Valuepacks.AddEditValuepack(valuepack, function (data) {
            //    if (data.success) {
            //        $scope.success = data.message;
            //        $scope.successvisible = true;
            //    }
            //    else {
            //        $scope.error = data.message;
            //        $scope.errorvisible = true;
            //    }
            //    ngProgress.complete();
            //});
        }
    };

    $scope.durationOptions = [
        { cd_id: 'Hours', cd_name: 'Hours' },
        { cd_id: 'Days', cd_name: 'Days' },
    ]
});