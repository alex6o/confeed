/// <reference path="../common.d.ts" />

declare module DTO {

    export interface IPersistedModel {
        id: number;
        created: Date;
    }

    export interface ISearchResult<T extends IPersistedModel> {
        entities: T[];
        total: number;
        links: any;
    }

    export interface IUser extends IPersistedModel {
        username: string;
    }

    export interface IRegisterUser {
        username: string;
        password: string;
    }

    export interface ILoginUser {
        username: string;
        password: string;
    }

    export interface IFeedPosting extends IPersistedModel {
        message: string;
        user: IUser;
        links: any;
    }
}
