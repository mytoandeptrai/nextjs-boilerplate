import { messages } from '..';

const flatten = (value: unknown, prefix = ''): [string, string][] =>
  Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof child === 'string' ? [[path, child] as [string, string]] : flatten(child, path);
  });

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('messages', () => {
  const en = Object.fromEntries(flatten(messages.en));
  const vi = Object.fromEntries(flatten(messages.vi));

  it('has the same keys in every locale', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });

  it('uses the same ICU placeholders in every locale', () => {
    for (const key of Object.keys(en)) expect(placeholders(vi[key]), key).toEqual(placeholders(en[key]));
  });
});
