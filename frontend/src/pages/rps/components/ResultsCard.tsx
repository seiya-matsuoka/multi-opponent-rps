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
    <Paper variant="outlined" className="p-3 sm:p-4">
      <Stack spacing={2}>
        <Typography variant="subtitle1">結果</Typography>

        {!result && (
          <Typography variant="body2" color="text.secondary">
            まだ実行していません。
          </Typography>
        )}

        {result && (
          <Stack spacing={2}>
            {/* Summary header */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Typography variant="body1">
                自分の手：<strong>{result.playerHand}</strong> / 相手：{' '}
                <strong>{result.opponents}</strong> 人
              </Typography>

              <Stack direction="row" spacing={1} className="flex-wrap">
                <Chip label={`WIN: ${result.summary.win}`} color="success" size="small" />
                <Chip label={`LOSE: ${result.summary.lose}`} color="error" size="small" />
                <Chip label={`DRAW: ${result.summary.draw}`} color="default" size="small" />
              </Stack>
            </Stack>

            <Divider />

            {/* Per-opponent list */}
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                相手ごとの結果
              </Typography>

              <Stack spacing={1}>
                {result.results.map((r) => (
                  <ResultRow key={r.opponentIndex} item={r} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
