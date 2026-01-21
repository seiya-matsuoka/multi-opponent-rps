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
