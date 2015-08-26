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
    $scope.isEdit = false;
    $scope.error = "";
    $scope.errorvisible = false;
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    $scope.selectedDistributionChannel = [];
    $scope.final_selectedDistributionChannel = [];

    $scope.changeChannels = function(){
        $scope.final_selectedDistributionChannel = [];
        for ( i in $scope.selectedDistributionChannel){
            if($scope.selectedDistributionChannel[i]){
                $scope.final_selectedDistributionChannel.push(parseInt(i));
            }
        }
    }

    // if id is given for edit purpose : 
         Offers.GetOfferData({ planid: $stateParams.id }, function (offer) {
                    $scope.DistributionChannels = offer.DistributionChannel; //Fetching distribution channels.
                    if($stateParams.id){
                        $scope.isEdit = true;
                        $scope.PlanId = offer.row[0].op_id;
                        $scope.PlanName = offer.row[0].op_plan_name;
                        $scope.Caption = offer.row[0].op_caption;
                        $scope.Description = offer.row[0].op_description;
                        $scope.Buyitems = offer.row[0].op_buy_item;
                        $scope.Getfreeitems = offer.row[0].op_free_item;
                        offer.selectedDistributionChannel.forEach(function(el){
                            $scope.selectedDistributionChannel[el.cmd_entity_detail] = true;
                        });
                    }
        });
   
    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function (isValid) {
        $scope.successvisible = false;
        $scope.errorvisible = false;
        if (isValid) {
            ngProgress.start();
            if($stateParams.id){
                $scope.changeChannels();
                 var offer = {
                        offerplanId: $scope.PlanId,
                        PlanName: $scope.PlanName,
                        Caption: $scope.Caption,
                        Description: $scope.Description,
                        Buyitems: $scope.Buyitems,
                        GetFreeItems: $scope.Getfreeitems,
                        DistributionChannels: $scope.final_selectedDistributionChannel
                  }
                 Offers.EditOffer(offer,function(data){
                    $scope.success = data.message;
                    $scope.successvisible = true;
                 });
                ngProgress.complete();
            }else{

                  var offer = {
                        PlanName: $scope.PlanName,
                        Caption: $scope.Caption,
                        Description: $scope.Description,
                        Buyitems: $scope.Buyitems,
                        GetFreeItems: $scope.Getfreeitems,
                        DistributionChannels: $scope.final_selectedDistributionChannel
                  }
                Offers.AddOffer(offer,function(data){
                    if(!data.success){
                        $scope.error = data.message;
                        $scope.errorvisible = true;
                    }else{
                        $scope.success = data.message;
                        $scope.successvisible = true;
                    }
                   
                 });
                 ngProgress.complete();
            }
        }
    };

});