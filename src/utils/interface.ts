/**
 * 该同学每日跑操情况
 */
export interface RunningRecord {
  year: number;
  month: number;
  day: number;
  ranking: number | null; // ranking为null表示未完成
  speed: string;
  mood: string;
}

/**
 * 今日排行榜情况
 */
export interface RankItem {
  avatarUri: string;
  username: string;
  startTime: string;
  endTime: string;
  speed: string;
  likeCount: number;
  isLiked: boolean;
  ranking: number;
}

/**
 * 每一学期跑操总体情况
 */
export interface HisotryTermRecordItem {
  annual: string;
  term: number;
  count: number;
  isPass: boolean;
}
