/// <reference path="user.d.ts"/>

require("angular");
var jQuery:JQueryStatic = require("jquery");
var _:_.LoDashStatic = require("lodash");
require("jquery-cookie");
require("restangular");

export var ERROR_UNAUTHORIZED = "ERROR_UNAUTHORIZED";
export var ERROR_AUTHORIZATION_EXPIRED = "ERROR_AUTHORIZATION_EXPIRED";


export class UserService implements User.IUserService{
    static RESOURCE_LOGIN = "user/login";
    static RESOURCE_SIGNUP = "user/signup";
    static RESOURCE_VALIDATE_REGISTRATION = "user/validate";
    static RESOURCE_CURRENT_USER = "user/currentuser";

    public static $inject = [
        "$q",
        "Restangular",
        "cf_common_userReferenceService"
    ];

    constructor(private $q:any,
                private restangular:restangular.IService,
                private userReferenceService:UserReferenceService) {
    }


    public signup(user:DTO.IRegisterUser):restangular.IPromise<DTO.IUser> {

        // remove the stored user information
        this.userReferenceService.resetUser();
        // remove the stored user auth token
        this.userReferenceService.resetUserAuthToken();

        // send registration request with the provided user data to the api
        return <restangular.IPromise<DTO.IUser>> this.restangular.all(UserService.RESOURCE_SIGNUP).post(user).then((result) => {
            // NOTE: if the the registration is successful, the user should be logged in
            // The auth interceptor has to ensure the proper handling of the received auth token (header)!

            // at this point the user should be handled as logged in
            // --> load user data from the api
            return this.loadCurrentUser().then((user:DTO.IUser):DTO.IUser=> {
                // store user data
                this.userReferenceService.persistUser(user);
                return user;
            });

        }, (result:restangular.IResponse) => {
            // the registration request failed
            // error handling goes here
            console.error("Signup failed: " + result.data.error);

            // remove any stored user data on the client side
            this.userReferenceService.resetUser();
            this.userReferenceService.resetUserAuthToken();
            return this.$q.reject(result);
        });
    }

    public login(user:DTO.ILoginUser):restangular.IPromise<DTO.IUser> {

        // remove the stored user information
        this.userReferenceService.resetUser();
        // remove the stored user auth token
        this.userReferenceService.resetUserAuthToken();

        // send the login request with the provided credentials
        return <restangular.IPromise<DTO.IUser>> this.restangular.all(UserService.RESOURCE_LOGIN).post(user).then(
            (result) => {
                // NOTE: if the the login is successful, no additional data is returned
                // The auth interceptor has to ensure the proper handling of the received auth token (header)!

                // --> load user data from the api
                return this.loadCurrentUser().then((user:DTO.IUser):DTO.IUser=> {
                    // store user data
                    this.userReferenceService.persistUser(user);
                    return user;
                });
            }, (result:restangular.IResponse) => {
                // the login request failed
                // error handling goes here
                console.error("Login failed: " + result.data.error);

                // remove any stored user data on the client side
                this.userReferenceService.resetUser();
                this.userReferenceService.resetUserAuthToken();
                return this.$q.reject(result);
            });
    }

    public logout():void {
        this.userReferenceService.resetUser();
        this.userReferenceService.resetUserAuthToken();
    }

    public loadCurrentUser():restangular.IPromise<DTO.IUser> {
        return this.restangular.one(UserService.RESOURCE_CURRENT_USER, null).get();
    }

    public isAuthorized():ng.IPromise<string> {
        var deferred = this.$q.defer();

        // is an auth token available
        if (this.isAuthDataStored()) {
            // load user data from api
            this.loadCurrentUser().then((user:DTO.IUser):void=> {
                // update existing data
                this.userReferenceService.persistUser(user);
                // mark as authorized
                deferred.resolve();
            }, (result:restangular.IResponse) => {
                // reject depending on response
                if (result.status === 401) {
                    deferred.reject(ERROR_UNAUTHORIZED);
                } else if (result.status === 419) {
                    deferred.reject(ERROR_AUTHORIZATION_EXPIRED);
                } else {
                    // default rejection reason
                    deferred.reject(ERROR_UNAUTHORIZED);
                }
            });
        } else {
            deferred.reject(ERROR_UNAUTHORIZED);
        }

        return deferred.promise;
    }

    public isAuthDataStored():boolean {
        return !_.isUndefined(this.userReferenceService.getUserAuthToken()) && !_.isUndefined(this.getCurrentUser());
    }

    public getCurrentUser():DTO.IUser {
        return this.userReferenceService.getUser();
    }
}


export class UserTargetStateService implements User.IUserTargetStateService {
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

/**
 * UserReferenceService
 * Manages the storage of user data and user auth data on the client
 */
export class UserReferenceService {
    public static COOKIE_USER = "CF_USER";
    public static COOKIE_USER_AUTH_TOKEN = "CF_USER_AUTH_TOKEN";
    private currentUser:DTO.IUser;
    private userAuthToken:string;

    setUser(user:DTO.IUser) {
        this.currentUser = user;
    }

    /**
     * Get the available user data
     * @returns {DTO.IUser} the user data or undefined if the user data is not available
     */
    getUser():DTO.IUser {
        if (_.isUndefined(this.currentUser)) {
            this.restoreUser();
        }
        return this.currentUser;
    }

    setUserAuthToken(token:string) {
        this.userAuthToken = token;
    }

    /**
     * Get the available user auth token
     * @returns {string} the user auth token or undefined if the token is not available
     */
    getUserAuthToken():string {
        if (_.isUndefined(this.userAuthToken)) {
            this.restoreUserAuthToken();
        }
        return this.userAuthToken;
    }

    private storeUser(user:DTO.IUser) {
        // remove previous cookies
        this.removeStoredUser();
        if (!_.isUndefined(user)) {
            (<any>jQuery).cookie(UserReferenceService.COOKIE_USER, JSON.stringify(user), {
                expires: 7,
                path: "/",
                secure: false
            });
        }
    }

    private storeUserAuthToken(token:string) {
        // remove previous cookies
        this.removeStoredUserAuthToken();
        if (!_.isUndefined(token)) {
            (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN, token, {
                expires: 7,
                path: "/",
                secure: false
            });
        }
    }

    private restoreUser():DTO.IUser {
        var userCookie = (<any>jQuery).cookie(UserReferenceService.COOKIE_USER);
        if (!_.isUndefined(userCookie) && userCookie.length > 0) {
            this.setUser(JSON.parse(userCookie));
            return this.getUser();
        }
        return undefined;
    }

    private restoreUserAuthToken():string {
        var tokenCookie = (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN);
        if (!_.isUndefined(tokenCookie) && tokenCookie.length > 0) {
            this.setUserAuthToken(tokenCookie);
            return this.getUserAuthToken();
        }
        return undefined;
    }


    private removeStoredUser():void {
        (<any>jQuery).cookie(UserReferenceService.COOKIE_USER, "", {expires: 7, path: "/", secure: false});
    }

    private removeStoredUserAuthToken():void {
        (<any>jQuery).cookie(UserReferenceService.COOKIE_USER_AUTH_TOKEN, "", {expires: 7, path: "/", secure: false});
    }

    /**
     * Removes user data stored on the client side
     */
    resetUser():void {
        this.currentUser = undefined;
        this.removeStoredUser();
    }

    /**
     * Removes user auth token stored on the cliend side
     */
    resetUserAuthToken():void {
        this.userAuthToken = undefined;
        this.removeStoredUserAuthToken();
    }

    /**
     * Persists user auth token on the client side
     * @param token user auth token
     */
    persistUserAuthToken(token:string):void {
        console.log("persisting user auth token");
        this.setUserAuthToken(token);
        this.storeUserAuthToken(token);
    }

    /**
     * Persists user data on the client side
     * @param user user data to persist
     */
    persistUser(user:DTO.IUser):void {
        console.log("persisting user");
        this.setUser(user);
        this.storeUser(user);
    }
}

/**
 *  UserAuthHttpInterceptor
 *  Interceptor for HTTP requests that manages the insertion and handling of auth relevant headers
 */
export class UserAuthHttpInterceptor {
    static RESOURCE_USER = "user";

    static POST_HEADER = {"Content-Type": "application/x-www-form-urlencoded"};
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

    constructor(public $rootScope, public userReferenceService:UserReferenceService, public $q, public $location) {
    }

    /**
     * Handling of failed responses
     * For responses with status 401, the user is logged out on the client and redirected to the login
     * @param response {@link https://docs.angularjs.org/api/ng/service/$http#interceptors}
     * @returns {any}
     */
    public responseError = (response) => {

        if (response.status === 401) {
            console.error("Unauthorized request");
            this.userReferenceService.resetUser();
            this.userReferenceService.resetUserAuthToken();
            this.$location.path('/login');
        }
        return this.$q.reject(response);
    };

    /**
     * Handling of successful responses
     * For responses with authentication header the containing token is stored on the client (user is logged in)
     * @param response {@link https://docs.angularjs.org/api/ng/service/$http#interceptors}
     * @returns {any}
     */
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

    /**
     * Adding the authentication token to every request if the user is logged in
     * @param config {@link https://docs.angularjs.org/api/ng/service/$http#interceptors}
     * @returns {any}
     */
    public request = (config) => {
        var token:string = this.userReferenceService.getUserAuthToken();
        if (!_.isUndefined(token) && !_.isNull(token)) {
            config.headers[UserAuthHttpInterceptor.HEADER_AUTHORIZATIONTOKEN] = UserAuthHttpInterceptor.HEADER_AUTHORIZATIONTOKEN_PREFIX + token;
        }
        return config;
    };
}


/**
 * Wrapper for usage in state resolve dependency - management
 * @param cf_common_userService
 * @returns {ng.IPromise<string>} {@link UserService.isAuthorized}
 */
export function loginRequired(cf_common_userService:User.IUserService):ng.IPromise<string> {
    return cf_common_userService.isAuthorized();
}


/**
 * AngularJS Module Definition
 */

// module dependencies
var moduleDependencies = [
    "restangular",
    "ui.router"];

// module definition
angular.module("cf.common.user", moduleDependencies)
    .service("cf_common_userService", UserService)
    .service("cf_common_userReferenceService", UserReferenceService)
    .service("cf_common_userAuthHttpInterceptor", UserAuthHttpInterceptor)
    .service("cf_common_userTargetStateService", UserTargetStateService);
