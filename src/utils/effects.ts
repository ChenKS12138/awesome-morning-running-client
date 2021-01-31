import Observer from './observer';
import { take, cancel, call } from 'redux-saga/effects';

const modalHidden = {
  _semaphore: 0,
  _observer: new Observer(),
  get semaphore() {
    return this._semaphore;
  },
  set semaphore(value) {
    this._semaphore = value;
    this._observer.update(value);
  },
  waitForModalHiddenEffect() {
    return new Promise((resolve, reject) => {
      const listener = (semaphore) => {
        if (semaphore === 0) {
          resolve();
          this._observer.unSubscribe(listener);
        } else if (semaphore < 0) {
          reject('semaphore should not be negative');
          this._observer.unSubscribe(listener);
        }
      };
      this._observer.subscribe(listener);
    });
  },
};

export const waitForModalHidden = modalHidden.waitForModalHiddenEffect.bind(modalHidden);

export function* enchanceTakeLatest(pattern: any[], saga: any) {
  let lastTask;
  while (true) {
    const action = yield take(pattern);
    if (lastTask) {
      yield cancel(lastTask);
    }
    try {
      lastTask = yield call(saga as any, action);
    } catch (e) {
      console.error(String(e));
    }
  }
}
