import { isWeChatMiniProgram } from 'universal-env';
import { RunningRecord } from './interface';
import { modalHidden } from './effects';
import { VALID_SENCE } from './constants';

/**
 * @param {string[]} classnames
 * @returns {string}
 */
export function composeClassnames(...classnames) {
  return classnames.join(' ');
}

/**
 * @param {number} num
 * @returns {string}
 */
export function numToChineseCharacter(num: number): string {
  return ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][num] ?? String(num);
}

interface DistributedRunningRecrod {
  offset: number;
  month: number;
  year: number;
  records: RunningRecord[];
}
/**
 * @param {RunningRecord[]} records
 */
export function distributeRunningRecord(records: RunningRecord[]): DistributedRunningRecrod[] {
  return records
    .slice()
    .sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month))
    .reduce((accumulate, current) => {
      let recordSet = accumulate.find((one) => one.year === current.year && one.month === current.month);
      if (!recordSet) {
        recordSet = { offset: 0, month: current.month, year: current.year, records: [] };
        accumulate.push(recordSet);
      }
      recordSet.records.push(current);
      return accumulate;
    }, [] as DistributedRunningRecrod[]);
}

/**
 * 获取经纬度
 */
export function fetchLocation(): Promise<{ longitude: number; latitude: number; speed: number; altitude: number }> {
  if (isWeChatMiniProgram) {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(location) {
          resolve(location);
        },
      });
    });
  } else {
    return Promise.resolve({ longitude: 0, latitude: 0, speed: 0, altitude: 0 });
  }
}

/**
 *
 * @param second
 */
export function parseSecondTime(originSeconds: number): { seconds: number; minutes: number } {
  originSeconds = Math.round(originSeconds);
  const seconds = originSeconds % 60;
  const minutes = Math.floor(originSeconds / 60);
  return { seconds, minutes };
}

type IMathcer = {
  condition: Function | any;
  handler: Function | any;
}[];

/**
 * @param conditions
 */
export function matcher(conditions: IMathcer) {
  return function (current) {
    const condition = conditions.find((one) =>
      typeof one.condition === 'function' ? one.condition(current) : Object.is(one.condition, current),
    );
    if (condition) {
      return typeof condition.handler === 'function' ? condition.handler(current) : condition.handler;
    } else {
      return null;
    }
  };
}

export function getCurrentFreshmanGrade(): number {
  const now = new Date();
  return now.getFullYear() - 1;
}

export async function getWxCode(): Promise<string> {
  if (isWeChatMiniProgram) {
    return new Promise((resolve) => {
      wx.login({
        complete(res) {
          return resolve(res?.code ?? '');
        },
      });
    });
  } else {
    return Promise.resolve('');
  }
}

export async function getUserAvatarUri(): Promise<string> {
  if (isWeChatMiniProgram) {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success(result) {
          resolve(result.userInfo.avatarUrl);
        },
        fail(reason) {
          reject(reason);
        },
      });
    });
  } else {
    return Promise.resolve('');
  }
}

export async function getUriBase64Encode(uri: string): Promise<string> {
  if (isWeChatMiniProgram) {
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'GET',
        url: uri,
        responseType: 'arraybuffer',
        success(response) {
          resolve('data:image/jpeg;base64,' + wx.arrayBufferToBase64(response.data as any));
        },
        fail(reason) {
          reject(reason);
        },
      });
    });
  } else {
    return Promise.resolve('');
  }
}

export function showModal(config) {
  (modalHidden as any).semaphore += 1;
  return wx.showModal({
    ...config,
    complete(result) {
      (modalHidden as any).semaphore -= 1;
      config?.complete?.(result);
    },
  });
}

export function parseQrCodeSence(scene: string | undefined) {
  if (!scene) return null;
  const [event, type, secret] = scene.split('$');
  if (!event || !type || !secret) return null;
  const validSence = Object.keys(VALID_SENCE);
  if (!validSence.includes(event)) return null;
  const validTypes = VALID_SENCE[event];
  if (!validTypes.includes(type)) return null;
  return { event, type, secret };
}
