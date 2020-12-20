import { RunningRecord } from './interface';

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
