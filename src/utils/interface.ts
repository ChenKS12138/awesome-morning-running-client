export interface ICheckIn {
  id: number;
  startAt: number;
  endAt: number;
  status: number;
  rank: number;
  dateTag: string;
  createAt: number;
  updateAt: number;
  likeCount: number;
  motion: string;
  userID: number;
  semesterRunningID: number;
}

export interface IStudent {
  id: number;
  studentID: string;
  username: string;
  openID: string;
  avatarBase64Encode: string;
  grade: number;
  createAt: number;
  updateAt: number;
}

export interface ISemesterCheckIn {
  academicYear: number;
  semester: number;
  totalCount: number;
  isPass: boolean;
  currentCount: number;
}

export interface IUserInfo {
  currentCount: number;
  totalCount: number;
  compensateCount: number;
  rank: number;
  averageCostSecond: number;
  username: string;
}

export interface IRankToday {
  id: number;
  username: string;
  avatarBase64Encode: string;
  startAt: number;
  endAt: number;
  rank: number;
  likeCount: number;
  isLike: number;
}

/**
 * 该同学每日跑操情况
 */
export interface RunningRecord {
  year: number;
  month: number;
  day: number;
  /** ranking为null表示未完成 */
  ranking: number | null;
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
