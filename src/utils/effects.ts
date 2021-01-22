import Observer from './observer';

export function waitForModalHidden() {
  return new Promise((resolve, reject) => {
    waitForModalHidden._obervser.subscribe((semaphore) => {
      if (semaphore === 0) {
        resolve();
      } else if (semaphore < 0) {
        reject('semaphore should not be negative');
      }
    });
  });
}
waitForModalHidden._semaphore = 0;
waitForModalHidden._obervser = new Observer();
Reflect.defineProperty(waitForModalHidden, 'semaphore', {
  get() {
    return waitForModalHidden._semaphore;
  },
  set(value) {
    waitForModalHidden._semaphore = value;
    waitForModalHidden._obervser.update(value);
  },
});
