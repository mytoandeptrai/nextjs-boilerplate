import type { Media, MediaNode, DeleteMediaRequest, GenUploadUrlResponse, CreateMediaRequest } from '@/types/media';
import type { PaginatedListResponse } from '@/types/common';
import { api } from '../config/axios';
import { transformPaginatedList } from '@/utils/pagination';
import axios from 'axios';

export class MediaService {
  static async find(params: {
    page?: number;
    limit?: number;
    sort?: string[];
    name?: string;
    is_all?: boolean;
  }) {
    const response = await api.get<PaginatedListResponse<MediaNode>>('/media', {
      params,
    });
    return transformPaginatedList(response.data);
  }

  static async get(id: string) {
    const response = await api.get<Media>(`/media/${id}`);
    return response.data;
  }

  static async create(data: CreateMediaRequest) {
    const response = await api.post<GenUploadUrlResponse>('/media', data);
    return response.data;
  }

  static async upload(file: File) {
    const response = await this.create({
      fileName: file.name,
      fileMime: file.type,
      fileSize: file.size,
      access: 'public',
    });

    console.log('uploading response', response);

    await axios.put(response.presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    const media = await this.get(response.mediaId);

    console.log('uploading response', media);

    return {
      id: media.id,
      url: media.url,
    };
  }

  static async delete(data: DeleteMediaRequest) {
    const response = await api.delete<Media>('/media', {
      data,
    });
    return response.data;
  }
}
