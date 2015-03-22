/// <reference path="login.d.ts"/>

require("angular");
require("angular-ui-router");

require("common/ui/validation/validation");

import UserImpl = require("common/user/user");

"use strict";

export enum LoginStateEnum {
    INPUT,
    SUCCESS,
    ERROR
}

class LoginCtrl implements cf.IBaseController {

    public static $inject = [
        "$scope",
        "$state",
        "cf_common_userService",
        "cf_common_userTargetStateService"
    ];
    constructor(
        private $scope: cf.ILoginScope,
        private $state: any,
        private userService: UserImpl.UserService,
        private userTargetStateService: UserImpl.UserTargetStateService
        ) {
        // set view model
        this.$scope.vm = this;
        this.$scope.error = null;
    }

    public onClickLogin(form:ng.IFormController, user:DTO.ILoginUser): void {
        this.$scope.error = null;

        if (form.$valid) {
            this.userService.login(user).then(
                (result: DTO.IUser) => {
                    if (this.userService.isAuthDataStored()) {
                        var restoredState = this.userTargetStateService.pullState();
                        if (!_.isUndefined(restoredState) && !_.isNull(restoredState)) {
                            this.$state.go(restoredState.name, this.userTargetStateService.pullParams());
                        } else {
                            this.$state.go("feed");
                        }
                    }
                },
                (err: any) => {
                    this.$scope.error = err.data;
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
var angularModule = angular.module("cf.user.login", moduleDependencies)
// Controller
    .controller("cf_loginCtrl", LoginCtrl)
// Services
// Directives
// Config
    .config(["$stateProvider",
        ($stateProvider) => {
            $stateProvider.state("login", {
                parent: "app",
                url: "/login",
                resolve: {
                },
                views: {
                    "content-container@app": {
                        controller: "cf_loginCtrl",
                        templateUrl: "/app/user/login/login.tpl.html"
                    }
                }
            });
        }]);
