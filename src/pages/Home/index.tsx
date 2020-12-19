import { createElement, useCallback, useMemo } from 'rax';
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
} from '@/components';
import { useDuckState, DuckProps, numToChineseCharacter } from '@/utils';

import styles from './index.module.css';
import HomeDuck from './index.duck';

export default Home;

/**
 * Home Page
 */

function Home() {
  const { duck, store, dispatch } = useDuckState(HomeDuck);

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
  }, [dispatch]);

  const handleShowRankList = useCallback(() => {
    dispatch({ type: duck.types.SHOW_RANK_LIST });
  }, [dispatch]);

  const handleShowHistoryRecord = useCallback(() => {
    dispatch({ type: duck.types.SHOW_HISTORY_RECORD });
  }, [dispatch]);

  return (
    <>
      <View className={styles.container}>
        <HomeDial total={totalRunningCount} current={currentRunningCount} goal={'跑操目标'} />
        <HomeStatistic compensatoryCount={compensatoryCount} ranking={ranking} speed={speed} />
        <view className={styles.panels}>
          <Panel.SolidGray width="146px" height="45px">
            <view className={styles['panel-text']} onClick={handleShowRankList}>
              今日排行榜
            </view>
          </Panel.SolidGray>
          <Panel.SolidGray width="146px" height="45px">
            <view className={styles['panel-text']} onClick={handleShowHistoryRecord}>
              历史跑操记录
            </view>
          </Panel.SolidGray>
        </view>
        <Divider className={styles.divider} />
        <HomeRecord dispatch={dispatch} store={store} duck={duck} />
      </View>
      <Modal x-if={showRankList} onClickMask={handleModalMaskClick}>
        <HomeRankListModal dispatch={dispatch} store={store} duck={duck} />
      </Modal>
      <Modal x-if={showHistoryRecord} onClickMask={handleModalMaskClick}>
        <HomeHistoryRecordModal dispatch={dispatch} store={store} duck={duck} />
      </Modal>
    </>
  );
}

/**
 *  Home Page Components
 */

interface IHomeDial {
  total: number;
  current: number;
  goal: string;
  // onEditGoal?: () => void;
}

function HomeDial({ goal, total, current }: IHomeDial) {
  const percent = useMemo(() => (current / total) * 100, [current, total]);
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
          <span className={styles['dial-numerical-current']}>{current}</span>
          <span>/{total}</span>
        </view>
        <view className={styles['dial-goal']}>
          <span>{goal}</span>
          <Icon.Edit />
        </view>
      </View>
    </Dial>
  );
}

interface IHomeStatistic {
  compensatoryCount: number;
  ranking: number;
  speed: string;
}

function HomeStatistic({ compensatoryCount, ranking, speed }: IHomeStatistic) {
  return (
    <view className={styles['statistic-container']}>
      <Statistic>
        <Statistic.Title>
          <text>补偿次数</text>
          <Icon.Question />
        </Statistic.Title>
        <Statistic.Value>
          <text>+{compensatoryCount}</text>
        </Statistic.Value>
      </Statistic>
      <Statistic>
        <Statistic.Title>
          <text>平均排名</text>
        </Statistic.Title>
        <Statistic.Value>
          <text>
            <text className={styles['statistic-small-text']}>NO.</text>
            <text>{ranking}</text>
          </text>
        </Statistic.Value>
      </Statistic>
      <Statistic>
        <Statistic.Title>
          <text>平均配速</text>
        </Statistic.Title>
        <Statistic.Value>
          <text>{speed}</text>
        </Statistic.Value>
      </Statistic>
    </view>
  );
}

/**
 * Home Page DuckComponents
 */

function HomeRecord({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  const { runningRecord, runningRecordDisplayMode } = duck.selectors(store);
  return (
    <view className={styles.record}>
      <view className={styles['record-title']}>
        <text>跑操记录</text>
        <Icon.GridMode />
      </view>
      <view className={styles['record-list']}>
        {runningRecord.map((runningRecordItem, key) => (
          <Panel.OutlineGreen key={key} className={styles['record-item']} width="347px" height="50px">
            <view className={styles['record-item-left']}>
              <text>{runningRecordItem.mood}</text>
              <text className={styles['record-item-date']}>{`${
                runningRecordItem.year
              }-${runningRecordItem.month.toString().padStart(2, '0')}-${runningRecordItem.day
                .toString()
                .padStart(2, '0')}`}
              </text>
              <text className={styles['record-item-duration']}>{runningRecordItem.speed}</text>
            </view>
            <view className={styles['record-item-right']}>
              {runningRecordItem.ranking ? `NO.${runningRecordItem.ranking}` : '未完成'}
            </view>
          </Panel.OutlineGreen>
        ))}
      </view>
    </view>
  );
}

function HomeRankListModal({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  const { rankList, myRank } = duck.selectors(store);
  return (
    <view>
      <view className={styles['rank-title-container']}>
        <text className={styles['rank-title']}>今日排行榜</text>
        <Icon.Question />
      </view>
      <view className={styles['rank-board-container']}>
        <ScrollView>
          {rankList?.length &&
            rankList.map((rankItem, key) => (
              <view key={key} className={styles['rank-board-item']}>
                <view className={styles['rank-board-item-sub']}>
                  <view className={styles['rank-board-item-ranking']}>{rankItem.ranking}</view>
                  <view className={styles['rank-board-avatar-wrapper']}>
                    <Avatar src={rankItem.avatarUri} size="40px" />
                  </view>
                  <view className={styles['rank-board-item-info']}>
                    <view className={styles['rank-board-item-name']}>{rankItem.username}</view>
                    <view className={styles['rank-board-item-duration']}>
                      {rankItem.startTime}
                      {'-'}
                      {rankItem.endTime}
                    </view>
                  </view>
                </view>
                <view className={styles['rank-board-item-sub']}>
                  <view className={styles['rank-board-item-speed']}>{rankItem.speed}</view>
                  <view className={styles['rank-board-item-like']}>
                    {rankItem.isLiked ? <Icon.CowRed /> : <Icon.CowGray />}
                    <view>{rankItem.likeCount}</view>
                  </view>
                </view>
              </view>
            ))}
        </ScrollView>
      </view>
      <view className={styles['rank-mine-wrapper']}>
        <view className={styles['rank-mine-container']}>
          <view className={styles['rank-mine-sub']}>
            <view className={styles['rank-mine-ranking']}>{myRank.ranking}</view>
            <view className={styles['rank-mine-avatar-wrapper']}>
              <Avatar src={myRank.avatarUri} size="40px" />
            </view>
            <view className={styles['rank-mine-info']}>
              <view className={styles['rank-mine-username']}>{myRank.username}</view>
              <view className={styles['rank-mine-duration']}>
                {myRank.startTime}
                {'-'}
                {myRank.endTime}
              </view>
            </view>
          </view>
          <view className={styles['rank-mine-sub']}>
            <view className={styles['rank-mine-speed']}>{myRank.speed}</view>
            <view className={styles['rank-mine-share-wrapper']}>
              <Icon.ShareGreen />
            </view>
          </view>
        </view>
      </view>
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
        {historyRecord.map((item, key) => {
          const innner = (
            <>
              <view className={styles['history-list-item-content']}>
                <view>
                  <view className={styles['history-list-item-annual']}>{item.annual}</view>
                  <view className={styles['history-list-item-term']}>第{numToChineseCharacter(item.term)}学期</view>
                </view>
                <view className={styles['history-list-item-count-wrapper']}>
                  <text className={styles['history-list-item-count']}>{item.count}</text>
                  <text>次</text>
                </view>
              </view>
            </>
          );

          return item.isPass ? (
            <Panel.OutlineGreen key={key} className={styles['history-list-item']} height="54px" width="279px">
              {innner}
            </Panel.OutlineGreen>
          ) : (
            <Panel.OutlineGray key={key} className={styles['history-list-item']} height="54px" width="279px">
              {innner}
            </Panel.OutlineGray>
          );
        })}
      </view>
    </view>
  );
}
