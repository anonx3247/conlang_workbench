create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_project_owner(project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.owner_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

create table public.phonemes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  symbol text not null check (length(trim(symbol)) > 0),
  phoneme_type text not null check (phoneme_type in ('consonant', 'vowel')),
  features jsonb not null default '{}'::jsonb check (jsonb_typeof(features) = 'object'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, symbol)
);

create table public.natural_classes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  phoneme_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.romanization_mappings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  ipa_symbol text not null check (length(ipa_symbol) > 0),
  latin_mapping text not null check (length(latin_mapping) > 0),
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, ipa_symbol),
  unique (project_id, latin_mapping)
);

create table public.phonotactic_templates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text,
  template_body jsonb not null,
  is_active boolean not null default true,
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(template_body) = 'object'),
  check (template_body ->> 'version' = '1'),
  check (template_body ->> 'kind' = 'phonotactic-template'),
  check (jsonb_typeof(template_body -> 'slots') = 'array'),
  check (not (template_body ? 'source' or template_body ? 'dsl' or template_body ? 'pattern'))
);

create table public.phonotactic_constraints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text,
  constraint_body jsonb not null,
  is_active boolean not null default true,
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(constraint_body) = 'object'),
  check (constraint_body ->> 'version' = '1'),
  check (constraint_body ->> 'kind' in ('forbidden-sequence', 'gemination')),
  check (not (constraint_body ? 'source' or constraint_body ? 'dsl' or constraint_body ? 'pattern'))
);

create table public.sound_rules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  rule_body jsonb not null,
  is_active boolean not null default true,
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(rule_body) = 'object'),
  check (rule_body ->> 'version' = '1'),
  check (rule_body ->> 'kind' = 'sound-rule'),
  check (jsonb_typeof(rule_body -> 'target') = 'array'),
  check (jsonb_typeof(rule_body -> 'replacement') = 'array'),
  check (not (rule_body ? 'source' or rule_body ? 'dsl' or rule_body ? 'pattern'))
);

create table public.parts_of_speech (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  abbreviation text not null check (length(trim(abbreviation)) > 0),
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dimensions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  pos_id uuid not null references public.parts_of_speech(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  abbreviation text,
  levels jsonb not null default '[]'::jsonb check (jsonb_typeof(levels) = 'array'),
  intrinsic boolean not null default false,
  ordering integer not null default 0,
  template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.morphology_rules (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  rule_kind text not null check (rule_kind in ('inflectional', 'derivational')),
  rule_body jsonb not null,
  feature_bindings jsonb not null default '{}'::jsonb check (jsonb_typeof(feature_bindings) = 'object'),
  input_pos_id uuid references public.parts_of_speech(id) on delete set null,
  output_pos_id uuid references public.parts_of_speech(id) on delete set null,
  auto_apply boolean not null default false,
  is_active boolean not null default true,
  ordering integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(rule_body) = 'object'),
  check (rule_body ->> 'version' = '1'),
  check (rule_body ->> 'kind' = 'morphology-rule'),
  check (rule_body ? 'operation' or rule_body ? 'branches'),
  check (not (rule_body ? 'source' or rule_body ? 'dsl' or rule_body ? 'pattern'))
);

create table public.morphology_rule_parts_of_speech (
  project_id uuid not null references public.projects(id) on delete cascade,
  rule_id uuid not null references public.morphology_rules(id) on delete cascade,
  pos_id uuid not null references public.parts_of_speech(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (rule_id, pos_id)
);

create table public.lexemes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  ipa text not null check (length(trim(ipa)) > 0),
  romanization text,
  meaning text,
  part_of_speech_id uuid references public.parts_of_speech(id) on delete set null,
  skipped_dimensions jsonb not null default '[]'::jsonb check (jsonb_typeof(skipped_dimensions) = 'array'),
  intrinsic_levels jsonb not null default '{}'::jsonb check (jsonb_typeof(intrinsic_levels) = 'object'),
  is_phonological_exception boolean not null default false,
  derived_from_lexeme_id uuid references public.lexemes(id) on delete set null,
  derived_via_rule_id uuid references public.morphology_rules(id) on delete set null,
  root_only_via_derivations boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.morphological_rule_exceptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  rule_id uuid not null references public.morphology_rules(id) on delete cascade,
  override_form text not null check (length(trim(override_form)) > 0),
  rule_body_snapshot jsonb not null check (jsonb_typeof(rule_body_snapshot) = 'object'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lexeme_id, rule_id)
);

create table public.paradigm_cell_overrides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  feature_set jsonb not null check (jsonb_typeof(feature_set) = 'object'),
  override_ipa text not null check (length(trim(override_ipa)) > 0),
  override_romanization text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lexeme_id, feature_set)
);

create table public.markers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  pos_id uuid not null references public.parts_of_speech(id) on delete cascade,
  name text not null default 'Unmarked',
  feature_bindings jsonb not null default '{}'::jsonb check (jsonb_typeof(feature_bindings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lexeme_parents (
  project_id uuid not null references public.projects(id) on delete cascade,
  child_lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  parent_lexeme_id uuid not null references public.lexemes(id) on delete cascade,
  relationship text,
  notes text,
  created_at timestamptz not null default now(),
  primary key (child_lexeme_id, parent_lexeme_id),
  check (child_lexeme_id <> parent_lexeme_id)
);

create table public.project_settings (
  project_id uuid not null references public.projects(id) on delete cascade,
  key text not null check (length(trim(key)) > 0),
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, key)
);

create index phonemes_project_id_idx on public.phonemes(project_id);
create index natural_classes_project_id_idx on public.natural_classes(project_id);
create unique index natural_classes_project_name_key on public.natural_classes(project_id, lower(name));
create index romanization_mappings_project_id_idx on public.romanization_mappings(project_id);
create index phonotactic_templates_project_id_idx on public.phonotactic_templates(project_id);
create index phonotactic_constraints_project_id_idx on public.phonotactic_constraints(project_id);
create index sound_rules_project_id_idx on public.sound_rules(project_id);
create index parts_of_speech_project_id_idx on public.parts_of_speech(project_id);
create unique index parts_of_speech_project_name_key on public.parts_of_speech(project_id, lower(name));
create unique index parts_of_speech_project_abbreviation_key on public.parts_of_speech(project_id, upper(abbreviation));
create index dimensions_project_id_idx on public.dimensions(project_id);
create unique index dimensions_project_pos_name_key on public.dimensions(project_id, pos_id, lower(name));
create index morphology_rules_project_id_idx on public.morphology_rules(project_id);
create index morphology_rule_parts_of_speech_project_id_idx on public.morphology_rule_parts_of_speech(project_id);
create index lexemes_project_id_idx on public.lexemes(project_id);
create index morphological_rule_exceptions_project_id_idx on public.morphological_rule_exceptions(project_id);
create index paradigm_cell_overrides_project_id_idx on public.paradigm_cell_overrides(project_id);
create index markers_project_id_idx on public.markers(project_id);
create index lexeme_parents_project_id_idx on public.lexeme_parents(project_id);

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_phonemes_updated_at before update on public.phonemes
  for each row execute function public.set_updated_at();
create trigger set_natural_classes_updated_at before update on public.natural_classes
  for each row execute function public.set_updated_at();
create trigger set_romanization_mappings_updated_at before update on public.romanization_mappings
  for each row execute function public.set_updated_at();
create trigger set_phonotactic_templates_updated_at before update on public.phonotactic_templates
  for each row execute function public.set_updated_at();
create trigger set_phonotactic_constraints_updated_at before update on public.phonotactic_constraints
  for each row execute function public.set_updated_at();
create trigger set_sound_rules_updated_at before update on public.sound_rules
  for each row execute function public.set_updated_at();
create trigger set_parts_of_speech_updated_at before update on public.parts_of_speech
  for each row execute function public.set_updated_at();
create trigger set_dimensions_updated_at before update on public.dimensions
  for each row execute function public.set_updated_at();
create trigger set_morphology_rules_updated_at before update on public.morphology_rules
  for each row execute function public.set_updated_at();
create trigger set_lexemes_updated_at before update on public.lexemes
  for each row execute function public.set_updated_at();
create trigger set_morphological_rule_exceptions_updated_at before update on public.morphological_rule_exceptions
  for each row execute function public.set_updated_at();
create trigger set_paradigm_cell_overrides_updated_at before update on public.paradigm_cell_overrides
  for each row execute function public.set_updated_at();
create trigger set_markers_updated_at before update on public.markers
  for each row execute function public.set_updated_at();
create trigger set_project_settings_updated_at before update on public.project_settings
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.phonemes enable row level security;
alter table public.natural_classes enable row level security;
alter table public.romanization_mappings enable row level security;
alter table public.phonotactic_templates enable row level security;
alter table public.phonotactic_constraints enable row level security;
alter table public.sound_rules enable row level security;
alter table public.parts_of_speech enable row level security;
alter table public.dimensions enable row level security;
alter table public.morphology_rules enable row level security;
alter table public.morphology_rule_parts_of_speech enable row level security;
alter table public.lexemes enable row level security;
alter table public.morphological_rule_exceptions enable row level security;
alter table public.paradigm_cell_overrides enable row level security;
alter table public.markers enable row level security;
alter table public.lexeme_parents enable row level security;
alter table public.project_settings enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy projects_select_own on public.projects
  for select using (owner_id = auth.uid());
create policy projects_insert_own on public.projects
  for insert with check (owner_id = auth.uid());
create policy projects_update_own on public.projects
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_delete_own on public.projects
  for delete using (owner_id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'phonemes',
    'natural_classes',
    'romanization_mappings',
    'phonotactic_templates',
    'phonotactic_constraints',
    'sound_rules',
    'parts_of_speech',
    'dimensions',
    'morphology_rules',
    'morphology_rule_parts_of_speech',
    'lexemes',
    'morphological_rule_exceptions',
    'paradigm_cell_overrides',
    'markers',
    'lexeme_parents',
    'project_settings'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (public.is_project_owner(project_id))',
      table_name || '_select_owned',
      table_name
    );
    execute format(
      'create policy %I on public.%I for insert with check (public.is_project_owner(project_id))',
      table_name || '_insert_owned',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update using (public.is_project_owner(project_id)) with check (public.is_project_owner(project_id))',
      table_name || '_update_owned',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete using (public.is_project_owner(project_id))',
      table_name || '_delete_owned',
      table_name
    );
  end loop;
end;
$$;
