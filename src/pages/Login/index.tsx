import { createElement, useMemo, useCallback } from 'rax';

import { Panel } from '@/components';

import styles from './index.module.css';
import { useDuckState } from '@/utils/duck';
import LoginDuck from './index.duck';
import { getCurrentFreshmanGrade, composeClassnames } from '@/utils';

export default Login;

/**
 * Login Page
 */
function Login() {
  const { dispatch, duck, store } = useDuckState<LoginDuck>(LoginDuck);

  const { grade, studentID, username, isFormValidate } = duck.selectors(store);

  const gradeList = useMemo(() => {
    const currentFreshmenGrade = getCurrentFreshmanGrade();
    return Array.from({ length: 4 }).map((_v, k) => {
      return currentFreshmenGrade - k;
    });
  }, []);

  const handleUsernameChange = useCallback(
    (e) => {
      dispatch(duck.creators.setUsername(e.target.value));
    },
    [dispatch, duck],
  );

  const handleStudentIDChange = useCallback(
    (e) => {
      dispatch(duck.creators.setStudentID(e.target.value));
    },
    [dispatch, duck],
  );

  const handleSelectorChange = useCallback(
    (e) => {
      const index = e.detail.value;
      dispatch(duck.creators.setGrade(gradeList[index]));
    },
    [dispatch, duck],
  );

  const handleLogin = useCallback(() => {
    dispatch({ type: duck.types.FETCH_USER_BIND });
  }, [dispatch, duck]);

  return (
    <view>
      <view className={styles.title}>
        <text>用户登录</text>
      </view>
      <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
        <input className={styles.input} placeholder="姓名" value={username} onInput={handleUsernameChange} />
      </Panel.OutlineGreen.Two>
      <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
        <input className={styles.input} placeholder="学号" value={studentID} onInput={handleStudentIDChange} />
      </Panel.OutlineGreen.Two>
      <picker mode="selector" value={0} range={gradeList} onChange={handleSelectorChange}>
        <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
          <text className={styles.input}>{`${grade}级`}</text>
        </Panel.OutlineGreen.Two>
      </picker>
      {isFormValidate ? (
        <Panel.SolidGreen.Zero
          height="80rpx"
          width="720rpx"
          className={composeClassnames([
            styles['input-wrapper'],
            styles['btn-wrapper'],
            styles['btn-wrapper--validate'],
          ])}
          onClick={handleLogin}
        >
          <view>登录</view>
        </Panel.SolidGreen.Zero>
      ) : (
        <Panel.SolidGray.Zero
          height="80rpx"
          width="720rpx"
          className={composeClassnames([styles['input-wrapper'], styles['btn-wrapper']])}
        >
          <view>登录</view>
        </Panel.SolidGray.Zero>
      )}
    </view>
  );
}
