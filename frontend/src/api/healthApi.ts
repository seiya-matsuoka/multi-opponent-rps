import { requestJson } from './http';
import type { HealthResponse } from './types';

/**
 * GET /api/health
 *
 * 目的：
 * - Render のコールドスタート対策（起動確認）
 * - 画面/Devtoolsから疎通を確認するためのエンドポイント
 */
export async function getHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>({
    method: 'GET',
    path: '/api/health',
    timeoutMs: 60_000,
  });
}
