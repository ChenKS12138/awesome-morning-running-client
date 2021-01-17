import { fetchLocation } from '@/utils';
import { Duck, reduceFromPayload } from '@/utils/duck';
import { fork, put, takeLatest } from 'redux-saga/effects';

export default class LocationDuck extends Duck {
  get quickTypes() {
    enum Types {
      FETCH_LOCATION,
      SET_LOCATION,
    }
    return {
      ...Types,
    };
  }
  get creators() {
    return {};
  }
  get reducers() {
    const { types } = this;
    return {
      location: reduceFromPayload(types.SET_LOCATION, { longitude: 0, latitude: 0 }),
    };
  }
  *saga() {
    yield fork([this, this.watchToFetchLocation]);
  }
  *watchToFetchLocation() {
    const { types } = this;
    yield takeLatest([types.FETCH_LOCATION], function* () {
      const location = yield fetchLocation();
      yield put({
        type: types.SET_LOCATION,
        payload: location,
      });
    });
  }
}
