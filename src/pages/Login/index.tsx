import { createElement, useCallback } from 'rax';

import { Panel, LoadingHover } from '@/components';

import styles from './index.module.css';
import { DuckProps, useDuckState } from '@/utils/duck';
import LoginDuck from './index.duck';
import { composeClassnames } from '@/utils';
import { BIND_TYPE } from '@/utils/constants';

export default Login;

/**
 * Login Page
 */
function Login() {
  const { dispatch, duck, store } = useDuckState<LoginDuck>(LoginDuck, 'LoginPage');

  const { bindType } = duck.selectors(store);

  return (
    <view>
      <view className={styles.title}>
        <text>用户登录</text>
      </view>
      {bindType === BIND_TYPE.BIND_BY_PASSWORD ? (
        <LoginPasswordForm duck={duck} store={store} dispatch={dispatch} />
      ) : (
        <LoginSmsForm duck={duck} store={store} dispatch={dispatch} />
      )}
      <LoadingHover duck={duck.ducks.loading} store={store} dispatch={dispatch} />
    </view>
  );
}

interface ILoginPasswordForm extends DuckProps<LoginDuck> {}

function LoginPasswordForm({ dispatch, duck, store }: ILoginPasswordForm) {
  const {
    data: { username, password },
    isValid,
  } = duck.ducks.bindByPasswordForm.selectors(store);

  const handleUsernameChange = useCallback(
    (e) => {
      dispatch(duck.ducks.bindByPasswordForm.creators.updateField('username', e.target.value));
    },
    [duck, dispatch],
  );

  const handlePasswordChange = useCallback(
    (e) => {
      dispatch(duck.ducks.bindByPasswordForm.creators.updateField('password', e.target.value));
    },
    [duck, dispatch],
  );

  const handleBind = useCallback(() => {
    dispatch({ type: duck.types.BIND_BY_PASSWORD });
  }, [dispatch, duck]);

  const handleBindTypeChange = useCallback(() => {
    dispatch(duck.creators.setBindType(BIND_TYPE.BIND_BY_SMS));
  }, [duck, dispatch, BIND_TYPE]);

  return (
    <view>
      <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
        <input
          className={styles.input}
          placeholder="手机号"
          value={username}
          type="number"
          onInput={handleUsernameChange}
        />
      </Panel.OutlineGreen.Two>
      <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
        <input
          className={styles.input}
          placeholder="密码"
          type="password"
          value={password}
          onInput={handlePasswordChange}
        />
      </Panel.OutlineGreen.Two>
      <view className={styles['form_bind-type_btn']} onClick={handleBindTypeChange}>
        使用短信验证码登陆
      </view>
      <LoginBtn disabled={!isValid} onClick={handleBind}>
        <view>登录</view>
      </LoginBtn>
    </view>
  );
}

interface ILoginSmsForm extends DuckProps<LoginDuck> {}

function LoginSmsForm({ dispatch, duck, store }: ILoginSmsForm) {
  const {
    data: { phone, smsCode },
    isValid,
  } = duck.ducks.bindBySmsForm.selectors(store);

  const { isActive: isTimerActive, seconds: timerSeconds } = duck.ducks.timer.selectors(store);

  const handlePhoneChange = useCallback(
    (e) => {
      dispatch(duck.ducks.bindBySmsForm.creators.updateField('phone', e.target.value));
    },
    [duck, dispatch],
  );

  const handleSmsCodeChange = useCallback(
    (e) => {
      dispatch(duck.ducks.bindBySmsForm.creators.updateField('smsCode', e.target.value));
    },
    [duck, dispatch],
  );

  const handleBind = useCallback(() => {
    dispatch({ type: duck.types.BIND_BY_SMS });
  }, [dispatch, duck]);

  const handleBindTypeChange = useCallback(() => {
    dispatch(duck.creators.setBindType(BIND_TYPE.BIND_BY_PASSWORD));
  }, [duck, dispatch, BIND_TYPE]);

  const handleSendSms = useCallback(() => {
    dispatch({
      type: duck.types.SEND_SMS,
    });
  }, [duck, dispatch]);

  return (
    <view>
      <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
        <input className={styles.input} placeholder="手机号" value={phone} onInput={handlePhoneChange} />
      </Panel.OutlineGreen.Two>
      <view className={styles['form_sms-code_container']}>
        <Panel.OutlineGreen.Two height="80rpx" width="720rpx" className={styles['input-wrapper']}>
          <input
            className={styles.input}
            placeholder="验证码"
            type="password"
            value={smsCode}
            onInput={handleSmsCodeChange}
          />
        </Panel.OutlineGreen.Two>
        <LoginBtn disabled={!phone?.length || isTimerActive} className={styles['form_sms-code_btn']} width="250rpx">
          {!isTimerActive ? <view onClick={handleSendSms}>获取</view> : <view>{60 - timerSeconds}s</view>}
        </LoginBtn>
      </view>
      <view className={styles['form_bind-type_btn']} onClick={handleBindTypeChange}>
        使用账号密码登陆
      </view>
      <LoginBtn disabled={!isValid} onClick={handleBind}>
        <view>登录</view>
      </LoginBtn>
    </view>
  );
}

interface ILoginBtn {
  disabled?: boolean;
  onClick?: (e: any) => void;
  children: any;
  className?: string;
  height?: string;
  width?: string;
}

function LoginBtn({ disabled, onClick, children, className, height, width }: ILoginBtn) {
  height = height || '80rpx';
  width = width || '720rpx';
  return disabled ? (
    <Panel.SolidGray.Zero
      height={height}
      width={width}
      className={composeClassnames([styles['input-wrapper'], styles['btn-wrapper']], className)}
    >
      {children}
    </Panel.SolidGray.Zero>
  ) : (
    <Panel.SolidGreen.Zero
      height={height}
      width={width}
      className={composeClassnames([
        styles['input-wrapper'],
        styles['btn-wrapper'],
        styles['btn-wrapper--validate'],
        className,
      ])}
      onClick={onClick}
    >
      {children}
    </Panel.SolidGreen.Zero>
  );
}
