/// <reference path="dto.d.ts" />

export class RegisterUser implements DTO.IRegisterUser {
    username: string;
    password: string;
}

export class LoginUser implements DTO.ILoginUser{
    username: string;
    password: string;
}

export class User implements DTO.IUser {
    id: number;
    created: number;
    username: string;
}

export class FeedPosting implements DTO.IFeedPosting {
    id: number;
    created: number;
    message: string;
    user: DTO.IUser;
    links: any;
}

export class NewFeedPosting implements DTO.INewFeedPosting{
    message: string;
}
