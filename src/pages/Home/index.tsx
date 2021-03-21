import { createElement, useCallback, useMemo, useEffect } from 'rax';
import { addNativeEventListener } from 'rax-app';

import {
  RaxView as View,
  RaxScrollView as ScrollView,
  Dial,
  Icon,
  Statistic,
  Divider,
  Panel,
  Modal,
  Avatar,
  LoadingHover,
  Button,
} from '@/components';
import { numToChineseCharacter, composeClassnames, parseSecondTime, matcher } from '@/utils';
import { useDuckState, DuckProps } from '@/utils/duck';
import { ICheckInToday } from '@/utils/interface';

import styles from './index.module.css';
import HomeDuck from './index.duck';
import { RUNNING_RECORD_DISPLAY_MODAL, CHECK_IN_STATUS } from '@/utils/constants';
import { empty } from '@/assets';

export default Home;

/**
 * Home Page
 */

function Home() {
  const { duck, store, dispatch } = useDuckState(HomeDuck, 'HomePage');

  const {
    showHistoryRecord,
    showRankList,
    totalRunningCount,
    currentRunningCount,
    compensatoryCount,
    ranking,
    speed,
  } = duck.selectors(store);

  const handleModalMaskClick = useCallback(() => {
    dispatch({ type: duck.types.HIDE_MODAL });
  }, [dispatch, duck]);

  const handleShowRankList = useCallback(() => {
    dispatch({ type: duck.types.SEND_USER_AVATAR });
    dispatch({ type: duck.types.SHOW_RANK_LIST });
  }, [dispatch, duck]);

  const handleShowHistoryRecord = useCallback(() => {
    dispatch({ type: duck.types.SHOW_HISTORY_RECORD });
  }, [dispatch, duck]);

  const handleUnbind = useCallback(() => {
    dispatch({ type: duck.types.SEND_USER_UNBIND });
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: duck.types.PAGE_RELOAD });
  }, []);

  addNativeEventListener('onPullDownRefresh', () => {
    dispatch({ type: duck.types.PAGE_RELOAD });
    wx.stopPullDownRefresh();
  });

  return (
    <>
      <View className={styles.container}>
        <HomeDial total={totalRunningCount} current={currentRunningCount} goal={'跑操目标'} />
        <HomeStatistic compensatoryCount={compensatoryCount} ranking={ranking} speed={speed} />
        <view className={styles.panels}>
          <Panel.SolidGray.Zero width="292rpx" height="90rpx">
            <button openType="getUserInfo" className={styles['panel-text']} onClick={handleShowRankList}>
              今日排行榜
            </button>
          </Panel.SolidGray.Zero>
          <Panel.SolidGray.Zero width="292rpx" height="90rpx">
            <view className={styles['panel-text']} onClick={handleShowHistoryRecord}>
              历史跑操记录
            </view>
          </Panel.SolidGray.Zero>
        </view>
        <Divider className={styles.divider} />
        <HomeAction dispatch={dispatch} store={store} duck={duck} />
        <Divider className={styles.divider} />
        <HomeRecord dispatch={dispatch} store={store} duck={duck} />
        <Divider className={styles.divider} />
        <Panel.SolidGray.Zero
          width="650rpx"
          height="90rpx"
          className={styles['unbind-container']}
          onClick={handleUnbind}
        >
          <view>解除绑定</view>
        </Panel.SolidGray.Zero>
      </View>
      <Modal x-if={showRankList} onClickMask={handleModalMaskClick}>
        <HomeRankListModal dispatch={dispatch} store={store} duck={duck} />
      </Modal>
      <Modal x-if={showHistoryRecord} onClickMask={handleModalMaskClick}>
        <HomeHistoryRecordModal dispatch={dispatch} store={store} duck={duck} />
      </Modal>
      <LoadingHover duck={duck.ducks.loading} dispatch={dispatch} store={store} />
    </>
  );
}

/**
 *  Home Page Components
 */

interface IHomeDial {
  total: number | undefined;
  current: number | undefined;
  goal: string | undefined;
}

function HomeDial({ goal, total, current }: IHomeDial) {
  const percent = useMemo(
    () => (typeof current === 'number' && typeof total === 'number' && total !== 0 ? (current / total) * 100 : 100),
    [current, total],
  );
  const color = useMemo(() => {
    if (percent < 33.3) {
      return Dial.colors.RED;
    } else if (percent < 66.6) {
      return Dial.colors.ORANGE;
    } else {
      return Dial.colors.GREEN;
    }
  }, [percent]);
  return (
    <Dial className={styles.dial} percent={percent} color={color}>
      <View className={styles['dial-content']}>
        <view className={styles['dial-numerical']}>
          <span className={styles['dial-numerical-current']}>{current ?? '-'}</span>
          <span>/{total ?? '-'}</span>
        </view>
        <view className={styles['dial-goal']}>
          <span>{goal ?? '-'}</span>
          <Icon.Edit />
        </view>
      </View>
    </Dial>
  );
}

interface IHomeStatistic {
  compensatoryCount: number | undefined;
  ranking: number | undefined;
  speed: number | undefined;
}

function HomeStatistic({ compensatoryCount, ranking, speed }: IHomeStatistic) {
  const parsedSpeed = useMemo(() => {
    return speed ? parseSecondTime(speed) : null;
  }, [speed]);
  return (
    <view className={styles['statistic-container']}>
      <Statistic>
        <Statistic.Title>
          <text>补偿次数</text>
          <Icon.Question />
        </Statistic.Title>
        <Statistic.Value>
          <text>+{compensatoryCount ?? '-'}</text>
        </Statistic.Value>
      </Statistic>
      <Statistic>
        <Statistic.Title>
          <text>平均排名</text>
        </Statistic.Title>
        <Statistic.Value>
          <text>
            <text className={styles['statistic-small-text']}>NO.</text>
            <text>{ranking ?? '-'}</text>
          </text>
        </Statistic.Value>
      </Statistic>
      <Statistic>
        <Statistic.Title>
          <text>平均配速</text>
        </Statistic.Title>
        <Statistic.Value>
          <text>{parsedSpeed ? `${parsedSpeed.minutes}'${String(parsedSpeed.seconds).padStart(2, '0')}''` : '-'}</text>
        </Statistic.Value>
      </Statistic>
    </view>
  );
}

/**
 * Home Page DuckComponents
 */

function HomeAction({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  const { todayCheckIn } = duck.selectors(store);
  return (
    <view className={styles['action-container']}>
      <view className={styles['common-title']}>
        <text>今日跑操</text>
      </view>
      <view className={styles['action-content']}>
        {matcher([
          {
            condition: null,
            handler: (
              <Button
                color={Button.colors.GREEN}
                onClick={() => {
                  dispatch({ type: duck.ducks.scanCode.types.SCAN_QR_CODE });
                }}
                width="628rpx"
              >
                <text>立即跑操</text>
              </Button>
            ),
          },
          {
            condition: () => true,
            handler: (checkIn: ICheckInToday) =>
              matcher([
                {
                  condition: (item: ICheckInToday) => item.checkIn.status === CHECK_IN_STATUS.RUNNING,
                  handler: (
                    <Button
                      color={Button.colors.ORANGE}
                      onClick={() => {
                        dispatch({
                          type: duck.ducks.router.types.REDIRECT_TO,
                          payload: { url: '/pages/Exercise/index' },
                        });
                      }}
                      width="628rpx"
                    >
                      <text>返回跑操详情</text>
                    </Button>
                  ),
                },
                {
                  condition: () => true,
                  handler: (
                    <Button
                      color={Button.colors.GRAY}
                      onClick={() => {
                        dispatch({
                          type: duck.ducks.router.types.REDIRECT_TO,
                          payload: { url: '/pages/Exercise/index' },
                        });
                      }}
                      width="628rpx"
                    >
                      <text>查看今日跑操</text>
                    </Button>
                  ),
                },
              ])(checkIn),
          },
        ])(todayCheckIn)}
      </view>
    </view>
  );
}

function HomeRecord({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  const state = duck.selectors(store);
  const handleDisplayModalClick = useCallback(() => {
    dispatch({
      type: duck.types.TOGGLE_DISPLAY_MODE,
    });
  }, []);

  return (
    <view className={styles.record}>
      <view className={styles['common-title']}>
        <text>跑操记录</text>
        <view x-if={state.distributedRunningRecords.length} onClick={handleDisplayModalClick}>
          {state.runningRecordDisplayMode === RUNNING_RECORD_DISPLAY_MODAL.LIST ? <Icon.GridMode /> : <Icon.ListMode />}
        </view>
      </view>
      <view className={styles['record-list']}>
        <img x-if={!state.distributedRunningRecords.length} className={styles['record-empty']} src={empty} />
        <view x-else>
          {state.runningRecordDisplayMode === RUNNING_RECORD_DISPLAY_MODAL.LIST ? (
            state.runningRecord.map((runningRecordItem, key) => {
              const inner = (
                <>
                  <view className={styles['record-item-left']}>
                    <text>{runningRecordItem.mood}</text>
                    <text className={styles['record-item-date']}>
                      {`${runningRecordItem.year}-${runningRecordItem.month
                        .toString()
                        .padStart(2, '0')}-${runningRecordItem.day.toString().padStart(2, '0')}`}
                    </text>
                    <text className={styles['record-item-duration']}>{runningRecordItem.speed}</text>
                  </view>
                  <view className={styles['record-item-right']}>
                    {runningRecordItem.ranking && `NO.${runningRecordItem.ranking}`}
                  </view>
                </>
              );
              return runningRecordItem.ranking ? (
                <Panel.OutlineGreen.Zero key={key} className={styles['record-item']} width="694rpx" height="100rpx">
                  {inner}
                </Panel.OutlineGreen.Zero>
              ) : (
                <Panel.OutlineGray.One key={key} className={styles['record-item']} width="694rpx" height="100rpx">
                  {inner}
                </Panel.OutlineGray.One>
              );
            })
          ) : (
            <view>
              {state.distributedRunningRecords.map((item, key) => (
                <view className={styles['record-gird-group']} key={key}>
                  <view className={styles['record-grid-group-title']}>{item.month}月</view>
                  <view className={styles['record-grid']}>
                    {item.records.map((record, recordKey) => {
                      return record.ranking !== null ? (
                        <Panel.OutlineGreen.Zero key={String(key) + String(recordKey)} width="126rpx" height="150rpx">
                          <view className={styles['record-grid-group-item']}>
                            <view className={styles['record-grid-group-item-day']}>{record.day}</view>
                            <view className={styles['record-grid-group-item-mood']}>{record.mood}</view>
                            <view className={styles['record-grid-group-item-speed']}>{record.speed}</view>
                            <view className={styles['record-grid-group-item-ranking']}>NO.{record.ranking}</view>
                          </view>
                        </Panel.OutlineGreen.Zero>
                      ) : (
                        <Panel.OutlineGray.One key={String(key) + String(recordKey)} width="126rpx" height="150rpx">
                          <view className={styles['record-grid-group-item']}>
                            <view
                              className={composeClassnames(
                                styles['record-grid-group-item-day'],
                                styles['record-grid-group-item-day--umcomplete'],
                              )}
                            >
                              {record.day}
                            </view>
                          </view>
                        </Panel.OutlineGray.One>
                      );
                    })}
                  </view>
                </view>
              ))}
            </view>
          )}
        </view>
      </view>
    </view>
  );
}

function HomeRankListModal({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  const { rankList, todayCheckIn, userInfo } = duck.selectors(store);
  return (
    <view>
      <view className={styles['rank-title-container']}>
        <text className={styles['rank-title']}>今日排行榜</text>
        <Icon.Question />
      </view>
      <view className={styles['rank-board-container']}>
        <ScrollView>
          {rankList?.length ? (
            rankList.map((rankItem, key) => (
              // eslint-disable-next-line react/jsx-indent
              <view key={key} className={styles['rank-board-item']}>
                <view className={styles['rank-board-item-sub']}>
                  <view className={styles['rank-board-item-ranking']}>{rankItem.rank}</view>
                  <view className={styles['rank-board-avatar-wrapper']}>
                    <Avatar src={rankItem.avatarBase64Encode} size="80rpx" />
                  </view>
                  <view className={styles['rank-board-item-info']}>
                    <view className={styles['rank-board-item-name']}>{rankItem.username}</view>
                    <view className={styles['rank-board-item-duration']}>
                      {formatTime(rankItem.startAt)}
                      {'-'}
                      {formatTime(rankItem.endAt)}
                    </view>
                  </view>
                </view>
                <view className={styles['rank-board-item-sub']}>
                  <view className={styles['rank-board-item-speed']}>
                    {formatSpeed(rankItem.endAt - rankItem.startAt)}
                  </view>
                  <view
                    className={styles['rank-board-item-like']}
                    onClick={() => {
                      dispatch({
                        type: duck.types.SEND_LIKE_CHECK_IN,
                        payload: { checkInID: rankItem.id, isLike: !rankItem.isLike },
                      });
                    }}
                  >
                    {rankItem.isLike ? <Icon.CowRed /> : <Icon.CowGray />}
                    <view>{rankItem.likeCount}</view>
                  </view>
                </view>
              </view>
            ))
          ) : (
            <view className={styles['empty-text']}>
              <text>暂无记录</text>
            </view>
          )}
        </ScrollView>
      </view>
      {todayCheckIn ? (
        <view className={styles['rank-mine-wrapper']}>
          <view className={styles['rank-mine-container']}>
            <view className={styles['rank-mine-sub']}>
              <view className={styles['rank-mine-ranking']}>{todayCheckIn.rank}</view>
              <view className={styles['rank-mine-avatar-wrapper']}>
                <open-data type="userAvatarUrl" />
              </view>
              <view className={styles['rank-mine-info']}>
                <view className={styles['rank-mine-username']}>{userInfo?.username}</view>
                <view className={styles['rank-mine-duration']}>
                  {formatTime(todayCheckIn.checkIn.startAt)}
                  {'-'}
                  {formatTime(todayCheckIn.checkIn.endAt)}
                </view>
              </view>
            </view>
            <view className={styles['rank-mine-sub']}>
              <view className={styles['rank-mine-speed']}>{/* {`7'33''`} */}</view>
              <view className={styles['rank-mine-share-wrapper']}>
                <Icon.ShareGreen />
              </view>
            </view>
          </view>
        </view>
      ) : null}
    </view>
  );
}

function HomeHistoryRecordModal({ dispatch, store, duck }: DuckProps<HomeDuck>) {
  const { historyRecord } = duck.selectors(store);
  return (
    <view>
      <view className={styles['history-title']}>
        <view>历史记录</view>
      </view>
      <view className={styles['history-list']}>
        {historyRecord.length ? (
          historyRecord.map((item, key) => {
            const innner = (
              <>
                <view className={styles['history-list-item-content']}>
                  <view>
                    <view className={styles['history-list-item-annual']}>
                      {`${item.academicYear}-${item.academicYear + 1}`}
                    </view>
                    <view className={styles['history-list-item-term']}>
                      第{numToChineseCharacter(item.semester + 1)}学期
                    </view>
                  </view>
                  <view className={styles['history-list-item-count-wrapper']}>
                    <text className={styles['history-list-item-count']}>{item.currentCount}</text>
                    <text>次</text>
                  </view>
                </view>
              </>
            );

            return item.isPass ? (
              <Panel.OutlineGreen.Zero key={key} className={styles['history-list-item']} height="108rpx" width="588rpx">
                {innner}
              </Panel.OutlineGreen.Zero>
            ) : (
              <Panel.OutlineGray.Zero key={key} className={styles['history-list-item']} height="108rpx" width="588rpx">
                {innner}
              </Panel.OutlineGray.Zero>
            );
          })
        ) : (
          <view className={styles['empty-text']}>
            <text>暂无记录</text>
          </view>
        )}
      </view>
    </view>
  );
}

function formatSpeed(second) {
  const time = parseSecondTime(second / 1000);
  return `${time.minutes}'${time.seconds.toString().padStart(2, '0')}''`;
}

function formatTime(millsec) {
  const t = new Date(millsec / 1000);
  return `${t.getHours()}:${t.getMinutes()}`;
}
