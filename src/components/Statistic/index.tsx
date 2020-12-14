import { createElement } from 'rax';
import styles from './index.module.css';

export default Statistic;

Statistic.Title = StatisticTitle;
Statistic.Value = StaticticValue;

interface IStatistic {
  children: JSX.Element | JSX.Element[];
}

function Statistic({ children }: IStatistic) {
  return <view className={styles.value}>{children}</view>;
}

interface IStatisticTitle {
  children: JSX.Element | JSX.Element[];
}

function StatisticTitle({ children }: IStatisticTitle) {
  return <view className={styles.title}>{children}</view>;
}

interface IStatisticValue {
  children: JSX.Element | JSX.Element[];
}

function StaticticValue({ children }: IStatisticValue) {
  return <view className={styles.value}>{children}</view>;
}
