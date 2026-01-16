/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** バックエンドAPIのベースURL */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __morps?: {
      health: () => Promise<unknown>;
      rps: (hand: 'ROCK' | 'PAPER' | 'SCISSORS', opponents: number) => Promise<unknown>;
    };
  }
}

export {};
