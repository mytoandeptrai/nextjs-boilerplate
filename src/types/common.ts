export interface MultiLanguageString {
  [key: string]: string;
}

export type MultiLangString = {
  lang: string;
  value: string;
}[];

export interface PageInfo {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface PaginatedListResponse<T> {
  items: T[];
  meta: PageInfo;
}

export type ContentType =
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'image'
  | 'video'
  | 'youtube'
  | 'vimeo'
  | 'text'
  | 'embed'
  | 'audio';

export type QuestionType =
  | 'BooleanQuestion'
  | 'SelectSingleQuestion'
  | 'SelectMultipleQuestion'
  | 'SortQuestion'
  | 'PairQuestion'
  | 'FillQuestion'
  | 'ImageMapQuestion'
  | 'OpenQuestion'
  | 'OpinionSelectMultipleQuestion'
  | 'OpinionOpenQuestion';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
