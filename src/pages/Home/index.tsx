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
} from '@/components';
import { useDuckState, DuckProps } from '@/utils';

import styles from './index.module.css';
import HomeDuck from './index.duck';

export default Home;

/**
 * Home Page
 */

function Home() {
  const { duck, store, dispatch } = useDuckState(HomeDuck);
  const { showHistoryRecord, showRankList } = duck.selectors(store);

  const handleModalMaskClick = useCallback(() => {
    dispatch({ type: duck.types.HIDE_MODAL });
  }, [dispatch]);

  return (
    <>
      <View className={styles.container}>
        <HomeDial total={60} current={30} goal={'跑操目标'} />
        <HomeStatistic compensatedCount={10} rank={123} speed="7'33''" />
        <view className={styles.panels}>
          <Panel.SolidGray width="146px" height="45px">
            <view
              className={styles['panel-text']}
              onClick={() => {
                dispatch({ type: duck.types.SHOW_RANK_LIST });
              }}
            >
              今日排行榜
            </view>
          </Panel.SolidGray>
          <Panel.SolidGray width="146px" height="45px">
            <view
              className={styles['panel-text']}
              onClick={() => {
                dispatch({ type: duck.types.SHOW_HISTORY_RECORD });
              }}
            >
              历史跑操记录
            </view>
          </Panel.SolidGray>
        </view>
        <Divider className={styles.divider} />
        <HomeRecord />
      </View>
      <Modal x-if={showRankList} onClickMask={handleModalMaskClick}>
        <view>排行榜</view>
      </Modal>
      <Modal x-if={showHistoryRecord} onClickMask={handleModalMaskClick}>
        <view>历史记录</view>
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
  compensatedCount: number;
  rank: number;
  speed: string;
}

function HomeStatistic({ compensatedCount, rank, speed }: IHomeStatistic) {
  return (
    <view className={styles['statistic-container']}>
      <Statistic>
        <Statistic.Title>
          <text>补偿次数</text>
          <Icon.Question />
        </Statistic.Title>
        <Statistic.Value>
          <text>+{compensatedCount}</text>
        </Statistic.Value>
      </Statistic>
      <Statistic>
        <Statistic.Title>
          <text>平均排名</text>
        </Statistic.Title>
        <Statistic.Value>
          <text>
            <text className={styles['statistic-small-text']}>NO.</text>
            <text>{rank}</text>
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

interface IHomeRecord {
  records?: any[];
}

function HomeRecord({ records }: IHomeRecord) {
  return (
    <view className={styles.record}>
      <view className={styles['record-title']}>
        <text>跑操记录</text>
        <Icon.GridMode />
      </view>
      <view className={styles['record-list']}>
        <Panel.OutlineGreen className={styles['record-item']} width="347px" height="50px">
          <view className={styles['record-item-left']}>
            <text>🧪</text>
            <text className={styles['record-item-date']}>2020-02-29</text>
            <text className={styles['record-item-duration']}>{"8'20''"}</text>
          </view>
          <view className={styles['record-item-right']}>NO.123</view>
        </Panel.OutlineGreen>
      </view>
    </view>
  );
}

/**
 * Home Page DuckComponents
 */

function HomeRankListModal({ dispatch, duck, store }: DuckProps<HomeDuck>) {
  return (
    <view>
      <view>
        <text>今日排行榜</text>
        <Icon.Question />
      </view>
    </view>
  );
}
