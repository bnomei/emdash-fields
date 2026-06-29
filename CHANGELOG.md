# Changelog

All notable changes to this package will be documented in this file.

This project follows semantic versioning.

## 0.2.1 - 2026-06-29

- Preserved unknown select subfield values on load so opening object or structure
  editors no longer clears saved selections that are not in the current option
  list.
- Improved legacy/off-type value handling for structured widgets, including
  scalar URL link values, numeric string subfields, string boolean flags, and
  single- or multi-choice values stored in older shapes.
- Documented structure `min`/`max` row-count behavior and fixed contradictory
  bounds so editor controls stay reachable without trimming or padding stored
  data on open.

## 0.2.0 - 2026-06-18

- Added EmDash-shaped `i18n` options with `locale`, `defaultLocale`,
  `locales`, `fallback`, and `messages` for field widget copy.
- Added localized string support for authored field labels, help text,
  placeholders, suffixes, choices, and widget metadata labels.
- Exported the default field i18n catalog, message keys, and resolver helpers.

## 0.1.1 - 2026-06-18

- Added deterministic value transformation helpers and test coverage for object,
  structure, link, choices, and numeric field behavior.
- Improved field labelling semantics and choice icon documentation.
- Removed unsupported `collapsed` and `presentation` option types.

## 0.1.0 - 2026-06-12

- Initial public package setup for the `@bnomei/emdash-fields` EmDash field
  widgets.
- Added object, structure, link, and choices JSON field widgets.
