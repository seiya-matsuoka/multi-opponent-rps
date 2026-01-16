import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { RpsHand } from '../../../api/types';
import { HandSelector } from './HandSelector';
import { OpponentsSelect } from './OpponentsSelect';

/**
 * 対戦条件（手・相手人数）＋ 実行ボタンの操作パネル。
 */
export function ControlsCard(props: {
  hand: RpsHand;
  opponents: number;
  disabled: boolean;
  running: boolean;
  onChangeHand: (hand: RpsHand) => void;
  onChangeOpponents: (opponents: number) => void;
  onRun: () => void;
}) {
  const { hand, opponents, disabled, running, onChangeHand, onChangeOpponents, onRun } = props;

  return (
    <Paper variant="outlined" className="p-3 sm:p-4">
      <Stack spacing={2}>
        <Typography variant="subtitle1">対戦条件</Typography>

        <Stack direction={'row'} spacing={2}>
          <HandSelector value={hand} disabled={disabled} onChange={onChangeHand} />
          <OpponentsSelect value={opponents} disabled={disabled} onChange={onChangeOpponents} />
        </Stack>

        <Box className="flex justify-end">
          <Button
            variant="contained"
            startIcon={running ? <CircularProgress size={18} /> : <PlayArrowIcon />}
            onClick={onRun}
            disabled={disabled}
          >
            じゃんけん実行
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
