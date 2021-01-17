import { RequestResponse, request } from '@/utils/request';
import { RunningRecord } from '@/utils/interface';

interface IReqeustCheckInModel {
  userId: string;
  studentId: string;
  encryptionTime: string;
  miniProgramKey: string;
  dateTag: string;
}
/**
 * @param {IReqeustCheckInModel} data
 */
export const requestCheckInStart = (data: IReqeustCheckInModel) => request.post('/checkIn/start', data);

/**
 * @param {IReqeustCheckInModel} data
 */
export const requestCheckInEnd = (data: IReqeustCheckInModel) => request.post('/checkIn/end', data);

export const reqeustCheckInRandToday = () => request.get('/checkIn/rankToday');

export const requestCheckInHistory = () => request.get('/checkIn/history');

interface IRequestCheckInUserStatus {
  userId: string;
  dateTag: string;
  miniProgramKey: string;
}

/**
 * @param {IRequestCheckInUserStatus} param0
 */
export const requestUserStatus = ({ userId, dateTag, miniProgramKey }: IRequestCheckInUserStatus) =>
  request.get<RequestResponse<RunningRecord>>(
    `/checkIn/userStatus?userId=${userId}&dateTag=${dateTag}&miniProgramKey=${miniProgramKey}`,
  );
