/// <reference path="validation.d.ts"/>

require("lodash");
require("angular");
require("jquery");
require("restangular");
import User = require("common/user/user");

"use strict";


function processAsyncErrorMessages(scope, error, fieldName: string, resolve, reject) {
  if (!_.isUndefined(error) && !_.isUndefined(error.details)) {
    _(error.details).forEach((errorEntry: any) => {
      if (_.isEqual(errorEntry.path, fieldName)) {
        scope.errorMessages[fieldName] = errorEntry.message;
        reject();
        return false;
      }
    }).value();
    resolve();
  } else {
    resolve();
  }
}

export function asyncFieldValidationDirective(
  $q,
  restangular,
  userService: User.UserService): ng.IDirective {

  return {
    require: 'ngModel',
    scope: {
      errorMessages: "=",
      mainModel: "="
    },
    link: (scope: Ui.IAsyncFieldValidationScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl) => {
      var fieldName: string = attrs["name"];
      var validationContext: string = attrs["context"];

      if (!_.isEmpty(fieldName)) {
        ctrl.$asyncValidators[fieldName] = (modelValue, viewValue) => {
          var dto: any = {};
          angular.copy(scope.mainModel, dto);
          dto[fieldName] = modelValue || viewValue;

          return $q((resolve, reject) => {
            switch (validationContext) {
              case "user":
                userService.validateRegister(dto).then(() => {
                  resolve();
                }, (result) => {
                    processAsyncErrorMessages(scope, result.data.error, fieldName, resolve, reject);
                  });
                break;
            }
          });
        }
	    }
    }
  };
}
asyncFieldValidationDirective.$inject = ["$q", "Restangular", "cf_common_userService"];

// source: http://odetocode.com/blogs/scott/archive/2014/10/13/confirm-password-validation-in-angularjs.aspx
export function equalToValidationDirective(): ng.IDirective {
  return {
    require: 'ngModel',
    scope: {
      equalTo: "=cfEqualTo"
    },
    link: (scope: Ui.IEqualToValidationScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl) => {
      ctrl.$validators.equalTo = (modelValue) => {
        return modelValue === scope.equalTo;
      };
      scope.$watch("equalTo", ()=>{
        ctrl.$validate();
      });
    }
  };
}

/**
* AngularJS Module Definition
*/

// module dependencies
var moduleDependencies = [
  "restangular",
  "cf.common.user"
];
// module defintion
var angularModule = angular.module("cf.common.ui.validation", moduleDependencies)
// Controller
// Services
// Directives
  .directive("cfAsyncFieldValidation", asyncFieldValidationDirective)
  .directive("cfEqualTo", equalToValidationDirective);
// Config
