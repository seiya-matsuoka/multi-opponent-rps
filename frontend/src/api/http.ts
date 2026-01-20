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

export type RequestJsonParams = {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
  timeoutMs?: number;
};

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
 * requestJson のコア実装を生成する（依存注入）。
 *
 * 目的：
 * - Vitestで fetch / baseUrl を差し替えて、ユニットテストしやすくする
 * - 本番の public API（requestJson の引数形）は変えない
 */
export function createRequestJson(deps: {
  /** baseURL を返す関数（テストでは固定値に差し替え可能） */
  getBaseUrl: () => string | undefined | null;
  /** fetch 実装（テストではモックに差し替え可能） */
  fetchImpl?: typeof fetch;
  /** タイマー（node環境でも動くように差し替え可能） */
  setTimeoutImpl?: typeof setTimeout;
  clearTimeoutImpl?: typeof clearTimeout;
}) {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  const setTimeoutImpl = deps.setTimeoutImpl ?? globalThis.setTimeout;
  const clearTimeoutImpl = deps.clearTimeoutImpl ?? globalThis.clearTimeout;

  /**
   * JSON API 呼び出しの共通関数（fetchベース）。
   *
   * 役割：
   * - baseURL は getBaseUrl() を使用して統一する
   * - タイムアウトを AbortController で実現する
   * - HTTPエラーは ApiError に正規化して throw する
   *
   * @throws ApiError
   * - baseURL 未設定（status=0）
   * - タイムアウト（status=0）
   * - HTTPエラー（status=HTTP status）
   */
  return async function requestJson<T>(params: RequestJsonParams): Promise<T> {
    // baseURL未設定は設定ミスの代表例なので、ここで早期に分かりやすく落とす
    const baseUrl = deps.getBaseUrl();

    if (!baseUrl) {
      throw new ApiError({
        status: 0,
        url: params.path,
        message:
          '接続先の設定が見つかりませんでした。環境変数（VITE_API_BASE_URL）を確認してください。',
      });
    }

    // baseURL と path を結合して最終URLを作る（末尾/先頭のスラッシュゆらぎを吸収）
    const url = joinUrl(baseUrl, params.path);

    // タイムアウト用に AbortController を用意。fetch はデフォルトでタイムアウトが無いので、こちらで制御する
    const controller = new AbortController();
    const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    // タイムアウト到達で abort させる（必ず finally で clearTimeout する）
    const timerId: ReturnType<typeof setTimeout> = setTimeoutImpl(
      () => controller.abort(),
      timeoutMs
    );

    try {
      // JSON API 前提なので content-type は application/json を固定 ＋ body が無いケース（GET 等）は undefined にして送らない
      const res = await fetchImpl(url, {
        method: params.method,
        headers: {
          'content-type': 'application/json',
        },
        body: params.body == null ? undefined : JSON.stringify(params.body),
        signal: controller.signal,
      });

      // レスポンスが JSON の場合のみ読み取る
      const json = await tryReadJson(res);

      // HTTPエラー（res.ok=false）の場合は ApiError に正規化して throw
      if (!res.ok) {
        const body = (json ?? {}) as ApiErrorBody;

        // message 候補を順に拾う（バックエンドのエラー形式に依存しすぎないため Optional中心）
        const message =
          body.message ??
          body.error ??
          `APIエラー: ${res.status} ${res.statusText}（${params.method} ${params.path}）`;

        throw new ApiError({
          status: res.status,
          url,
          message,
          rawBody: json, // デバッグ用に生のJSONも保持しておく
        });
      }

      // 正常系：JSONでないケースは想定しないが、念のため unknown を許容
      return json as T;
    } catch (e) {
      // タイムアウト（AbortError）を ApiError に正規化（status=0 は通信/環境起因のエラーとして扱う）
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new ApiError({
          status: 0,
          url,
          message: `サーバーの起動に時間がかかっています。しばらく待ってからもう一度お試しください。`,
        });
      }

      // それ以外のエラーはそのまま投げる（ネットワーク切断など fetch 由来の例外がここに入る）
      throw e;
    } finally {
      // タイマーの後始末（リーク防止）
      clearTimeoutImpl(timerId);
    }
  };
}

/**
 * 本番用 requestJson。
 * - ENV を参照する場合はここから
 * - テストでは createRequestJson を使う
 */
const requestJsonImpl = createRequestJson({
  getBaseUrl: () => ENV.apiBaseUrl,
});

/**
 * 既存API互換の requestJson（外部からの呼び出し形は変えない）。
 */
export async function requestJson<T>(params: RequestJsonParams): Promise<T> {
  return requestJsonImpl<T>(params);
}
