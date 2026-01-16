import { ENV } from '../config/env';

/**
 * API呼び出しで返ってくる可能性のある「エラーJSON」を表現する型。
 */
type ApiErrorBody = Partial<{
  message: string;
  error: string;
  code: string;
  status: number;
  path: string;
  details: unknown;
}>;

/**
 * API呼び出しに失敗したことを表す例外。
 *
 * - status: HTTPステータス（タイムアウト等の通信エラーは 0）
 * - message: ユーザー表示/ログの中心となるメッセージ
 * - url: 失敗したURL
 * - rawBody: エラー応答の生JSON（デバッグ用）
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly rawBody?: unknown;

  constructor(params: { status: number; url: string; message: string; rawBody?: unknown }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.url = params.url;
    this.rawBody = params.rawBody;
  }
}

/** fetch のタイムアウト（ms） */
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * baseURL と path を安全に結合する（// を避ける）。
 */
function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * JSONレスポンスを読み取る。JSONでない場合は undefined。
 */
async function tryReadJson(res: Response): Promise<unknown | undefined> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return undefined;

  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

/**
 * JSON API 呼び出しの共通関数（fetchベース）。
 *
 * 役割：
 * - baseURL は ENV.apiBaseUrl を使用して統一する
 * - タイムアウトを AbortController で実現する
 * - HTTPエラーは ApiError に正規化して throw する
 *
 * @throws ApiError
 * - VITE_API_BASE_URL 未設定（status=0）
 * - タイムアウト（status=0）
 * - HTTPエラー（status=HTTP status）
 *
 * @example
 *   const res = await requestJson<{ status: string }>({ method: "GET", path: "/api/health" })
 */
export async function requestJson<T>(params: {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  timeoutMs?: number;
}): Promise<T> {
  const baseUrl = ENV.apiBaseUrl;

  if (!baseUrl) {
    throw new ApiError({
      status: 0,
      url: params.path,
      message: 'VITE_API_BASE_URL が未設定です（環境変数を確認してください）',
    });
  }

  const url = joinUrl(baseUrl, params.path);

  const controller = new AbortController();
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: params.method,
      headers: {
        'content-type': 'application/json',
      },
      body: params.body == null ? undefined : JSON.stringify(params.body),
      signal: controller.signal,
    });

    const json = await tryReadJson(res);

    if (!res.ok) {
      // message の候補をバックエンドの形式に依存しすぎないよう安全に拾う
      const body = (json ?? {}) as ApiErrorBody;
      const message =
        body.message ??
        body.error ??
        `APIエラー: ${res.status} ${res.statusText}（${params.method} ${params.path}）`;

      throw new ApiError({
        status: res.status,
        url,
        message,
        rawBody: json,
      });
    }

    // 正常系：JSONでないケースは想定しないが、念のため unknown を許容
    return json as T;
  } catch (e) {
    // AbortError（タイムアウト）を分かりやすくする
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError({
        status: 0,
        url,
        message: `タイムアウトしました（${timeoutMs}ms）: ${params.method} ${params.path}`,
      });
    }
    throw e;
  } finally {
    window.clearTimeout(timerId);
  }
}
