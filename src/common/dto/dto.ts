/// <reference path="dto.d.ts" />

export class SearchQuery implements DTO.ISearchQuery {
    lastId: string;
    limit: number;
    direction: number;
}

export class RegisterUser implements DTO.IRegisterUser {
    username: string;
    password: string;
}

export class User implements DTO.IUser {
    id: number;
    created: Date;
    username: string;
}

export class FeedPosting implements DTO.IFeedPosting {
    id: number;
    created: Date;
    message: string;
    user: DTO.IUser;
    links: any;
}
