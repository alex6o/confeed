/// <reference path="dto.d.ts" />

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
