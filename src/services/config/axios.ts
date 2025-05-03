import axios, {
  type AxiosResponse,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '@/constants';
import { ServiceError } from '../error';

interface FailedRequests {
  resolve: (value: AxiosResponse) => void;
  reject: (value: AxiosError) => void;
  config: AxiosRequestConfig;
  error: AxiosError;
}

let failedRequests: FailedRequests[] = [];
let isTokenRefreshing = false;

const defaultHeaders = {
  'Content-Type': 'application/json',
  LANG: 'vi',
  Timezone: 'Asia/Saigon',
} as const;

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}`,
  headers: defaultHeaders,
});

const handleSuccess = (res: AxiosResponse) => {
  const result = res.data;

  return result;
};

const handleError = async (error: AxiosError) => {
  const originalRequest = error.config!;
  const status = error?.response?.status;

  if (status !== 401) {
    return Promise.reject(error);
  }

  if (isTokenRefreshing) {
    return new Promise((resolve, reject) => {
      failedRequests.push({
        resolve,
        reject,
        config: originalRequest,
        error,
      });
    });
  }

  isTokenRefreshing = true;
  try {
    const refreshToken = '';
    const urlEndpoint = `${process.env.API_URL}/users/token/refresh`;
    await axios.post(urlEndpoint, {
      refreshToken,
    });
    failedRequests.forEach(({ resolve, reject, config }) => {
      api(config)
        .then((resHttp) => resolve(resHttp))
        .catch((errorHttp) => reject(errorHttp));
    });
  } catch (_error: unknown) {
    failedRequests.forEach(({ reject, error: errorFailedRequest }) => reject(errorFailedRequest));
    return await Promise.reject(error);
  } finally {
    failedRequests = [];
    isTokenRefreshing = false;
  }

  return api(originalRequest);
};

api.interceptors.response.use((response) => {
  if (response?.data?.error_code) {
    let message = 'Unknown error';
    if (typeof response?.data?.message === 'string') {
      message = response?.data?.message;
    } else if (Array.isArray(response?.data?.message)) {
      message = response?.data?.message.join(', ');
    }
    throw new ServiceError(message);
  }

  return response.data;
});

api.interceptors.response.use(handleSuccess, handleError);

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function setupBearerAuthorization(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export { api, setupBearerAuthorization };

export default api;
