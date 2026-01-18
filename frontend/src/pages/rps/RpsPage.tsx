import { Alert, Container, Paper, Stack, Typography } from '@mui/material';

import { useRpsPage } from './hooks/useRpsPage';
import { ServerStatusCard } from './components/ServerStatusCard';
import { ControlsCard } from './components/ControlsCard';
import { ResultsCard } from './components/ResultsCard';

/**
 * じゃんけん画面。
 *
 * 役割：
 * - 画面全体の組み立て
 * - エラーメッセージなど、ページ単位で持つべき表示の制御
 */
export function RpsPage() {
  const {
    hand,
    opponents,
    warmupLoading,
    warmupStatus,
    rpsLoading,
    rpsResult,
    errorMessage,
    canRunRps,
    setHand,
    setOpponents,
    warmup,
    runRps,
  } = useRpsPage();

  // 操作不可判定（warmup中 or rps中）
  const controlsDisabled = !canRunRps;

  return (
    <Container maxWidth="md" className="py-6">
      <Paper elevation={2} className="p-4 sm:p-6">
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" component="h1">
              Multi Opponent RPS
            </Typography>
          </Stack>

          {/* Warmup */}
          <ServerStatusCard loading={warmupLoading} status={warmupStatus} onWarmup={warmup} />

          {/* Error */}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Controls */}
          <ControlsCard
            hand={hand}
            opponents={opponents}
            disabled={controlsDisabled}
            running={rpsLoading}
            onChangeHand={setHand}
            onChangeOpponents={setOpponents}
            onRun={runRps}
          />

          {/* Results */}
          <ResultsCard result={rpsResult} />
        </Stack>
      </Paper>
    </Container>
  );
}
