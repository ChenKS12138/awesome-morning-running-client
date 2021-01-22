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
