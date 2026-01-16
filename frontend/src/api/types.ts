/**
 * API で使用する型定義。
 *
 * - Request はUI側の入力バリデーションにも使えるため強い型で固定する
 */

/** GET /api/health のレスポンス（バックエンド実装に合わせた最小の型） */
export type HealthResponse = Readonly<{
  status: string;
}>;

/** じゃんけんの手（バックエンドの enum に合わせる） */
export type RpsHand = 'ROCK' | 'PAPER' | 'SCISSORS';

/** POST /api/rps のリクエスト */
export type RpsRequest = Readonly<{
  hand: RpsHand;
  opponents: number;
}>;

/** 1対戦ごとの勝敗 */
export type RpsRoundResult = 'WIN' | 'LOSE' | 'DRAW';

/** 相手ごとの結果 */
export type RpsResultItem = Readonly<{
  opponentIndex: number;
  opponentHand: RpsHand;
  result: RpsRoundResult;
}>;

/** 集計結果 */
export type RpsSummary = Readonly<{
  win: number;
  lose: number;
  draw: number;
}>;

/** POST /api/rps のレスポンス */
export type RpsResponse = Readonly<{
  playerHand: RpsHand;
  opponents: number;
  results: ReadonlyArray<RpsResultItem>;
  summary: RpsSummary;
}>;
