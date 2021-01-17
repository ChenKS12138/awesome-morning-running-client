import { isWeChatMiniProgram } from 'universal-env';

export interface RequestResponse<TData extends any> {
  errCode: number;
  success: boolean;
  data: TData;
  errMsg: string;
}

interface IRequest {
  baseURL: string;
  get<TResponse extends unknown>(url: string): Promise<TResponse>;
  post<TResponse extends unknown, TData extends unknown>(url: string, data: TData): Promise<TResponse>;
}

export const request: IRequest = {
  baseURL: 'http://localhost:8000',
  get(_url: string) {
    return Promise.resolve(null as any);
  },
  post(_url: string) {
    return Promise.resolve(null as any);
  },
};

if (isWeChatMiniProgram) {
  request.get = function <TResponse extends unknown>(url: string): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        success(response) {
          resolve(response.data as TResponse);
        },
        fail(reason) {
          reject(reason);
        },
      });
    });
  };
  request.post = function <TResponse extends unknown, TData extends unknown>(
    url: string,
    data: TData,
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        data: data as any,
        success(response) {
          resolve(response.data as TResponse);
        },
        fail(reason) {
          reject(reason);
        },
      });
    });
  };
}
