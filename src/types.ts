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

export type FieldsSubField = {
  key: string;
  label: LocalizedString;
  type?: FieldsSubFieldType;
  required?: boolean;
  placeholder?: LocalizedString;
  suffix?: LocalizedString;
  options?: FieldsChoice[] | string[];
};

export type ObjectOptions = {
  fields: FieldsSubField[];
  helpText?: LocalizedString;
  i18n?: FieldsI18nConfig;
};

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

export type LinkValue = {
  type?: "url" | "email" | "tel" | "entry" | "media";
  value?: string;
  text?: string;
  target?: "_blank" | "_self";
};

export type LinkOptions = {
  i18n?: FieldsI18nConfig;
};

export type ChoicesOptions = {
  choices?: FieldsChoice[] | string[];
  options?: FieldsChoice[] | string[];
  multiple?: boolean;
  orientation?: "vertical" | "horizontal";
  columns?: number;
  helpText?: LocalizedString;
  i18n?: FieldsI18nConfig;
};
