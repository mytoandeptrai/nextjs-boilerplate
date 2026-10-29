import { addNoteAction, greetAction } from '../actions';
import { MAX_NAME_LENGTH } from '../const';

const form = (name: string) => {
  const data = new FormData();
  data.set('name', name);

  return data;
};

describe('react 19 server actions', () => {
  it('greets a valid name and trims it', async () => {
    expect(await greetAction({ status: 'idle' }, form('  Ada '))).toEqual({ status: 'success', name: 'Ada' });
  });

  it('returns translatable error keys instead of throwing', async () => {
    expect(await greetAction({ status: 'idle' }, form('   '))).toEqual({ status: 'error', errorKey: 'nameRequired' });
    expect(await greetAction({ status: 'idle' }, form('x'.repeat(MAX_NAME_LENGTH + 1)))).toEqual({
      status: 'error',
      errorKey: 'nameTooLong',
    });
  });

  it('saves a note and rejects the ones containing "fail"', async () => {
    await expect(addNoteAction('hello')).resolves.toMatchObject({ text: 'hello' });
    await expect(addNoteAction('this will FAIL')).rejects.toThrow();
  });
});
