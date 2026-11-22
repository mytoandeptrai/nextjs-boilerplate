import { requestInternal } from '../axios';
import { CHAT_KEYS } from './keys';
import type { ChatBody } from './schema';
import type { IChatResponse, IChatStatus } from './type';

export const getChatStatusRequest = async (): Promise<IChatStatus> =>
  (await requestInternal.get<IChatStatus>(CHAT_KEYS.SEND)).data;

export const sendChatRequest = async (body: ChatBody): Promise<IChatResponse> => {
  const { data } = await requestInternal.post<IChatResponse>(CHAT_KEYS.SEND, body);

  return data;
};
