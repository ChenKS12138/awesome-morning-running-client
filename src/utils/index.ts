export * from './duck';

/**
 * @param {string[]} classnames
 * @returns {string}
 */
export function composeClassnames(...classnames) {
  return classnames.join(' ');
}
