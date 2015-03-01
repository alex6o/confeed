/// <reference path="signup.d.ts"/>

require("angular");
require("angular-ui-router");

require("common/ui/validation/validation");

import User = require("common/user/user");

"use strict";

export enum SignupStateEnum {
  INPUT,
  SUCCESS,
  ERROR
}

export class SignupCtrl implements cf.IBaseController {

  public static $inject = [
    "$scope",
    "$state",
    "cf_common_userService",
    "cf_common_userTargetStateService"
  ];
  constructor(
    private $scope: cf.ISignupScope,
    private $state,
    private userService: User.UserService,
    private userTargetStateService: User.UserTargetStateService
    ) {
    // set view model
    this.$scope.vm = this;
    this.$scope.errorMessages = {};
    this.$scope.signupState = SignupStateEnum.INPUT;
  }

  public onClickSubmit(form: ng.IFormController, user: DTO.IRegisterUser): void {
    if (form.$valid) {
      this.userService.signup(user).then(
        (result: any) => {
          this.$scope.signupState = SignupStateEnum.SUCCESS;

          if (this.userService.isAuthDataStored()) {
            var restoredState = this.userTargetStateService.pullState();
            if (!_.isUndefined(restoredState)) {
              this.$state.go(restoredState.name, this.userTargetStateService.pullParams());
            } else {
              this.$state.go("feed");
            }
          }
        },
        (err: any) => {
          console.log(err);
          this.$scope.signupState = SignupStateEnum.ERROR;
        });
    }
  }
}

/**
 * AngularJS Module Definition
 */

// module dependencies
var moduleDependencies = [
  "ui.router",
  "cf.common.user",
  "cf.common.ui.validation"];
// module defintion
var angularModule = angular.module("cf.user.signup", moduleDependencies)
// Controller
  .controller("cf_signupCtrl", SignupCtrl)
// Services
// Directives
// Config
  .config(["$stateProvider",
    ($stateProvider) => {
      $stateProvider.state("signup", {
        parent: "app",
        url: "/signup",
        resolve: {
        },
        views: {
          "content-container@app": {
            controller: "cf_signupCtrl",
            templateUrl: "/app/user/signup/signup.tpl.html"
          }
        }
      });
    }]);
