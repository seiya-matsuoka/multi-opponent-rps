import { requestJson } from './http';
import type { RpsRequest } from './types';

/**
 * POST /api/rps
 *
 * 目的：
 * - ユーザーの手と相手人数を送り、対戦結果（CPUの手/勝敗など）を取得する
 *
 */
export async function postRps(req: RpsRequest): Promise<unknown> {
  return requestJson<unknown>({
    method: 'POST',
    path: '/api/rps',
    body: req,
  });
}
