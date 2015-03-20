/// <reference path="../ui.d.ts" />

declare module Ui {

    export interface IAsyncFieldValidationScope extends ng.IScope {
        errorMessages: any;
        mainModel: any;
    }

    export interface IEqualToValidationScope extends ng.IScope {
        equalTo: any;
    }
}
