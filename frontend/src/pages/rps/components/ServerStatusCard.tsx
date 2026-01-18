import { Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

/**
 * サーバー起動用のカード。
 *
 * 目的：
 * - Render のコールドスタート対策として /api/health を叩く入口を用意する
 * - ローディング中/成功/失敗が一目で分かるようにする
 */
export function ServerStatusCard(props: {
  loading: boolean;
  status: 'idle' | 'ok' | 'error';
  onWarmup: () => void;
}) {
  const { loading, status, onWarmup } = props;

  return (
    <Paper variant="outlined" className="p-2 sm:p-3">
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Typography variant="body2" className="whitespace-nowrap">
          サーバー起動ボタン
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {loading && <CircularProgress size={16} />}
          {!loading && status === 'ok' && <Chip label="OK" size="small" color="success" />}
          {!loading && status === 'error' && <Chip label="ERROR" size="small" color="error" />}

          <Button
            size="small"
            variant="contained"
            startIcon={<LocalFireDepartmentIcon fontSize="small" />}
            onClick={onWarmup}
            disabled={loading}
          >
            起動
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
