/// <reference path="feed.d.ts"/>

require("angular");
require("angular-ui-router");
require("restangular");
var jQuery: JQueryStatic = require("jquery");
var moment = require("moment");
require("jquery-cookie");
require("lodash");

require("common/ui/validation/validation");
require("common/ui/format/format");
require("./create/create");

import UserImpl = require("common/user/user");

"use strict";

class FeedService implements cf.IFeedService {
    static RESOURCE_FEED = "feed";
    static RESOURCE_POSTING = "posting";

    public static $inject = [
        "$q",
        "Restangular",
        "HateoasRestangular"
    ];

    constructor(
        private $q: any,
        private restangular: restangular.IService,
        private hateoasRestangular: restangular.IService
        ) {
    }

    public getNewFeedPostings(since: Date, limit: number): restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>> {
        return this.restangular.all(FeedService.RESOURCE_FEED + "/" + FeedService.RESOURCE_POSTING).customGET(null, { since: since, limit: limit });
    }

    public getOlderFeedPostings(refFeedPosting: DTO.IFeedPosting): restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>> {
        if(!_.isUndefined(refFeedPosting.links) && !_.isUndefined(refFeedPosting.links["next"])){
            return this.hateoasRestangular.oneUrl(null, refFeedPosting.links["next"].href).customGET(null);
        }else{
            return this.$q.reject("no next link available!");
        }
    }

    public sendFeedPosting(feedPost: DTO.IFeedPosting): restangular.IPromise<DTO.IFeedPosting> {
        return this.restangular.all(FeedService.RESOURCE_FEED + "/" + FeedService.RESOURCE_POSTING).post({ posting: feedPost });
    }
}



class FeedCtrl implements cf.IBaseController {
    private refTimestamp: Date;
    private fetchLimit: number;
    private postingLimit: number;

    private static DEFAULT_FETCH_LIMIT = 10;
    private static DEFAULT_POSTING_LIMIT = 10;

    public static $inject = [
        "$scope",
        "$state",
        "$stateParams",
        "$interval",
        "currentUser",
        "cf_common_userService",
        "cf_feedService"
    ];
    constructor(
        private $scope: cf.IFeedScope,
        private $state: any,
        private $stateParams: any,
        private $interval: ng.IIntervalService,
        private currentUser: DTO.IUser,
        private userService: any,
        private feedService: cf.IFeedService
        ) {

        // init timestamp
        this.refTimestamp = new Date();
        this.fetchLimit = FeedCtrl.DEFAULT_FETCH_LIMIT;
        this.postingLimit = FeedCtrl.DEFAULT_POSTING_LIMIT;

        // set view model
        this.$scope.vm = this;
        this.$scope.feedPostings = new Array();
        this.$scope.currentUser = this.currentUser;

        this.resolveFeedPostings();

        $interval(() => {
            this.resolveFeedPostings();
        }, 20000);
    }

    private resolveFeedPostings(): void {
        this.feedService.getNewFeedPostings(this.refTimestamp, this.fetchLimit).then(
            (result: DTO.ISearchResult<DTO.IFeedPosting>) => {
                if (!_.isEmpty(result.entities)) {
                    _(result.entities).forEachRight((entry: DTO.IFeedPosting) => {
                        this.$scope.feedPostings.unshift(entry);
                    }).value();

                    if (this.postingLimit > 0) {
                        this.$scope.feedPostings = _(this.$scope.feedPostings).slice(0, this.postingLimit).valueOf();
                    }

                }
            },
            (result: restangular.IResponse) => {
                console.error("Error while fetching posts!");
                // handle error
            });
    }

    public togglePostingLimit() {
        if (this.postingLimit == 0) {
            this.postingLimit = FeedCtrl.DEFAULT_POSTING_LIMIT;
        } else if (this.postingLimit > 0) {
            this.postingLimit = 0;
        }
        console.log("posting limit set to %d", this.postingLimit);
    }

    public onClickLogout(): void {
        this.userService.logout();
        this.$state.go("login");
    }

    public getPostingLimit(): number {
        return this.postingLimit;
    }

    public onClickLoadMore(): void {
        this.postingLimit = 0;

        if (!_.isEmpty(this.$scope.feedPostings)) {

            this.feedService.getOlderFeedPostings(_.last(this.$scope.feedPostings)).then(
                (result: DTO.ISearchResult<DTO.IFeedPosting>) => {
                    if (!_.isEmpty(result.entities)) {
                        _(result.entities).forEach((entry: DTO.IFeedPosting) => {
                            this.$scope.feedPostings.push(entry);
                        }).value();
                    }
                },
                (result: restangular.IResponse) => {
                    console.error("Error while fetching posts!");
                    // handle error
                });
        }
    }
}



function feedBlockAnimation() {
    return {
        enter: (element, done) => {
            jQuery(element).hide().slideDown(300, done);
        },
        leave: (element, done) => {
            jQuery(element).fadeOut(300, done);
        }
    };
}

/**
 * AngularJS Module Definition
 */

// module dependencies
var moduleDependencies = [
    "ui.router",
    "cf.common.user",
    "cf.common.ui.validation",
    "cf.common.ui.format",
    "cf.feed.create"
];
// module defintion
var angularModule = angular.module("cf.feed", moduleDependencies)
// Controller
    .controller("cf_feedCtrl", FeedCtrl)
// Services
    .service("cf_feedService", FeedService)
    .animation(".feed-posting", feedBlockAnimation)
// Directives
/*// Config*/
    .config(["$stateProvider",
        ($stateProvider) => {
            $stateProvider.state("feed", {
                parent: "app",
                url: "/feed",
                resolve: {
                    currentUser: UserImpl.loginRequired
                },
                views: {
                    "content-container@app": {
                        controller: "cf_feedCtrl",
                        templateUrl: "/app/feed/feed.tpl.html"
                    },
                    "create-posting@feed": {
                        controller: "cf_feedCreateCtrl",
                        templateUrl: "/app/feed/create/create.tpl.html"
                    }
                }
            });
        }]);
