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
import { IUserInfo, ICheckIn, IRankToday, ISemesterCheckIn, RunningRecord, ICheckInToday } from '@/utils/interface';
import { LoadingDuck, RouterDuck, ScanCodeDuck } from '@/ducks';
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
      SET_CHECK_IN_TODAY,

      SHOW_RANK_LIST,
      SHOW_HISTORY_RECORD,
      HIDE_MODAL,
      TOGGLE_DISPLAY_MODE,

      SEND_USER_AVATAR,
      SEND_LIKE_CHECK_IN,
      SEND_USER_UNBIND,
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
      todayCheckIn: reduceFromPayload<ICheckInToday | null>(types.SET_CHECK_IN_TODAY, null),
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
      router: RouterDuck,
      scanCode: ScanCodeDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToShowRankList]);
    yield fork([this, this.watchToShowHistoryRecord]);
    yield fork([this, this.watchToHideModal]);
    yield fork([this, this.watchToToggleRecordDisplayMode]);
    yield fork([this, this.watchToSendUserAvatar]);
    yield fork([this, this.watchToLikeCheckIn]);
    yield fork([this, this.watchToLoadPage]);
    yield fork([this, this.watchToUnbindUser]);
  }
  *watchToLoadPage() {
    const duck = this;
    yield takeLatest([duck.types.PAGE_RELOAD], function* () {
      yield all([
        call([duck, duck.fetchUserInfo]),
        call([duck, duck.fetchCheckInToday]),
        call([duck, duck.fetchCheckInHistory]),
      ]);
    });
  }
  *watchToShowRankList() {
    const duck = this;
    yield takeLatest([duck.types.SHOW_RANK_LIST], function* () {
      yield put(duck.creators.setShowRankList(true));
      yield all([call([duck, duck.fetchRankToday]), call([duck, duck.fetchCheckInToday])]);
    });
  }
  *watchToShowHistoryRecord() {
    const duck = this;
    yield takeLatest([duck.types.SHOW_HISTORY_RECORD], function* () {
      yield put(duck.creators.setShowHistoryRecord(true));
      yield call([duck, duck.fetchUserHistory]);
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
  *watchToSendUserAvatar() {
    const { types } = this;
    yield takeLatest([types.SEND_USER_AVATAR], function* () {
      const avatarUri = yield getUserAvatarUri();
      const base64String = yield getUriBase64Encode(avatarUri);
      yield call(requestUserAvatar, { avatarBase64Encode: base64String });
    });
  }
  *fetchRankToday() {
    const { ducks, types } = this;
    const checkIns: IRankToday[] = yield ducks.loading.call(requestCheckInRankToday);
    yield put({
      type: types.SET_RANK_LIST,
      payload: checkIns ?? [],
    });
  }
  *fetchUserHistory() {
    const { ducks, types } = this;
    const semesterCheckIns: ISemesterCheckIn[] = yield ducks.loading.call(requestUserHistory);
    yield put({ type: types.SET_HISTORY_RECORD, payload: semesterCheckIns ?? [] });
  }
  *fetchUserInfo() {
    const { types, ducks } = this;
    const userInfo: IUserInfo = yield ducks.loading.call(requestUserInfo);
    yield put({ type: types.SET_USER_INFO, payload: userInfo });
  }
  *fetchCheckInHistory() {
    const { types, ducks } = this;
    const checkIns: ICheckIn[] = (yield ducks.loading.call(requestCheckInHistory)) ?? [];
    const runningRecords: RunningRecord[] = checkIns.map((checkIn) => {
      const [year, month, day] = checkIn.dateTag.split('-');
      const duration = parseSecondTime((checkIn.endAt - checkIn.startAt) / 1000);
      return {
        mood: checkIn.motion,
        year: Number.parseInt(year, 10),
        month: Number.parseInt(month, 10),
        day: Number.parseInt(day, 10),
        // ranking: checkIn.rank,
        ranking: 1,
        speed: `${duration.minutes}'${duration.seconds.toString().padStart(2, '0')}''`,
      };
    });
    yield put({
      type: types.SET_RUNNING_RECORD,
      payload: runningRecords ?? [],
    });
  }
  *fetchCheckInToday() {
    const { types, ducks } = this;
    const checkInToday = yield ducks.loading.call(requestCheckInToday);
    yield put({ type: types.SET_CHECK_IN_TODAY, payload: checkInToday });
  }
  *watchToLikeCheckIn() {
    const duck = this;
    yield takeLatest([duck.types.SEND_LIKE_CHECK_IN], function* (action: any) {
      const { checkInID, isLike } = action.payload;
      yield duck.ducks.loading.call(requestCheckInLike, { checkInID, isLike });
      yield call([duck, duck.fetchRankToday]);
    });
  }
  *watchToUnbindUser() {
    const { types, ducks } = this;
    yield takeLatest([types.SEND_USER_UNBIND], function* () {
      yield ducks.loading.call(requestUserUnbind);
      wx.clearStorageSync();
      yield put({ type: types.PAGE_RELOAD });
    });
  }
}
