import axios from 'axios';

import { buildRoute } from '@/constants/routes';
import type { IPaginatedListResponse } from '@/types/type';
import { transformPaginatedList } from '@/utils/pagination';
import { getApiRequestClient } from '../axios';
import { MEDIA_KEYS } from './keys';
import type {
  ICreateMediaRequest,
  IDeleteMediaRequest,
  IGenUploadUrlResponse,
  IGetMediaListParams,
  IMedia,
  IMediaNode,
} from './type';

export const getMediaListRequest = async (params: IGetMediaListParams) => {
  const { data } = await getApiRequestClient().get<IPaginatedListResponse<IMediaNode>>(MEDIA_KEYS.MEDIA, {
    params: { ...params, sort: params.sort?.join(',') },
  });

  return transformPaginatedList(data);
};

export const getMediaRequest = async (id: string): Promise<IMedia> => {
  const { data } = await getApiRequestClient().get<IMedia>(buildRoute(MEDIA_KEYS.MEDIA_DETAIL, { id }));

  return data;
};

export const createMediaRequest = async (body: ICreateMediaRequest): Promise<IGenUploadUrlResponse> => {
  const { data } = await getApiRequestClient().post<IGenUploadUrlResponse>(MEDIA_KEYS.MEDIA, body);

  return data;
};

/** Asks the backend for a presigned URL, PUTs the file straight to storage, then reads the media back. */
export const uploadMediaRequest = async (file: File) => {
  const upload = await createMediaRequest({
    fileName: file.name,
    fileMime: file.type,
    fileSize: file.size,
    access: 'public',
  });

  await axios.put(upload.presignedUrl, file, { headers: { 'Content-Type': file.type } });

  const media = await getMediaRequest(upload.mediaId);

  return { id: media.id, url: media.url };
};

export const deleteMediaRequest = async (body: IDeleteMediaRequest): Promise<IMedia> => {
  const { data } = await getApiRequestClient().delete<IMedia>(MEDIA_KEYS.MEDIA, { data: body });

  return data;
};
