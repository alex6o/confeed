/// <reference path="../feed.d.ts"/>

declare module cf {
    interface IFeedCreateScope extends IBaseScope {
        feedPosting:DTO.IFeedPosting;
        error:string;
    }
}
