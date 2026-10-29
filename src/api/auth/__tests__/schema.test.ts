import { createLoginSchema } from '../schema';

const schema = createLoginSchema({ invalidEmail: 'bad email', passwordRequired: 'need password' });

describe('createLoginSchema', () => {
  it('accepts valid credentials', () => {
    expect(schema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('reports the translated messages', () => {
    const result = schema.safeParse({ email: 'nope', password: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message).sort()).toEqual(['bad email', 'need password']);
  });
});
