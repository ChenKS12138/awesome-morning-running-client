import { Duck } from '@/utils/duck';
import { fork } from 'redux-saga/effects';
import { enchanceTakeLatest as takeLatest } from '@/utils/effects';

export default class RouterDuck extends Duck {
  get quickTypes() {
    enum Types {
      REDIRECT_TO,
    }
    return {
      ...Types,
    };
  }
  *saga() {
    yield fork([this, this.watchToRedirect]);
  }
  *watchToRedirect() {
    const { types } = this;
    yield takeLatest([types.REDIRECT_TO], function* (action) {
      const { url } = action.payload;
      yield wx.redirectTo({
        url,
      });
    });
  }
}
