# 将来可能性教育支援ツール

高校生が将来起こりうる事象に対して感情・行動を考え、人生グラフとして可視化することで自己理解を深めるWebアプリ。

## 概要

「偏差値で進路を決めるのではなく、自分はどう生きたいかを起点に考える」ことを目的とした、将来可能性教育を支援するITツール。

- AIが生成した将来の事象（10〜80代）に対してポジ/ネガ評価と行動記述を行う
- シミュレーション結果を人生グラフとして可視化する
- ログイン不要・ブラウザ上で完結するMVP構成

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js (App Router) / TypeScript |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| AI | Anthropic Claude API |
| データ保持 | sessionStorage |

## 開発環境のセットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local に ANTHROPIC_API_KEY を設定する

# 開発サーバーの起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

## ドキュメント

- [full/](full/) — フル要件定義
- [mvp/](mvp/) — MVP仕様書
