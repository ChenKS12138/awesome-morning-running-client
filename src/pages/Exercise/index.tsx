import { LocationDuck } from '@/ducks';
import { useDuckState, DuckProps } from '@/utils/duck';
import { createElement, useEffect } from 'rax';
import { Statistic, Button, Divider, Icon, Panel } from '@/components';

import ExerciseDuck from './index.duck';

import styles from './index.module.css';
import { EXERCISE_STATUS, EMOJIS } from './index.constants';
import { matcher, composeClassnames, parseSecondTime } from '@/utils';

export default Exercise;

function Exercise() {
  const { dispatch, duck, store } = useDuckState<ExerciseDuck>(ExerciseDuck);
  const { exerciseStatus } = duck.selectors(store);
  useEffect(() => {
    dispatch({ type: duck.types.EXEC_START });
  }, []);
  return (
    <view className={styles.container}>
      <ExerciseMap duck={duck.ducks.location} store={store} dispatch={dispatch} />
      {exerciseStatus === EXERCISE_STATUS.FINISH ? (
        <ExerciseInfoFinish duck={duck} store={store} dispatch={dispatch} />
      ) : (
        <ExerciseInfo duck={duck} store={store} dispatch={dispatch} />
      )}
    </view>
  );
}

function ExerciseMap({ dispatch, duck, store }: DuckProps<LocationDuck>) {
  const { location } = duck.selectors(store);
  return <map className={styles.map} longitude={location.longitude} latitude={location.latitude} scale="16" />;
}

function ExerciseInfo({ dispatch, duck, store }: DuckProps<ExerciseDuck>) {
  const { parsedAverageTime, parsedUsedTime, currentCount, totalCount } = duck.selectors(store);

  const { exerciseStatus } = duck.selectors(store);
  const { location } = duck.ducks.location.selectors(store);
  const parsedPace = parseSecondTime(Math.max(0, location.speed));

  return (
    <view className={styles.info}>
      <view className={styles['info-timer']}>
        <Statistic>
          <Statistic.Value>
            <text className={styles['info-timer-time']}>
              {parsedUsedTime.minutes.toString().padStart(2, '0')}:{parsedUsedTime.seconds.toString().padStart(2, '0')}
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>加油！跑起来！</text>
          </Statistic.Title>
        </Statistic>
        {/* <Avatar
          src="https://avatars1.githubusercontent.com/u/42082890?s=460&u=576fffd9f1773ebf346c06afb3326b30ad21d0fd&v=4"
          size="110rpx"
        /> */}
        <open-data type="userAvatarUrl" />
      </view>
      <Divider className={styles.divider} />
      <view className={styles['info-statistic-container']}>
        <Statistic>
          <Statistic.Value>
            <text>
              {currentCount}/{totalCount}
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>累计次数</text>
          </Statistic.Title>
        </Statistic>
        <Statistic>
          <Statistic.Value>
            <text>
              {parsedAverageTime.minutes.toString().padStart(2, '0')}:
              {parsedAverageTime.seconds.toString().padStart(2, '0')}
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>平均用时</text>
          </Statistic.Title>
        </Statistic>
        <Statistic>
          <Statistic.Value>
            <text>{`${parsedPace.minutes}'${parsedPace.seconds}''`}</text>
          </Statistic.Value>
          <Statistic.Title>
            <text>平均配速</text>
          </Statistic.Title>
        </Statistic>
      </view>
      <view className={styles['button-container']}>
        {matcher([
          {
            condition: EXERCISE_STATUS.OEVERTIME,
            handler: (
              <Button color={Button.colors.GRAY} width="628rpx">
                <text className={styles['button-text']}>已超时，无法打卡</text>
              </Button>
            ),
          },
          {
            condition: () => true,
            handler: (condition) => (
              <Button
                onClick={() => {
                  dispatch({
                    type: duck.types.EXEC_FINISH,
                  });
                }}
                color={matcher([
                  {
                    condition: EXERCISE_STATUS.RUNNING_GREEN,
                    handler: Button.colors.GREEN,
                  },
                  {
                    condition: EXERCISE_STATUS.RUNNING_ORANGE,
                    handler: Button.colors.ORANGE,
                  },
                  {
                    condition: EXERCISE_STATUS.RUNNING_RED,
                    handler: Button.colors.RED,
                  },
                ])(condition)}
                width="628rpx"
              >
                <text className={styles['button-text']}>完成跑操</text>
              </Button>
            ),
          },
        ])(exerciseStatus)}
      </view>
    </view>
  );
}

function ExerciseInfoFinish({ dispatch, duck, store }: DuckProps<ExerciseDuck>) {
  const { motion, todayRank, currentCount, parsedTodayPace, parsedTodayTimeCost } = duck.selectors(store);

  return (
    <view className={composeClassnames(styles.info, styles['info--finish'])}>
      <view className={styles['info-timer']}>
        <Statistic>
          <Statistic.Value>
            <text className={composeClassnames(styles['info-timer-time'], styles['info-timer-time--finish'])}>
              第<text className={styles['info-timer-time-numberic--finish']}>{currentCount + 1}</text>
              次完成
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>
              {new Date().getFullYear()}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}/
              {new Date().getDay().toString().padStart(2, '0')}
            </text>
          </Statistic.Title>
        </Statistic>
        {/* <Avatar
          src="https://avatars1.githubusercontent.com/u/42082890?s=460&u=576fffd9f1773ebf346c06afb3326b30ad21d0fd&v=4"
          size="110rpx"
        /> */}
        <open-data type="userAvatarUrl" />
      </view>
      <Divider className={styles.fader} />
      <view
        className={composeClassnames(styles['info-statistic-container'], styles['info-statistic-container--finish'])}
      >
        <Statistic>
          <Statistic.Value>
            <text>{todayRank}</text>
            <text className={styles['rank-text']}>名</text>
          </Statistic.Value>
          <Statistic.Title>
            <text>今日排名</text>
          </Statistic.Title>
        </Statistic>
        <Statistic>
          <Statistic.Value>
            <text>
              {parsedTodayTimeCost.minutes.toString().padStart(2, '0')}:
              {parsedTodayTimeCost.seconds.toString().padStart(2, '0')}
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>今日用时</text>
          </Statistic.Title>
        </Statistic>
        <Statistic>
          <Statistic.Value>
            <text>
              {parsedTodayPace.minutes}
              {"'"}
              {parsedTodayPace.seconds}
              {"''"}
            </text>
          </Statistic.Value>
          <Statistic.Title>
            <text>今日配速</text>
          </Statistic.Title>
        </Statistic>
      </view>
      <Divider className={styles.divider} />
      <view className={styles['motion-container']}>
        <view className={styles['motion-title']}>记录心情</view>
        <scroll-view className={styles['motion-scroll-view']} scrollX enableFlex>
          {EMOJIS.map((emoji, index) => (
            <view
              key={index}
              onClick={() => {
                dispatch(duck.creators.setMotion(emoji.value));
              }}
            >
              {motion === emoji.value ? (
                <Panel.OutlineGreen.One height="120rpx" width="146rpx" className={styles['motion-scroll-view-item']}>
                  <view>
                    <img src={emoji.src} className={styles['motion-scroll-view-item-img']} />
                  </view>
                </Panel.OutlineGreen.One>
              ) : (
                <Panel.SolidGray.Zero height="120rpx" width="146rpx" className={styles['motion-scroll-view-item']}>
                  <view>
                    <img src={emoji.src} className={styles['motion-scroll-view-item-img']} />
                  </view>
                </Panel.SolidGray.Zero>
              )}
            </view>
          ))}
        </scroll-view>
      </view>
      <view className={styles['button-container']}>
        <Button color={Button.colors.GREEN} width="158rpx">
          <Icon.ShareWhite />
        </Button>
        <Button color={Button.colors.GREEN} width="452rpx">
          <text
            className={styles['button-text']}
            onClick={() => {
              wx.redirectTo({
                url: '/pages/Home/index',
              });
            }}
          >
            完成
          </text>
        </Button>
      </view>
    </view>
  );
}
