import { reduceFromPayload, createToPayload, Duck } from '@/utils/duck';
import { LocationDuck, TimerDuck } from '@/ducks';
import { parseSecondTime, matcher, showModal } from '@/utils';
import { EXERCISE_STATUS, CHECK_IN_STATUS } from '@/utils/constants';
import { put, select, fork, call } from 'redux-saga/effects';
import { IUserInfo, ICheckIn } from '@/utils/interface';
import {
  requestUserInfo,
  requestCheckInToday,
  requestCheckInMotion,
  requestCheckInStart,
  requestCheckInEnd,
} from '@/utils/model';
import { waitForModalHidden, enchanceTakeLatest as takeLatest } from '@/utils/effects';

export default class ExerciseDuck extends Duck {
  get quickTypes() {
    enum Types {
      PAGE_RELOAD,
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
      FETCH_CHECKIN_END,

      LOAD_FINISH_PAGE,
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
      ...super.creators,
      setMotion: createToPayload(types.SET_MOTION),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      ...super.rawSelectors,
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
      ...super.quickDucks,
      location: LocationDuck,
      timer: TimerDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchPluseToChangeDurationAndLocation]);
    yield fork([this, this.watchToFetchUserInfo]);
    yield fork([this, this.watchUsedTimeToChangeExerciseStatus]);
    yield fork([this, this.watchMotionToSendMotion]);
    yield fork([this, this.watchToLoadFinishPage]);
    yield fork([this, this.watchToFetchCheckInEnd]);
    yield fork([this, this.watchPageReload]);
  }
  *watchPageReload() {
    const duck = this;
    const { types, ducks } = duck;
    yield takeLatest([types.PAGE_RELOAD], function* () {
      try {
        const todayCheckIn: ICheckIn | null = yield call(requestCheckInToday);
        if (todayCheckIn?.status === CHECK_IN_STATUS.IN_TIME_FINISH) {
          yield put({ type: types.SET_EXERCISE_STATUS, payload: EXERCISE_STATUS.FINISH });
        } else {
          if (!todayCheckIn) {
            yield call(requestCheckInStart);
          }
          yield put({
            type: types.SET_START_AT,
            payload: todayCheckIn?.startAt ?? Date.now(),
          });
          yield put({ type: ducks.timer.types.ACTIVATE });
        }
      } catch (_e) {
        yield waitForModalHidden();
        wx.redirectTo({
          url: '/pages/Home/index',
        });
      }
    });
    yield takeLatest([types.PAGE_RELOAD], function* () {
      yield put({ type: types.FETCH_USER_INFO });
    });
  }
  *watchToLoadFinishPage() {
    const { types, ducks } = this;
    yield takeLatest([types.LOAD_FINISH_PAGE], function* () {
      const todayCheckIn: ICheckIn = yield call(requestCheckInToday);
      yield put({
        type: types.SET_TODAY_CHECK_IN,
        payload: todayCheckIn,
      });
      yield put({
        type: types.SET_MOTION,
        payload: todayCheckIn.motion,
      });
      yield put({
        type: ducks.location.types.FETCH_LOCATION,
      });
    });
    yield takeLatest([types.SET_EXERCISE_STATUS], function* (action: any) {
      const exerStatus: EXERCISE_STATUS = action.payload;
      if (exerStatus === EXERCISE_STATUS.FINISH) {
        yield put({ type: ducks.timer.types.DEACTIVATE });
        yield put({ type: types.LOAD_FINISH_PAGE });
      }
    });
  }
  *watchPluseToChangeDurationAndLocation() {
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
  *watchUsedTimeToChangeExerciseStatus() {
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
          condition: (seconds) => seconds <= 600,
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
  *watchToFetchCheckInEnd() {
    const { types } = this;
    yield takeLatest([types.FETCH_CHECKIN_END], function* () {
      try {
        const checkIn: ICheckIn = yield call(requestCheckInEnd);
        if (checkIn?.status === CHECK_IN_STATUS.OVERTIME_FINISH) {
          showModal({
            title: '超时',
            content: '今日跑操超时!',
            showCancel: false,
          });
          throw new Error('今日跑操超时!');
        } else {
          yield put({ type: types.FETCH_USER_INFO });
          yield put({
            type: types.SET_EXERCISE_STATUS,
            payload: EXERCISE_STATUS.FINISH,
          });
        }
      } catch (_e) {
        yield waitForModalHidden();
        wx.redirectTo({
          url: '/pages/Home/index',
        });
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
  *watchMotionToSendMotion() {
    const { types, selectors } = this;
    yield takeLatest([types.SET_MOTION], function* () {
      const { motion, todayCheckIn } = selectors(yield select());
      if (todayCheckIn?.id) {
        yield requestCheckInMotion({ motion, checkInID: todayCheckIn?.id });
      }
    });
  }
}
