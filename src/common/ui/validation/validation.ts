/// <reference path="validation.d.ts"/>

require("lodash");
require("angular");
require("jquery");
require("restangular");

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
            scope.$watch("equalTo", () => {
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
    .directive("cfEqualTo", equalToValidationDirective);
// Config
