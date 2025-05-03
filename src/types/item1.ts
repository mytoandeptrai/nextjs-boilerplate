export interface Item1 {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItem1Request {
  name: string;
}

export interface UpdateItem1Request {
  id: string;
  name: string;
}
