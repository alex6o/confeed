/// <reference path="../../app.d.ts"/>
/// <reference path="create/create.d.ts"/>

declare module cf {
  interface IFeedScope extends IBaseScope {
    feedPostings:DTO.IFeedPosting[];
    currentUser:DTO.IUser;
  }

  interface IFeedService{
    getNewFeedPostings(since:Date, limit:number):restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>;
    getOlderFeedPostings(refFeedPosting:DTO.IFeedPosting): restangular.IPromise<DTO.ISearchResult<DTO.IFeedPosting>>;
    sendFeedPosting(feedPosting:DTO.IFeedPosting):restangular.IPromise<DTO.IFeedPosting>;
  }
}
