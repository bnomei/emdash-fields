import type { ChoicesOptions, FieldsSubField, ObjectOptions, StructureOptions } from "./types";

export const fieldsWidgets = {
  object: "fields:object",
  structure: "fields:structure",
  link: "fields:link",
  choices: "fields:choices",
  objectForm: "fields:object-form",
  list: "fields:list",
} as const;

export function objectOptions(
  fields: FieldsSubField[],
  options: Omit<ObjectOptions, "fields"> = {},
) {
  return { ...options, fields } satisfies ObjectOptions;
}

export function structureOptions(
  fields: FieldsSubField[],
  options: Omit<StructureOptions, "fields"> = {},
) {
  return { ...options, fields } satisfies StructureOptions;
}

/** @deprecated Use fieldsWidgets. */
export const fieldKitPlusWidgets = fieldsWidgets;

/** @deprecated Use objectOptions. */
export const objectFormOptions = objectOptions;

/** @deprecated Use structureOptions. */
export const listOptions = structureOptions;

export function choicesOptions(options: ChoicesOptions) {
  return options;
}
