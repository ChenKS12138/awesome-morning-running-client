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
