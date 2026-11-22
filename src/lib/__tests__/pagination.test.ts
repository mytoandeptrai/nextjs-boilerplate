import { getPageItems, getTotalPages, parsePage } from '../pagination';

describe('parsePage', () => {
  it.each([
    ['3', 3],
    ['1', 1],
    [undefined, 1],
    ['0', 1],
    ['-2', 1],
    ['2.5', 1],
    ['abc', 1],
    [['2', '3'], 1],
    ['99999999999', 1],
  ])('reads %j as page %i', (value, page) => {
    expect(parsePage(value)).toBe(page);
  });
});

describe('getTotalPages', () => {
  it('rounds up and never goes below one page', () => {
    expect(getTotalPages(0, 12)).toBe(1);
    expect(getTotalPages(12, 12)).toBe(1);
    expect(getTotalPages(13, 12)).toBe(2);
  });
});

describe('getPageItems', () => {
  it('lists every page when there are few', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('keeps the first, last and neighbouring pages and marks the gaps', () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, null, 12]);
    expect(getPageItems(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
    expect(getPageItems(12, 12)).toEqual([1, null, 11, 12]);
  });

  it('shows the page itself instead of an ellipsis for a single hidden page', () => {
    expect(getPageItems(3, 12)).toEqual([1, 2, 3, 4, null, 12]);
    expect(getPageItems(10, 12)).toEqual([1, null, 9, 10, 11, 12]);
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
