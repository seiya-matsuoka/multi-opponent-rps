import { Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { RpsResponse } from '../../../api/types';
import { ResultRow } from './ResultRow';

/**
 * 結果表示カード。
 *
 * 役割：
 * - 未実行時の表示
 * - 実行後の表示（Summary + 相手ごとの一覧）
 */
export function ResultsCard(props: { result: RpsResponse | null }) {
  const { result } = props;

  return (
    <Paper variant="outlined" className="flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-3">
      <Stack spacing={1.5} className="flex min-h-0 flex-1 flex-col">
        <Typography variant="body2" className="shrink-0">
          結果
        </Typography>

        {!result && (
          <Typography variant="body2" color="text.secondary">
            まだ実行していません。
          </Typography>
        )}

        {result && (
          <Stack spacing={1.5} className="flex min-h-0 flex-1 flex-col">
            {/* Summary header */}
            <Stack
              className="shrink-0"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Typography variant="body2" className="truncate">
                自分の手：<strong className="ml-1">{result.playerHand}</strong>
                <span className="ml-2">/ 相手：</span>
                <strong className="ml-1">{result.opponents}</strong>人
              </Typography>

              <Stack direction="row" spacing={0.5} className="flex-wrap">
                <Chip label={`WIN: ${result.summary.win}`} color="success" size="small" />
                <Chip label={`LOSE: ${result.summary.lose}`} color="error" size="small" />
                <Chip label={`DRAW: ${result.summary.draw}`} color="default" size="small" />
              </Stack>
            </Stack>

            <Divider className="shrink-0" />

            {/* Per-opponent list */}
            <Stack spacing={1} className="flex min-h-0 flex-1 flex-col">
              <Typography variant="body2" color="text.secondary" className="shrink-0">
                相手ごとの結果
              </Typography>

              {/* ここだけスクロールする */}
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <Stack spacing={1}>
                  {result.results.map((r) => (
                    <ResultRow key={r.opponentIndex} item={r} />
                  ))}
                </Stack>
              </div>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
