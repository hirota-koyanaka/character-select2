# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定
**重要**: このプロジェクトでのすべてのやり取りは日本語で行ってください。コメント、説明、エラーメッセージなど、すべての応答を日本語で提供してください。

## 実装ポリシー
**重要**: 以下のルールに従って作業を進めてください：
- 重大なセキュリティリスクや破壊的変更がない限り、ユーザーの許可を求めずに実装を進める
- タスクが明確な場合は、すぐに実装に取り掛かる
- 必要に応じてファイルの読み取り、編集、作成を自律的に行う
- エラーが発生した場合は、自動的に修正を試みる
- ただし、以下の場合は必ずユーザーに確認を取る：
  - 本番環境へのデプロイや公開
  - 大量のファイル削除
  - 外部APIキーや認証情報の設定
  - データベースの削除やリセット

## プロジェクト概要
このプロジェクトは、Next.js 15とReact 19を使用したキャラクター選択画面のUIアプリケーションです。Radix UIコンポーネントとTailwind CSSでスタイリングされています。

## コマンド

### 開発
```bash
pnpm dev     # 開発サーバーを起動（http://localhost:3000）
```

### ビルドとデプロイ
```bash
pnpm build   # 本番用ビルド
pnpm start   # 本番サーバーを起動
```

### コード品質
```bash
pnpm lint    # ESLintでコードをチェック
```

## アーキテクチャ

### ディレクトリ構造
- `app/` - Next.js App Routerのページとレイアウト
- `components/` - Reactコンポーネント
  - `ui/` - Radix UIベースの再利用可能なUIコンポーネント（shadcn/ui）
  - `character-select.tsx` - メインのキャラクター選択コンポーネント
- `lib/` - ユーティリティ関数（主にcn関数でクラス名を結合）
- `hooks/` - カスタムReactフック

### 主要な技術スタック
- **フレームワーク**: Next.js 15（App Router使用）
- **UI ライブラリ**: Radix UI（@radix-ui/react-*）
- **スタイリング**: Tailwind CSS v4 + CSS変数によるテーマ管理
- **フォーム管理**: React Hook Form + Zod（バリデーション用）
- **アニメーション**: tailwindcss-animate
- **アイコン**: lucide-react

### コンポーネント設計
- すべてのUIコンポーネントは`components/ui/`に配置され、Radix UIプリミティブをラップ
- コンポーネントは`class-variance-authority`（CVA）を使用してバリアントを管理
- `cn()`ユーティリティ関数（lib/utils.ts）を使用してクラス名を結合

### TypeScript設定
- 厳格モード有効（`strict: true`）
- パスエイリアス: `@/*`が プロジェクトルートにマップ