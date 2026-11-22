import { useMutation } from '@tanstack/react-query';

import type { UploadFolder } from '@/constants/const';
import type { IApiError } from '@/types/type';
import { uploadImageRequest } from './requests';
import type { IUploadResponse } from './type';

export const useUploadImageMutation = () =>
  useMutation<IUploadResponse, IApiError, { file: Blob; folder: UploadFolder }>({ mutationFn: uploadImageRequest });
