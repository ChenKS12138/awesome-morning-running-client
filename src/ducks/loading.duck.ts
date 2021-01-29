import { Duck, reduceFromPayload } from '@/utils/duck';
import { takeLatest, fork, select, put, delay } from 'redux-saga/effects';

export default class PageDuck extends Duck {
  get quickTypes() {
    enum Types {
      WAIT,
      DONE,

      SET_SEMAPHORE,
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
      semaphore: reduceFromPayload(types.SET_SEMAPHORE, 0),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      isLoading: (state: State) => state.semaphore > 0,
    };
  }
  *saga() {
    yield fork([this, this.watchLoaingSemephoreChange]);
  }
  *watchLoaingSemephoreChange() {
    const { types, selectors } = this;
    yield takeLatest([types.WAIT], function* () {
      const { semaphore } = selectors(yield select());
      if (semaphore === 0) {
        wx.showLoading({
          title: '加载中',
        });
      }
      yield put({ type: types.SET_SEMAPHORE, payload: semaphore + 1 });
    });
    yield takeLatest([types.DONE], function* () {
      const { semaphore } = selectors(yield select());
      if (semaphore === 1) {
        yield delay(500);
        wx.hideLoading();
      }
      yield put({ type: types.SET_SEMAPHORE, payload: semaphore - 1 });
    });
  }
}
