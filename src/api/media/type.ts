export interface IMediaStatus {
  [key: string]: unknown;
}

export interface IMedia {
  id: string;
  name: string;
  key: string;
  ext: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  url: string;
  provider: string;
  userId: string;
  status: IMediaStatus;
}

export interface IMediaNode {
  id: string;
  name: string;
  key: string;
  ext: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  url: string;
  provider: string;
  userId: string;
  status: IMediaStatus;
}

export interface ICreateMediaRequest {
  fileName: string;
  fileMime: string;
  fileSize: number;
  access: 'public' | 'private';
}

export interface IGenUploadUrlResponse {
  presignedUrl: string;
  mediaId: string;
}

export interface IDeleteMediaRequest {
  id: string;
}

export interface IGetMediaListParams {
  page?: number;
  limit?: number;
  sort?: string[];
  name?: string;
  is_all?: boolean;
}
