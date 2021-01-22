import { composeClassnames } from '@/utils';
import { createElement } from 'rax';
import styles from './index.module.css';

export default {
  SolidGreen: {
    Zero: PanelSolidGreen0,
  },
  SolidGray: {
    Zero: PanelSolidGray0,
  },
  OutlineGreen: {
    Zero: PanelOutlineGreen0,
    One: PanelOutlineGreen1,
    Two: PanelOutlineGreen2,
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
  onClick?: any;
}

function PanelSolidGray0({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['solid-gray-0'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelSolidGreen0({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['solid-green-0'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelOutlineGreen0({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green-0'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelOutlineGreen1({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green-1'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelOutlineGreen2({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-green-2'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelOutlineGray0({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-gray-0'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}

function PanelOutlineGray1({ children, height, width, className, ...rest }: IPanel) {
  return (
    <view className={composeClassnames(styles['outline-gray-1'], className)} style={{ height, width }} {...rest}>
      {children}
    </view>
  );
}
