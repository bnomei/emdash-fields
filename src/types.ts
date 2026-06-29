/**
 * Option and stored-value types for fields plugin widgets.
 *
 * Options are schema-safe widget configuration on EmDash JSON fields; values are
 * the JSON shapes widgets read from persistence and emit through `onChange`.
 */
import type { ReactElement } from "react";
import type { FieldsI18nConfig, LocalizedString } from "./i18n";

export type FieldsSubFieldType =
  | "text"
  | "textarea"
  | "number"
  | "integer"
  | "boolean"
  | "select"
  | "url";

export type FieldsChoice = {
  value: string;
  label?: LocalizedString;
  description?: LocalizedString;
  /**
   * Display icon for a choice.
   *
   * Schema-safe configuration should use a string token (for initials or a glyph)
   * or a string image source (http(s), root-relative, relative, or data:image/).
   * Code-defined options may pass a React element.
   */
  icon?: string | ReactElement;
};

/** One keyed input inside an object or structure row. */
export type FieldsSubField = {
  key: string;
  label: LocalizedString;
  type?: FieldsSubFieldType;
  required?: boolean;
  placeholder?: LocalizedString;
  suffix?: LocalizedString;
  options?: FieldsChoice[] | string[];
};

/** Fixed subfield layout for a single JSON object editor. */
export type ObjectOptions = {
  fields: FieldsSubField[];
  helpText?: LocalizedString;
  i18n?: FieldsI18nConfig;
};

/** Repeatable object rows with optional min/max bounds and reordering. */
export type StructureOptions = {
  fields: FieldsSubField[];
  itemLabel?: LocalizedString;
  min?: number;
  max?: number;
  sortable?: boolean;
  summary?: LocalizedString;
  helpText?: LocalizedString;
  i18n?: FieldsI18nConfig;
};

/** @deprecated Use FieldsSubFieldType. */
export type FieldKitSubFieldType = FieldsSubFieldType;

/** @deprecated Use FieldsChoice. */
export type FieldKitChoice = FieldsChoice;

/** @deprecated Use FieldsSubField. */
export type FieldKitSubField = FieldsSubField;

/** @deprecated Use ObjectOptions. */
export type ObjectFormOptions = ObjectOptions;

/** @deprecated Use StructureOptions. */
export type ListOptions = StructureOptions;

/** Persisted link payload: type, href value, label text, and target window. */
export type LinkValue = {
  type?: "url" | "email" | "tel" | "entry" | "media";
  value?: string;
  text?: string;
  target?: "_blank" | "_self";
};

export type LinkOptions = {
  i18n?: FieldsI18nConfig;
};

/** Single- or multi-select choice cards; `options` aliases `choices` when empty. */
export type ChoicesOptions = {
  choices?: FieldsChoice[] | string[];
  options?: FieldsChoice[] | string[];
  multiple?: boolean;
  orientation?: "vertical" | "horizontal";
  columns?: number;
  helpText?: LocalizedString;
  i18n?: FieldsI18nConfig;
};
