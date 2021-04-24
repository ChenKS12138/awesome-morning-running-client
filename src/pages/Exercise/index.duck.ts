import { reduceFromPayload, createToPayload, Duck } from '@/utils/duck';
import { LocationDuck, TimerDuck, LoadingDuck, RouterDuck, ScanCodeDuck } from '@/ducks';
import { parseSecondTime, matcher, showModal, parseQrCodeSence } from '@/utils';
import { EXERCISE_STATUS, CHECK_IN_STATUS, VALID_SCENE_EVENT, VALID_SCENE_TYPE } from '@/utils/constants';
import { put, select, fork } from 'redux-saga/effects';
import { IUserInfo, ICheckInToday } from '@/utils/interface';
import {
  requestUserInfo,
  requestCheckInToday,
  requestCheckInMotion,
  requestCheckInStart,
  requestCheckInEnd,
} from '@/utils/model';
import { waitForModalHidden, enchanceTakeLatest as takeLatest } from '@/utils/effects';
import { getSearchParams } from 'rax-app';

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
      todayCheckIn: reduceFromPayload<ICheckInToday | null>(types.SET_TODAY_CHECK_IN, null),
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
          const { startAt, endAt } = state.todayCheckIn.checkIn || { startAt: 0, endAt: 0 };
          if (endAt !== null) {
            return parseSecondTime(Math.round((endAt - startAt) / 1000));
          }
        }
        return parseSecondTime(0);
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
      loading: LoadingDuck,
      router: RouterDuck,
      scanCode: ScanCodeDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToFetchUserInfo]);
    yield fork([this, this.watchUsedTimeToChangeExerciseStatus]);
    yield fork([this, this.watchMotionToSendMotion]);
    yield fork([this, this.watchToLoadFinishPage]);
    yield fork([this, this.watchToFetchCheckInEnd]);
    yield fork([this, this.watchPageReload]);
    yield fork([this, this.watchExerciseStatus]);
    yield fork([this, this.watchTimePluse]);
  }
  *watchPageReload() {
    const duck = this;
    const { types, ducks } = duck;
    yield takeLatest([types.PAGE_RELOAD], function* () {
      yield put({ type: types.FETCH_USER_INFO });
      const scene = parseQrCodeSence(getSearchParams()?.scene as string | undefined);
      if (scene?.event === VALID_SCENE_EVENT.CHECK_IN && scene?.type === VALID_SCENE_TYPE.END) {
        yield put({ type: types.FETCH_CHECKIN_END });
      } else {
        try {
          const todayCheckIn: ICheckInToday | null = yield ducks.loading.call(requestCheckInToday);
          if (todayCheckIn?.checkIn?.status === CHECK_IN_STATUS.IN_TIME_FINISH) {
            yield put({ type: types.SET_EXERCISE_STATUS, payload: EXERCISE_STATUS.FINISH });
          } else if (todayCheckIn?.checkIn?.status === CHECK_IN_STATUS.OVERTIME_FINISH) {
            showModal({
              title: '超时',
              content: '今日跑操超时!',
              showCancel: false,
            });
            throw new Error('今日跑操超时!');
          } else {
            if (!todayCheckIn?.checkIn) {
              if (scene?.event === VALID_SCENE_EVENT.CHECK_IN && scene?.type === VALID_SCENE_TYPE.START) {
                yield ducks.loading.call(requestCheckInStart);
              } else {
                yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url: '/pages/Home/index' } });
              }
            }
            yield put({
              type: types.SET_START_AT,
              payload: todayCheckIn?.checkIn?.startAt ?? Date.now(),
            });
            yield put({ type: ducks.timer.types.ACTIVATE });
          }
        } catch (_e) {
          yield waitForModalHidden();
          yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url: '/pages/Home/index' } });
        }
      }
    });
  }
  *watchToLoadFinishPage() {
    const { types, ducks } = this;
    yield takeLatest([types.LOAD_FINISH_PAGE], function* () {
      const todayCheckIn: ICheckInToday = yield ducks.loading.call(requestCheckInToday);
      yield put({
        type: types.SET_TODAY_CHECK_IN,
        payload: todayCheckIn,
      });
      yield put({
        type: types.SET_MOTION,
        payload: todayCheckIn?.checkIn?.motion,
      });
      yield put({
        type: ducks.location.types.FETCH_LOCATION,
      });
    });
  }
  *watchExerciseStatus() {
    const { types, ducks } = this;
    yield takeLatest([types.SET_EXERCISE_STATUS], function* (action: any) {
      const exerStatus: EXERCISE_STATUS = action.payload;
      if (exerStatus === EXERCISE_STATUS.FINISH) {
        yield put({ type: ducks.timer.types.DEACTIVATE });
        yield put({ type: types.LOAD_FINISH_PAGE });
      }
    });
  }
  *watchTimePluse() {
    const { types, ducks, selectors } = this;
    yield takeLatest([ducks.timer.types.PULSE], function* () {
      yield put({
        type: ducks.location.types.FETCH_LOCATION,
      });
      const now = Date.now();
      const { startAt } = selectors(yield select());
      const duration = Math.round((now - startAt) / 1000);
      yield put({
        type: types.SET_USED_TIME,
        payload: duration,
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
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_CHECKIN_END], function* () {
      try {
        const checkIn: ICheckInToday = yield ducks.loading.call(requestCheckInEnd);
        if (checkIn?.checkIn?.status === CHECK_IN_STATUS.OVERTIME_FINISH) {
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
        yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url: '/pages/Home/index' } });
      }
    });
  }
  *watchToFetchUserInfo() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_USER_INFO], function* () {
      const userInfo: IUserInfo = yield ducks.loading.call(requestUserInfo);
      yield put({
        type: types.SET_USER_INFO,
        payload: userInfo,
      });
    });
  }
  *watchMotionToSendMotion() {
    const { types, selectors, ducks } = this;
    yield takeLatest([types.SET_MOTION], function* () {
      const { motion, todayCheckIn } = selectors(yield select());
      if (todayCheckIn?.checkIn?.id) {
        yield ducks.loading.call(requestCheckInMotion, { motion, checkInID: todayCheckIn?.checkIn?.id });
      }
    });
  }
}
