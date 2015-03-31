/// <reference path="../common/common.d.ts" />

declare module cf {
  interface IBaseCtrl {
  }

  interface IBaseScope extends ng.IScope {
    vm: IBaseCtrl;
  }
}
