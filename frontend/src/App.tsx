import { Container, Paper, Stack, Typography } from '@mui/material';

export default function App() {
  return (
    <Container maxWidth="sm" className="py-6">
      <Paper elevation={2} className="p-4 sm:p-6">
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" component="h1">
              Multi Opponent RPS
            </Typography>
          </Stack>

          <Typography variant="body1">未実装</Typography>

          <Typography variant="body2" color="text.secondary">
            未実装
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
