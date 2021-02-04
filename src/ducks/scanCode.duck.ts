import { Duck } from '@/utils/duck';
import { enchanceTakeLatest as takeLatest, scanCode } from '@/utils/effects';
import { fork, put } from 'redux-saga/effects';
import { RouterDuck } from '.';

export default class ScanCodeDuck extends Duck {
  get quickTypes() {
    enum Types {
      SCAN_QR_CODE,
    }
    return {
      ...Types,
    };
  }
  get quickDucks() {
    return {
      router: RouterDuck,
    };
  }
  *saga() {
    yield fork([this, this.watchToScanQrCode]);
  }
  *watchToScanQrCode() {
    const { types, ducks } = this;
    yield takeLatest([types.SCAN_QR_CODE], function* () {
      const result = yield scanCode({
        onlyFromCamera: true,
      });
      if (result?.scanType === 'WX_CODE' && result?.errMsg === 'scanCode:ok' && result?.path) {
        const url = String(result.path).startsWith('/') ? result.path : '/' + result.path;
        yield put({ type: ducks.router.types.REDIRECT_TO, payload: { url } });
      } else {
        wx.showToast({ title: '扫码失败', icon: 'none' });
      }
    });
  }
}
