/// <reference path="app.d.ts"/>

var _: _.LoDashStatic = require("lodash");
var windowTemp: any = window;
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

import User = require("common/user/user");

"use strict";

/**
 * Main Controller
 */
export class AppCtrl {
  public static $inject = [
    "$scope",
    "$state",
    "$rootScope",
    "cf_common_userTargetStateService"
  ];
  constructor(
    private $scope: cf.IBaseScope,
    private $state: any,
    private $rootScope: any,
    private userTargetStateService: User.UserTargetStateService
    ) {
      console.log("app ctrl");
    // application wide event handling
    this.$rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
      if (error === User.ERROR_UNAUTHORIZED) {
        this.userTargetStateService.pushState(toState, toParams);
        $state.go("login");
      }

      if (error === User.ERROR_AUTHORIZATION_EXPIRED) {
        this.userTargetStateService.pushState(toState, toParams);
        $state.go("login");
      }
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
// module defintion
var angularModule = angular.module("cf", moduleDependencies)
// Controller
  .controller("cf_appCtrl", AppCtrl)
// Services
  .factory("HateoasRestangular", (Restangular) => {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl("");
    })
  })
// Directives
// Run
// Config
  .config(["$stateProvider", "$locationProvider", "$urlRouterProvider", "$httpProvider", "RestangularProvider",
    ($stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, RestangularProvider) => {

      RestangularProvider.setBaseUrl('http://private-71b1-confeed.apiary-mock.com/');
      //$locationProvider.html5Mode(true);
      $locationProvider.hashPrefix("!");

      // state definition
      $stateProvider.state("app", {
        abstract: true,
        templateUrl: "/app.tpl.html",
        url: "",
        resolve: {
        }
      });

      $httpProvider.interceptors.push("cf_common_userAuthHttpInterceptor");

    }]);
