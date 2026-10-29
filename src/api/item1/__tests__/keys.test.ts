import { item1QueryKeys } from '../keys';

describe('item1QueryKeys', () => {
  it('nests every key under `all` so one invalidation clears the domain', () => {
    expect(item1QueryKeys.list({ page: 1 })).toEqual(['item1', 'list', { page: 1 }]);
    expect(item1QueryKeys.detail('7')).toEqual(['item1', 'detail', '7']);
    expect(item1QueryKeys.list()[0]).toBe(item1QueryKeys.all[0]);
  });
});
