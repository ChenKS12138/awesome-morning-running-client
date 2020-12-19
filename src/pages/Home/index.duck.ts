import { Duck, createToPayload, reduceFromPayload } from '@/utils';
import { RankItem } from '@/utils/interface';
import { takeLatest, put, fork, all } from 'redux-saga/effects';

export default class HomeDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_SHOW_RANK_LIST,
      SET_SHOW_HISTORY_RECORD,
      SET_RANK_LIST,

      SHOW_RANK_LIST,
      SHOW_HISTORY_RECORD,
      HIDE_MODAL,
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
      rankList: reduceFromPayload<RankItem[]>(types.SET_RANK_LIST, [
        {
          avatarUri: 'avatar.png',
          endTime: '06:10',
          startTime: '06:00',
          isLiked: true,
          likeCount: 10,
          speed: "7'33''",
          username: 'cattchen',
        },
      ]),
      showRankList: reduceFromPayload<boolean>(types.SET_SHOW_RANK_LIST, true),
      showHistoryRecord: reduceFromPayload<boolean>(types.SET_SHOW_HISTORY_RECORD, false),
    };
  }
  * saga() {
    yield fork([this, this.watchToShowRankList]);
    yield fork([this, this.watchToShowHistoryRecord]);
    yield fork([this, this.watchToHideModal]);
  }
  * watchToShowRankList() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_RANK_LIST], function* () {
      yield put(creators.setShowRankList(true));
    });
  }
  * watchToShowHistoryRecord() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_HISTORY_RECORD], function* () {
      yield put(creators.setShowHistoryRecord(true));
    });
  }
  * watchToHideModal() {
    const { types, creators } = this;
    yield takeLatest([types.HIDE_MODAL], function* () {
      yield all([put(creators.setShowHistoryRecord(false)), put(creators.setShowRankList(false))]);
    });
  }
}
