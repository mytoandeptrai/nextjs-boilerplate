import * as auth from './auth';
import * as media from './media';
import * as item1 from './item1';
const services = {
  ...auth,
  ...media,
  ...item1,
};

export default services;
