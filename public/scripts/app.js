/**
 * Created by sujata.patne on 7/6/2015.
 */
var myApp = angular.module('myApp',['ui.bootstrap','ui.router','ngProgress']);

myApp.config(function($stateProvider) {
        $stateProvider
            .state("dashboard", {
                templateUrl: "partials/dashboard.html",
                controller: "dashboardCtrl",
                url:"/dashboard"
            })
            .state('users', {
                templateUrl: 'partials/add-edit-users.html',
                controller: 'usersCtrl',
                url:'/users'
            })
            .state('a-la-cart',{
                templateUrl: 'partials/a-la-cart-plan.html',
                controller: 'oneTimePlanCtrl',
                url: '/a-la-cart'
            })
            .state('subscriptions',{
                templateUrl: 'partials/subscriptions-plan.html',
                controller: 'subscriptionsPlanCtrl',
                url: '/subscriptions'
            })
            .state('value-pack',{
                templateUrl: 'partials/value-pack-plan.html',
                controller: 'valuePackPlanCtrl',
                url: '/value-pack'
            })
            .state('plan-list',{
                templateUrl: 'partials/plan-list.html',
                controller: 'planListCtrl',
                url: '/plan-list'
            })
            .state('accountforgot', {
                templateUrl: 'partials/account-changepassword.html',
                controller: '',
                url: '/accountforgot'
            })
            .state("changepassword", {
                templateUrl: 'partials/account-changepassword.html',
                controller: 'usersCtrl',
                url: '/changepassword'
            })
    })
    .run(function($state){
        console.log($state);
        $state.go("dashboard");
    })