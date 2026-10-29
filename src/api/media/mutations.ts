import { useMutation } from '@tanstack/react-query';

import type { IApiError } from '@/types/type';
import { uploadMediaRequest } from './requests';

interface IUploadMediaOptions {
  onSuccess?: (result: { id: string; url: string }) => void;
  onError?: (error: IApiError) => void;
}

export const useUploadMedia = (options?: IUploadMediaOptions) => {
  const { mutateAsync, isPending } = useMutation<{ id: string; url: string }, IApiError, File>({
    mutationFn: uploadMediaRequest,
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  });

  return {
    upload: mutateAsync,
    isUploading: isPending,
  };
};
