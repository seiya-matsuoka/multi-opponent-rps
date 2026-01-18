import { Chip, Paper, Stack, Typography } from '@mui/material';
import type { RpsResultItem, RpsRoundResult } from '../../../api/types';

/**
 * 相手1人分の結果行。
 */
export function ResultRow(props: { item: RpsResultItem }) {
  const { item } = props;

  return (
    <Paper variant="outlined" className="p-2">
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="body2" className="truncate">
          相手 {item.opponentIndex}：<strong className="ml-1">{item.opponentHand}</strong>
        </Typography>

        <Chip label={item.result} color={resultColor(item.result)} size="small" />
      </Stack>
    </Paper>
  );
}

/**
 * 勝敗（WIN/LOSE/DRAW）に応じて Chip の色を決める。
 */
function resultColor(result: RpsRoundResult): 'success' | 'error' | 'default' {
  switch (result) {
    case 'WIN':
      return 'success';
    case 'LOSE':
      return 'error';
    default:
      return 'default';
  }
}
