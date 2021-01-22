import { Duck, reduceFromPayload, createToPayload } from '@/utils/duck';
import { LocationDuck } from '@/ducks';
import { parseSecondTime, matcher } from '@/utils';
import { EXERCISE_STATUS } from './index.constants';
import TimerDuck from '@/ducks/timer.duck';
import { put, select, fork, takeLatest, call, delay } from 'redux-saga/effects';
import { IUserInfo, ICheckIn } from '@/utils/interface';
import {
  requestUserInfo,
  requestCheckInToday,
  requestCheckInMotion,
  requestCheckInStart,
  requestCheckInEnd,
} from '@/utils/model';
import { waitForModalHidden } from '@/utils/effects';

export default class ExerciseDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_USED_TIME,
      SET_EXERCISE_STATUS,
      SET_MOTION,
      SET_TODAY_RANK,
      SET_TODAY_TIME_COST,
      SET_TODAY_PACE,
      SET_START_AT,
      SET_USER_INFO,
      SET_TODAY_CHECK_IN,

      FETCH_USER_INFO,

      EXEC_START,
      EXEC_FINISH,
    }
    return {
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      usedTime: reduceFromPayload<number>(types.SET_USED_TIME, 0),
      exerciseStatus: reduceFromPayload<EXERCISE_STATUS>(types.SET_EXERCISE_STATUS, EXERCISE_STATUS.RUNNING_GREEN),
      motion: reduceFromPayload<string>(types.SET_MOTION, ''),
      todayPace: reduceFromPayload(types.SET_TODAY_PACE, 453),

      startAt: reduceFromPayload<number>(types.SET_START_AT, Date.now()),
      userInfo: reduceFromPayload<IUserInfo | null>(types.SET_USER_INFO, null),
      todayCheckIn: reduceFromPayload<ICheckIn | null>(types.SET_TODAY_CHECK_IN, null),
    };
  }
  get creators() {
    const { types } = this;
    return {
      setMotion: createToPayload(types.SET_MOTION),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      parsedUsedTime: (state: State) => parseSecondTime(state.usedTime),
      parsedAverageTime: (state: State) => parseSecondTime(state.userInfo?.averageCostSecond ?? 0),
      totalCount: (state: State) => state.userInfo?.totalCount ?? 0,
      currentCount: (state: State) => state.userInfo?.currentCount ?? 0,
      parsedTodayTimeCost: (state: State) => {
        if (state.todayCheckIn) {
          const { startAt, endAt } = state.todayCheckIn;
          return parseSecondTime(Math.round((endAt - startAt) / 1000));
        } else {
          return parseSecondTime(0);
        }
      },
      todayRank: (state: State) => state.todayCheckIn?.rank,
      parsedTodayPace: (state: State) => parseSecondTime(state.todayPace),
    };
  }
  get quickDucks() {
    return {
      location: LocationDuck,
      timer: TimerDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToStartRunning]);
    yield fork([this, this.watchToStopRunning]);
    yield fork([this, this.watchToChangeByPluse]);
    yield fork([this, this.watchToFetchUserInfo]);
    yield fork([this, this.watchToChangeExerciseStatus]);
    yield fork([this, this.watchToSendMotionChange]);
  }
  *watchToStartRunning() {
    const { types, ducks } = this;
    yield takeLatest([types.EXEC_START], function* () {
      try {
        yield call(requestCheckInStart);
        yield put({ type: ducks.timer.types.EXEC_ACTIVATE });
        yield put({ type: types.FETCH_USER_INFO });
      } catch (_err) {
        yield waitForModalHidden();
        wx.redirectTo({
          url: '/pages/Home/index',
        });
      }
    });
  }
  *watchToStopRunning() {
    const { types, ducks, creators } = this;
    yield takeLatest([types.EXEC_FINISH], function* () {
      yield put({
        type: ducks.timer.types.EXEC_DEACTIVATE,
      });
      yield put({ type: types.SET_EXERCISE_STATUS, payload: EXERCISE_STATUS.FINISH });

      const checkIn = yield call(requestCheckInEnd);
      if (checkIn) {
        const todayCheckIn: ICheckIn = yield call(requestCheckInToday);
        yield put(creators.setMotion(todayCheckIn.motion));
        yield put({
          type: types.SET_TODAY_CHECK_IN,
          payload: todayCheckIn,
        });
      } else {
        console.log('fail check in end');
      }
    });
  }
  *watchToFetchUserInfo() {
    const { types } = this;
    yield takeLatest([types.FETCH_USER_INFO], function* () {
      const userInfo: IUserInfo = yield requestUserInfo();
      yield put({
        type: types.SET_USER_INFO,
        payload: userInfo,
      });
    });
  }
  *watchToChangeByPluse() {
    const { types, ducks, selectors } = this;
    yield takeLatest([ducks.timer.types.PULSE], function* () {
      const now = Date.now();
      const { startAt } = selectors(yield select());
      const duration = Math.round((now - startAt) / 1000);
      yield put({
        type: types.SET_USED_TIME,
        payload: duration,
      });
    });
    yield takeLatest([ducks.timer.types.PULSE], function* () {
      yield put({
        type: ducks.location.types.FETCH_LOCATION,
      });
    });
  }
  *watchToChangeExerciseStatus() {
    const { types } = this;
    yield takeLatest([types.SET_USED_TIME], function* (action: any) {
      const usedSecond: number = action.payload;
      const nextStatus = matcher([
        {
          condition: (seconds) => seconds <= 360,
          handler: EXERCISE_STATUS.RUNNING_GREEN,
        },
        {
          condition: (seconds) => seconds <= 540,
          handler: EXERCISE_STATUS.RUNNING_ORANGE,
        },
        {
          condition: (second) => second <= 600,
          handler: EXERCISE_STATUS.RUNNING_RED,
        },
        {
          condition: () => true,
          handler: EXERCISE_STATUS.OEVERTIME,
        },
      ])(usedSecond);
      yield put({
        type: types.SET_EXERCISE_STATUS,
        payload: nextStatus,
      });
    });
  }
  *watchToSendMotionChange() {
    const { types, selectors } = this;
    yield takeLatest([types.SET_MOTION], function* () {
      const { motion, todayCheckIn } = selectors(yield select());
      if (todayCheckIn?.id) {
        yield requestCheckInMotion({ motion, checkInID: todayCheckIn?.id });
      }
    });
  }
}
