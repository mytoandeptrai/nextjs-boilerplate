import { NextRequest } from 'next/server';

import proxy from '../proxy';

const call = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost:3000${path}`, cookie ? { headers: { cookie } } : undefined));

describe('proxy session guard', () => {
  it('sends anonymous visitors to the login page, keeping the locale', () => {
    expect(call('/item1').headers.get('location')).toBe('http://localhost:3000/login');
    expect(call('/vi/item1').headers.get('location')).toBe('http://localhost:3000/vi/login');
  });

  it('keeps signed-in users away from the login page', () => {
    expect(call('/login', 'accessToken=abc').headers.get('location')).toBe('http://localhost:3000/');
    expect(call('/vi/login', 'refreshToken=abc').headers.get('location')).toBe('http://localhost:3000/vi');
  });

  it('lets anonymous visitors reach the login page', () => {
    expect(call('/login').headers.get('location')).toBeNull();
  });

  it('lets signed-in users reach protected pages', () => {
    expect(call('/item1', 'accessToken=abc').headers.get('location')).toBeNull();
  });
});
