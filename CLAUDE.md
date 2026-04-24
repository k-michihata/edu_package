# 将来可能性教育支援ツール MVP

## プロジェクト構成

```
edu_package/
  full/     # フル要件定義ドキュメント
  mvp/      # MVP仕様書
  src/      # Next.js アプリ（開発はここ）
  package.json
  ...
```

## 開発ディレクトリ

ルート直下で開発する。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| グラフ | Recharts |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| データ保持 | sessionStorage（ログイン不要） |
| デプロイ | Vercel |

## 開発コマンド

```bash
npm run dev    # 開発サーバー起動 (localhost:3000)
npm run build  # ビルド
npm run lint   # Lint
```

## 環境変数

`.env.local` に以下を設定する：

```
ANTHROPIC_API_KEY=your_api_key_here
```

## MVPスコープ

- ログイン・認証なし
- データ永続化なし（sessionStorageのみ）
- 3画面：トップ → シミュレーション（前半/後半） → 人生グラフ
- AIが前半（10〜40代）・後半（50〜80代）それぞれ5個の事象を生成
- 各事象にポジ/ネガ評価 + 行動記述
- 人生グラフ：横軸=年齢、縦軸=ポジ+1/ネガ-1
