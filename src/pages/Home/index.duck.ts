import { Duck, createToPayload, reduceFromPayload } from '@/utils';
import { takeLatest, put, fork, all } from 'redux-saga/effects';

export default class HomeDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_SHOW_RANKLING_LIST,
      SET_SHOW_HISTORY_RECORD,

      SHOW_RANKING_LIST,
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
      setShowRankingList: createToPayload<boolean>(types.SET_SHOW_RANKLING_LIST),
      setShowHistoryRecord: createToPayload<boolean>(types.SET_SHOW_HISTORY_RECORD),
    };
  }
  get reducers() {
    const { types } = this;
    return {
      showRankingList: reduceFromPayload<boolean>(types.SET_SHOW_RANKLING_LIST, false),
      showHistoryRecord: reduceFromPayload<boolean>(types.SET_SHOW_HISTORY_RECORD, false),
    };
  }
  *saga() {
    yield fork([this, this.watchToShowRankingList]);
    yield fork([this, this.watchToShowHistoryRecord]);
    yield fork([this, this.watchToHideModal]);
  }
  *watchToShowRankingList() {
    const { types, creators } = this;
    yield takeLatest([types.SHOW_RANKING_LIST], function* () {
      yield put(creators.setShowRankingList(true));
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
      yield all([put(creators.setShowHistoryRecord(false)), put(creators.setShowRankingList(false))]);
    });
  }
}
