import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getHealth } from '../../../api/healthApi';
import { postRps } from '../../../api/rpsApi';
import type { RpsHand, RpsResponse } from '../../../api/types';

/**
 * RpsPage 用の状態管理フック。
 *
 * 目的：
 * - UI（コンポーネント）から API 呼び出しの詳細を隠す
 * - ローディング / エラー / 結果表示などの状態を一箇所に集約する
 * - 初回ロード時に warmup（/api/health）を自動実行する
 */
export function useRpsPage() {
  // 入力
  const [hand, setHand] = useState<RpsHand>('ROCK');
  const [opponents, setOpponents] = useState<number>(3);

  // warmup（health）
  const [warmupLoading, setWarmupLoading] = useState(false);
  const [warmupStatus, setWarmupStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  // rps 実行
  const [rpsLoading, setRpsLoading] = useState(false);
  const [rpsResult, setRpsResult] = useState<RpsResponse | null>(null);

  // 画面に出すエラー
  const [errorMessage, setErrorMessage] = useState<string>('');

  const canRunRps = useMemo(() => !rpsLoading && !warmupLoading, [rpsLoading, warmupLoading]);

  /**
   * Render のコールドスタート対策の起動リクエスト。
   * - /api/health を叩いて起動を促し、UI上で状態が分かるようにする
   */
  const warmup = useCallback(async () => {
    setErrorMessage('');
    setWarmupLoading(true);
    setWarmupStatus('idle');

    try {
      const res = await getHealth();
      // health の戻り値は { status: "ok" } 想定
      setWarmupStatus(res.status === 'ok' ? 'ok' : 'error');
      if (res.status !== 'ok') {
        setErrorMessage('health の応答が想定と異なります');
      }
    } catch (e) {
      setWarmupStatus('error');
      setErrorMessage(e instanceof Error ? e.message : '不明なエラーが発生しました');
    } finally {
      setWarmupLoading(false);
    }
  }, []);

  /**
   * 初回ロード時に warmup を自動実行する。
   *
   * - React 18 の開発モード（StrictMode）では useEffect が2回走ることがあるため、useRef で初回だけを保証する。
   */
  const didAutoWarmupRef = useRef(false);
  useEffect(() => {
    if (didAutoWarmupRef.current) return;
    didAutoWarmupRef.current = true;
    void warmup();
  }, [warmup]);

  /**
   * じゃんけん実行。
   */
  const runRps = useCallback(async () => {
    setErrorMessage('');
    setRpsLoading(true);

    try {
      const res = await postRps({ hand, opponents });
      setRpsResult(res);
    } catch (e) {
      setRpsResult(null);
      setErrorMessage(e instanceof Error ? e.message : '不明なエラーが発生しました');
    } finally {
      setRpsLoading(false);
    }
  }, [hand, opponents]);

  return {
    // state
    hand,
    opponents,
    warmupLoading,
    warmupStatus,
    rpsLoading,
    rpsResult,
    errorMessage,
    canRunRps,

    // actions
    setHand,
    setOpponents,
    warmup,
    runRps,
  };
}
