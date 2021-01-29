import Observer from './observer';

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
