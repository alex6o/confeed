/// <reference path="app.d.ts"/>

var _:_.LoDashStatic = require("lodash");
var windowTemp:any = window;
windowTemp._ = _;

require("jquery");
require("angular");
require("angular-animate");
require("angular-ui-router");
require("angular-bootstrap");
require("restangular");

require("ui-main/app/user/signup/signup");
require("ui-main/app/user/login/login");
require("ui-main/app/feed/feed");

import UserImpl = require("common/user/user");

/**
 * App Controller
 * Main Controller for the application
 */
export class AppCtrl {

    public static $inject = [
        "$scope",
        "$state",
        "$rootScope",
        "cf_common_userTargetStateService"
    ];
    
    constructor(private $scope:cf.IBaseScope,
                private $state:any,
                private $rootScope:any,
                private userTargetStateService:User.IUserTargetStateService) {

        // Global listener for errors during state changes
        this.$rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {

            /**
             * Handle events caused by authentication errors
             * [TODO: Authorization Event Handling]
             */
            // handle unauthorized access
            // user token has expired
        });

        // set view model
        $scope.vm = this;
        // default state
        $state.go("feed");
    }
}

/**
 * AngularJS Module Definition
 */

// module dependencies
var moduleDependencies = [
    "ngAnimate",
    "ui.router",
    "restangular",
    "cf.user.signup",
    "cf.user.login",
    "cf.common.user",
    "cf.feed"
];

// module definition
var angularModule = angular.module("cf", moduleDependencies)
    .controller("cf_appCtrl", AppCtrl)
    .config(["$stateProvider", "$locationProvider", "$httpProvider", "RestangularProvider",
        ($stateProvider, $locationProvider, $httpProvider, RestangularProvider) => {

            RestangularProvider.setBaseUrl('/api/');
            $locationProvider.hashPrefix("!");

            // setup root application state
            $stateProvider.state("app", {
                abstract: true,
                templateUrl: "/app.tpl.html",
                url: ""
            });

            /**
             * [TODO: Register authentication interceptor (cf_common_userAuthHttpInterceptor) to our app]
             */
        }])
    .factory("HateoasRestangular", (Restangular) => {
        // create additional restangular instance
        return Restangular.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl("http://localhost/api");
        })
    });
