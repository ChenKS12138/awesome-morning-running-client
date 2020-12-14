import { createElement } from 'rax';
import styles from './index.module.css';

export default Modal;

interface IModal {
  children: JSX.Element | JSX.Element[];
  onClickMask?: () => void;
}

function Modal({ children, onClickMask }: IModal) {
  return (
    <view className={styles.modal} onClick={onClickMask}>
      <view className={styles.content}>{children}</view>
    </view>
  );
}
