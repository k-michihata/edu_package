-- 将来可能性教育支援ツール フル版スキーマ
-- Supabase ダッシュボードの SQL Editor で実行する（full/06_data.md 準拠）

create type user_role as enum ('student', 'teacher');
create type sim_phase as enum ('first', 'second');
create type evaluation_type as enum ('positive', 'negative');
create type event_category as enum ('social_change', 'life_event', 'other');
create type event_source as enum ('ai', 'user_input');

-- プロフィール（auth.users と 1:1）
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'student',
  name text not null default '',
  class_id uuid,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- クラス
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_class_id_fkey foreign key (class_id) references public.classes(id);

-- 価値観記述（フェーズ2で使用）
create table public.value_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- キャリアアンカー診断結果（フェーズ2で使用）
create table public.career_anchor_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  anchor_scores jsonb not null,
  dominant_type text not null,
  created_at timestamptz not null default now()
);

-- 生徒入力事象（フェーズ3で使用）
create table public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  phase sim_phase not null,
  category event_category not null,
  years_later int not null,
  age_at_event int not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- AI生成事象
create table public.ai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  phase sim_phase not null,
  source event_source not null default 'ai',
  category event_category,
  age_at_event int not null,
  description text not null,
  basis text,
  created_at timestamptz not null default now()
);

-- シミュレーション回答
create table public.simulation_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.ai_events(id) on delete cascade,
  phase sim_phase not null,
  evaluation evaluation_type not null,
  action_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- 問いかけテンプレート（フェーズ4で使用）
create table public.question_templates (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id),
  questions jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 新規ユーザー作成時にプロフィールを自動作成
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: 生徒のデータは本人のみ読み書き可能
-- （教師によるクラス生徒の閲覧ポリシーはフェーズ4のアドミン実装時に追加する）

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.value_descriptions enable row level security;
alter table public.career_anchor_results enable row level security;
alter table public.user_events enable row level security;
alter table public.ai_events enable row level security;
alter table public.simulation_answers enable row level security;
alter table public.question_templates enable row level security;

create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

create policy "own rows" on public.value_descriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.career_anchor_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.user_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.ai_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on public.simulation_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own templates" on public.question_templates
  for all using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
