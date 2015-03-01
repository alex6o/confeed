/// <reference path="../common.d.ts"/>

declare module User {
  interface UserTargetStateService {
    pushState(state, params);
    pullState();
    pullParams();
  }
}
