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
