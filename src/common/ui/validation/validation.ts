/// <reference path="validation.d.ts"/>

require("lodash");
require("angular");
require("jquery");
require("restangular");

/**
 * Directive for validating that two inputs have the same content
 * @see: {@link https://docs.angularjs.org/guide/directive}
 * @see: {@link http://odetocode.com/blogs/scott/archive/2014/10/13/confirm-password-validation-in-angularjs.aspx}
 */
export function equalToValidationDirective(): ng.IDirective {
    return {
        require: 'ngModel',
        scope: {
            equalTo: "=cfEqualTo"
        },
        link: (scope: Ui.IEqualToValidationScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl) => {
            ctrl.$validators.equalTo = (modelValue) => {
                /**
                 * [TODO: check if the modelValue is equal to the reference scope value provided by equalTo]
                 */
                return true;
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
// module definition
var angularModule = angular.module("cf.common.ui.validation", moduleDependencies)
    .directive("cfEqualTo", equalToValidationDirective);

