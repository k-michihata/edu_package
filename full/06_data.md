# 06 データ設計

## データモデル概要

```
User（ユーザー）
  ├─ Profile（プロフィール）
  ├─ SelfAnalysis（自己分析）
  │    ├─ ValueDescription（価値観記述）
  │    └─ CareerAnchorResult（キャリアアンカー診断結果）
  └─ Simulation（シミュレーション）
       ├─ UserEvent（生徒入力事象）
       ├─ AIEvent（AI生成事象）
       └─ SimulationAnswer（シミュレーション回答）

Teacher（教師）
  └─ QuestionTemplate（問いかけテンプレート）

Class（クラス）
  ├─ Teacher（教師）
  └─ Students（生徒一覧）
```

---

## 各データの詳細

### User（ユーザー）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | ユーザーID（学校アカウントと紐づけ） |
| role | enum | 生徒 / 教師 |
| name | string | 氏名 |
| class_id | string | 所属クラスID |
| created_at | datetime | アカウント作成日時 |
| last_login_at | datetime | 最終ログイン日時 |

---

### ValueDescription（価値観記述）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 記述ID |
| user_id | string | 生徒ID |
| question_id | string | 問いかけID（テンプレートと紐づけ） |
| answer | text | 記述内容 |
| created_at | datetime | 記述日時 |
| updated_at | datetime | 更新日時 |

---

### CareerAnchorResult（キャリアアンカー診断結果）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 診断結果ID |
| user_id | string | 生徒ID |
| anchor_scores | object | 8項目それぞれのスコア |
| dominant_type | string | 最も高いアンカータイプ |
| created_at | datetime | 診断日時 |

#### anchor_scores の構造

| キー | 説明 |
|------|------|
| specialty | 専門・職能別コンピタンス |
| management | 全般管理コンピタンス |
| security | 保障・安定 |
| entrepreneurship | 起業家的創造性 |
| autonomy | 自律・独立 |
| service | 奉仕・社会貢献 |
| challenge | 純粋な挑戦 |
| lifestyle | 生活様式 |

---

### UserEvent（生徒入力事象）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 事象ID |
| user_id | string | 生徒ID |
| phase | enum | 前半（10〜40代）/ 後半（50〜80代） |
| category | enum | 社会変化 / ライフイベント / その他 |
| years_later | number | 何年後に起こるか |
| age_at_event | number | 事象発生時の年齢（推定） |
| description | string | 事象の内容 |
| created_at | datetime | 入力日時 |

---

### AIEvent（AI生成事象）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 事象ID |
| user_id | string | 生徒ID |
| phase | enum | 前半 / 後半 |
| source | enum | AI生成 / 生徒入力から採用 |
| category | enum | 社会変化 / ライフイベント / その他 |
| age_at_event | number | 事象発生時の年齢 |
| description | string | 事象の内容 |
| basis | string | 生成の根拠（行動タイプ・入力事象など） |
| created_at | datetime | 生成日時 |

---

### SimulationAnswer（シミュレーション回答）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 回答ID |
| user_id | string | 生徒ID |
| event_id | string | 事象ID（AIEventと紐づけ） |
| phase | enum | 前半 / 後半 |
| evaluation | enum | ポジティブ / ネガティブ |
| action_text | text | 行動記述 |
| created_at | datetime | 回答日時 |
| updated_at | datetime | 更新日時 |

---

### QuestionTemplate（問いかけテンプレート）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | テンプレートID |
| teacher_id | string | 作成した教師のID |
| class_id | string | 対象クラスID |
| questions | array | 問いかけ一覧（順序付き） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

---

### Class（クラス）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | クラスID |
| name | string | クラス名 |
| teacher_id | string | 担当教師ID |
| student_ids | array | 所属生徒IDの一覧 |
| created_at | datetime | 作成日時 |

---

## データの流れ

```
① ログイン
   └─ User情報を取得・セッション開始

② 価値観記述
   └─ ValueDescriptionを保存

③ キャリアアンカー診断
   └─ CareerAnchorResultを保存
   └─ dominant_typeをシミュレーションに引き渡す

④ 将来事象入力
   └─ UserEventを保存（3〜5個）

⑤ AI事象生成
   └─ CareerAnchorResult + UserEventをAIに渡す
   └─ AIEventを生成・保存（合計5個）
   └─ 生徒入力から最低1つをsource=「生徒入力から採用」として含める

⑥ シミュレーション回答
   └─ SimulationAnswerを保存（各事象に対して）

⑦ 人生グラフ生成
   └─ SimulationAnswer（evaluation + age_at_event）をもとにグラフを描画
```

---

## データ保持方針

| 項目 | 方針 |
|------|------|
| 保存単位 | ユーザーアカウント単位で永続保存 |
| セッション継続 | ログイン後に前回の状態を復元できる |
| 削除ポリシー | 未定（学校・教師の管理ポリシーに依存） |
| 個人情報保護 | 生徒の回答・グラフは教師・本人のみ閲覧可能 |
