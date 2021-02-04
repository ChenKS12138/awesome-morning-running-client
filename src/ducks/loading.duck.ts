import { Duck, reduceFromPayload } from '@/utils/duck';
import { fork, put, call, takeEvery, select, delay } from 'redux-saga/effects';

export default class PageDuck extends Duck {
  get quickTypes() {
    enum Types {
      WAIT,
      DONE,

      SET_SEMAPHORE,
      SET_IS_LOADING,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      semaphore(state = 0, action: { type: string; payload: number }) {
        if (action.type === types.SET_SEMAPHORE) {
          return state + action.payload;
        }
        return state;
      },
      isLoading: reduceFromPayload(types.SET_IS_LOADING, false),
    };
  }
  *saga() {
    yield fork([this, this.watchLoaingSemephoreChange]);
  }
  *watchLoaingSemephoreChange() {
    const { types, selectors } = this;
    yield takeEvery([types.WAIT], function* () {
      yield put({ type: types.SET_SEMAPHORE, payload: 1 });
    });
    yield takeEvery([types.DONE], function* () {
      yield put({ type: types.SET_SEMAPHORE, payload: -1 });
    });
    yield takeEvery([types.SET_SEMAPHORE], function* (action: { payload: number }) {
      const { semaphore } = selectors(yield select());
      const prevSemaphore = semaphore - action.payload;
      if (prevSemaphore === 0 && semaphore === 1) {
        wx.showLoading({
          title: '加载中',
        });
        yield put({ type: types.SET_IS_LOADING, payload: true });
      } else if (prevSemaphore === 1 && semaphore === 0) {
        yield delay(500);
        wx.hideLoading();
        yield put({ type: types.SET_IS_LOADING, payload: false });
      }
    } as any);
  }
  call = (...callArgs) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const loadingDuck = this;
    return (function* () {
      yield put({ type: loadingDuck.types.WAIT });
      try {
        return yield (call as any)(...callArgs);
      } finally {
        yield put({ type: loadingDuck.types.DONE });
      }
    })();
  };
}
