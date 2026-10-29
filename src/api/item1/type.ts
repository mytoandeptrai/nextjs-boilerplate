export interface IItem1 {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateItem1Body {
  name: string;
}

export interface IUpdateItem1Body {
  id: string;
  name: string;
}

export interface IGetItem1ListParams {
  page?: number;
  limit?: number;
  sort?: string[];
  name?: string;
}
