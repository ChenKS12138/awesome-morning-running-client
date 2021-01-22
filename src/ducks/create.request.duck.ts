import { takeEvery, fork, put, all } from 'redux-saga/effects';
import { Duck, reduceFromPayload } from 'use-duck-state';

export default createRequestDuck;

function createRequestDuck<TData = any>(initialData: TData, requestHandler: () => Generator<any, any, any>) {
  return class RequestDuck extends Duck {
    get quickTypes() {
      enum Types {
        SET_LOADING,
        SET_DATA,
        SET_REASON,

        INVOKE,
      }
      return {
        ...super.quickTypes,
        ...Types,
      };
    }
    get reducers() {
      const { types } = this;
      return {
        loading: reduceFromPayload<boolean>(types.SET_LOADING, false),
        data: reduceFromPayload<TData>(types.SET_DATA, initialData),
        reason: reduceFromPayload<Error | null>(types.SET_REASON, null),
      };
    }
    get creators() {
      const { types } = this;
      return {
        ...super.creators,
        invoke() {
          return { type: types.INVOKE };
        },
      };
    }
    *saga() {
      yield fork([this, this.watchToInvoke]);
    }
    *watchToInvoke() {
      const { types } = this;
      yield takeEvery([types.INVOKE], function* () {
        yield all([
          put({
            type: types.SET_LOADING,
            payload: true,
          }),
          put({ type: types.SET_REASON, payload: null }),
        ]);
        try {
          const data = yield requestHandler();
          yield put({
            type: types.SET_DATA,
            payload: data,
          });
        } catch (reason) {
          yield put({ type: types.SET_REASON, payload: reason });
        }
        yield put({ type: types.SET_LOADING, payload: false });
      });
    }
  };
}
