/**
 * フロントエンドの環境変数をまとめた窓口。
 *
 * 目的：
 * - `import.meta.env` への直接アクセスを各所に散らさない
 * - 環境変数名の変更や追加があっても、修正箇所をこのファイルに集約する
 *
 * 注意：
 * - Vite の仕様上、クライアント側で参照できる環境変数（import.meta.env）は `VITE_` で始まるもののみ
 */
export const ENV = {
  /**
   * バックエンドAPIのベースURL
   *
   * 例：
   * - ローカル: http://localhost:8080
   * - 本番(Render): https://xxxx.onrender.com
   *
   * 未設定のままAPIを呼ぶと ApiError を投げる（http.ts 側で検知）。
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
} as const;
