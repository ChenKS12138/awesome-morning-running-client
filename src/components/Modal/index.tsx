import { createElement, useCallback } from 'rax';
import styles from './index.module.css';

export default Modal;

interface IModal {
  children: JSX.Element | JSX.Element[];
  onClickMask?: () => void;
}

function Modal({ children, onClickMask }: IModal) {
  const handleContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <view className={styles.modal} onClick={onClickMask}>
      <view className={styles.content} onClick={handleContentClick}>
        {children}
      </view>
    </view>
  );
}
