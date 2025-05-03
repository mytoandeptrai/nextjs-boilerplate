export interface MediaStatus {
  [key: string]: unknown;
}

export interface Media {
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
  status: MediaStatus;
}

export interface MediaNode {
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
  status: MediaStatus;
}

export interface CreateMediaRequest {
  fileName: string;
  fileMime: string;
  fileSize: number;
  access: 'public' | 'private';
}

export interface GenUploadUrlResponse {
  presignedUrl: string;
  mediaId: string;
}

export interface MarkUploadDoneRequest {
  // From the OpenAPI schema, this appears to be an empty object
  [key: string]: never;
}

export interface DeleteMediaRequest {
  id: string;
}
