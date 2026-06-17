export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GeneratedKeys = "id" | "created_at" | "updated_at";

type NullableKeys<Row> = {
  [Key in keyof Row]-?: null extends Row[Key] ? Key : never;
}[keyof Row];

type DefaultInsert<Row> = Omit<Row, GeneratedKeys | NullableKeys<Row>> &
  Partial<Pick<Row, Extract<keyof Row, GeneratedKeys | NullableKeys<Row>>>>;

export type TableRecord<
  Row,
  Insert = DefaultInsert<Row>,
  Update = Partial<Insert>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProjectOwnedRow = {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: TableRecord<
        {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          display_name?: string | null;
        }
      >;
      projects: TableRecord<
        {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
        }
      >;
      phonemes: TableRecord<
        ProjectOwnedRow & {
          symbol: string;
          phoneme_type: "consonant" | "vowel";
          features: Json;
          notes: string | null;
        },
        {
          id?: string;
          project_id: string;
          symbol: string;
          phoneme_type: "consonant" | "vowel";
          features?: Json;
          notes?: string | null;
        }
      >;
      natural_classes: TableRecord<
        ProjectOwnedRow & {
          name: string;
          description: string | null;
          phoneme_ids: string[];
          notes: string | null;
        },
        {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          phoneme_ids?: string[];
          notes?: string | null;
        }
      >;
      romanization_mappings: TableRecord<
        ProjectOwnedRow & {
          ipa_symbol: string;
          latin_mapping: string;
          ordering: number;
        },
        {
          id?: string;
          project_id: string;
          ipa_symbol: string;
          latin_mapping: string;
          ordering?: number;
        }
      >;
      phonotactic_templates: TableRecord<
        ProjectOwnedRow & {
          label: string | null;
          template_body: Json;
          is_active: boolean;
          ordering: number;
          notes: string | null;
        }
      >;
      phonotactic_constraints: TableRecord<
        ProjectOwnedRow & {
          label: string | null;
          constraint_body: Json;
          is_active: boolean;
          ordering: number;
          notes: string | null;
        }
      >;
      sound_rules: TableRecord<
        ProjectOwnedRow & {
          name: string;
          rule_body: Json;
          is_active: boolean;
          ordering: number;
          notes: string | null;
        }
      >;
      parts_of_speech: TableRecord<
        ProjectOwnedRow & {
          name: string;
          abbreviation: string;
          ordering: number;
          notes: string | null;
        }
      >;
      dimensions: TableRecord<
        ProjectOwnedRow & {
          pos_id: string;
          name: string;
          abbreviation: string | null;
          levels: Json;
          intrinsic: boolean;
          ordering: number;
          template_id: string | null;
          notes: string | null;
        }
      >;
      morphology_rules: TableRecord<
        ProjectOwnedRow & {
          name: string;
          rule_kind: "inflectional" | "derivational";
          rule_body: Json;
          feature_bindings: Json;
          input_pos_id: string | null;
          output_pos_id: string | null;
          auto_apply: boolean;
          is_active: boolean;
          ordering: number;
          notes: string | null;
        }
      >;
      morphology_rule_parts_of_speech: TableRecord<{
        project_id: string;
        rule_id: string;
        pos_id: string;
        rule_ordering: number;
        created_at: string;
      }>;
      morphological_rule_exceptions: TableRecord<
        ProjectOwnedRow & {
          lexeme_id: string;
          rule_id: string;
          override_form: string;
          rule_body_snapshot: Json;
          notes: string | null;
        }
      >;
      lexemes: TableRecord<
        ProjectOwnedRow & {
          ipa: string;
          romanization: string | null;
          meaning: string | null;
          part_of_speech_id: string | null;
          skipped_dimensions: Json;
          intrinsic_levels: Json;
          is_phonological_exception: boolean;
          derived_from_lexeme_id: string | null;
          derived_via_rule_id: string | null;
          root_only_via_derivations: boolean;
          notes: string | null;
        }
      >;
      paradigm_cell_overrides: TableRecord<
        ProjectOwnedRow & {
          lexeme_id: string;
          feature_set: Json;
          override_ipa: string;
          override_romanization: string | null;
          notes: string | null;
        }
      >;
      markers: TableRecord<
        ProjectOwnedRow & {
          pos_id: string;
          name: string;
          feature_bindings: Json;
          notes: string | null;
        }
      >;
      lexeme_parents: TableRecord<{
        project_id: string;
        child_lexeme_id: string;
        parent_lexeme_id: string;
        relationship: string | null;
        notes: string | null;
        created_at: string;
      }>;
      project_settings: TableRecord<{
        project_id: string;
        key: string;
        value: Json;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
