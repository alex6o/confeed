/// <reference path="create.d.ts"/>
require("angular");
require("angular-ui-router");
require("lodash");

import DTOImpl = require("common/dto/dto");

"use strict";

export class FeedCreateCtrl implements cf.IBaseController {
    public static MAX_POSTING_CHARS = 180;

    public static $inject = [
        "$scope",
        "$state",
        "$stateParams",
        "cf_feedService"
    ];
    constructor(
        private $scope: cf.IFeedCreateScope,
        private $state: any,
        private $stateParams: any,
        private feedService: cf.IFeedService
        ) {
        // set view model
        this.$scope.vm = this;
    }

    public getRemainingCharCount(feedPosting: DTO.IFeedPosting): number {
        var result: number = FeedCreateCtrl.MAX_POSTING_CHARS;
        if (!_.isUndefined(feedPosting)) {
            result = Math.max(FeedCreateCtrl.MAX_POSTING_CHARS - feedPosting.message.length, 0);
        }
        return result;
    }
    public getPostingCharLimit(): number {
        return FeedCreateCtrl.MAX_POSTING_CHARS;
    }

    public onClickSendFeedPosting(feedPosting:DTO.IFeedPosting):void {
        this.feedService.sendFeedPosting(feedPosting).then((result:DTO.IFeedPosting)=>{
                // success handling
                this.$scope.feedPosting = new DTOImpl.FeedPosting();
            },(err)=>{
                // error handling goes here
                console.error(err);
            });
    }
}

/**
 * AngularJS Module Definition
 */

// module dependencies
var moduleDependencies = [
    "ui.router"
];
// module defintion
var angularModule = angular.module("cf.feed.create", moduleDependencies)
// Controller
    .controller("cf_feedCreateCtrl", FeedCreateCtrl);
// Services
// Directives
// Config
