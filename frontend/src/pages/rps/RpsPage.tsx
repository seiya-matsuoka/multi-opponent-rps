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
    <div className="h-dvh overflow-hidden">
      <Container maxWidth="md" className="flex h-full flex-col py-4">
        <Paper elevation={2} className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <Stack spacing={2} className="flex min-h-0 flex-1 flex-col">
            {/* Header */}
            <Typography variant="h6" component="h1">
              Multi Opponent RPS
            </Typography>

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
            <div className="min-h-0 flex-1">
              <ResultsCard result={rpsResult} />
            </div>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
