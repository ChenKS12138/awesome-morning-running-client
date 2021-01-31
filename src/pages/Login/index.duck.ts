import { reduceFromPayload, createToPayload, Duck } from '@/utils/duck';
import { getCurrentFreshmanGrade, getWxCode } from '@/utils';
import { select, fork, put, call } from 'redux-saga/effects';

import * as model from '@/utils/model';
import { LoadingDuck } from '@/ducks';
import { enchanceTakeLatest } from '@/utils/effects';

export default class LoginDuck extends Duck {
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
  get quickDucks() {
    return {
      loading: LoadingDuck,
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
    yield fork([this, this.watchToBind]);
  }
  *watchToBind() {
    const { types, selectors, ducks } = this;
    yield enchanceTakeLatest([types.FETCH_USER_BIND], function* () {
      console.log('handle user bind');
      const { grade, studentID, username, isFormValidate } = selectors(yield select());
      if (isFormValidate) {
        yield put({ type: ducks.loading.types.WAIT });
        try {
          const code = yield getWxCode();
          const result = yield call(model.requestUserBind, { grade, studentID, username, code });
          if (result) {
            wx.redirectTo({
              url: '/pages/Home/index',
            });
          }
        } finally {
          yield put({ type: ducks.loading.types.DONE });
        }
      }
    });
    yield put({ type: types.FETCH_USER_BIND });
  }
}
