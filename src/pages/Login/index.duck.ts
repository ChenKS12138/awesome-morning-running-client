import { reduceFromPayload, createToPayload } from '@/utils/duck';
import { getCurrentFreshmanGrade, getWxCode } from '@/utils';
import { select, fork, takeLatest, put } from 'redux-saga/effects';

import * as model from '@/utils/model';
import { PageDuck } from '@/ducks';

export default class LoginDuck extends PageDuck {
  get quickTypes() {
    enum Types {
      SET_STUDENT_ID,
      SET_USERNAME,
      SET_GRADE,

      FETCH_USER_BIND,
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
      studentID: reduceFromPayload<string>(types.SET_STUDENT_ID, ''),
      username: reduceFromPayload<string>(types.SET_USERNAME, ''),
      grade: reduceFromPayload<number>(types.SET_GRADE, getCurrentFreshmanGrade()),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      ...super.rawSelectors,
      isFormValidate(state: State) {
        return state.studentID && state.grade && state.username;
      },
    };
  }
  get creators() {
    const { types } = this;
    return {
      ...super.creators,
      setStudentID: createToPayload(types.SET_STUDENT_ID),
      setUsername: createToPayload(types.SET_USERNAME),
      setGrade: createToPayload(types.SET_GRADE),
    };
  }
  *saga() {
    yield* super.saga();
    yield fork([this, this.watchToBind]);
  }
  *watchToBind() {
    const { types, selectors } = this;
    yield takeLatest([types.FETCH_USER_BIND], function* () {
      const { grade, studentID, username, isFormValidate } = selectors(yield select());
      if (isFormValidate) {
        const code = yield getWxCode();
        const result = yield model.requestUserBind({ grade, studentID, username, code });
        if (result) {
          wx.redirectTo({
            url: '/pages/Home/index',
          });
        }
      }
    });
    yield put({ type: types.FETCH_USER_BIND });
  }
}
