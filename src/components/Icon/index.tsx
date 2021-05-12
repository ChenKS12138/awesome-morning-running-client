import { createElement } from 'rax';
import styles from './index.module.css';
import {
  ICON_COW_GRAY,
  ICON_COW_RED,
  ICON_EDIT,
  ICON_GRID_MODE,
  ICON_LIST_MODE,
  ICON_QUESTION,
  ICON_SHARE_GREEN,
  ICON_SHARE_WHITE,
  ICON_GO_NEXT,
  ICON_USER,
  ICON_PASSWORD,
} from '@/assets';

export function Edit() {
  return <img className={styles.edit} src={ICON_EDIT} />;
}

export function Question() {
  return <img className={styles.question} src={ICON_QUESTION} />;
}

export function GridMode() {
  return <img className={styles['grid-mode']} src={ICON_GRID_MODE} />;
}

export function ListMode() {
  return <img className={styles['list-mode']} src={ICON_LIST_MODE} />;
}

export function ShareWhite() {
  return <img className={styles.share} src={ICON_SHARE_WHITE} />;
}

export function ShareGreen() {
  return <img className={styles.share} src={ICON_SHARE_GREEN} />;
}

export function CowGray() {
  return <img className={styles.cow} src={ICON_COW_GRAY} />;
}

export function CowRed() {
  return <img className={styles.cow} src={ICON_COW_RED} />;
}

export function Next() {
  return <img className={styles.next} src={ICON_GO_NEXT} />;
}

export function User() {
  return <img className={styles['login-icon']} src={ICON_USER} />;
}

export function Password() {
  return <img className={styles['login-icon']} src={ICON_PASSWORD} />;
}
