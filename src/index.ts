import { definePlugin, type PluginDescriptor } from "emdash";
import { fieldsWidgets } from "./schema";

export type {
  ChoicesOptions,
  FieldsChoice,
  FieldsSubField,
  FieldsSubFieldType,
  FieldKitChoice,
  FieldKitSubField,
  FieldKitSubFieldType,
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

export type FieldsDescriptorOptions = {
  entrypoint?: string;
  adminEntry?: string;
};

const PLUGIN_ID = "fields";
const PLUGIN_VERSION = "0.1.0";
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
    options: { adminEntry },
  };
}

export function createPlugin(options: Pick<FieldsDescriptorOptions, "adminEntry"> = {}) {
  return definePlugin({
    id: PLUGIN_ID,
    version: PLUGIN_VERSION,
    admin: {
      entry: options.adminEntry ?? `${PACKAGE_NAME}/admin`,
      fieldWidgets: [
        { name: "object", label: "Object", fieldTypes: ["json"] },
        { name: "structure", label: "Structure", fieldTypes: ["json"] },
        { name: "link", label: "Link", fieldTypes: ["json"] },
        { name: "choices", label: "Choices", fieldTypes: ["json"] },
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
