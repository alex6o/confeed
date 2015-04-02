/// <reference path="signup.d.ts"/>

require("angular");
require("angular-ui-router");

require("common/ui/validation/validation");

import UserImpl = require("common/user/user");
import DTOImpl = require("common/dto/dto");

export class SignupCtrl implements cf.ISignupCtrl {

    public static $inject = [
        "$scope",
        "$state",
        "cf_common_userService",
        "cf_common_userTargetStateService"
    ];

    constructor(
        private $scope: cf.ISignupScope,
        private $state,
        private userService: User.IUserService,
        private userTargetStateService: UserImpl.UserTargetStateService
        ) {

        // set view model
        this.$scope.vm = this;
        this.$scope.error = null;
        this.$scope.user = new DTOImpl.RegisterUser();
    }

    public onClickSubmit(form: ng.IFormController, user: DTO.IRegisterUser): void {
        if (form.$valid) {
            this.userService.signup(user).then(
                (result: any) => {
                    var restoredState = this.userTargetStateService.pullState();
                    if (!_.isUndefined(restoredState) && !_.isNull(restoredState)) {
                        this.$state.go(restoredState.name, this.userTargetStateService.pullParams());
                    } else {
                        this.$state.go("feed");
                    }
                },
                (result:restangular.IResponse) => {
                    this.$scope.error = result.data.error;
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

// module definition
var angularModule = angular.module("cf.user.signup", moduleDependencies)
    .controller("cf_signupCtrl", SignupCtrl)
    .config(["$stateProvider",
        ($stateProvider) => {
            $stateProvider.state("signup", {
                parent: "app",
                url: "/signup",
                views: {
                    "content-container@app": {
                        controller: "cf_signupCtrl",
                        templateUrl: "/app/user/signup/signup.tpl.html"
                    }
                }
            });
        }]);
