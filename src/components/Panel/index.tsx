import { composeClassnames } from '@/utils';
import { createElement } from 'rax';
import styles from './index.module.css';

export default {
  SolidGray: PanelSolidGray,
  OutlineGreen: PanelOutlineGreen,
  OutlineGray: PanelOutlineGray,
};

interface IPanel {
  children: JSX.Element | JSX.Element[];
  width: number | string;
  height: number | string;
  className?: string;
}

function PanelSolidGray({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['solid-gray'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGreen({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGray({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-gray'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}
