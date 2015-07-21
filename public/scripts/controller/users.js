/**
 * Created by sujata.patne on 13-07-2015.
 */
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('usersCtrl', function ($scope, $http, ngProgress, $timeout, Users) {
    $scope.base_url = site_base_path;
    $('.removeActiveClass').removeClass('active');
    $('.removeSubactiveClass').removeClass('active');
    $('#addedituser').addClass('active');

    $scope.Permission = true;
    $scope.IsDisable = true;
    $scope.Vendor = [];
    $scope.Users = [];
    $scope.UserRole = [];
    $scope.SelectedUserRole = 0;
    $scope.UserList = [];
    $scope.SaveUserData = false;

    $scope.usercurrentPage = 0;
    $scope.userpageSize = 5;

    $scope.connectionError = false;
    $scope.error;

    ngProgress.color('yellowgreen');
    ngProgress.height('3px');

    //$scope.editable = false;
    //
    //$scope.FullName = "";
    //$scope.UserName = "";
    //$scope.EmailId = "";
    //$scope.MobileNo = "";
    //$scope.SelectedVendorList = [];
    //$scope.Id = "";
    //
    //$scope.NameValidation = false;
    //$scope.UserNameValidation = false;
    //$scope.EmailValidation = false;
    //$scope.MobileValidation = false;
    //$scope.RoleValidationVisible = false;
    //$scope.VendorValidation = false;
    //
    //if ($scope.Permission == true) {
    //    $scope.IsDisable = false;
    //}
    //else {
    //    $scope.IsDisable = true;
    //}

    Users.getUsers(function (users) {
        $scope.UserList = angular.copy(users.UserData);
        $scope.UserRole = angular.copy(users.UserRole);
        console.log($scope.UserList);
    });
    var data = {
        FullName: $scope.FullName,
        UserName: $scope.UserName,
        EmailId: $scope.EmailId,
        MobileNo: $scope.MobileNo,
        Role: $scope.SelectedUserRole,
        ld_Id: $scope.userID
    }

    $scope.addEditUsers = function(id){
        Users.addEditUsers({ld_id:id},function (user) {
            if (user.RoleUser === "Super Admin") {
                $scope.UserRole = angular.copy(user.UserRole);

                $scope.FullName = user.UserData[0].ld_display_name;
                $scope.UserName = user.UserData[0].ld_user_name;
                $scope.EmailId = user.UserData[0].ld_email_id;
                $scope.MobileNo = user.UserData[0].ld_mobile_no;
                $scope.SelectedUserRole = user.UserData[0].ld_role;
                $scope.ld_Id = user.UserData[0].ld_id;
                console.log($scope.SelectedUserRole)
            }
            else {
                location.href = "/";
            }
        });
    }

    $scope.OldPassword = "";
    $scope.NewPassword = "";
    $scope.ConfirmPassword = "";
    $scope.ConfirmPasswordValidation = false;
    $scope.OldPasswordValidation = false;
    $scope.connectionError = false;
    $scope.SaveUserData = false;

    $scope.SaveChangedPassword = function () {
        $scope.ConfirmPasswordValidation = false;
        $scope.OldPasswordValidation = false;
        $scope.connectionError = false;
        $scope.SaveUserData = false;
        $scope.error = "";
        if ($scope.OldPassword != "") {
            if ($scope.NewPassword != "") {
                if ($scope.ConfirmPassword != "") {
                    if ($scope.NewPassword == $scope.ConfirmPassword) {
                        ngProgress.start();
                        var datas = {
                            "oldpassword": $scope.OldPassword,
                            "newpassword": $scope.NewPassword
                        };
                        Users.changePassword(datas, function(data) {
                            ngProgress.complete();
                            if (data.Result == "Success") {
                                $scope.OldPassword = "";
                                $scope.NewPassword = "";
                                $scope.ConfirmPassword = "";
                                $scope.SaveUserData = true;
                            }
                            if (data.Result == "OldpasswordError") {
                                $scope.OldPasswordValidation = true;
                            }
                        });
                    }
                    else {
                        $scope.ConfirmPasswordValidation = true;
                    }
                }
            }
        }
    };

});

myApp.filter('startFrom', function () {
    return function (input, start) {
        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    }
});