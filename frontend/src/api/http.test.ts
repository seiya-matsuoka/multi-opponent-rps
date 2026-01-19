import { describe, it, expect } from 'vitest';
import { ApiError, createRequestJson } from './http';

/**
 * fetch の戻り値（Responseのようなもの）を作るヘルパー。
 *
 * - fetch の戻り値は本来 `Response` 型だが、本物を生成するのは手間となる（環境依存も増える）
 * - 今回の requestJson 実装が参照しているのは以下だけ：
 *   - status / ok / statusText
 *   - headers.get('content-type')
 *   - json()
 * - なので必要な形だけを自前で用意して、テストを軽量＆安定化する
 */
function mockResponse(params: {
  status: number;
  ok: boolean;
  statusText?: string;
  contentType?: string;
  json?: () => Promise<unknown>;
}) {
  return {
    status: params.status,
    ok: params.ok,
    statusText: params.statusText ?? '',
    headers: {
      // requestJson 側が content-type を見て JSON と判断するため、ここだけ実装する。
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? (params.contentType ?? '') : '',
    },
    // JSON を返すための関数。テストごとに返却内容を変えたいので関数として渡す。
    json: params.json ?? (async () => ({})),
  } as unknown as Response;
}

describe('createRequestJson', () => {
  it('200 + JSON のとき、パースした値を返す', async () => {
    /**
     * fetch のモック（差し替え対象）。
     *
     * - 通信は一切せず、必ず「200 OK + JSON」を返す Response を返す
     * - requestJson が res.ok を見て成功扱いし、res.json() の結果を返すことを確認する
     */
    const fetchMock: typeof fetch = (async () =>
      mockResponse({
        status: 200,
        ok: true,
        contentType: 'application/json',
        json: async () => ({ status: 'ok' }),
      })) as unknown as typeof fetch;

    /**
     * createRequestJson で requestJson の“本体”を生成する。
     *
     * - getBaseUrl：テストでは固定のURLを返す（ENVに依存しない）
     * - fetchImpl：上で作った fetchMock を注入する
     */
    const requestJson = createRequestJson({
      getBaseUrl: () => 'https://example.com',
      fetchImpl: fetchMock,
    });

    /**
     * 実行：GET /api/health を呼ぶ想定で requestJson を呼び出す。
     * - path は joinUrl により baseUrl と結合される
     * - 返り値が `{ status: "ok" }` になることを期待
     */
    const data = await requestJson<{ status: string }>({
      method: 'GET',
      path: '/api/health',
    });

    expect(data.status).toBe('ok');
  });

  it('400 のとき、ApiError を投げる（rawBody に JSON を入れる）', async () => {
    /**
     * fetch のモック（エラー応答を返す）。
     *
     * - 「400 Bad Request + JSONボディ」を返す Response を返す
     * - requestJson が res.ok を見て失敗扱いし、ApiError を throw することを確認する
     */
    const fetchMock: typeof fetch = (async () =>
      mockResponse({
        status: 400,
        ok: false,
        statusText: 'Bad Request',
        contentType: 'application/json',
        json: async () => ({ error: 'BAD_REQUEST' }),
      })) as unknown as typeof fetch;

    const requestJson = createRequestJson({
      getBaseUrl: () => 'https://example.com',
      fetchImpl: fetchMock,
    });

    /**
     * まずは「ApiError が投げられること」だけを確認する。
     * rejects.toBeInstanceOf(ApiError) は、例外型の確認に向く。
     */
    await expect(
      requestJson({
        method: 'POST',
        path: '/api/rps',
        body: { hand: 'ROCK', opponents: 3 },
      })
    ).rejects.toBeInstanceOf(ApiError);

    /**
     * 次に「ApiError の中身」を確認する。
     * - status が 400
     * - rawBody にレスポンスJSONが入っている
     */
    try {
      await requestJson({
        method: 'POST',
        path: '/api/rps',
        body: { hand: 'ROCK', opponents: 3 },
      });
    } catch (e) {
      const err = e as ApiError;
      expect(err.status).toBe(400);
      expect(err.rawBody).toEqual({ error: 'BAD_REQUEST' });
    }
  });
});
