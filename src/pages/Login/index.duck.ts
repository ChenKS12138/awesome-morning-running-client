import { reduceFromPayload, createToPayload, Duck } from '@/utils/duck';
import { getWxCode } from '@/utils';
import { select, fork, put } from 'redux-saga/effects';

import * as model from '@/utils/model';
import { LoadingDuck, RouterDuck, TimerDuck } from '@/ducks';
import { enchanceTakeLatest as takeLatest } from '@/utils/effects';
import BindByPasswordFormDuck from './ducks/bindByPasswordForm.duck';
import BindBySmsFormDuck from './ducks/bindBySmsForm.duck';
import { BIND_TYPE } from '@/utils/constants';

export default class LoginDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_BIND_TYPE,
      FETCH_USER_BIND,
      BIND_BY_PASSWORD,
      BIND_BY_SMS,

      SEND_SMS,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      bindType: reduceFromPayload<BIND_TYPE>(types.SET_BIND_TYPE, BIND_TYPE.BIND_BY_SMS),
    };
  }
  get creators() {
    const { types } = this;
    return {
      setBindType: createToPayload<BIND_TYPE>(types.SET_BIND_TYPE),
    };
  }
  get quickDucks() {
    return {
      loading: LoadingDuck,
      router: RouterDuck,
      bindByPasswordForm: BindByPasswordFormDuck,
      bindBySmsForm: BindBySmsFormDuck,
      timer: TimerDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToBindByPassword]);
    yield fork([this, this.watchToBindBySms]);
    yield fork([this, this.watchTimerPause]);
    yield fork([this, this.watchToSendSms]);
  }
  *watchToBindByPassword() {
    const { types, ducks } = this;
    yield takeLatest([types.BIND_BY_PASSWORD], function* () {
      const { data, isValid } = ducks.bindByPasswordForm.selectors(yield select());
      if (isValid) {
        const code = yield getWxCode();
        const result = yield ducks.loading.call(model.requestUserBindByPassword, { ...data, wxLoginCode: code });
        if (result) {
          yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url: '/pages/Home/index' } });
        }
      }
    });
  }
  *watchToBindBySms() {
    const { types, ducks } = this;
    yield takeLatest([types.BIND_BY_SMS], function* () {
      const { data, isValid } = ducks.bindBySmsForm.selectors(yield select());
      if (isValid) {
        const code = yield getWxCode();
        const result = yield ducks.loading.call(model.requestUserBindBySms, { ...data, wxLoginCode: code });
        if (result) {
          yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url: '/pages/Home/index' } });
        }
      }
    });
  }
  *watchToSendSms() {
    const { types, ducks } = this;
    yield takeLatest([types.SEND_SMS], function* () {
      const {
        data: { phone },
      } = ducks.bindBySmsForm.selectors(yield select());
      if (phone?.length) {
        const result = yield model.requestUserSendSms(phone);
        if (result) {
          yield put({
            type: ducks.timer.types.RESET,
          });
          yield put({ type: ducks.timer.types.ACTIVATE });
        }
      }
    });
  }
  *watchTimerPause() {
    const { ducks } = this;
    yield takeLatest([ducks.timer.types.PULSE], function* () {
      const { seconds } = ducks.timer.selectors(yield select());
      if (seconds >= 60) {
        yield put({
          type: ducks.timer.types.DEACTIVATE,
        });
      }
    });
  }
}
