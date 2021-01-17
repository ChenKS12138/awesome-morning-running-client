import { Duck, reduceFromPayload, createToPayload } from '@/utils/duck';
import { LocationDuck } from '@/ducks';
import { parseSecondTime } from '@/utils';
import { EXERCISE_STATUS, EMOJIS } from './index.constants';

export default class ExerciseDuck extends Duck {
  get quickTypes() {
    enum Types {
      SET_USED_TIME,
      SET_CURRENT_COUNT,
      SET_TOTAL_COUNT,
      SET_AVERAGE_TIME,
      SET_PACE,
      SET_EXERCISE_STATUS,
      SET_MOTION,

      SET_TODAY_RANK,
      SET_TODAY_TIME_COST,
      SET_TODAY_PACE,
    }
    return {
      ...Types,
    };
  }
  get reducers() {
    const { types } = this;
    return {
      usedTime: reduceFromPayload<number>(types.SET_USED_TIME, 309),
      currentCount: reduceFromPayload<number>(types.SET_CURRENT_COUNT, 34),
      totalCount: reduceFromPayload<number>(types.SET_TOTAL_COUNT, 35),
      averageTime: reduceFromPayload<number>(types.SET_AVERAGE_TIME, 482),
      pace: reduceFromPayload<number>(types.SET_PACE, 453), // 配速 --- 每公里耗时
      exerciseStatus: reduceFromPayload<EXERCISE_STATUS>(types.SET_EXERCISE_STATUS, EXERCISE_STATUS.RUNNING_GREEN),
      motion: reduceFromPayload(types.SET_MOTION, EMOJIS[0].key),
      todayRank: reduceFromPayload(types.SET_TODAY_RANK, 233),
      todayTimeCost: reduceFromPayload(types.SET_TODAY_TIME_COST, 482),
      todayPace: reduceFromPayload(types.SET_TODAY_PACE, 453),
    };
  }
  get creators() {
    const { types } = this;
    return {
      setMotion: createToPayload(types.SET_MOTION),
    };
  }
  get rawSelectors() {
    type State = this['State'];
    return {
      parsedUsedTime(state: State) {
        return parseSecondTime(state.usedTime);
      },
      parsedAverageTime(state: State) {
        return parseSecondTime(state.averageTime);
      },
      parsedPace(state: State) {
        return parseSecondTime(state.pace);
      },
      parsedTodayTimeCost(state: State) {
        return parseSecondTime(state.todayTimeCost);
      },
      parsedTodayPace(state: State) {
        return parseSecondTime(state.todayPace);
      },
    };
  }
  get quickDucks() {
    return {
      location: LocationDuck,
    };
  }
  *saga() {
    yield null;
  }
}
