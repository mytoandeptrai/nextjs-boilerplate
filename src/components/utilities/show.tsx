import type { FCC } from '@/types/type';

export const Show: FCC<{ when?: boolean }> = (props) => {
  return props.when ? props.children : null;
};
