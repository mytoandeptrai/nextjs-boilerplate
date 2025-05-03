import type { FC, PropsWithChildren, SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface IMeta {
  code: number;
  message: string;
}

export type TResponse<T> = {
  meta: IMeta;
  data: T;
};

export type FCC<P = {}> = FC<PropsWithChildren<P>>;

export interface IOption<T> {
  label: string;
  value: T;
}

export interface IPagination {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaging {
  page: number;
  limit: number;
  total?: number;
}

export type TCommonSort = 'ASC' | 'DESC';
