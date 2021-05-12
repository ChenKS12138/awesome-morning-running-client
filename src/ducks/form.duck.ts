import { Duck, reduceFromPayload } from '@/utils/duck';
import { enchanceTakeLatest as takeLatest } from '@/utils/effects';
import { fork, put, select } from 'redux-saga/effects';

export default abstract class BaseFormDuck<TFormData extends object = {}> extends Duck {
  get quickTypes() {
    enum Types {
      SET_DATA,

      UPDATE_FIELD,
      CLEAN_DATA,
    }
    return {
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      data: reduceFromPayload<TFormData>(types.SET_DATA, {} as any),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      isValid: (state: State) => this.validator(state.data),
    };
  }
  get creators() {
    const { types } = this;
    return {
      updateField(field, value) {
        return {
          type: types.UPDATE_FIELD,
          payload: { field, value },
        };
      },
    };
  }
  *saga() {
    yield fork([this, this.watchToCleanData]);
    yield fork([this, this.watchToUpdateField]);
  }
  *watchToUpdateField() {
    const { types, selectors } = this;
    yield takeLatest([types.UPDATE_FIELD], function* (action) {
      const { field, value } = action.payload;
      const { data } = selectors(yield select());
      yield put({
        type: types.SET_DATA,
        payload: {
          ...data,
          [field]: value,
        },
      });
    });
  }
  *watchToCleanData() {
    const { types } = this;
    yield takeLatest([types.CLEAN_DATA], function* () {
      yield put({
        type: types.SET_DATA,
        payload: {},
      });
    });
  }
  abstract validator(data: TFormData): boolean;
}
