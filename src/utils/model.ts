import { Response, request } from '@/utils/request';
import { ICheckIn, ISemesterCheckIn, IStudent, IUserInfo, IRankToday } from '@/utils/interface';

export const requestCheckInStart = () => request.post<Response<ICheckIn>>('/checkIn/start');

export const requestCheckInEnd = () => request.post<Response<ICheckIn>>('/checkIn/end');

export const requestCheckInRankToday = () => request.get<Response<IRankToday[]>>('/checkIn/rankToday');

export const requestCheckInHistory = () => request.get<Response<ICheckIn[]>>('/checkIn/history');

interface ICheckInMotion {
  motion: string; // emoji表情
  checkInID: number;
}

/**
 *
 * @param {ICheckInMotion} data
 */
export const requestCheckInMotion = (data: ICheckInMotion) =>
  request.post<Response<ICheckIn>, ICheckInMotion>('/checkIn/motion', data);

interface ICheckInLike {
  checkInID: string;
  isLike: boolean;
}

/**
 * @param {ICheckInLike} data
 */
export const requestCheckInLike = (data: ICheckInLike) =>
  request.post<Response<ICheckIn>, ICheckInLike>('/checkIn/like', data);

export const requestCheckInToday = () => request.get<Response<ICheckIn>>('/checkIn/today');

interface IUserAvatar {
  avatarBase64Encode: string;
}

/**
 * @param {IUserAvatar} data
 */
export const requestUserAvatar = (data: IUserAvatar) =>
  request.post<Response<IStudent>, IUserAvatar>('/user/avatar', data);

export const requestUserHistory = () => request.get<Response<ISemesterCheckIn[]>>('/user/history');

export const requestUserInfo = () => request.get<Response<IUserInfo>>('/user/info');

interface IUserBind {
  username: string;
  studentID: string;
  code: string;
  grade: number;
}

/**
 * @param {IUserBind} data
 */
export const requestUserBind = (data: IUserBind) => request.post<Response<IStudent>, IUserBind>('/user/bind', data);

interface IUserLogin {
  code: string;
}

/**
 * @param {IUserLogin} data
 */
export const requestUserLogin = (data: IUserLogin) => request.post<Response<string>, IUserLogin>('/user/login', data);

export const requestUserUnbind = () => request.post<Response<IStudent>>('/user/unbind');

interface IUserBindByPassword {
  username: string;
  password: string;
  wxLoginCode: string;
}

/**
 * @param {IUserBindByPassword} data
 */
export const requestUserBindByPassword = (data: IUserBindByPassword) =>
  request.post<Response<IStudent>, IUserBindByPassword>('/user/bindByPassword', data);

interface IUserBindBySms {
  phone: string;
  smsCode: string;
  wxLoginCode: string;
}

/**
 * @param {IUserBindBySms} data
 */
export const requestUserBindBySms = (data: IUserBindBySms) =>
  request.post<Response<IStudent>, IUserBindBySms>('/user/bindBySms', data);

export const requestUserSendSms = (phoneNumber: string) => request.get(`/user/sendSms?phoneNumber=${phoneNumber}`);
