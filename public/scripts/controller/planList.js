/**
 * Created by sujata.patne on 15-07-2015.
 */
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('planListCtrl', function ($scope, $http, ngProgress) {
    $scope.OperatorsList = [
        {id:1, name:'Vodafone', amt:10, disclaimer:'Click to download this content @ Rs.10/-'},
        {id:2, name:'BSNL', amt:20, disclaimer:'Click to download this content @ Rs.20/-'},
        {id:3, name:'MTS', amt:30, disclaimer:'Click to download this content @ Rs.30/-'},
        {id:4, name:'Uninor', amt:40, disclaimer:'Click to download this content @ Rs.40/-'},
        {id:5, name:'Airtel', amt:50, disclaimer:'Click to download this content @ Rs.50/-'}
    ];
    $scope.ContentTypes = [
        {cd_id:1, cd_name:'Wallpaper'},
        {cd_id:2, cd_name:'Audio'},
        {cd_id:3, cd_name:'Video'},
        {cd_id:4, cd_name:'Games'}
    ];

    $scope.planList = [
        {cd_id:1, plan: "Wallpaper@10",content_id:1,created_on:"2015-07-15"},
        {cd_id:2, plan: "Video@10",content_id:2,created_on:"2015-07-11"},
        {cd_id:3, plan: "Audio@10",content_id:3,created_on:"2015-07-21"},
        {cd_id:4, plan: "Games@10",content_id:4,created_on:"2015-07-25"}
    ];
    $scope.getContentName = function(id) {
        var type = '';
        $scope.ContentTypes.forEach(function (data) {
            if (data.cd_id == id) {
                type = data.cd_name;
            }
        });
        return (type) ? type : '';
    }

    $scope.setDate = function(val) {
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

