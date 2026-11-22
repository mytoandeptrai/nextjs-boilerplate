import type { UploadFolder } from '@/constants/const';
import { requestInternal } from '../axios';
import { UPLOAD_KEYS } from './keys';
import type { IUploadResponse } from './type';

export const uploadImageRequest = async ({
  file,
  folder,
}: {
  file: Blob;
  folder: UploadFolder;
}): Promise<IUploadResponse> => {
  const form = new FormData();

  form.append('file', file, 'upload');
  form.append('folder', folder);

  // Let the browser set the multipart boundary.
  const { data } = await requestInternal.post<IUploadResponse>(UPLOAD_KEYS.CREATE, form, {
    headers: { 'Content-Type': undefined },
  });

  return data;
};
