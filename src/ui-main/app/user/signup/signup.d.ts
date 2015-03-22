/// <reference path="../user.d.ts"/>

declare module cf {

  interface ISignupScope extends IBaseScope {
    user: DTO.IRegisterUser;
    errors: Array<string>;
  }
}
