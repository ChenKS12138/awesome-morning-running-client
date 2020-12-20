import { Duck, createToPayload, reduceFromPayload } from '@/utils/duck';
import { distributeRunningRecord } from '@/utils';
import { RankItem, HisotryTermRecordItem, RunningRecord } from '@/utils/interface';
import { takeLatest, put, fork, all, select } from 'redux-saga/effects';
import { RUNNING_RECORD_DISPLAY_MODAL } from './index.constants';

export default class HomeDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_TOTAL_RUNNING_COUNT,
      SET_CURRENT_RUNNING_COUNT,
      SET_COMPENSATORY_COUNT,
      SET_RANKING,
      SET_SPEED,
      SET_SHOW_RANK_LIST,
      SET_SHOW_HISTORY_RECORD,
      SET_RANK_LIST,
      SET_MY_RANK,
      SET_HISTORY_RECORD,
      SET_RUNNING_RECORD_DISPLAY_MODE,
      SET_RUNNING_RECORD,

      SHOW_RANK_LIST,
      SHOW_HISTORY_RECORD,
      HIDE_MODAL,
      TOGGLE_DISPLAY_MODE,
    }
    return {
      ...Types,
    };
  }
  get creators() {
    const { types } = this;
    return {
      setShowRankList: createToPayload<boolean>(types.SET_SHOW_RANK_LIST),
      setShowHistoryRecord: createToPayload<boolean>(types.SET_SHOW_HISTORY_RECORD),
    };
  }
  get reducers() {
    const { types } = this;
    return {
      totalRunningCount: reduceFromPayload<number>(types.SET_TOTAL_RUNNING_COUNT, 60),
      currentRunningCount: reduceFromPayload<number>(types.SET_CURRENT_RUNNING_COUNT, 34),
      compensatoryCount: reduceFromPayload<number>(types.SET_COMPENSATORY_COUNT, 10),
      ranking: reduceFromPayload<number>(types.SET_RANKING, 123),
      speed: reduceFromPayload<string>(types.SET_SPEED, "7'33''"),
      showRankList: reduceFromPayload<boolean>(types.SET_SHOW_RANK_LIST, false),
      showHistoryRecord: reduceFromPayload<boolean>(types.SET_SHOW_HISTORY_RECORD, false),
      myRank: reduceFromPayload<RankItem>(types.SET_MY_RANK, {
        avatarUri:
          'https://avatars1.githubusercontent.com/u/42082890?s=460&u=576fffd9f1773ebf346c06afb3326b30ad21d0fd&v=4',
        endTime: '06:10',
        startTime: '06:00',
        isLiked: true,
        likeCount: 10,
        speed: "7'33''",
        username: 'cattchen',
        ranking: 111,
      }),
      rankList: reduceFromPayload<RankItem[]>(types.SET_RANK_LIST, [
        {
          avatarUri:
            'https://avatars1.githubusercontent.com/u/42082890?s=460&u=576fffd9f1773ebf346c06afb3326b30ad21d0fd&v=4',
          endTime: '06:10',
          startTime: '06:00',
          isLiked: true,
          likeCount: 10,
          speed: "7'33''",
          username: 'cattchen',
          ranking: 1,
        },
      ]),
      historyRecord: reduceFromPayload<HisotryTermRecordItem[]>(types.SET_HISTORY_RECORD, [
        {
          annual: '2017-2018',
          term: 1,
          count: 40,
          isPass: true,
        },
        {
          annual: '2017-2018',
          term: 2,
          count: 10,
          isPass: false,
        },
        {
          annual: '2018-2019',
          term: 1,
          count: 35,
          isPass: true,
        },
        {
          annual: '2018-2019',
          term: 2,
          count: 65,
          isPass: true,
        },
      ]),
      runningRecordDisplayMode: reduceFromPayload<RUNNING_RECORD_DISPLAY_MODAL>(
        types.SET_RUNNING_RECORD_DISPLAY_MODE,
        RUNNING_RECORD_DISPLAY_MODAL.GRID,
      ),
      runningRecord: reduceFromPayload<RunningRecord[]>(types.SET_RUNNING_RECORD, [
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 28,
          ranking: 122,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 27,
          ranking: 121,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 26,
          ranking: 123,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 25,
          ranking: 122,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 24,
          ranking: 121,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 2,
          day: 23,
          ranking: 123,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 1,
          day: 28,
          ranking: 122,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 1,
          day: 27,
          ranking: null,
          speed: "8'20''",
        },
        {
          mood: '😂',
          year: 2020,
          month: 1,
          day: 26,
          ranking: 123,
          speed: "8'20''",
        },
      ]),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      distributedRunningRecords(state: State) {
        return distributeRunningRecord(state.runningRecord);
      },
    };
  }
  *saga() {
    yield fork([this, this.watchToShowRankList]);
    yield fork([this, this.watchToShowHistoryRecord]);
    yield fork([this, this.watchToHideModal]);
    yield fork([this, this.watchToToggleRecordDisplayMode]);
  }
  *watchToShowRankList() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_RANK_LIST], function* () {
      yield put(creators.setShowRankList(true));
    });
  }
  *watchToShowHistoryRecord() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_HISTORY_RECORD], function* () {
      yield put(creators.setShowHistoryRecord(true));
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
}
