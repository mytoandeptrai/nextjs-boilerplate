import { generateContent, GeminiError } from '../gemini';

const serverEnv = vi.hoisted(() => ({ GEMINI_API_KEY: 'test-key' as string | undefined, GEMINI_MODEL: 'test-model' }));

vi.mock('server-only', () => ({}));
vi.mock('@/constants/env.server', () => ({ serverEnv }));

const fetchMock = vi.fn();
const request = { system: 'rules', contents: [{ role: 'user' as const, parts: [{ text: 'hi' }] }] };
const answer = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });
const ok = () => answer(200, { candidates: [{ content: { parts: [{ text: 'hello' }] } }] });

beforeEach(() => {
  serverEnv.GEMINI_API_KEY = 'test-key';
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('generateContent', () => {
  it('sends the key in a header, never in the address, and returns the model turn', async () => {
    fetchMock.mockResolvedValue(ok());

    expect(await generateContent(request)).toEqual({ role: 'model', parts: [{ text: 'hello' }] });

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('test-key');
    expect(JSON.parse(init.body).systemInstruction).toEqual({ parts: [{ text: 'rules' }] });
  });

  it('reports an exhausted quota (429) as overloaded without trying again', async () => {
    fetchMock.mockResolvedValue(answer(429, { error: { status: 'RESOURCE_EXHAUSTED' } }));

    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'overloaded' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('tries a busy model (503) once more before reporting overloaded', async () => {
    fetchMock.mockImplementation(async () => answer(503));

    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'overloaded' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('answers when the second try gets through', async () => {
    fetchMock.mockResolvedValueOnce(answer(503)).mockResolvedValueOnce(ok());

    expect((await generateContent(request)).parts[0]?.text).toBe('hello');
  });

  it('reports a timeout or a network failure as overloaded', async () => {
    fetchMock.mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError'));

    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'overloaded' });
  });

  it.each([400, 403, 404])('reports %d as a failure, not as overload', async (status) => {
    fetchMock.mockResolvedValue(answer(status));

    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'failed' });
  });

  it('reports an answer without content as a failure', async () => {
    fetchMock.mockResolvedValue(answer(200, { candidates: [{ finishReason: 'SAFETY' }] }));

    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'failed' });
  });

  it('does not call Gemini without a key', async () => {
    serverEnv.GEMINI_API_KEY = undefined;

    await expect(generateContent(request)).rejects.toBeInstanceOf(GeminiError);
    await expect(generateContent(request)).rejects.toMatchObject({ reason: 'unavailable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
