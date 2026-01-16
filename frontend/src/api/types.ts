/**
 * API で使用する型定義。
 *
 * - Request はUI側の入力バリデーションにも使えるため強い型で固定する
 */

/** じゃんけんの手（バックエンドの enum に合わせる） */
export type RpsHand = 'ROCK' | 'PAPER' | 'SCISSORS';

/** POST /api/rps のリクエスト */
export type RpsRequest = Readonly<{
  hand: RpsHand;
  opponents: number;
}>;

/** GET /api/health のレスポンス（バックエンド実装に合わせた最小の型） */
export type HealthResponse = Readonly<{
  status: string;
}>;
