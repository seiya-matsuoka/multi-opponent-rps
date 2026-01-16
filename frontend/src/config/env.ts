/**
 * フロントエンドで使用する環境変数をまとめる。
 *
 * ※Vite の仕様上で、import.meta.env から参照できるのは `VITE_` で始まる変数のみ。
 */
export const ENV = {
  /**
   * バックエンドAPIのベースURL
   * 例: http://localhost:8080 / https://xxxx.onrender.com
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
} as const;
