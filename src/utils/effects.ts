import Observer from './observer';
import { fork, take, cancel, call } from 'redux-saga/effects';

export const modalHidden = {
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

export function scanCode(config) {
  return new Promise((resolve, reject) => {
    wx.scanCode({
      ...config,
      success(result) {
        config?.success?.(result);
        resolve(result);
      },
      fail(reason) {
        config?.fail?.(reason);
        reject(reason);
      },
    });
  });
}

export function enchanceTakeLatest(pattern: any[], saga: any) {
  return (function* () {
    yield (function* () {
      const env = {
        lastTask: null,
      };
      while (true) {
        const action = yield take(pattern);
        if (env.lastTask) {
          yield cancel(env.lastTask as any);
        }
        env.lastTask = yield fork(
          function* (currentAction, currentEnv) {
            try {
              yield call(saga, currentAction);
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/ban-tslint-comment
              // tslint:disable-next-line
              console.error(String(e));
            } finally {
              if (currentEnv?.lastTask) {
                currentEnv.lastTask = null;
              }
            }
          },
          action,
          env,
        );
      }
    })();
  })();
}

export function enchanceTakeEvery(pattern: any[], saga: any) {
  return (function* () {
    yield (function* () {
      while (true) {
        const action = yield take(pattern);
        yield fork(function* (currentAction) {
          try {
            yield call(saga, currentAction);
          } catch (e) {
            // eslint-disable-next-line @typescript-eslint/ban-tslint-comment
            // tslint:disable-next-line
            console.error(String(e));
          }
        }, action);
      }
    })();
  })();
}
