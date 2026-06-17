import type { ChoicesOptions, ObjectOptions } from "./types";

const objectOptions = {
  fields: [],
  helpText: "Optional help text.",
} satisfies ObjectOptions;

const choicesOptions = {
  choices: ["One", "Two"],
  multiple: true,
} satisfies ChoicesOptions;

void objectOptions;
void choicesOptions;

const unsupportedObjectOptions = {
  fields: [],
  // @ts-expect-error Unsupported object UI state is not part of the public options type.
  collapsed: true,
} satisfies ObjectOptions;

const unsupportedChoicesOptions = {
  choices: ["One", "Two"],
  // @ts-expect-error Unsupported choices presentation UI is not part of the public options type.
  presentation: "toggle",
} satisfies ChoicesOptions;

void unsupportedObjectOptions;
void unsupportedChoicesOptions;
