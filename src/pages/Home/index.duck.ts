import { createToPayload, reduceFromPayload, Duck } from '@/utils/duck';
import { distributeRunningRecord, getUserAvatarUri, getUriBase64Encode, parseSecondTime } from '@/utils';
import { put, fork, all, select, call } from 'redux-saga/effects';
import { RUNNING_RECORD_DISPLAY_MODAL } from '@/utils/constants';
import {
  requestUserInfo,
  requestUserAvatar,
  requestCheckInRankToday,
  requestUserHistory,
  requestCheckInHistory,
  requestCheckInLike,
  requestUserUnbind,
  requestCheckInToday,
} from '@/utils/model';
import { IUserInfo, ICheckIn, IRankToday, ISemesterCheckIn, RunningRecord } from '@/utils/interface';
import { LoadingDuck } from '@/ducks';
import { enchanceTakeLatest as takeLatest } from '@/utils/effects';

export default class HomeDuck extends Duck {
  get quickTypes() {
    enum Types {
      PAGE_RELOAD,

      SET_SHOW_RANK_LIST,
      SET_SHOW_HISTORY_RECORD,
      SET_RANK_LIST,
      SET_HISTORY_RECORD,
      SET_RUNNING_RECORD_DISPLAY_MODE,
      SET_RUNNING_RECORD,
      SET_USER_INFO,

      SHOW_RANK_LIST,
      SHOW_HISTORY_RECORD,
      HIDE_MODAL,
      TOGGLE_DISPLAY_MODE,

      FETCH_USER_INFO,
      FETCH_CHECK_IN_RANK_TODAY,
      FETCH_USER_HISTORY,
      SEND_USER_AVATAR,
      FETCH_CHECK_IN_HISTORY,
      SEND_LIKE_CHECK_IN,
      SEND_USER_UNBIND,
      SET_CHECK_IN_TODAY,
      FETCH_CHECK_IN_TODAY,
    }
    return {
      ...super.quickTypes,
      ...Types,
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      setShowRankList: createToPayload<boolean>(types.SET_SHOW_RANK_LIST),
      setShowHistoryRecord: createToPayload<boolean>(types.SET_SHOW_HISTORY_RECORD),
    };
  }
  get reducers() {
    const { types } = this;
    return {
      ...super.reducers,
      userInfo: reduceFromPayload<IUserInfo | null>(types.SET_USER_INFO, null),
      showRankList: reduceFromPayload<boolean>(types.SET_SHOW_RANK_LIST, false),
      showHistoryRecord: reduceFromPayload<boolean>(types.SET_SHOW_HISTORY_RECORD, false),
      rankList: reduceFromPayload<IRankToday[]>(types.SET_RANK_LIST, []),
      historyRecord: reduceFromPayload<ISemesterCheckIn[]>(types.SET_HISTORY_RECORD, []),
      runningRecordDisplayMode: reduceFromPayload<RUNNING_RECORD_DISPLAY_MODAL>(
        types.SET_RUNNING_RECORD_DISPLAY_MODE,
        RUNNING_RECORD_DISPLAY_MODAL.GRID,
      ),
      runningRecord: reduceFromPayload<RunningRecord[]>(types.SET_RUNNING_RECORD, []),
      todayCheckIn: reduceFromPayload<ICheckIn | null>(types.SET_CHECK_IN_TODAY, null),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      ...super.rawSelectors,
      distributedRunningRecords: (state: State) => distributeRunningRecord(state.runningRecord),
      totalRunningCount: (state: State) => state.userInfo?.totalCount,
      currentRunningCount: (state: State) => state.userInfo?.currentCount,
      compensatoryCount: (state: State) => state.userInfo?.compensateCount,
      ranking: (state: State) => state.userInfo?.rank,
      speed: (state: State) => state.userInfo?.averageCostSecond,
    };
  }
  get quickDucks() {
    return {
      ...super.quickDucks,
      loading: LoadingDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToShowRankList]);
    yield fork([this, this.watchToShowHistoryRecord]);
    yield fork([this, this.watchToHideModal]);
    yield fork([this, this.watchToToggleRecordDisplayMode]);
    yield fork([this, this.watchToFetchUserInfo]);
    yield fork([this, this.watchToSendUserAvatar]);
    yield fork([this, this.watchToFetchRankToday]);
    yield fork([this, this.watchToFetchCheckInHistory]);
    yield fork([this, this.watchToLikeCheckIn]);
    yield fork([this, this.watchToFetchUserHistory]);
    yield fork([this, this.watchToLoadPage]);
    yield fork([this, this.watchToUnbindUser]);
    yield fork([this, this.watchToFetchCheckInToday]);
  }
  *watchToLoadPage() {
    const { types } = this;
    yield takeLatest([types.PAGE_RELOAD], function* () {
      yield put({ type: types.FETCH_USER_INFO });
      yield put({ type: types.FETCH_CHECK_IN_HISTORY });
    });
  }
  *watchToShowRankList() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_RANK_LIST], function* () {
      yield put(creators.setShowRankList(true));
      yield all([put({ type: types.FETCH_CHECK_IN_RANK_TODAY }), put({ type: types.FETCH_CHECK_IN_TODAY })]);
    });
  }
  *watchToShowHistoryRecord() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_HISTORY_RECORD], function* () {
      yield put(creators.setShowHistoryRecord(true));
      yield put({ type: types.FETCH_USER_HISTORY });
    });
  }
  *watchToHideModal() {
    const { types, creators } = this;
    yield takeLatest([types.HIDE_MODAL], function* () {
      yield all([put(creators.setShowHistoryRecord(false)), put(creators.setShowRankList(false))]);
    });
  }
  *watchToToggleRecordDisplayMode() {
    const { types, selectors } = this;
    yield takeLatest([types.TOGGLE_DISPLAY_MODE], function* () {
      const { runningRecordDisplayMode } = selectors(yield select());
      yield put({
        type: types.SET_RUNNING_RECORD_DISPLAY_MODE,
        payload:
          runningRecordDisplayMode === RUNNING_RECORD_DISPLAY_MODAL.GRID
            ? RUNNING_RECORD_DISPLAY_MODAL.LIST
            : RUNNING_RECORD_DISPLAY_MODAL.GRID,
      });
    });
  }
  *watchToFetchUserInfo() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_USER_INFO], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        const userInfo: IUserInfo = yield call(requestUserInfo);
        yield put({ type: types.SET_USER_INFO, payload: userInfo });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
  *watchToSendUserAvatar() {
    const { types } = this;
    yield takeLatest([types.SEND_USER_AVATAR], function* () {
      const avatarUri = yield getUserAvatarUri();
      const base64String = yield getUriBase64Encode(avatarUri);
      yield call(requestUserAvatar, { avatarBase64Encode: base64String });
    });
  }
  *watchToFetchRankToday() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_CHECK_IN_RANK_TODAY], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        const checkIns: IRankToday[] = yield call(requestCheckInRankToday);
        yield put({
          type: types.SET_RANK_LIST,
          payload: checkIns ?? [],
        });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
  *watchToFetchUserHistory() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_USER_HISTORY], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        const semesterCheckIns: ISemesterCheckIn[] = yield call(requestUserHistory);
        yield put({ type: types.SET_HISTORY_RECORD, payload: semesterCheckIns ?? [] });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
  *watchToFetchCheckInHistory() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_CHECK_IN_HISTORY], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        const checkIns: ICheckIn[] = (yield call(requestCheckInHistory)) ?? [];
        const runningRecords: RunningRecord[] = checkIns.map((checkIn) => {
          const [year, month, day] = checkIn.dateTag.split('-');
          const duration = parseSecondTime((checkIn.endAt - checkIn.startAt) / 1000);
          return {
            mood: checkIn.motion,
            year: Number.parseInt(year, 10),
            month: Number.parseInt(month, 10),
            day: Number.parseInt(day, 10),
            ranking: checkIn.rank,
            speed: `${duration.minutes}'${duration.seconds.toString().padStart(2, '0')}''`,
          };
        });
        yield put({
          type: types.SET_RUNNING_RECORD,
          payload: runningRecords ?? [],
        });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
  *watchToLikeCheckIn() {
    const { types, ducks } = this;
    yield takeLatest([types.SEND_LIKE_CHECK_IN], function* (action: any) {
      const { checkInID, isLike } = action.payload;
      yield put({ type: ducks.loading.types.WAIT });
      try {
        yield call(requestCheckInLike, { checkInID, isLike });
        yield put({ type: types.FETCH_CHECK_IN_RANK_TODAY });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
  *watchToUnbindUser() {
    const { types, ducks } = this;
    yield takeLatest([types.SEND_USER_UNBIND], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        yield call(requestUserUnbind);
        wx.clearStorageSync();
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
      yield put({ type: types.PAGE_RELOAD });
    });
  }
  *watchToFetchCheckInToday() {
    const { types, ducks } = this;
    yield takeLatest([types.FETCH_CHECK_IN_TODAY], function* () {
      yield put({ type: ducks.loading.types.WAIT });
      try {
        const checkInToday = yield call(requestCheckInToday);
        yield put({ type: types.SET_CHECK_IN_TODAY, payload: checkInToday });
      } finally {
        yield put({ type: ducks.loading.types.DONE });
      }
    });
  }
}
