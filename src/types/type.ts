import type { FC, PropsWithChildren, SVGProps } from 'react';

/* -------------------------------------------------------------------------- */
/*                                   React                                    */
/* -------------------------------------------------------------------------- */

/** Function component that accepts children. */
export type FCC<P = Record<string, unknown>> = FC<PropsWithChildren<P>>;

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/** Props every App Router page receives. */
export type PageProps<P extends Record<string, string | string[]> = Record<string, string>> = {
  params: Promise<P>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Props every App Router layout receives. */
export type LayoutProps<P extends Record<string, string | string[]> = Record<string, string>> = {
  children: React.ReactNode;
  params: Promise<P>;
};

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];

/* -------------------------------------------------------------------------- */
/*                                  API / HTTP                                */
/* -------------------------------------------------------------------------- */

export interface IPageInfo {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
}

export interface IPaginatedListResponse<T> {
  items: T[];
  meta: IPageInfo;
}

/** Normalised error every rejected request resolves to (see `src/api/interceptors.ts`). */
export interface IApiError {
  status: number;
  message: string;
  code?: string | number;
  details?: unknown;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IMultiLanguageString {
  [key: string]: string;
}
