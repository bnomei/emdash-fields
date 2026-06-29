/**
 * Widget registry keys and typed option builders for field schema authoring.
 *
 * `fieldsWidgets` names match admin entry keys; builders satisfy option types when
 * defining CMS JSON fields.
 */
import type { ChoicesOptions, FieldsSubField, ObjectOptions, StructureOptions } from "./types";

/** Admin widget identifiers referenced from EmDash field definitions. */
export const fieldsWidgets = {
  object: "fields:object",
  structure: "fields:structure",
  link: "fields:link",
  choices: "fields:choices",
  objectForm: "fields:object-form",
  list: "fields:list",
} as const;

/** Builds a typed object widget options object with required `fields`. */
export function objectOptions(
  fields: FieldsSubField[],
  options: Omit<ObjectOptions, "fields"> = {},
) {
  return { ...options, fields } satisfies ObjectOptions;
}

/** Builds a typed structure widget options object with required `fields`. */
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

/** Identity helper that preserves `ChoicesOptions` typing at schema sites. */
export function choicesOptions(options: ChoicesOptions) {
  return options;
}
