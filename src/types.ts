import type { ReactNode } from "react";

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
  label?: string;
  description?: string;
  icon?: ReactNode;
};

export type FieldsSubField = {
  key: string;
  label: string;
  type?: FieldsSubFieldType;
  required?: boolean;
  placeholder?: string;
  suffix?: string;
  options?: FieldsChoice[] | string[];
};

export type ObjectOptions = {
  fields: FieldsSubField[];
  helpText?: string;
};

export type StructureOptions = {
  fields: FieldsSubField[];
  itemLabel?: string;
  min?: number;
  max?: number;
  sortable?: boolean;
  summary?: string;
  helpText?: string;
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

export type ChoicesOptions = {
  choices?: FieldsChoice[] | string[];
  options?: FieldsChoice[] | string[];
  multiple?: boolean;
  orientation?: "vertical" | "horizontal";
  columns?: number;
  helpText?: string;
};
