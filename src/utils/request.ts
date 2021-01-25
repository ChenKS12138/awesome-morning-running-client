import { isWeChatMiniProgram } from 'universal-env';
import { showModal } from '.';

export interface Response<TData extends any> {
  errCode: number;
  success: boolean;
  data: TData;
  errMsg: string;
}

interface IRequest {
  baseURL: string;
  get<TResponse extends unknown>(url: string): Promise<TResponse>;
  post<TResponse extends unknown, TData extends unknown = unknown>(url: string, data?: TData): Promise<TResponse>;
}

export const request: IRequest = {
  baseURL: REQUEST_BASE_URL || 'http://localhost:3000',
  get(_url: string) {
    return Promise.resolve(null as any);
  },
  post(_url: string) {
    return Promise.resolve(null as any);
  },
};

// wx.request仅在微信小程序下使用
if (isWeChatMiniProgram) {
  const requestToken = () =>
    new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          if (res.code) {
            wx.request({
              method: 'POST',
              url: request.baseURL + '/user/login',
              data: { code: res.code },
              success(response: any) {
                if (response.data.errCode === null) {
                  wx.setStorageSync('jwt_token', response.data.data);
                  resolve(response.data.data);
                } else {
                  reject(response.data.errMsg);
                }
              },
              fail(err) {
                reject(err);
              },
            });
          } else {
            reject(res.errMsg);
          }
        },
        fail(err) {
          reject(err);
        },
      });
    });

  const showErrorModal = (reason: string) => {
    showModal({
      title: '遇到了点错误~',
      content: reason,
      showCancel: false,
    });
  };

  const wrapRequest = (config) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('jwt_token');
      if (token) {
        config.header = { ...config.header, Authorization: 'Bearer ' + token };
      }
      wx.request({
        ...config,
        success(response: any) {
          if (response.data.errCode === null) {
            resolve(config?.success?.(response.data));
          } else if (response.data.errCode === 22) {
            requestToken()
              .then((secondToken) => {
                if (secondToken) {
                  config.header = { Authorization: 'Bearer ' + secondToken };
                  wx.request({
                    ...config,
                    success(secondResponse: any) {
                      resolve(config?.success?.(secondResponse.data));
                    },
                    fail(reason) {
                      reject(reason);
                    },
                  });
                }
              })
              .catch((reason) => {
                wx.redirectTo({
                  url: '/pages/Login/index',
                });
                reject(reason);
              });
          } else {
            showErrorModal(response.data.errMsg);
            reject(response.data.errMsg);
          }
        },
        fail(reason) {
          showErrorModal(String(reason));
          reject(String(reason));
        },
      });
    });
  };

  request.get = function <TResponse extends unknown>(url: string): Promise<TResponse> {
    const requestConfig = {
      method: 'GET',
      url: this.baseURL + url,
      success(response) {
        return response.data;
      },
    };
    return wrapRequest(requestConfig) as Promise<TResponse>;
  };
  request.post = function <TResponse extends unknown, TData extends unknown>(
    url: string,
    data?: TData,
  ): Promise<TResponse> {
    const requestConfig = {
      method: 'POST',
      url: this.baseURL + url,
      data: data as any,
      success(response) {
        return response.data;
      },
    };
    return wrapRequest(requestConfig) as Promise<TResponse>;
  };
}
