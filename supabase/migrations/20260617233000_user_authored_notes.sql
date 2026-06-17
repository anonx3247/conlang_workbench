alter table public.natural_classes
  add column notes text;

alter table public.phonotactic_templates
  add column notes text;

alter table public.phonotactic_constraints
  add column notes text;

alter table public.sound_rules
  add column notes text;

alter table public.parts_of_speech
  add column notes text;

alter table public.dimensions
  add column notes text;

alter table public.morphology_rules
  add column notes text;

alter table public.lexemes
  add column notes text;

alter table public.markers
  add column notes text;
