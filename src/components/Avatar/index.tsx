import { createElement } from 'rax';
import styles from './index.module.css';

export default Avatar;

interface IAvatar {
  src: string;
  size: number;
}

function Avatar({ size, src }: IAvatar) {
  return <img className={styles.img} src={src} style={{ width: size, height: size }} />;
}
