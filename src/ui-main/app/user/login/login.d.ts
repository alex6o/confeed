/// <reference path="../user.d.ts"/>

declare module cf {
  interface ILoginScope extends IBaseScope {
    user: DTO.ILoginUser;
    error: string;
  }
}
