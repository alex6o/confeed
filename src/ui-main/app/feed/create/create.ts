/// <reference path="create.d.ts"/>
require("angular");
require("angular-ui-router");
require("lodash");

import DTOImpl = require("common/dto/dto");

export class FeedCreateCtrl implements cf.IBaseCtrl {
    public static MAX_POSTING_CHARS = 180;
    private feedCtrl:cf.IFeedCtrl;

    public static $inject = [
        "$scope",
        "$state",
        "$stateParams",
        "cf_feedService"
    ];

    constructor(private $scope:cf.IFeedCreateScope,
                private $state:any,
                private $stateParams:any,
                private feedService:cf.IFeedService) {

        // backup reference to parent controller
        this.feedCtrl = <cf.IFeedCtrl> this.$scope.vm;
        // set view model
        this.$scope.vm = this;
        this.$scope.error = null;
        this.$scope.feedPosting = new DTOImpl.FeedPosting();
    }

    public getRemainingCharCount(feedPosting:DTO.IFeedPosting):number {
        var result:number = FeedCreateCtrl.MAX_POSTING_CHARS;
        if (!_.isUndefined(feedPosting) && !_.isUndefined(feedPosting.message)) {
            result = Math.max(FeedCreateCtrl.MAX_POSTING_CHARS - feedPosting.message.length, 0);
        }
        return result;
    }

    public getPostingCharLimit():number {
        return FeedCreateCtrl.MAX_POSTING_CHARS;
    }

    public onClickSendFeedPosting(feedPosting:DTO.IFeedPosting):void {
        // reset error
        this.$scope.error = null;

        this.feedService.sendFeedPosting(feedPosting).then((result:DTO.IFeedPosting)=> {
            // success handling
            this.$scope.feedPosting = new DTOImpl.FeedPosting();
            // trigger resolving
            this.feedCtrl.resolveFeedPostings();

        }, (result:restangular.IResponse)=> {
            // error handling goes here
            console.error(result.data.error);
            this.$scope.error = result.data.error;
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
    .controller("cf_feedCreateCtrl", FeedCreateCtrl);