import { RunningRecord } from './interface';

export * from './duck';

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

/**
 * @param {RunningRecord[]} records
 */
export function distributeRunningRecord(
  records: RunningRecord[],
): Array<{
    offset: number;
    month: number;
    records: RunningRecord[];
  }> {
  return [];
}
