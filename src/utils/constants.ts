import {
  EMOJI_UNAMUSED_FACE,
  EMOJI_GRINNING_FACE,
  EMOJI_FACE_WITH_RAISED_EYEBROW,
  EMOJI_LOUDLY_CRYING_FACE,
} from '@/assets';

/**
 * 跑操运动状态
 */
export enum EXERCISE_STATUS {
  RUNNING_GREEN, // 跑操中 剩余时间 4~10mins
  RUNNING_ORANGE, // 跑操中 剩余时间 1~4mins
  RUNNING_RED, // 跑操中 剩余时间 0~1mins
  OEVERTIME, // 跑操中 超时
  FINISH, // 完成跑操
}

/**
 * 记录心情 emoji
 * code 被作为key不应该重复
 */
export const EMOJIS = [
  {
    src: EMOJI_GRINNING_FACE,
    value: '😀',
  },
  {
    src: EMOJI_FACE_WITH_RAISED_EYEBROW,
    value: '🤨',
  },
  {
    src: EMOJI_LOUDLY_CRYING_FACE,
    value: '😭',
  },
  {
    src: EMOJI_UNAMUSED_FACE,
    value: '😒',
  },
];

/**
 * 跑操记录展示模式
 */
export enum RUNNING_RECORD_DISPLAY_MODAL {
  GRID,
  LIST,
}

/**
 * 签到状态
 */
export const CHECK_IN_STATUS = {
  RUNNING: 0,
  IN_TIME_FINISH: 1,
  OVERTIME_FINISH: 2,
};

export const VALID_SCENE_EVENT = {
  CHECK_IN: 'checkIn',
};

export const VALID_SCENE_TYPE = {
  START: 'start',
  END: 'end',
};

export const VALID_SENCE = {
  [VALID_SCENE_EVENT.CHECK_IN]: [VALID_SCENE_TYPE.START, VALID_SCENE_TYPE.END],
};

export enum BIND_TYPE {
  BIND_BY_PASSWORD,
  BIND_BY_SMS,
}
