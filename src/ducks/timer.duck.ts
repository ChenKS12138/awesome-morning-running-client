import { Duck, reduceFromPayload } from '@/utils/duck';
import { select, take, put, fork, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

export default class TimerDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_SECONDS,
      SET_IS_ACTIVE,

      EXEC_ACTIVATE,
      EXEC_DEACTIVATE,
      EXEC_RESET,

      PULSE,
    }
    return {
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      seconds: reduceFromPayload<number>(types.SET_SECONDS, 0),
      isActive: reduceFromPayload<boolean>(types.SET_IS_ACTIVE, false),
    };
  }
  *saga() {
    yield fork([this, this.watchToChangeSecond]);
    yield fork([this, this.watchToChangeStatus]);
  }
  *watchToChangeStatus() {
    const { types } = this;
    yield takeLatest([types.EXEC_ACTIVATE], function* () {
      yield put({ type: types.SET_IS_ACTIVE, payload: true });
    });

    yield takeLatest([types.EXEC_DEACTIVATE], function* () {
      yield put({ type: types.SET_IS_ACTIVE, payload: false });
    });
  }
  *watchToChangeSecond() {
    const { types, selectors, createTimerChannel } = this;
    yield takeLatest([types.SET_IS_ACTIVE], function* () {
      const timerChannel = createTimerChannel();
      while (true) {
        const { isActive } = selectors(yield select());
        if (!isActive) {
          break;
        } else {
          const seconds = yield take(timerChannel);
          yield put({
            type: types.SET_SECONDS,
            payload: seconds,
          });
          yield put({
            type: types.PULSE,
          });
        }
      }
    });
    yield takeLatest([types.EXEC_RESET], function* () {
      yield put({ type: types.SET_SECONDS, payload: 0 });
    });
  }
  createTimerChannel() {
    return eventChannel((emit) => {
      let second = 0;
      emit(second);
      const t = setInterval(() => {
        second += 1;
        emit(second);
      }, 1000);
      return () => {
        clearInterval(t);
      };
    });
  }
}
