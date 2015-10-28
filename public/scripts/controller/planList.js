/**
 * Created by sujata.patne on 15-07-2015.
 */

myApp.controller('planListCtrl', function ($scope, $http, ngProgress, PlanList, $window) {
    $('.removeActiveClass').removeClass('active');
    $('#plan-list').addClass('active');
    $scope.IsDisable = true;
    $scope.listcurrentPage = 0;
    $scope.listpageSize = 10;
    $scope.AllPlanList = [];
    $scope.PlanName = "";
    $scope.planList = [];
    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    // get contenttype
    $scope.getContentName = function (id) {
        var type = '';
        //console.log(id)

        $scope.ContentTypes.forEach(function (data) {
            if (data.cd_id == id) {
                type = data.cd_name;
            }
        });
        //console.log(type)
        return (type) ? type : '';
    }

    // block - unblock Plan
    $scope.BlockUnBlockPlan = function (id, contenttype) {
        $scope.AllPlanList.forEach(function (value) {
            if (value.planid == id && value.contenttype == contenttype) {
                var active = 1;
                if (value.active == 1) {
                    active = 0;
                }
                if (confirm("Are you want to sure " + (active == 0 ? 'block' : 'unblock') + ' this plan ?')) {
                    var plan = {
                        ContentType: value.contenttype,
                        active: active,
                        PlanId: value.planid,
                        Status: active == 0 ? 'blocked' : 'unblocked'
                    }
                    ngProgress.start();
                    PlanList.BlockUnBlockPlan(plan, function (data) {
                        if (data.success) {
                            value.active = active;
                            toastr.success( data.message);
                            $scope.successvisible = true;
                        }
                        else {
                            toastr.error(data.message);
                            $scope.errorvisible = true;
                        }
                        ngProgress.complete();
                    });
                }
            }
        });
    }

    //on edit click
    $scope.EditPlan = function (id, contenttype) {
        if (contenttype == "Subscription") {
            $window.location.href = "/#/edit-subscriptions/" + id;
        }
        else if (contenttype == "Value Pack") {
            $window.location.href = "/#/edit-value-pack/" + id;
        }
        else if (contenttype == "Offers") {
            $window.location.href = "/#/edit-offer-plan/" + id;
        }
        else {
            $window.location.href = "/#/edit-a-la-cart/" + id;
        }
    }

    //delete plan
    $scope.DeletePlan = function (id, contenttype) {
        if (confirm('Are you want to sure delete this plan ?')) {
            var plan = {
                ContentType: contenttype,
                PlanId: id,
            }
            ngProgress.start();
            PlanList.DeletePlan(plan, function (data) {
                if (data.success) {
                    toastr.success(data.message);
                    $scope.successvisible = true;
                    var Plans = [];
                    $scope.AllPlanList.forEach(function (value) {
                        if (value.planid == id && value.contenttype == contenttype) {
                        }
                        else {
                            Plans.push(value);
                        }
                    });
                    $scope.AllPlanList = Plans;
                    $scope.FilterContent();
                }
                else {
                    toastr.error(data.message);
                    $scope.errorvisible = true;

                }
                ngProgress.complete();
            });
        }
    }

    //Search click
    $scope.FilterContent = function () {
        var plans = [];
        $scope.AllPlanList.forEach(function (value) {
            if ($scope.SelectedContentType && $scope.SelectedContentType != null) {
                if ($scope.PlanName) {
                    if ((value.planname.indexOf($scope.PlanName) > -1) && value.contentid == $scope.SelectedContentType) {
                        plans.push(value);
                    }
                }
                else {
                    if (value.contentid == $scope.SelectedContentType) {
                        plans.push(value);
                    }
                }
            }
            else {
                if ($scope.PlanName) {
                    if (value.planname.indexOf($scope.PlanName) > -1) {
                        plans.push(value);
                    }
                }
                else {
                    plans.push(value);
                }
            }
        });
        $scope.planList = plans;
    }

    // get all plan 
    PlanList.GetPlanList(function (PlanList) {
        $scope.ContentTypes = angular.copy(PlanList.ContentTypes);
        //console.log( $scope.ContentTypes)
        $scope.ContentTypes.push({ cd_cm_id: 2, cd_desc: 0, cd_desc1: '', cd_display_name: "Subscription", cd_id: "Subscription", cd_name: "Subscription" });
        $scope.ContentTypes.push({ cd_cm_id: 2, cd_desc: 0, cd_desc1: '', cd_display_name: "Value Pack", cd_id: "Value Pack", cd_name: "Value Pack" });
        $scope.ContentTypes.push({ cd_cm_id: 2, cd_desc: 0, cd_desc1: '', cd_display_name: "Offers", cd_id: "Offers", cd_name: "Offers" });
        PlanList.Alacarts.forEach(function (value) {
            $scope.AllPlanList.push({ planid: value.ap_id, type: 'Alacart', planname: value.ap_plan_name, created_on: $scope.setDate(value.ap_created_on), active: value.ap_is_active, contenttype: $scope.getContentName(value.ap_content_type), contentid: value.ap_content_type });
        });
        PlanList.Subscriptions.forEach(function (value) {
            $scope.AllPlanList.push({ planid: value.sp_id, type: 'Subscriptions',  planname: value.sp_plan_name, created_on: $scope.setDate(value.sp_created_on), active: value.sp_is_active, contenttype: 'Subscription', contentid: 'Subscription' });
        });
        PlanList.ValuePacks.forEach(function (value) {
            $scope.AllPlanList.push({ planid: value.vp_id, type: 'ValuePacks',  planname: value.vp_plan_name, created_on: $scope.setDate(value.vp_created_on), active: value.vp_is_active, contenttype: "Value Pack", contentid: "Value Pack" });
        });
        PlanList.Offers.forEach(function (value) {
            $scope.AllPlanList.push({ planid: value.op_id, type: 'Offers',  planname: value.op_plan_name, created_on: $scope.setDate(value.op_created_on), active: value.op_is_active, contenttype: "Offers", contentid: "Offers" });
        });
        $scope.planList = $scope.AllPlanList;

    });

    //export plan 
    $scope.ExportPlan = function () {
        PlanList.ExportPlan({ PlanList: $scope.planList }, function (data) {
            var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
            window.saveAs(blob, 'PlanList.xlsx');
        });
    }

    //convert date formatdata);
    $scope.setDate = function (val) {
        var d = new Date(val);
        var date = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        var selectdate;
        switch (month) {
            case 1:
                selectdate = date + '-Jan-' + year;
                break;
            case 2:
                selectdate = date + '-Feb-' + year;
                break;
            case 3:
                selectdate = date + '-Mar-' + year;
                break;
            case 4:
                selectdate = date + '-Apr-' + year;
                break;
            case 5:
                selectdate = date + '-May-' + year;
                break;
            case 6:
                selectdate = date + '-Jun-' + year;
                break;
            case 7:
                selectdate = date + '-Jul-' + year;
                break;
            case 8:
                selectdate = date + '-Aug-' + year;
                break;
            case 9:
                selectdate = date + '-Sep-' + year;
                break;
            case 10:
                selectdate = date + '-Oct-' + year;
                break;
            case 11:
                selectdate = date + '-Nov-' + year;
                break;
            case 12:
                selectdate = date + '-Dec-' + year;
                break;

        }
        return selectdate;
    }

});

