/// <reference path="format.d.ts"/>

require("lodash");
require("angular");
require("jquery");

var moment = require("moment");

"use strict";

export function continousFilterUpdateDirective(
    $interval: ng.IIntervalService,
    $filter: ng.IFilterService): ng.IDirective {

  return {
        scope: {
            filterName: "=",
            model: "=cfUpdateFilter"
        },
        link: (scope, element: ng.IAugmentedJQuery) => {
            var updateInterval = 1000 * 30;
            var interval;

            function updateFilter() {
                var filter = $filter(scope.filterName);
                element.text(filter(scope.model));
            }

            interval = $interval(updateFilter, updateInterval);
            updateFilter();

            element.bind('$destroy', function() {
                $interval.cancel(interval);
            });
        }
    }
}
continousFilterUpdateDirective.$inject = ["$interval", "$filter"];


function timeFromNowFilter() {
    return (input): string => {
        return moment(input).fromNow();
    };
}

/**
* AngularJS Module Definition
*/



// module dependencies
var moduleDependencies = [
];
// module defintion
var angularModule = angular.module("cf.common.ui.format", moduleDependencies)
// Controller
// Services
// Directives
    .directive("cfUpdateFilter", continousFilterUpdateDirective)
    .filter("cfTimeFromNow", timeFromNowFilter);
// Config
