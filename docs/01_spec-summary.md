# 仕様/機能ドキュメント

> このドキュメントは、**multi-opponent-rps** の仕様/機能をまとめたもの。

## 1. アプリ概要

- アプリ名：multi-opponent-rps
- 概要：ユーザーが選択した「じゃんけんの手」で、指定人数の相手（CPU）と対戦し、各相手ごとの手と勝敗結果を表示する。
- DB：使用しない（ステートレス API）
- 画面：1 画面完結

---

## 2. 画面構成

### 2.1 画面一覧

- 1 画面完結（入力＋結果表示）

### 2.2 画面要素

- サーバー状態表示（ウォームアップ）
  - 「サーバー起動」ボタンで `/api/health` を呼び出す（手動）
  - 起動中：スピナー表示
  - 成功：Ready 表示
  - 失敗：エラー表示（再試行導線は「サーバー起動」ボタン）
- 入力エリア
  - 相手人数（1〜10）：MUI Select で選択
  - 自分の手（グー/チョキ/パー）：MUI ToggleButtonGroup で選択
  - 実行ボタン：じゃんけん開始（API 呼び出し）
- 結果表示エリア
  - 集計（勝ち/負け/あいこ）
  - 相手ごとの結果リスト（N 件）

### 2.3 配色

- MUI Theme を利用してブルー系を基調にした配色（背景は淡い青、カードは白、primary は青）

---

## 3. ユーザー操作フロー

1. 画面を開く
2. 「サーバー起動」を押して `/api/health` を呼び出し、Render のコールドスタートを待つ
3. Ready になったら、相手人数（1〜10）を選ぶ
4. 自分の手を選び、「実行」を押す
5. `/api/rps` の結果が表示される
6. 必要に応じて手や人数を変えて再実行する

補足：

- `/api/health` と `/api/rps` の呼び出しは timeout 60 秒で実行する（コールドスタート想定）。

---

## 4. バックエンド API 仕様（外部仕様）

### 4.1 共通

- Base Path：`/api`
- データ形式：JSON
- ステータスコード：
  - 200：成功
  - 400：入力不正 / JSON 不正
  - 500：想定外エラー（統一エラー形式で返す）

---

### 4.2 GET `/api/health`

#### 目的

- Render のコールドスタート対策（サーバー起動確認）
- フロント画面のウォームアップ表示に利用

#### リクエスト

- Body なし

#### レスポンス（200）

```json
{
  "status": "ok"
}
```

---

### 4.3 POST `/api/rps`

#### 目的

- 指定人数の相手（CPU）とじゃんけんを行い、相手ごとの結果と集計を返す

#### リクエスト

- Content-Type：`application/json`
- Body：

```json
{
  "hand": "ROCK",
  "opponents": 3
}
```

- hand：`ROCK | PAPER | SCISSORS`
- opponents：`1〜10`

#### レスポンス（200）

```json
{
  "playerHand": "ROCK",
  "opponents": 3,
  "results": [
    {
      "opponentIndex": 1,
      "opponentHand": "SCISSORS",
      "result": "WIN"
    },
    {
      "opponentIndex": 2,
      "opponentHand": "ROCK",
      "result": "DRAW"
    },
    {
      "opponentIndex": 3,
      "opponentHand": "PAPER",
      "result": "LOSE"
    }
  ],
  "summary": {
    "win": 1,
    "lose": 1,
    "draw": 1
  }
}
```

- opponentIndex：表示用の 1 始まり（1..N）
- opponents：件数分 results が返る
- result：`WIN | LOSE | DRAW`

#### バリデーション（400）

- hand が未指定（必須）
- opponents が範囲外（1〜10 以外）

---

## 5. エラーレスポンス仕様（統一形式）

バックエンドは 400/500 を ApiErrorResponse の形で返す。

### 5.1 形式（基本）

```json
{
  "timestamp": "2026-01-01T12:34:56.789Z",
  "status": 400,
  "error": "Bad Request",
  "message": "入力が不正です",
  "path": "/api/rps",
  "details": {}
}
```

- timestamp：ISO-8601（OffsetDateTime）
- status：HTTP ステータスコード
- error：HTTP reason phrase 相当
- message：画面に出してよいエラーメッセージ（日本語）
- path：対象パス
- details：任意（エラー種別により内容が変わる）

### 5.2 バリデーションエラー（400）の details 例

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "入力が不正です",
  "path": "/api/rps",
  "details": {
    "fields": [
      {
        "field": "hand",
        "message": "hand は必須です"
      },
      {
        "field": "opponents",
        "message": "opponents は 10 以下で指定してください"
      }
    ]
  }
}
```

### 5.3 JSON 不正（400）の message 例

- `JSON が不正です`s
- `JSON が不正、または項目の型が不正です`

---

## 6. フロントエンド仕様

### 6.1 表示要件

- レスポンシブ対応
- エラーメッセージは画面上に表示する

### 6.2 入力要件

- 相手人数：MUI Select（1〜10）
- 手の選択：ToggleButtonGroup（ROCK / SCISSORS / PAPER）
- 実行ボタン：API 呼び出し中はローディング表示、入力 UI は操作不可

### 6.3 結果表示要件

- 未実行時：プレースホルダー文言を表示
- 実行後：
  - 自分の手 / 相手人数
  - 集計（win/lose/draw）
  - 相手ごとの結果一覧（相手番号 / 相手の手 / 勝敗）

### 6.4 ウォームアップ（health）要件

- 「サーバー起動」ボタンで `/api/health` を呼び出す
- 起動中はスピナー
- 成功したら Ready
- 失敗時は error 表示（再試行は同ボタン）

### 6.5 タイムアウト要件

- `/api/health` と `/api/rps` は timeout 60 秒で呼び出す（Render コールドスタート対策）

---

## 7. 設定（環境変数・設定値）

### 7.1 バックエンド

- `PORT`：待ち受けポート（未設定時 8080）
- `ALLOWED_ORIGINS`：CORS 許可オリジン（カンマ区切り可）
  - 未設定（空）の場合は CORS を有効化しない（別オリジン呼び出しは通らない）

ローカル開発向け（運用方針）：

- `application.yml` はコミット対象
- `application-local.yml` は gitignore（ローカル専用）
- `application-local.yml.example` をコミットしてテンプレとして残す
- `SPRING_PROFILES_ACTIVE=local` を指定すると `application-local.yml` が読まれる

### 7.2 フロントエンド

- `VITE_API_BASE_URL`：バックエンドのベース URL（例：`http://localhost:8080`）
  - `.env` は gitignore
  - `.env.example` をコミットしてテンプレとして残す
