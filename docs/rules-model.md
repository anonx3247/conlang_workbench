# Structured Rule Model

Conlang Workbench stores linguistic rules as structured typed data. Text DSL is
not canonical storage.

## Canonical Storage

Rule-bearing tables use `jsonb` columns with version and kind checks:

- `sound_rules.rule_body`
- `morphology_rules.rule_body`
- `phonotactic_templates.template_body`
- `phonotactic_constraints.constraint_body`

The JSON object carries the semantic parts of a rule, such as target,
replacement, context, operations, conditions, feature bindings, slots, and
positions. The database rejects string-only bodies and top-level `source`,
`dsl`, or `pattern` fields in canonical rule JSON.

## Display And Import

A readable syntax can be added later as generated display text or as an
import/export format. When that happens, parsing and serialization should live at
the boundary:

1. Parse imported text into the structured JSON shape.
2. Validate it with the TypeScript guards in `src/lib/rules.ts`.
3. Store only the structured object.
4. Generate display text from the structured object when needed.

This avoids coupling schema migrations and runtime behavior to parser quirks.
The previous alpha app stored morphology, rewrite, and phonotactic behavior as
DSL strings, which forced migrations to parse and rewrite user-authored text.
This version keeps parser compatibility concerns outside the database contract.
