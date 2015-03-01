/// <reference path="../common/common.d.ts" />

declare module cf {
  interface IBaseController { }

  interface IBaseScope extends ng.IScope {
    vm: IBaseController;
  }
}
