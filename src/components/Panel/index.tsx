import { composeClassnames } from '@/utils';
import { createElement } from 'rax';
import styles from './index.module.css';

export default {
  SolidGray: {
    Zero: PanelSolidGray0,
  },
  OutlineGreen: {
    Zero: PanelOutlineGreen0,
    One: PanelOutlineGreen1,
  },
  OutlineGray: {
    Zero: PanelOutlineGray0,
    One: PanelOutlineGray1,
  },
};

interface IPanel {
  children: JSX.Element | JSX.Element[];
  width: number | string;
  height: number | string;
  className?: string;
}

function PanelSolidGray0({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['solid-gray-0'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGreen0({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green-0'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGreen1({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green-1'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGray0({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-gray-0'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}

function PanelOutlineGray1({ children, height, width, className }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-gray-1'], className)} style={{ height, width }}>
      {children}
    </view>
  );
}
