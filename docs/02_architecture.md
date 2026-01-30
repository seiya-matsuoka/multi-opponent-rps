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
