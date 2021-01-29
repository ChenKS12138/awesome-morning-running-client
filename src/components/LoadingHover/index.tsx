import { createElement } from 'rax';
import styles from './index.module.css';
import { DuckProps } from 'use-duck-state';
import { LoadingDuck } from '@/ducks';

export default LoadingHover;

interface ILoadingHover extends DuckProps<LoadingDuck> {}

function LoadingHover({ duck, store }: ILoadingHover) {
  const { isLoading } = duck.selectors(store);
  return <view style={{ display: isLoading ? 'block' : 'none' }} className={styles['loading-hover']} />;
}
