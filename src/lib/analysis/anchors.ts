// キャリアアンカー診断（full/06_data.md の8タイプ）
// Scheinのキャリアアンカーを高校生向けに読み替えた設問（各タイプ2問・5段階評価）

export const ANCHOR_TYPES = [
  "specialty",
  "management",
  "security",
  "entrepreneurship",
  "autonomy",
  "service",
  "challenge",
  "lifestyle",
] as const;

export type AnchorType = (typeof ANCHOR_TYPES)[number];

export type AnchorScores = Record<AnchorType, number>;

export const ANCHOR_INFO: Record<AnchorType, { label: string; title: string; description: string }> = {
  specialty: {
    label: "専門・職能",
    title: "専門をきわめるタイプ",
    description:
      "一つの分野を深く追求して「これなら任せて」と言えることに、やりがいを感じるタイプ。得意なことを磨き続けられる道を選ぶと力を発揮しやすい。",
  },
  management: {
    label: "全般管理",
    title: "みんなをまとめるリーダータイプ",
    description:
      "人やチームをまとめて、大きな目標に向かって動かすことにやりがいを感じるタイプ。責任ある立場を任されるほど燃える。",
  },
  security: {
    label: "保障・安定",
    title: "安定を大切にするタイプ",
    description:
      "先の見通しが立つ、安心できる環境で力を発揮するタイプ。腰を据えてじっくり取り組める道を選ぶと安定して成長できる。",
  },
  entrepreneurship: {
    label: "起業家的創造性",
    title: "新しいものを生み出す起業家タイプ",
    description:
      "まだ世の中にないものをゼロから作ることにわくわくするタイプ。自分のアイデアを形にできる場所で輝く。",
  },
  autonomy: {
    label: "自律・独立",
    title: "自分のペースを大切にする自由人タイプ",
    description:
      "細かいルールに縛られず、自分のやり方・自分のペースで進めたいタイプ。裁量を持って任されるほど力を発揮する。",
  },
  service: {
    label: "奉仕・社会貢献",
    title: "人や社会の役に立ちたい貢献タイプ",
    description:
      "誰かの役に立てた実感が一番のエネルギーになるタイプ。人や社会を良くすることにつながる道でやりがいを感じる。",
  },
  challenge: {
    label: "純粋な挑戦",
    title: "難題に燃えるチャレンジャータイプ",
    description:
      "「難しそう」と聞くとむしろやる気が出るタイプ。手ごわい課題や高い目標に挑み続けられる環境で成長する。",
  },
  lifestyle: {
    label: "生活様式",
    title: "暮らし全体のバランスを大切にするタイプ",
    description:
      "仕事も私生活もどちらも大切にしたいタイプ。勉強や仕事だけに偏らない、自分らしい生活のリズムを保てる道を選ぶと満足度が高い。",
  },
};

export interface AnchorQuestion {
  anchor: AnchorType;
  text: string;
}

// 各タイプ2問を交互に並べる（同じタイプが連続しないように）
export const ANCHOR_QUESTIONS: AnchorQuestion[] = [
  { anchor: "specialty", text: "一つのことを深くきわめて、その分野の専門家になりたい" },
  { anchor: "management", text: "将来はチームや組織をまとめるリーダーになりたい" },
  { anchor: "security", text: "安定した収入や生活があることが何より大事だ" },
  { anchor: "entrepreneurship", text: "自分で新しいサービスや会社をゼロから作ってみたい" },
  { anchor: "autonomy", text: "細かいルールに縛られず、自分のやり方で物事を進めたい" },
  { anchor: "service", text: "困っている人や社会の役に立つことに時間を使いたい" },
  { anchor: "challenge", text: "難しい問題ほど「やってやろう」とわくわくする" },
  { anchor: "lifestyle", text: "勉強や仕事だけでなく、趣味や友達・家族との時間も同じくらい大切にしたい" },
  { anchor: "specialty", text: "「これなら誰にも負けない」という得意分野を持ちたい" },
  { anchor: "management", text: "みんなの意見をまとめて、大きな計画を動かすことにあこがれる" },
  { anchor: "security", text: "将来の見通しが立つ、安心できる道を選びたい" },
  { anchor: "entrepreneurship", text: "人がやっていないことを、自分の手で形にしたい" },
  { anchor: "autonomy", text: "時間や場所を自分で決められる生き方がしたい" },
  { anchor: "service", text: "世の中を少しでも良くする仕事がしたい" },
  { anchor: "challenge", text: "簡単にできることより、ハードルが高いことに挑戦したい" },
  { anchor: "lifestyle", text: "自分らしい生活のリズムを崩さずに生きていきたい" },
];

export const SCALE_OPTIONS = [
  { value: 5, label: "あてはまる" },
  { value: 4, label: "ややあてはまる" },
  { value: 3, label: "どちらともいえない" },
  { value: 2, label: "あまりあてはまらない" },
  { value: 1, label: "あてはまらない" },
];

export function calculateScores(answers: number[]): { scores: AnchorScores; dominant: AnchorType } {
  const scores = Object.fromEntries(ANCHOR_TYPES.map((t) => [t, 0])) as AnchorScores;
  ANCHOR_QUESTIONS.forEach((q, i) => {
    scores[q.anchor] += answers[i] ?? 0;
  });
  const dominant = ANCHOR_TYPES.reduce((best, t) => (scores[t] > scores[best] ? t : best), ANCHOR_TYPES[0]);
  return { scores, dominant };
}
