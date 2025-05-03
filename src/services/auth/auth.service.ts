import { api } from '../config/axios';
import type { AccessTokenResponse, LoginRequest } from '@/types/auth';

export const AuthService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AccessTokenResponse>('/auth/login', data);
    return response.data;
  },
};
