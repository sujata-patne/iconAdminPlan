/**
 * Created by sujata.patne on 15-07-2015.
 */
var site_base_path = '';
//var site_base_path = 'http://dailymagic.in';
myApp.controller('subscriptionsPlanCtrl', function ($scope, $http, ngProgress) {
        $scope.ContentTypes = [
        {cd_id:1, cd_name:'Wallpaper'},
        {cd_id:2, cd_name:'Audio'},
        {cd_id:3, cd_name:'Video'},
        {cd_id:4, cd_name:'Games'},
    ];
    $scope.JetPayEvent = [
        {cd_id:1, cd_name:'Wallpaper@10'},
        {cd_id:2, cd_name:'Video@20'},
        {cd_id:3, cd_name:'Audio@10'},
        {cd_id:4, cd_name:'Game@30'},
    ];
    $scope.operators = [
        {event_id:1, data: [
            {id:1, name:'Vodafone', amt:10, disclaimer:'Click to download this content @ Rs.10/-'},
            {id:2, name:'BSNL', amt:20, disclaimer:'Click to download this content @ Rs.20/-'},
            {id:3, name:'MTS', amt:30, disclaimer:'Click to download this content @ Rs.30/-'},
            {id:4, name:'Uninor', amt:40, disclaimer:'Click to download this content @ Rs.40/-'},
            {id:5, name:'Airtel', amt:50, disclaimer:'Click to download this content @ Rs.50/-'}
        ]},
        {event_id:2, data: [
            {id:1, name:'Vodafone', amt:8, disclaimer:'Click to download this content @ Rs.8/-'},
            {id:2, name:'BSNL', amt:20, disclaimer:'Click to download this content @ Rs.20/-'},
            {id:3, name:'MTS', amt:30, disclaimer:'Click to download this content @ Rs.30/-'},
            {id:4, name:'Uninor', amt:40, disclaimer:'Click to download this content @ Rs.40/-'},
            {id:5, name:'Airtel', amt:50, disclaimer:'Click to download this content @ Rs.50/-'}
        ]},
        {event_id:3, data: [
            {id:1, name:'Vodafone', amt:11, disclaimer:'Click to download this content @ Rs.11/-'},
            {id:2, name:'BSNL', amt:20, disclaimer:'Click to download this content @ Rs.20/-'},
            {id:3, name:'MTS', amt:30, disclaimer:'Click to download this content @ Rs.30/-'},
            {id:4, name:'Uninor', amt:40, disclaimer:'Click to download this content @ Rs.40/-'},
            {id:5, name:'Airtel', amt:50, disclaimer:'Click to download this content @ Rs.50/-'}
        ]},
        {event_id:4, data: [
            {id:1, name:'Vodafone', amt:9, disclaimer:'Click to download this content @ Rs.9/-'},
            {id:2, name:'BSNL', amt:20, disclaimer:'Click to download this content @ Rs.20/-'},
            {id:3, name:'MTS', amt:30, disclaimer:'Click to download this content @ Rs.30/-'},
            {id:4, name:'Uninor', amt:40, disclaimer:'Click to download this content @ Rs.40/-'},
            {id:5, name:'Airtel', amt:50, disclaimer:'Click to download this content @ Rs.50/-'}
        ]}
    ];

    $scope.displayOperators = function(){
        $scope.operators.forEach(function(value){
            if($scope.SelectedEventId == value.event_id ){
                $scope.OperatorsList = value.data
            }
        })
    }
    $scope.resetForm = function(){
        $scope.SelectedEventId = '';
        $scope.OperatorsList = '';
    }

    /**    function to submit the form after all validation has occurred and check to make sure the form is completely valid */
    $scope.submitForm = function(isValid) {
        if (isValid) {
            alert('our form is amazing');
        }
    };
});