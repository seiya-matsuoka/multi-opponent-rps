import { getHealth } from './healthApi';
import { postRps } from './rpsApi';
import type { RpsHand } from './types';

/**
 * 開発用の簡易API呼び出し口を `window.__morps` として登録する。
 *
 * 目的：
 * - APIクライアント単体で疎通確認できるようにする
 * - CORS / 環境変数（API URL）/ エラー整形の確認を最短で行う
 *
 * 安全性：
 * - `import.meta.env.DEV` のときだけ登録するため、本番ビルドでは露出しない想定（falseになる）
 *
 * @example
 *   await window.__morps.health()
 *   await window.__morps.rps("ROCK", 3)
 */
export function registerApiDevtools(): void {
  if (!import.meta.env.DEV) return;

  window.__morps = {
    health: async () => getHealth(),
    rps: async (hand: RpsHand, opponents: number) =>
      postRps({
        hand,
        opponents,
      }),
  };
}
