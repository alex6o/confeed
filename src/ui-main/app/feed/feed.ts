/// <reference path="feed.d.ts"/>

require("angular");
require("angular-ui-router");
require("restangular");
var jQuery:JQueryStatic = require("jquery");
var moment = require("moment");
require("jquery-cookie");
require("lodash");

require("common/ui/validation/validation");
require("common/ui/format/format");
require("./create/create");

import UserImpl = require("common/user/user");


/**
 * Feed Service
 * Creation and retrieving of feed postings
 */
class FeedService implements cf.IFeedService {
    static RESOURCE_FEED = "feed";
    static RESOURCE_POSTING = "posting";

    public static $inject = [
        "$q",
        "Restangular",
        "HateoasRestangular"
    ];

    constructor(private $q:any,
                private restangular:restangular.IService,
                private hateoasRestangular:restangular.IService) {
    }

    public getNewFeedPostings(since:Date, limit:number):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>> {
        var sinceUnix:number = moment(since).valueOf();
        return this.restangular.all(FeedService.RESOURCE_FEED + "/" + FeedService.RESOURCE_POSTING).customGET(null, {
            since: sinceUnix,
            limit: limit
        });
    }

    public getOlderFeedPostings(before:Date, limit:number):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>> {
        var sinceUnix:number = moment(before).valueOf();
        return this.restangular.all(FeedService.RESOURCE_FEED + "/" + FeedService.RESOURCE_POSTING).customGET(null, {
            before: sinceUnix,
            limit: limit
        });
    }

    public getNextFeedPostings(refFeedPosting:DTO.IFeedPosting):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>> {
        if (!_.isUndefined(refFeedPosting.links) && !_.isUndefined(refFeedPosting.links["next"])) {
            return this.hateoasRestangular.oneUrl(refFeedPosting.links["next"].href, null).customGET(null);
        } else {
            return this.$q.reject("No next link available!");
        }
    }

    public sendFeedPosting(feedPosting:DTO.IFeedPosting):restangular.IPromise<DTO.IFeedPosting> {
        return this.restangular.all(FeedService.RESOURCE_FEED + "/" + FeedService.RESOURCE_POSTING).post(feedPosting);
    }
}


class FeedCtrl implements cf.IFeedCtrl {
    private refTimestamp:Date;
    private fetchLimit:number;
    private postingLimit:number;
    private moreFeedPostings:boolean;

    private static DEFAULT_FETCH_LIMIT = 10;
    private static DEFAULT_POSTING_LIMIT = 10;
    private static DEFAULT_FETCH_INTERVAL = 10000;

    public static $inject = [
        "$scope",
        "$state",
        "$stateParams",
        "$interval",
        "currentUser",
        "cf_common_userService",
        "cf_feedService"
    ];

    constructor(private $scope:cf.IFeedScope,
                private $state:any,
                private $stateParams:any,
                private $interval:ng.IIntervalService,
                private currentUser:DTO.IUser,
                private userService:User.IUserService,
                private feedService:cf.IFeedService) {

        // init timestamp
        this.refTimestamp = moment().toDate();
        this.fetchLimit = FeedCtrl.DEFAULT_FETCH_LIMIT;
        this.postingLimit = FeedCtrl.DEFAULT_POSTING_LIMIT;
        this.moreFeedPostings = true;

        // set view model
        this.$scope.vm = this;
        this.$scope.feedPostings = [];
        this.$scope.currentUser = this.currentUser;


        this.resolveInitialFeedPostings();

        $interval(() => {
            this.resolveFeedPostings();
        }, FeedCtrl.DEFAULT_FETCH_INTERVAL);
    }

    public resolveInitialFeedPostings():void {

        this.feedService.getOlderFeedPostings(this.refTimestamp, this.fetchLimit)
            .then((result:DTO.ISearchResult<DTO.IFeedPosting>) => {
                if (!_.isEmpty(result.entities)) {
                    _(result.entities).forEach((entry:DTO.IFeedPosting) => {
                        this.$scope.feedPostings.push(entry);
                    }).value();
                }
            },
            (result:restangular.IResponse) => {
                console.error("Error while fetching posts!");
                // handle error
            })
            .finally(()=> {
                this.resolveFeedPostings();
            });
    }


    public resolveFeedPostings():void {
        // fetch new postings based on reference timestamp
        this.feedService.getNewFeedPostings(this.refTimestamp, this.fetchLimit).then(
            (result:DTO.ISearchResult<DTO.IFeedPosting>) => {

                // process the result
                if (!_.isEmpty(result.entities)) {
                    // store new timestamp
                    // get last entry in result array (most recent posting) and store date as new reference
                    this.refTimestamp = moment(_.last(result.entities).created).toDate();

                    _(result.entities).forEach((entry:DTO.IFeedPosting) => {
                        this.$scope.feedPostings.unshift(entry);
                    }).value();


                    if (this.postingLimit > 0) {
                        this.$scope.feedPostings = _(this.$scope.feedPostings).slice(0, this.postingLimit).valueOf();
                    }

                }
            },
            (result:restangular.IResponse) => {
                console.error("Error while fetching posts!");
                // handle error
            });
    }

    public togglePostingLimit():void {
        if (this.postingLimit == 0) {
            this.postingLimit = FeedCtrl.DEFAULT_POSTING_LIMIT;
        } else if (this.postingLimit > 0) {
            this.postingLimit = 0;
        }
        console.log("posting limit set to %d", this.postingLimit);
    }

    public onClickLogout():void {
        this.userService.logout();
        this.$state.go("login");
    }

    public getPostingLimit():number {
        return this.postingLimit;
    }

    public onClickLoadMore():void {
        this.postingLimit = 0;

        if (!_.isEmpty(this.$scope.feedPostings)) {
            this.feedService.getNextFeedPostings(_.last(this.$scope.feedPostings)).then(
                (result:DTO.ISearchResult<DTO.IFeedPosting>) => {
                    if (!_.isEmpty(result.entities)) {
                        _(result.entities).forEach((entry:DTO.IFeedPosting) => {
                            this.$scope.feedPostings.push(entry);
                        }).value();
                    } else {
                        this.setMoreFeedPostings(false);
                    }
                },
                (result:restangular.IResponse) => {
                    console.error("Error while fetching posts!" + result.data);
                    // handle error
                });
        }
    }

    public setMoreFeedPostings(moreFeedPostings:boolean):void{
        this.moreFeedPostings = moreFeedPostings;
    }

    public hasMoreFeedPostings():boolean {
        return this.moreFeedPostings;
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

// module definition
var angularModule = angular.module("cf.feed", moduleDependencies)
    .controller("cf_feedCtrl", FeedCtrl)
    .service("cf_feedService", FeedService)
    .animation(".feed-posting", feedBlockAnimation)
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
