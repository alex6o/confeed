/// <reference path="../user.d.ts"/>

declare module cf {

    /**
     * Controller for Login
     */
    interface ILoginCtrl extends IBaseCtrl {
        /**
         * Submit the login credentials
         * @param form  instance of the login form
         * @param user  the login credentials
         */
        onClickLogin(form:ng.IFormController, user:DTO.ILoginUser):void;
    }

    interface ILoginScope extends IBaseScope {
        user: DTO.ILoginUser;
        error: string;
    }
}
