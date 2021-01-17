import { RunningRecord } from './interface';
import { isWeChatMiniProgram } from 'universal-env';

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
export function fetchLocation(): Promise<{ longitude: number; latitude: number }> {
  if (isWeChatMiniProgram) {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success(location) {
          resolve({
            longitude: location.longitude,
            latitude: location.latitude,
          });
        },
      });
    });
  } else {
    return Promise.resolve({ longitude: 0, latitude: 0 });
  }
}

/**
 *
 * @param second
 */
export function parseSecondTime(originSeconds: number): { seconds: number; minutes: number } {
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
