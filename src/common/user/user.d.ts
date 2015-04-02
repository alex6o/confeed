/// <reference path="../common.d.ts"/>

declare module User {

    /**
     * UserTargetStateService
     * Basic storage for states and parameters
     */
    interface IUserTargetStateService {
        /**
         * Store an single state
         * @param state
         * @param params
         */
        pushState(state, params);

        /**
         * Get the stored state
         * @returns {any} the state
         */
        pullState();

        /**
         * Get the stored parameters
         * @returns {any} the parameters
         */
        pullParams();
    }

    /**
     * User Service
     * Manages user registration and authentication
     */
    interface IUserService {

        /**
         * Process registration for provided user data
         * NOTE: the registration and login are combined on the api side, hence an successful registration requests already
         * includes the auth token in the response!
         * @param user  user data for the registration
         * @returns {restangular.IPromise<DTO.IUser>} promise of the registration result - in case of a successful user registration
         * the persisted user object is returned
         */
        signup(user:DTO.IRegisterUser):restangular.IPromise<DTO.IUser>;

        /**
         * Login the user with the provided credentials
         * @param user  the authentication credentials
         * @returns {restangular.IPromise<DTO.IUser>}   promise containing the persisted user information
         */
        login(user:DTO.ILoginUser):restangular.IPromise<DTO.IUser>;


        /**
         * Logout the user on client side
         */
        logout():void;

        /**
         * Load the user information using the stored auth token
         * @returns {restangular.IPromise<DTO.IUser>}  promise containing the persisted user information
         */
        loadCurrentUser():restangular.IPromise<DTO.IUser>;

        /**
         * Check if the stored user auth token is valid
         * @returns {ng.IPromise<string>} if the returned promise is resolved the user is authorized otherwise in case
         * of rejection the user is <code>ERROR_UNAUTHORIZED</code> or <code>ERROR_AUTHORIZATION_EXPIRED</code>
         */
        isAuthorized():ng.IPromise<string>;

        /**
         * Check if auth data is stored on the client
         * @returns {boolean}
         */
        isAuthDataStored():boolean;

        /**
         * Get the user data stored on the client side
         * @returns {DTO.IUser} the user data
         */
        getCurrentUser():DTO.IUser;
    }

}
