import { createElement } from 'rax';
import styles from './index.module.css';

export default Button;

type ColorConfig = [string, string];

interface IButton {
  color: ColorConfig;
  width?: number;
  children?: JSX.Element | JSX.Element[];
}

function Button({ color, width, children }: IButton) {
  return (
    <view
      className={styles.button}
      style={{ width, background: `linear-gradient(to right bottom,${color[0]},${color[1]})` }}
    >
      {children}
    </view>
  );
}

Button.colors = {
  GREEN: ['#B8E986', '#47B13D'],
  ORANGE: ['#F0A022', '#FF695E'],
  RED: ['#ED2F32', '#D9513C'],
  GRAY: ['#9B9B9B', '#9B9B9B'],
};
