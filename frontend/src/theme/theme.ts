import { createTheme } from '@mui/material/styles';

/**
 * アプリ全体のMUIテーマ。
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E66D0', // ブルー系
    },
    background: {
      default: '#EEF5FF', // 薄い水色
      paper: '#FFFFFF', // カードは白
    },
    divider: 'rgba(30, 102, 208, 0.16)',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(30, 102, 208, 0.18)', // カード枠線を薄い青系
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
        },
      },
    },
  },
});
