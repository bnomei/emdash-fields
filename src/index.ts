import { definePlugin, type PluginDescriptor } from "emdash";
import { fieldMessage, type FieldsI18nConfig } from "./i18n";
import { fieldsWidgets } from "./schema";

export type {
  ChoicesOptions,
  FieldsChoice,
  FieldsSubField,
  FieldsSubFieldType,
  FieldKitChoice,
  FieldKitSubField,
  FieldKitSubFieldType,
  LinkOptions,
  LinkValue,
  ListOptions,
  ObjectOptions,
  ObjectFormOptions,
  StructureOptions,
} from "./types";
export {
  choicesOptions,
  fieldsWidgets,
  fieldKitPlusWidgets,
  listOptions,
  objectFormOptions,
  objectOptions,
  structureOptions,
} from "./schema";
export type {
  FieldsI18nConfig,
  FieldsI18nMessages,
  FieldsMessageKey,
  LocalizedString,
} from "./i18n";
export {
  DEFAULT_FIELDS_I18N,
  DEFAULT_LOCALE,
  fieldMessage,
  formatFieldMessage,
  formatLocalizedString,
  localeFallbacks,
  localizedString,
} from "./i18n";

export type FieldsDescriptorOptions = {
  entrypoint?: string;
  adminEntry?: string;
  i18n?: FieldsI18nConfig;
};

const PLUGIN_ID = "fields";
const PLUGIN_VERSION = "0.2.0";
const PACKAGE_NAME = "@bnomei/emdash-fields";

export function fieldsPlugin(options: FieldsDescriptorOptions = {}): PluginDescriptor {
  const entrypoint = options.entrypoint ?? PACKAGE_NAME;
  const adminEntry = options.adminEntry ?? `${entrypoint}/admin`;

  return {
    id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    format: "native",
    entrypoint,
    adminEntry,
    options: { adminEntry, i18n: options.i18n },
  };
}

export function createPlugin(options: Pick<FieldsDescriptorOptions, "adminEntry" | "i18n"> = {}) {
  return definePlugin({
    id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    admin: {
      entry: options.adminEntry ?? `${PACKAGE_NAME}/admin`,
      fieldWidgets: [
        { name: "object", label: fieldMessage("object", options.i18n), fieldTypes: ["json"] },
        {
          name: "structure",
          label: fieldMessage("structure", options.i18n),
          fieldTypes: ["json"],
        },
        { name: "link", label: fieldMessage("link", options.i18n), fieldTypes: ["json"] },
        { name: "choices", label: fieldMessage("choices", options.i18n), fieldTypes: ["json"] },
      ],
    },
  });
}

/** @deprecated Use FieldsDescriptorOptions. */
export type FieldKitPlusDescriptorOptions = FieldsDescriptorOptions;

/** @deprecated Use fieldsPlugin. */
export const fieldKitPlusPlugin = fieldsPlugin;

export default fieldsPlugin;

export const widgets = fieldsWidgets;
