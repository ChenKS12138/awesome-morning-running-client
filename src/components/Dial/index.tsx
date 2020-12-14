import { createElement } from 'rax';

import { RaxView as View } from '@/components';
import styles from './index.module.css';
import { composeClassnames } from '@/utils';

export default Dial;

interface ColorConfig {
  inner: [string, string]; // [top-right，bottom-left]
  outer: [string, string]; // [top-left，bottom-right]
}

interface IDial {
  percent: number;
  color: ColorConfig;
  // style?: Rax.StyleHTMLAttributes<HTMLDivElement>;
  className?: string;
  children?: JSX.Element;
}

function Dial({ color, percent, children, className }: IDial) {
  const clipPathValue = useClipPathPolygon(percent);
  return (
    <View className={composeClassnames(styles.container, className)}>
      <View
        className={styles.outer}
        style={{
          background: `linear-gradient(to left bottom, ${color.outer[0]}, ${color.outer[1]})`,
          clipPath: clipPathValue,
        }}
      />
      <View className={styles.gap}>
        <View
          className={styles.inner}
          style={{
            background: `linear-gradient(to right bottom, ${color.inner[0]}, ${color.inner[1]})`,
          }}
        >
          <View className={styles.content}>{children}</View>
        </View>
      </View>
    </View>
  );
}

/**
 * @param {number} percent
 */
function useClipPathPolygon(percent: number): string {
  if (percent <= 0) {
    return 'polygon(50% 0)';
  } else if (percent <= 12.5) {
    return `polygon(50% 0%, ${(1 + Math.tan((percent / 100) * 2 * Math.PI)) * 50}% 0%, 50% 50%)`;
  } else if (percent <= 37.5) {
    return `polygon(50% 0%, 100% 0%, 100% ${50 * (Math.tan(((percent - 25) / 100) * 2 * Math.PI) + 1)}%, 50% 50%)`;
  } else if (percent <= 62.5) {
    return `polygon(50% 0%, 100% 0%, 100% 100%, ${
      50 * (Math.tan(((50 - percent) / 100) * 2 * Math.PI) + 1)
    }% 100%, 50% 50%)`;
  } else if (percent <= 87.5) {
    return `polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${
      50 * (Math.tan(((percent - 75) / 100) * 2 * Math.PI) + 1)
    }%, 50% 50%)`;
  } else if (percent <= 100) {
    return `polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%,0% 0%, ${
      (1 - Math.tan(((100 - percent) / 100) * 2 * Math.PI)) * 50
    }% 0% , 50% 50%)`;
  } else {
    return 'polygon()';
  }
}

Dial.colors = {
  /* eslint-disable @typescript-eslint/consistent-type-assertions */
  RED: {
    inner: ['#ED2F32', '#D9513C'],
    outer: ['#F5919A', '#D4374F'],
  } as ColorConfig,
  /* eslint-disable @typescript-eslint/consistent-type-assertions */
  ORANGE: {
    inner: ['#FAD961', '#F76B1C'],
    outer: ['#EFD24E', '#F39B2E'],
  } as ColorConfig,
  /* eslint-disable @typescript-eslint/consistent-type-assertions */
  GREEN: {
    inner: ['#B8E986', '#47B13D'],
    outer: ['#ACD8AC', '#50BB46'],
  } as ColorConfig,
};
