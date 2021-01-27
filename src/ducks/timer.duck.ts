import { Duck, reduceFromPayload, createToPayload } from '@/utils/duck';
import { select, take, put, fork, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

export default class TimerDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_SECONDS,
      SET_IS_ACTIVE,

      ACTIVATE,
      DEACTIVATE,
      RESET,

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
  get creators() {
    const { types } = this;
    return {
      setSeconds: createToPayload<number>(types.SET_SECONDS),
    };
  }
  *saga() {
    yield fork([this, this.watchToChangeSecond]);
    yield fork([this, this.watchToChangeStatus]);
  }
  *watchToChangeStatus() {
    const { types } = this;
    yield takeLatest([types.ACTIVATE], function* () {
      yield put({ type: types.SET_IS_ACTIVE, payload: true });
    });

    yield takeLatest([types.DEACTIVATE], function* () {
      yield put({ type: types.SET_IS_ACTIVE, payload: false });
    });
  }
  *watchToChangeSecond() {
    const { types, selectors, createTimerChannel, creators } = this;
    yield takeLatest([types.SET_IS_ACTIVE], function* () {
      const { seconds } = selectors(yield select());
      const timerChannel = createTimerChannel(seconds);
      while (true) {
        const { isActive } = selectors(yield select());
        if (!isActive) {
          break;
        } else {
          const nextSeconds = yield take(timerChannel);
          yield put(creators.setSeconds(nextSeconds));
          yield put({
            type: types.PULSE,
          });
        }
      }
    });
    yield takeLatest([types.RESET], function* () {
      yield put({ type: types.SET_SECONDS, payload: 0 });
    });
  }
  createTimerChannel(initSeconds: number) {
    return eventChannel((emit) => {
      let second = initSeconds;
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
