import { composeClassnames } from '@/utils';
import { createElement } from 'rax';
import styles from './index.module.css';

export default Divider;

interface IDivider {
  className?: string;
}

function Divider({ className }: IDivider) {
  return <view className={composeClassnames(styles.container, className)} />;
}
