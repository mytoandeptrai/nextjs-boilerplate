import { requestInternal } from '../axios';
import { ADMIN_SETTINGS_KEYS } from './keys';
import type { SettingsBody } from './schema';

export const getSettingsRequest = async (): Promise<SettingsBody> =>
  (await requestInternal.get<SettingsBody>(ADMIN_SETTINGS_KEYS.ROOT)).data;

export const updateSettingsRequest = async (body: SettingsBody): Promise<SettingsBody> =>
  (await requestInternal.put<SettingsBody>(ADMIN_SETTINGS_KEYS.ROOT, body)).data;
