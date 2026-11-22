import { requestInternal } from '../axios';
import { CHAT_KEYS } from './keys';
import type { ChatBody } from './schema';
import type { IChatResponse } from './type';

export const sendChatRequest = async (body: ChatBody): Promise<IChatResponse> => {
  const { data } = await requestInternal.post<IChatResponse>(CHAT_KEYS.SEND, body);

  return data;
};
