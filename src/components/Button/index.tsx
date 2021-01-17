import { createElement } from 'rax';
import styles from './index.module.css';

export default Button;

type ColorConfig = [string, string];

interface IButton {
  color: ColorConfig;
  width?: string;
  children?: JSX.Element | JSX.Element[];
  onClick?: (event: any) => any;
}

function Button({ color, width, children, onClick }: IButton) {
  return (
    <view
      onClick={onClick}
      className={styles.button}
      style={{ width, background: `linear-gradient(to right bottom,${color[0]},${color[1]})` }}
    >
      {children}
    </view>
  );
}

Button.colors = {
  GREEN: ['#B8E986', '#47B13D'] as [string, string],
  ORANGE: ['#F0A022', '#FF695E'] as [string, string],
  RED: ['#ED2F32', '#D9513C'] as [string, string],
  GRAY: ['#9B9B9B', '#9B9B9B'] as [string, string],
};
