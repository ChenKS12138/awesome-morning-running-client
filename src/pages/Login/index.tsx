import { createElement, useCallback } from 'rax';

import { Panel, LoadingHover, Icon } from '@/components';

import styles from './index.module.css';
import { DuckProps, useDuckState } from '@/utils/duck';
import LoginDuck from './index.duck';
import { composeClassnames } from '@/utils';
import { BIND_TYPE } from '@/utils/constants';
import { loginIllustration } from '@/assets';

export default Login;

/**
 * Login Page
 */
function Login() {
  const { dispatch, duck, store } = useDuckState<LoginDuck>(LoginDuck, 'LoginPage');

  const { bindType } = duck.selectors(store);

  return (
    <view className={styles['login-container-wrapper']}>
      <view className={styles['login-form-container']}>
        <view className={styles['login-title']}>用户登录</view>
        <view className={styles['login-form']}>
          {bindType === BIND_TYPE.BIND_BY_PASSWORD ? (
            <LoginPasswordForm duck={duck} store={store} dispatch={dispatch} />
          ) : (
            <LoginSmsForm duck={duck} store={store} dispatch={dispatch} />
          )}
        </view>
      </view>
      <view className={styles['login-bottom-text']}>元气满满的一天从晨跑开始</view>
      <img className={styles['login-bottom-illustration']} src={loginIllustration} mode="aspectFit" />
      <LoadingHover duck={duck.ducks.loading} store={store} dispatch={dispatch} />
    </view>
  );
}

type ILoginPasswordForm = DuckProps<LoginDuck>;

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
  }, [duck, dispatch]);

  return (
    <view>
      <Panel.OutlineGreen.Two height="6.3vh" width="61.87vw" className={styles['input-wrapper']}>
        <Icon.User />
        <input
          className={styles.input}
          placeholder-class={styles['input-placeholder-grey']}
          placeholder="请输入南邮小程序账号"
          value={username}
          type="number"
          onInput={handleUsernameChange}
        />
      </Panel.OutlineGreen.Two>
      <Panel.OutlineGreen.Two height="6.3vh" width="61.87vw" className={styles['input-wrapper']}>
        <Icon.Password />
        <input
          className={styles.input}
          placeholder-class={styles['input-placeholder-grey']}
          placeholder="请输入南邮小程序密码"
          type="password"
          value={password}
          onInput={handlePasswordChange}
        />
      </Panel.OutlineGreen.Two>
      <view className={styles['form_bind-type_btn']} onClick={handleBindTypeChange}>
        使用验证码登陆
      </view>
      <LoginBtn
        disabled={!isValid}
        onClick={handleBind}
        width="68.53vw"
        height="8.55vh"
        className={styles['login-button-container']}
      >
        <view className={styles['login-button']}>
          <view className={styles['login-text']}>立即登录</view>
          <view className={styles['login-next']}>
            <Icon.Next />
          </view>
        </view>
      </LoginBtn>
    </view>
  );
}

type ILoginSmsForm = DuckProps<LoginDuck>;

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
  }, [duck, dispatch]);

  const handleSendSms = useCallback(() => {
    dispatch({
      type: duck.types.SEND_SMS,
    });
  }, [duck, dispatch]);

  return (
    <view>
      <Panel.OutlineGreen.Two height="6.3vh" width="61.87vw" className={styles['input-wrapper']}>
        <Icon.User />
        <input
          className={styles.input}
          placeholder-class={styles['input-placeholder-grey']}
          placeholder="请输入南邮小程序账号"
          value={phone}
          onInput={handlePhoneChange}
        />
      </Panel.OutlineGreen.Two>
      <view className={styles['form_sms-code_container']}>
        <Panel.OutlineGreen.Two height="6.3vh" width="61.87vw" className={styles['input-wrapper']}>
          <Icon.Password />
          <input
            className={styles.input}
            placeholder-class={styles['input-placeholder-grey']}
            placeholder="请输入验证码"
            type="number"
            value={smsCode}
            onInput={handleSmsCodeChange}
          />
          <LoginBtn
            disabled={!phone?.length || isTimerActive}
            className={styles['form_sms-code_btn']}
            width="162rpx"
            height="44rpx"
          >
            {!isTimerActive ? <view onClick={handleSendSms}>发送验证码</view> : <view>{60 - timerSeconds}s</view>}
          </LoginBtn>
        </Panel.OutlineGreen.Two>
      </view>
      <view className={styles['form_bind-type_btn']} onClick={handleBindTypeChange}>
        使用密码登陆
      </view>
      <LoginBtn
        disabled={!isValid}
        onClick={handleBind}
        width="68.53vw"
        height="8.55vh"
        className={styles['login-button-container']}
      >
        <view className={styles['login-button']}>
          <view className={styles['login-text']}>立即登录</view>
          <Icon.Next />
        </view>
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
    <Panel.SolidGray.Zero height={height} width={width} className={composeClassnames(className)}>
      {children}
    </Panel.SolidGray.Zero>
  ) : (
    <Panel.SolidGreen.Zero height={height} width={width} className={composeClassnames([className])} onClick={onClick}>
      {children}
    </Panel.SolidGreen.Zero>
  );
}
