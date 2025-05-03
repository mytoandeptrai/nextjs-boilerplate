import type { FCC } from '@/types-1';

export const Show: FCC<{ when?: boolean }> = (props) => {
  return <>{props.when ? <>{props.children}</> : null}</>;
};
