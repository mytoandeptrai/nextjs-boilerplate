import { useMutation } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { sendChatRequest } from './requests';
import type { ChatBody } from './schema';
import type { IChatResponse } from './type';

export const useSendChatMutation = () =>
  useMutation<IChatResponse, IApiError, ChatBody>({
    mutationKey: ['send-chat'],
    mutationFn: sendChatRequest,
  });
