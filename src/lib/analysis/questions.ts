// 価値観記述のデフォルトの問いかけ。
// 教師によるカスタマイズ（F-41）はアドミン実装時に question_templates から取得する形に置き換える。
// IDは value_descriptions.question_id と紐づけるための固定UUID。

export interface ValueQuestion {
  id: string;
  text: string;
  hint: string;
}

export const DEFAULT_VALUE_QUESTIONS: ValueQuestion[] = [
  {
    id: "d0000000-0000-4000-8000-000000000001",
    text: "あなたが「これだけは大切にしたい」と思うことは何ですか？",
    hint: "人・もの・考え方・過ごし方など、どんなことでもOK",
  },
  {
    id: "d0000000-0000-4000-8000-000000000002",
    text: "今までで一番「楽しかった・夢中になれた」のはどんな時間でしたか？",
    hint: "部活・遊び・勉強・人との時間など、思い出して書いてみよう",
  },
  {
    id: "d0000000-0000-4000-8000-000000000003",
    text: "10年後、どんな毎日を過ごせていたら「いい人生だな」と思えそうですか？",
    hint: "仕事のことでも、暮らしのことでも、両方でもOK",
  },
];
