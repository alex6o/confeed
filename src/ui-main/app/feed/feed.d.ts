/// <reference path="../../app.d.ts"/>
/// <reference path="create/create.d.ts"/>

declare module cf {
    interface IFeedScope extends IBaseScope {
        feedPostings:DTO.IFeedPosting[];
        currentUser:DTO.IUser;
    }

    /**
     * Controller for the feed
     */
    interface IFeedCtrl extends IBaseCtrl {
        /**
         * Trigger the fetching of new feed postings
         */
        resolveFeedPostings():void;

        /**
         * Initial fetching of postings
         * This method is responsible to fetch x existing posts and to check if there are new postings available
         */
        resolveInitialFeedPostings():void;

        /**
         * Toggle for limiting the number of listed postings
         */
        togglePostingLimit():void;

        /**
         * Handling for clicks on logout
         */
        onClickLogout():void;

        /**
         * Get the current limit for listed postings
         * @returns {number} the max. number of listed postings
         */
        getPostingLimit():number;

        /**
         * Handling for clicks on load more postings
         * This method has to trigger the fetching logic to get the next (older) postings
         */
        onClickLoadMore():void;

        /**
         * Check if there are more postings available for the feed
         * @returns {boolean} true if there are more postings available
         */
        hasMoreFeedPostings():boolean;
    }

    interface IFeedService {
        /**
         * Fetch new postings since a specific time defined by <code>since</code>
         * @param since fetch posts beginning from this timestamp
         * @param limit number of postings to fetch
         * @returns {IPromise<DTO.ISearchResult<DTO.IFeedPosting>>} resulting postings
         */
        getNewFeedPostings(since:Date, limit:number):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>;

        /**
         * Load feed postings before a specific time defined by <code>before</code>
         * @param before    fetch posts before this timestamp
         * @param limit     number of postings to fetch
         * @returns {IPromise<DTO.ISearchResult<DTO.IFeedPosting>>} resulting postings
         */
        getOlderFeedPostings(before:Date, limit:number):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>;

        /**
         * Load next feed postings using the hateoas links
         * @param refFeedPosting reference posting containing the link to the next entries
         * @returns {restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>} resulting postings
         */
        getNextFeedPostings(refFeedPosting:DTO.IFeedPosting): restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>;

        /**
         * Send new feed posting to api
         * @param feedPosting   the new posting
         * @returns {IPromise<DTO.IFeedPosting>} the persisted feed posting
         */
        sendFeedPosting(feedPosting:DTO.IFeedPosting):restangular.IPromise<DTO.IFeedPosting>;
    }
}
