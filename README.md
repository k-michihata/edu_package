# 将来可能性教育支援ツール

高校生が将来起こりうる事象に対して感情・行動を考え、人生グラフとして可視化することで自己理解を深めるWebアプリ。

## 概要

「偏差値で進路を決めるのではなく、自分はどう生きたいかを起点に考える」ことを目的とした、将来可能性教育を支援するITツール。

- AIが生成した将来の事象（10〜80代）に対してポジ/ネガ評価と行動記述を行う
- シミュレーション結果を人生グラフとして可視化する
- ログイン画面なしで利用できる（匿名セッションで進捗を自動保存・同じブラウザで再開可能）
- 学校アカウント（Google）ログインは将来追加予定

## ブランチ

| ブランチ | 内容 |
|---------|------|
| `main` | フル版の開発 |
| `mvp`（タグ `mvp-v1`） | MVP完成時点のスナップショット（ログイン不要・sessionStorage版） |

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) / TypeScript |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| AI | OpenAI API（`gpt-5-mini`） |
| DB・認証 | Supabase（PostgreSQL + Auth、匿名サインイン） |
| ホスティング | Vercel |

## 開発環境のセットアップ

### 1. Supabase プロジェクトの準備

1. [Supabase](https://supabase.com/) でプロジェクトを作成する
2. ダッシュボードの **SQL Editor** で `supabase/schema.sql` を実行する
3. **Authentication > Sign In / Providers** で **Anonymous Sign-Ins を有効化**する

### 2. アプリの起動

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local に以下を設定する
#   OPENAI_API_KEY               … OpenAI のAPIキー
#   NEXT_PUBLIC_SUPABASE_URL     … Supabase の Project URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY … Supabase の anon key

# 開発サーバーの起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

## ドキュメント

- [full/](full/) — フル要件定義（開発中の仕様）
- [mvp/](mvp/) — MVP仕様書
- [supabase/schema.sql](supabase/schema.sql) — DBスキーマ（RLS含む）
