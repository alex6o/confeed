/// <reference path="user.d.ts"/>

require("angular");
var jQuery: JQueryStatic = require("jquery");
var _: _.LoDashStatic = require("lodash");
require("jquery-cookie");
require("restangular");

export var ERROR_UNAUTHORIZED = "ERROR_UNAUTHORIZED";
export var ERROR_AUTHORIZATION_EXPIRED = "ERROR_AUTHORIZATION_EXPIRED";

export class UserService {
    static RESOURCE_LOGIN = "user/login";
    static RESOURCE_SIGNUP = "user/signup";
    static RESOURCE_VALIDATE_REGISTRATION = "user/validate";
    static RESOURCE_CURRENT_USER = "user/currentuser";

    public static $inject = [
        "$q",
        "Restangular",
        "cf_common_userReferenceService"
    ];

    constructor(
        private $q: any,
        private restangular: restangular.IService,
        private userReferenceService: UserReferenceService) {
    }

    public signup(user: DTO.IRegisterUser): restangular.IPromise<DTO.IUser> {
        // reset client side user state
        this.userReferenceService.resetUser();
        this.userReferenceService.resetUserAuthToken();

        return <restangular.IPromise<DTO.IUser>> this.restangular.all(UserService.RESOURCE_SIGNUP).post(user).then((result) => {
            // note: the auth interceptor sets the received auth token
            // load user data
            return this.loadCurrentUser().then((user: DTO.IUser): DTO.IUser=> {
                this.userReferenceService.persistUser(user);
                return user;
            });
        },
        (err) => {
            console.error("Signup failed: " + err.data);
            this.userReferenceService.resetUser();
            this.userReferenceService.resetUserAuthToken();
            return this.$q.reject(err.data);
        });
    }

    public login(user: DTO.ILoginUser): restangular.IPromise<DTO.IUser> {
        // reset client side user state
        this.userReferenceService.resetUser();
        this.userReferenceService.resetUserAuthToken();

        return <restangular.IPromise<DTO.IUser>> this.restangular.all(UserService.RESOURCE_LOGIN).post(user).then(
            (result) => {
                // note: the auth interceptor sets the received auth token
                // load user data
                return this.loadCurrentUser().then((user: DTO.IUser): DTO.IUser=> {
                    this.userReferenceService.persistUser(user);
                    return user;
                });
            },
            (err) => {
                console.error("Login failed: " + err.data);
                this.userReferenceService.resetUser();
                this.userReferenceService.resetUserAuthToken();
                return this.$q.reject(err.data);
            });
    }


    public logout(): void {
        this.userReferenceService.resetUser();
        this.userReferenceService.resetUserAuthToken();
    }

    public validateRegister(user: DTO.IRegisterUser): restangular.IPromise<any> {
        return this.restangular.all(UserService.RESOURCE_VALIDATE_REGISTRATION).post({ user: user });
    }

    public loadCurrentUser(): restangular.IPromise<DTO.IUser> {
        return this.restangular.one(UserService.RESOURCE_CURRENT_USER, null).get();
    }

    public isAuthorized(): ng.IPromise<string> {
        var deferred = this.$q.defer();

        if (this.isAuthDataStored()) {
            // load user data
            this.loadCurrentUser().then((user: DTO.IUser): void=> {
                this.userReferenceService.persistUser(user);
                deferred.resolve(this.userReferenceService.getUser());
            }, (err) => {
                    if (err.status === 401) {
                        deferred.reject(ERROR_UNAUTHORIZED);
                    } else if (err.status === 419) {
                        deferred.reject(ERROR_AUTHORIZATION_EXPIRED);
                    }
                });
        } else {
            deferred.reject(ERROR_UNAUTHORIZED);
        }

        return deferred.promise;
    }

    public isAuthDataStored(): boolean {
        return !_.isUndefined(this.userReferenceService.getUserAuthToken()) && !_.isUndefined(this.getCurrentUser());
    }

    public getCurrentUser(): DTO.IUser {
        return this.userReferenceService.getUser();
    }

}

export class UserTargetStateService implements User.UserTargetStateService {
    private targetState;
    private targetParams;

    public pushState(state, params) {
        this.targetState = state;
        this.targetParams = params;
    }

    public pullState() {
        var state = _.clone(this.targetState);
        this.targetState = null;
        return state;
    }

    public pullParams() {
        var params = _.clone(this.targetParams);
        this.targetParams = null;
        return params;
    }
}


export class UserReferenceService {
    public static COOKIE_USER = "CF_USER";
    public static COOKIE_USER_AUTH_TOKEN = "CF_USER_AUTH_TOKEN";
    private currentUser: DTO.IUser;
    private userAuthToken: string;

    setUser(user: DTO.IUser) {
        this.currentUser = user;
    }

    getUser(): DTO.IUser {
        if (_.isUndefined(this.currentUser)) {
            this.restoreUser();
        }
        return this.currentUser;
    }

    setUserAuthToken(token: string) {
        this.userAuthToken = token;
    }

    getUserAuthToken(): string {
        if (_.isUndefined(this.userAuthToken)) {
            this.restoreUserAuthToken();
        }
        return this.userAuthToken;
    }

    storeUser(user: DTO.IUser) {
        // remove previous cookies
        this.removeStoredUser();
        if (!_.isUndefined(user)) {
            (<any>jQuery).cookie(UserReferenceService.COOKIE_USER, JSON.stringify(user), { expires: 7, path: "/", secure: false });
        }
    }

    storeUserAuthToken(token: string) {
        // remove previous cookies
        this.removeStoredUserAuthToken();
        if (!_.isUndefined(token)) {
            (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN, token, { expires: 7, path: "/", secure: false });
        }
    }

    restoreUser(): DTO.IUser {
        var userCookie = (<any>jQuery).cookie(UserReferenceService.COOKIE_USER);
        if (!_.isUndefined(userCookie) && userCookie.length > 0) {
            this.setUser(JSON.parse(userCookie));
            return this.getUser();
        }
        return undefined;
    }

    restoreUserAuthToken(): string {
        var tokenCookie = (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN);
        if (!_.isUndefined(tokenCookie) && tokenCookie.length > 0) {
            this.setUserAuthToken(tokenCookie);
            return this.getUserAuthToken();
        }
        return undefined;
    }


    removeStoredUser(): void {
        (<any>jQuery).cookie(UserReferenceService.COOKIE_USER, "", { expires: 7, path: "/", secure: false });
    }

    removeStoredUserAuthToken(): void {
        (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN, "", { expires: 7, path: "/", secure: false });
    }

    resetUser(): void {
        this.currentUser = undefined;
        this.removeStoredUser();
    }

    resetUserAuthToken(): void {
        this.userAuthToken = undefined;
        this.removeStoredUserAuthToken();
    }

    persistUserAuthToken(token: string): void {
        console.log("persisting user auth token");
        this.setUserAuthToken(token);
        this.storeUserAuthToken(token);
    }

    persistUser(user: DTO.IUser): void {
        console.log("persisting user");
        this.setUser(user);
        this.storeUser(user);
    }
}

export class UserAuthHttpInterceptor {
    static RESOURCE_USER = "user";

    static POST_HEADER = { "Content-Type": "application/x-www-form-urlencoded" };
    public static HEADER_AUTHORIZATIONTOKEN = "X-CF-AUTH-TOKEN";
    public static HEADER_AUTHORIZATIONTOKEN_PREFIX = "";
    static RESPONSE_CODE_UNAUTHORIZED = 401;
    static EVENT_USER_AUTHTOKEN_EXPIRED = "EVENT_USER_AUTHTOKEN_EXPIRED";

    public static $inject = [
        "$rootScope",
        "cf_common_userReferenceService",
        "$q",
        "$location"
    ];

    constructor(public $rootScope, public userReferenceService: UserReferenceService, public $q, public $location) {
    }

    public responseError = (response) => {
        if (response.status === 401) {
            console.log("unauthorized request");
            this.userReferenceService.resetUser();
            this.userReferenceService.resetUserAuthToken();
            this.$location.path('/login');
        }
        return this.$q.reject(response);
    };

    public response = (response) => {
        var authToken = response.headers(UserAuthHttpInterceptor.HEADER_AUTHORIZATIONTOKEN);
        if (!_.isEmpty(authToken)) {
            console.log("Received auth token...");
            // reset client side user state
            this.userReferenceService.resetUserAuthToken();
            this.userReferenceService.persistUserAuthToken(authToken);
        }
        return response;
    };

    public request = (config) => {
        var token: string = this.userReferenceService.getUserAuthToken();
        if (!_.isUndefined(token) && !_.isNull(token)) {
            config.headers[UserAuthHttpInterceptor.HEADER_AUTHORIZATIONTOKEN] = UserAuthHttpInterceptor.HEADER_AUTHORIZATIONTOKEN_PREFIX + token;
        }
        return config;
    };
}


export function loginRequired(cf_common_userService: UserService) {
    return cf_common_userService.isAuthorized();
}


/**
* AngularJS Module Definition
*/

// module dependencies
var moduleDependencies = [
    "restangular",
    "ui.router"];
// module defintion
angular.module("cf.common.user", moduleDependencies)
// Controller
// Services
    .service("cf_common_userService", UserService)
    .service("cf_common_userReferenceService", UserReferenceService)
    .service("cf_common_userAuthHttpInterceptor", UserAuthHttpInterceptor)
    .service("cf_common_userTargetStateService", UserTargetStateService);
// Directives
// Config
