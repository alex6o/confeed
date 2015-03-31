/// <reference path="../user.d.ts"/>

declare module cf {

    /**
     * Controller for User Signup
     */
    interface ISignupCtrl extends IBaseCtrl {

        /**
         * Handle form submission of a new user
         * @param form  the instance of the signup-form
         * @param user  the user instance containing the data for registration
         */
        onClickSubmit(form:ng.IFormController, user:DTO.IRegisterUser): void;
    }

    interface ISignupScope extends IBaseScope {
        user: DTO.IRegisterUser;
        error: string;
    }
}
