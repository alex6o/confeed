/// <reference path="../feed.d.ts"/>

declare module cf {
    interface IFeedCreateScope extends IBaseScope {
        feedPosting:DTO.IFeedPosting;
        error:string;
    }


    /**
     * Controller for the feed
     */
    interface IFeedCreateCtrl extends IBaseCtrl {

        /**
         * Determine the remaining character for a message
         * @param feedPosting   the posting for checking the message length
         * @returns {number} the number of remaining message character
         */
        getRemainingCharCount(feedPosting:DTO.IFeedPosting):number;

        /**
         * Get the global message length limit
         * @returns {number} allowed message length
         */
        getPostingCharLimit():number;

        /**
         * Handling the submission of new feed posts
         * @param feedPosting   the new feed posting
         */
        onClickSendFeedPosting(feedPosting:DTO.IFeedPosting):void;
    }
}
