# 設計ドキュメント

> このドキュメントは、**multi-opponent-rps** の設計をまとめたもの。

## 1. 全体アーキテクチャ

### 1.1 構成概要

- フロントエンド：React + TypeScript + Vite
  - Vercel へデプロイ
  - `VITE_API_BASE_URL` でバックエンド URL を切り替え
- バックエンド：Spring Boot（REST API）
  - Render へ Dockerfile を用いてデプロイ
  - ステートレス（DB なし）

### 1.2 通信と CORS

- フロントとバックは別オリジンになる前提
- バックエンド側で CORS を許可
  - 許可オリジンは環境変数で制御（本番・開発で切り替え）

---

## 2. バックエンド設計（Spring Boot / REST API）

### 2.1 技術スタック

- Spring Boot：`3.5.9`（Gradle）
- Java：21
- 主な starter
  - `spring-boot-starter-web`
  - `spring-boot-starter-validation`
- テスト：JUnit5（`spring-boot-starter-test`）

### 2.2 パッケージ構成（役割で分割）

ベースパッケージ：

- `com.github.seiyamatsuoka.multiopponentrps`

役割別パッケージ：

- `config`
  - `AppCorsProperties`：CORS 設定値の受け口（ConfigurationProperties）
  - `CorsConfig`：Spring MVC の CORS 設定
- `health`
  - `HealthController`：`GET /api/health`
  - `HealthResponse`：レスポンス DTO
- `rps`
  - `RpsController`：`POST /api/rps`
  - `RpsService`：じゃんけんロジック（対戦結果生成）
  - `dto/RpsRequest`, `dto/RpsResponse`：リクエスト/レスポンス DTO
  - `model/*`：ドメイン（Hand/Result/RoundResult/Summary）
- `error`
  - `ApiExceptionHandler`：例外ハンドリング（統一 JSON）
  - `ApiErrorResponse`：エラー JSON のレスポンスモデル

### 2.3 API 設計

#### 2.3.1 GET `/api/health`

- 目的：Render のコールドスタートを含む「起動確認」
- レスポンス：`{ "status": "ok" }`

#### 2.3.2 POST `/api/rps`

- 目的：ユーザーの手＋相手人数から、相手ごとの結果と集計を返す
- バリデーション：Bean Validation を使用（`@Valid` + DTO 制約）
  - `hand`：必須（`@NotNull`）
  - `opponents`：範囲（`@Min(1)` / `@Max(10)`）
- レスポンス構造
  - `playerHand`：ユーザーの手
  - `opponents`：対戦人数
  - `results[]`：相手ごとの結果（相手 index・相手の手・勝敗）
  - `summary`：集計（win/lose/draw）

### 2.4 じゃんけんロジック（Service）

- `RpsService` が責務を持つ
  - 相手の手の生成（Random）
  - `Result`（WIN/LOSE/DRAW）の判定
  - `RoundResult` の配列生成
  - `Summary` の集計生成

Controller は、入力の受け取り・`@Valid`・Service 呼び出し・DTO 返却のみ。

### 2.5 エラー/例外設計

- `ApiExceptionHandler`（ControllerAdvice）で統一レスポンスに変換する
- 対象
  - DTO バリデーションエラー（`MethodArgumentNotValidException`）
  - enum 変換失敗などの入力不正（`HttpMessageNotReadableException`）
  - その他（`Exception`）は 500 として統一
- 統一レスポンス：`ApiErrorResponse`
  - `message`：ユーザー向けの要約メッセージ
  - `details`：項目別の詳細（配列）

### 2.6 CORS 設計

- `AppCorsProperties`（`app.cors.*`）で allowed origins を受け取る
- `CorsConfig` で Spring MVC の CORS を構成
  - 許可オリジン：`app.cors.allowed-origins`（空なら未許可）
  - 主要メソッドを許可（GET/POST/OPTIONS など）
  - `allowCredentials(false)`（cookie 前提にしない）

---

## 3. バックエンド設定（application.yml / 環境変数 / profiles）

### 3.1 設定ファイル運用

- `application.yml`：コミット（公開 OK な値）
- `application-local.yml.example`：コミット（テンプレ）
- `application-local.yml`：gitignore（ローカル専用の上書き）

### 3.2 プロファイル切り替え

- ローカルで `application-local.yml` を有効にしたい場合：
  - `SPRING_PROFILES_ACTIVE=local` を設定して起動する

例（PowerShell）：

```powershell
$env:SPRING_PROFILES_ACTIVE="local"
./gradlew bootRun
```

### 3.3 環境変数

- `ALLOWED_ORIGINS`
  - 本番（Render）では Vercel の URL を設定して CORS 許可する
- その他（必要に応じて）
  - Render 側の `PORT` 等はプラットフォーム側で付与される想定（Dockerfile/Run 設定に合わせる）

---

## 4. Dockerfile / デプロイ設計（バックエンド：Render）

- build ステージ
  - Gradle wrapper でビルドして jar を生成
- runtime ステージ
  - JRE イメージで起動
  - 非 root ユーザーで実行（`appuser`）

---

## 5. フロントエンド設計（Vite + React + TS）

### 5.1 技術スタック

- React：19
- TypeScript：5
- Vite：7
- UI：
  - MUI（`@mui/material`）
  - Tailwind CSS
- テスト：
  - Vitest（ユニットテスト）

### 5.2 環境変数（.env 運用）

- `.env`：gitignore（ローカル専用）
- `.env.example`：コミット（テンプレ）

主要キー：

- `VITE_API_BASE_URL`
  - 例：`http://localhost:8080`（ローカル）
  - 例：`https://<render-app>.onrender.com`（本番）

※ Vite は `VITE_` prefix のみをフロントに注入する。

### 5.3 API クライアント設計

- `src/api/http.ts`
  - `createRequestJson()` を中心に、fetch を共通化
  - AbortController による timeout
  - `ApiError` でステータス・レスポンスボディを保持
  - JSON / text の分岐（`Content-Type` を見て解釈）
- `src/api/healthApi.ts`
  - `getHealth()`：コールドスタート対策（起動確認）
- `src/api/rpsApi.ts`
  - `postRps()`：`RpsRequest` → `RpsResponse` を呼び出し

### 5.4 画面（RPS ページ）の構成方針

- 画面は「ページ + フック + UI 部品」で分割する
- 状態管理は軽量に、ページ専用 hook に寄せる（Redux 等は不要）

構成：

- `RpsPage.tsx`：ページ組み立て（カードの配置）
- `hooks/useRpsPage.ts`：状態と操作（warmup/execute、入力状態、結果、エラー等）
- `components/*`：UI 部品（MUI Card/Stack 等で分割）

### 5.5 サーバー起動（warmup）設計

- Render のコールドスタートを想定し、フロントから起動確認を行える
- UI 上は「サーバー起動」ボタンで `GET /api/health` を呼ぶ
- 起動中/成功/失敗の状態（Chip など）を表示

### 5.6 フロントのテスト（Vitest）

- UI ではなく「HTTP 共通処理」の例外系を最小で担保
- 対象
  - `src/api/http.test.ts`：`createRequestJson` の挙動（200/400 等）

---

## 6. デプロイ設計（フロント：Vercel）

- Vercel へデプロイ
- `vercel.json` の rewrites で SPA の直接アクセスを許可（`/` に寄せる）
- 環境変数 `VITE_API_BASE_URL` を Vercel 側で設定して本番バックエンドへ接続

---

## 7. ディレクトリ構成

### 7.1 リポジトリ ルート（概要）

```txt
multi-opponent-rps/
  backend/
  frontend/
```

### 7.2 backend（詳細）

```txt
backend/
  .dockerignore
  .gitignore
  .gitattributes
  .groovylintrc.json
  Dockerfile
  build.gradle
  settings.gradle
  gradlew
  gradlew.bat
  gradle/
    wrapper/
      gradle-wrapper.jar
      gradle-wrapper.properties

  src/
    main/
      java/
        com/github/seiyamatsuoka/multiopponentrps/
          MultiOpponentRpsApplication.java
          config/
            AppCorsProperties.java
            CorsConfig.java
          error/
            ApiExceptionHandler.java
            ApiErrorResponse.java
          health/
            HealthController.java
            HealthResponse.java
          rps/
            RpsController.java
            RpsService.java
            dto/
              RpsRequest.java
              RpsResponse.java
            model/
              Hand.java
              Result.java
              RoundResult.java
              Summary.java
      resources/
        application.yml
        application-local.yml.example
        application-local.yml

    test/
      java/
        com/github/seiyamatsuoka/multiopponentrps/
          SmokeTest.java
          config/
            CorsConfigTest.java
          error/
            RpsErrorHandlingTest.java
          health/
            HealthControllerTest.java
          rps/
            RpsControllerTest.java
            RpsServiceTest.java
            dto/
              RpsRequestValidationTest.java
```

### 7.3 frontend（詳細）

```txt
frontend/
  .env
  .env.example
  .gitignore
  .prettierignore
  .prettierrc
  eslint.config.js
  index.html
  package.json
  pnpm-lock.yaml
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  vitest.config.ts
  vercel.json

  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    theme/
      theme.ts
    config/
      env.ts
    api/
      devtools.ts
      http.ts
      http.test.ts
      types.ts
      healthApi.ts
      rpsApi.ts
    pages/
      rps/
        RpsPage.tsx
        hooks/
          useRpsPage.ts
        components/
          ServerStatusCard.tsx
          ControlsCard.tsx
          HandSelector.tsx
          OpponentsSelect.tsx
          ResultsCard.tsx
          ResultRow.tsx
    styles/
      index.css
```

---

## 8. ローカル動作

### 8.1 backend 起動（例）

```bash
cd backend
./gradlew bootRun
```

### 8.2 backend テスト（例）

```bash
cd backend
./gradlew test
```

### 8.3 frontend 起動（例）

```bash
cd frontend
pnpm install
pnpm dev
```

### 8.4 frontend テスト（例）

```bash
cd frontend
pnpm test
```
