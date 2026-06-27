import { Button, Input, Radio, Select, Textarea } from "@cloudflare/kumo";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useAdminLocale } from "./admin-locale";
import {
  fieldMessage,
  formatFieldMessage,
  localizedString,
  type FieldsI18nConfig,
  type LocalizedString,
} from "./i18n";
import type { CSSProperties, ChangeEvent } from "react";
import type {
  ChoicesOptions,
  FieldsChoice,
  FieldsSubField,
  LinkOptions,
  LinkValue,
  ObjectOptions,
  StructureOptions,
} from "./types";

type FieldWidgetProps<TOptions = Record<string, unknown>> = {
  value: unknown;
  onChange: (value: unknown) => void;
  label?: string;
  id?: string;
  required?: boolean;
  options?: TOptions;
  minimal?: boolean;
};

type JsonRecord = Record<string, unknown>;

const wrapperStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies CSSProperties;

const rowStyle = {
  border:
    "1px solid var(--color-kumo-hairline, var(--color-kumo-line, color-mix(in srgb, currentColor 16%, transparent)))",
  borderRadius: "0.5rem",
  padding: "0.75rem",
  display: "grid",
  gap: "0.75rem",
  background: "var(--color-kumo-base, transparent)",
} satisfies CSSProperties;

const fieldStyle = {
  display: "grid",
  gap: "0.35rem",
} satisfies CSSProperties;

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-color-kumo-strong, currentColor)",
} satisfies CSSProperties;

const buttonRowStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  alignItems: "center",
} satisfies CSSProperties;

const checkboxRowStyle = {
  ...buttonRowStyle,
  color: "var(--text-color-kumo-default, currentColor)",
} satisfies CSSProperties;

const checkboxChoiceRowStyle = {
  ...checkboxRowStyle,
  alignItems: "flex-start",
} satisfies CSSProperties;

const fieldsetStyle = {
  border: 0,
  display: "grid",
  gap: "0.75rem",
  margin: 0,
  minWidth: 0,
  padding: 0,
} satisfies CSSProperties;

const legendStyle = {
  ...labelStyle,
  padding: 0,
} satisfies CSSProperties;

const choiceCardStyle = {
  alignItems: "flex-start",
  background: "var(--color-kumo-base, transparent)",
  border:
    "1px solid var(--color-kumo-hairline, var(--color-kumo-line, color-mix(in srgb, currentColor 16%, transparent)))",
  borderRadius: "0.5rem",
  cursor: "pointer",
  display: "flex",
  gap: "0.75rem",
  justifyContent: "space-between",
  minWidth: 0,
  padding: "0.75rem",
  transition: "background-color 120ms ease, border-color 120ms ease",
} satisfies CSSProperties;

const selectedChoiceCardStyle = {
  background: "var(--color-kumo-tint, color-mix(in srgb, currentColor 6%, transparent))",
  borderColor: "var(--color-kumo-brand, var(--color-kumo-interact, currentColor))",
} satisfies CSSProperties;

const choiceCardContentStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: "0.65rem",
  minWidth: 0,
} satisfies CSSProperties;

const choiceCardTextStyle = {
  display: "grid",
  gap: "0.2rem",
  minWidth: 0,
} satisfies CSSProperties;

const choiceCardLabelStyle = {
  color: "var(--text-color-kumo-default, currentColor)",
  fontSize: "0.92rem",
  fontWeight: 600,
  lineHeight: 1.25,
} satisfies CSSProperties;

const choiceDescriptionStyle = {
  color: "var(--text-color-kumo-subtle, currentColor)",
  fontSize: "0.82rem",
  fontWeight: 400,
  lineHeight: 1.35,
} satisfies CSSProperties;

const choiceIconStyle = {
  alignItems: "center",
  background: "var(--color-kumo-recessed, color-mix(in srgb, currentColor 8%, transparent))",
  border:
    "1px solid var(--color-kumo-hairline, var(--color-kumo-line, color-mix(in srgb, currentColor 12%, transparent)))",
  borderRadius: "0.375rem",
  color: "var(--text-color-kumo-strong, currentColor)",
  display: "inline-flex",
  flex: "0 0 auto",
  fontSize: "0.72rem",
  fontWeight: 700,
  height: "1.75rem",
  justifyContent: "center",
  lineHeight: 1,
  overflow: "hidden",
  width: "1.75rem",
} satisfies CSSProperties;

const choiceIconImageStyle = {
  height: "100%",
  objectFit: "cover",
  width: "100%",
} satisfies CSSProperties;

const choiceControlStyle = {
  flex: "0 0 auto",
  marginTop: "0.15rem",
} satisfies CSSProperties;

const helpTextStyle = {
  color: "var(--text-color-kumo-subtle, currentColor)",
  fontSize: "0.85rem",
} satisfies CSSProperties;

const fullWidthButtonClassName = "h-9 min-h-9 w-full justify-center";

function useFieldI18n(i18n: FieldsI18nConfig | undefined): FieldsI18nConfig {
  const locale = useAdminLocale(i18n?.locale ?? i18n?.defaultLocale);
  return { ...i18n, locale };
}

export function normalizeObjectValue(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

export function updateObjectValue(value: unknown, key: string, nextValue: unknown): JsonRecord {
  return { ...normalizeObjectValue(value), [key]: nextValue };
}

export function normalizeStructureValue(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map((item) => normalizeObjectValue(item)) : [];
}

export function addStructureItem(value: unknown): JsonRecord[] {
  return [...normalizeStructureValue(value), {}];
}

export function updateStructureItem(
  value: unknown,
  index: number,
  nextItem: unknown,
): JsonRecord[] {
  const items = normalizeStructureValue(value);
  if (index < 0 || index >= items.length) {
    return items;
  }

  const nextItems = [...items];
  nextItems[index] = normalizeObjectValue(nextItem);
  return nextItems;
}

export function removeStructureItem(value: unknown, index: number): JsonRecord[] {
  return normalizeStructureValue(value).filter((_item, itemIndex) => itemIndex !== index);
}

export function moveStructureItem(
  value: unknown,
  fromIndex: number,
  toIndex: number,
): JsonRecord[] {
  const items = normalizeStructureValue(value);
  if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [moved] = nextItems.splice(fromIndex, 1);
  if (!moved) {
    return items;
  }

  nextItems.splice(toIndex, 0, moved);
  return nextItems;
}

export function normalizeLinkValue(value: unknown): LinkValue {
  return normalizeObjectValue(value) as LinkValue;
}

export function updateLinkValue(value: unknown, nextValue: Partial<LinkValue>): LinkValue {
  return { ...normalizeLinkValue(value), ...nextValue };
}

export function normalizeChoices(value?: FieldsChoice[] | string[]): FieldsChoice[] {
  return (value ?? []).map((choice) =>
    typeof choice === "string" ? { value: choice, label: choice } : choice,
  );
}

export function normalizeChoiceSelection(value: unknown, multiple: boolean): string[] {
  if (multiple) {
    if (typeof value === "string") {
      return [value];
    }
    return Array.isArray(value)
      ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
      : [];
  }

  return typeof value === "string" ? [value] : [];
}

export function updateChoiceSelection(
  value: unknown,
  choiceValue: string,
  checked: boolean,
  multiple: boolean,
): string | string[] {
  if (!multiple) {
    return checked ? choiceValue : (normalizeChoiceSelection(value, false)[0] ?? "");
  }

  const nextSelected = new Set(normalizeChoiceSelection(value, true));
  if (checked) {
    nextSelected.add(choiceValue);
  } else {
    nextSelected.delete(choiceValue);
  }
  return [...nextSelected];
}

function choiceColumnCount(columns: number | undefined, total: number) {
  if (typeof columns === "number" && Number.isFinite(columns)) {
    return Math.max(1, Math.min(Math.floor(columns), Math.max(total, 1)));
  }
  return Math.max(total, 1);
}

function horizontalChoiceGridStyle(columns: number | undefined, total: number) {
  return {
    display: "grid",
    gap: "0.75rem",
    gridTemplateColumns: `repeat(${choiceColumnCount(columns, total)}, minmax(0, 1fr))`,
  } satisfies CSSProperties;
}

function choiceInputId(id: string, value: string, index: number) {
  const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, "-") || "choice";
  return `${id}-${index}-${safeValue}`;
}

function isImageIcon(icon: unknown): icon is string {
  return typeof icon === "string" && /^(?:https?:|data:image\/|\/|\.\/|\.\.\/)/.test(icon);
}

function renderChoiceIcon(choice: FieldsChoice) {
  if (!choice.icon) return null;

  return (
    <span aria-hidden="true" style={choiceIconStyle}>
      {isImageIcon(choice.icon) ? (
        <img alt="" src={choice.icon} style={choiceIconImageStyle} />
      ) : (
        choice.icon
      )}
    </span>
  );
}

function renderChoiceCardLabel(choice: FieldsChoice, i18n: FieldsI18nConfig) {
  const description = localizedString(choice.description, i18n);

  return (
    <span style={choiceCardContentStyle}>
      {renderChoiceIcon(choice)}
      <span style={choiceCardTextStyle}>
        <span style={choiceCardLabelStyle}>{choiceLabel(choice, i18n)}</span>
        {description ? <span style={choiceDescriptionStyle}>{description}</span> : null}
      </span>
    </span>
  );
}

function choiceLabel(choice: FieldsChoice, i18n: FieldsI18nConfig) {
  return localizedString(choice.label, i18n, choice.value);
}

export function parseNumericInput(value: string, type: "number" | "integer") {
  if (value.trim() === "") {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  if (type === "integer" && !Number.isInteger(numericValue)) {
    return undefined;
  }

  return numericValue;
}

function readInputValue(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  type: FieldsSubField["type"],
) {
  const target = event.currentTarget;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    return target.checked;
  }
  if (target instanceof HTMLInputElement && target.type === "number") {
    return parseNumericInput(target.value, type === "integer" ? "integer" : "number");
  }
  return target.value;
}

function renderSubField(
  field: FieldsSubField,
  value: unknown,
  onChange: (value: unknown) => void,
  idPrefix: string,
  i18n: FieldsI18nConfig,
) {
  const id = `${idPrefix}-${field.key}`;
  const labelId = `${id}-label`;
  const type = field.type ?? "text";
  const label = localizedString(field.label, i18n);
  const placeholder = localizedString(field.placeholder, i18n) || undefined;
  const suffix = localizedString(field.suffix, i18n);
  const commonProps = {
    id,
    name: field.key,
    required: field.required,
    placeholder,
    "aria-labelledby": labelId,
    value: typeof value === "string" || typeof value === "number" ? value : "",
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(readInputValue(event, type)),
  };

  const selectChoices = normalizeChoices(field.options);

  return (
    <div key={field.key} style={fieldStyle}>
      {type === "boolean" || type === "select" ? null : (
        <label id={labelId} htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <Textarea {...commonProps} className="min-h-24 w-full" rows={4} />
      ) : type === "boolean" ? (
        <label htmlFor={id} style={checkboxRowStyle}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            name={field.key}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.currentTarget.checked)
            }
          />
          {label}
        </label>
      ) : type === "select" ? (
        <Select
          label={label}
          className="w-full"
          items={[
            { value: "", label: fieldMessage("select", i18n) },
            ...selectChoices.map((choice) => ({
              value: choice.value,
              label: choiceLabel(choice, i18n),
            })),
          ]}
          value={typeof value === "string" ? value : ""}
          onValueChange={(nextValue) => onChange(String(nextValue))}
        />
      ) : (
        <Input
          {...commonProps}
          className="w-full"
          type={
            type === "number" || type === "integer" ? "number" : type === "url" ? "url" : "text"
          }
          step={type === "integer" ? 1 : undefined}
        />
      )}
      {suffix ? <small style={helpTextStyle}>{suffix}</small> : null}
    </div>
  );
}

function renderObjectFields(
  fields: FieldsSubField[],
  value: JsonRecord,
  onChange: (value: JsonRecord) => void,
  idPrefix: string,
  i18n: FieldsI18nConfig,
) {
  return fields.map((field) =>
    renderSubField(
      field,
      value[field.key],
      (nextValue) => onChange(updateObjectValue(value, field.key, nextValue)),
      idPrefix,
      i18n,
    ),
  );
}

function summary(
  template: LocalizedString | undefined,
  item: JsonRecord,
  fallback: string,
  i18n: FieldsI18nConfig,
) {
  if (!template) return fallback;
  const localizedTemplate = localizedString(template, i18n);
  return localizedTemplate.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, key: string) => {
    const value = item[key];
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  });
}

export function ObjectField({
  value,
  onChange,
  id = "fields-object",
  options,
}: FieldWidgetProps<ObjectOptions>) {
  const i18n = useFieldI18n(options?.i18n);
  const data = normalizeObjectValue(value);
  const fields = options?.fields ?? [];

  if (!fields.length) {
    return <p>{fieldMessage("objectRequiresFields", i18n)}</p>;
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      {renderObjectFields(fields, data, (nextValue) => onChange(nextValue), id, i18n)}
      {options?.helpText ? (
        <small style={helpTextStyle}>{localizedString(options.helpText, i18n)}</small>
      ) : null}
    </div>
  );
}

export function StructureField({
  value,
  onChange,
  id = "fields-structure",
  options,
}: FieldWidgetProps<StructureOptions>) {
  const i18n = useFieldI18n(options?.i18n);
  const items = normalizeStructureValue(value);
  const fields = options?.fields ?? [];
  const itemLabel = localizedString(options?.itemLabel, i18n, fieldMessage("item", i18n));
  const sortable = options?.sortable !== false;

  if (!fields.length) {
    return <p>{fieldMessage("structureRequiresFields", i18n)}</p>;
  }

  function updateItems(nextItems: JsonRecord[]) {
    onChange(nextItems);
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      {items.map((item, index) => (
        <section key={index} style={rowStyle}>
          <strong>{summary(options?.summary, item, `${itemLabel} ${index + 1}`, i18n)}</strong>
          {renderObjectFields(
            fields,
            item,
            (nextItem) => {
              updateItems(updateStructureItem(items, index, nextItem));
            },
            `${id}-${index}`,
            i18n,
          )}
          <div style={buttonRowStyle}>
            <Button
              type="button"
              size="sm"
              variant="secondary-destructive"
              icon={TrashIcon}
              disabled={typeof options?.min === "number" && items.length <= options.min}
              onClick={() => updateItems(removeStructureItem(items, index))}
            >
              {fieldMessage("remove", i18n)}
            </Button>
            {sortable ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  icon={ArrowUpIcon}
                  disabled={index === 0}
                  onClick={() => updateItems(moveStructureItem(items, index, index - 1))}
                >
                  {fieldMessage("up", i18n)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  icon={ArrowDownIcon}
                  disabled={index === items.length - 1}
                  onClick={() => updateItems(moveStructureItem(items, index, index + 1))}
                >
                  {fieldMessage("down", i18n)}
                </Button>
              </>
            ) : null}
          </div>
        </section>
      ))}
      <Button
        type="button"
        size="sm"
        className={fullWidthButtonClassName}
        icon={PlusIcon}
        disabled={typeof options?.max === "number" && items.length >= options.max}
        onClick={() => updateItems(addStructureItem(items))}
      >
        {formatFieldMessage("addItem", i18n, { item: itemLabel })}
      </Button>
      {options?.helpText ? (
        <small style={helpTextStyle}>{localizedString(options.helpText, i18n)}</small>
      ) : null}
    </div>
  );
}

/** @deprecated Use ObjectField. */
export const ObjectFormField = ObjectField;

/** @deprecated Use StructureField. */
export const ListField = StructureField;

export function LinkField({
  value,
  onChange,
  id = "fields-link",
  options,
}: FieldWidgetProps<LinkOptions>) {
  const i18n = useFieldI18n(options?.i18n);
  const data = normalizeLinkValue(value);

  function update(nextValue: Partial<LinkValue>) {
    onChange(updateLinkValue(data, nextValue));
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      <div style={fieldStyle}>
        <Select
          label={fieldMessage("type", i18n)}
          className="w-full"
          items={[
            { value: "url", label: fieldMessage("url", i18n) },
            { value: "email", label: fieldMessage("email", i18n) },
            { value: "tel", label: fieldMessage("telephone", i18n) },
            { value: "entry", label: fieldMessage("entry", i18n) },
            { value: "media", label: fieldMessage("media", i18n) },
          ]}
          value={data.type ?? "url"}
          onValueChange={(nextValue) => update({ type: String(nextValue) as LinkValue["type"] })}
        />
      </div>
      <div style={fieldStyle}>
        <label id={`${id}-value-label`} htmlFor={`${id}-value`} style={labelStyle}>
          {fieldMessage("value", i18n)}
        </label>
        <Input
          id={`${id}-value`}
          aria-labelledby={`${id}-value-label`}
          className="w-full"
          value={data.value ?? ""}
          onChange={(event) => update({ value: event.currentTarget.value })}
        />
      </div>
      <div style={fieldStyle}>
        <label id={`${id}-text-label`} htmlFor={`${id}-text`} style={labelStyle}>
          {fieldMessage("text", i18n)}
        </label>
        <Input
          id={`${id}-text`}
          aria-labelledby={`${id}-text-label`}
          className="w-full"
          value={data.text ?? ""}
          onChange={(event) => update({ text: event.currentTarget.value })}
        />
      </div>
      <label htmlFor={`${id}-target`} style={checkboxRowStyle}>
        <input
          id={`${id}-target`}
          type="checkbox"
          checked={data.target === "_blank"}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update({ target: event.currentTarget.checked ? "_blank" : "_self" })
          }
        />
        {fieldMessage("openInNewTab", i18n)}
      </label>
    </div>
  );
}

export function ChoicesField({
  value,
  onChange,
  label,
  id = "fields-choices",
  options,
}: FieldWidgetProps<ChoicesOptions>) {
  const i18n = useFieldI18n(options?.i18n);
  const choicesList = normalizeChoices(options?.choices ?? options?.options);
  const legend = label ?? fieldMessage("choices", i18n);
  const multiple = Boolean(options?.multiple);
  const horizontal = options?.orientation === "horizontal";
  const selected = new Set(normalizeChoiceSelection(value, multiple));

  if (!choicesList.length) {
    return <p>{fieldMessage("choicesRequiresChoices", i18n)}</p>;
  }

  if (horizontal) {
    return (
      <fieldset id={id} style={fieldsetStyle}>
        <legend style={legendStyle}>{legend}</legend>
        <div style={horizontalChoiceGridStyle(options?.columns, choicesList.length)}>
          {choicesList.map((choice, index) => {
            const checked = selected.has(choice.value);
            const inputId = choiceInputId(id, choice.value, index);

            return (
              <label
                key={choice.value}
                htmlFor={inputId}
                style={{
                  ...choiceCardStyle,
                  ...(checked ? selectedChoiceCardStyle : {}),
                }}
              >
                {renderChoiceCardLabel(choice, i18n)}
                <input
                  id={inputId}
                  type={multiple ? "checkbox" : "radio"}
                  checked={checked}
                  name={multiple ? `${id}-${choice.value}` : id}
                  value={choice.value}
                  style={choiceControlStyle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (multiple) {
                      onChange(
                        updateChoiceSelection(
                          value,
                          choice.value,
                          event.currentTarget.checked,
                          true,
                        ),
                      );
                      return;
                    }

                    if (event.currentTarget.checked) {
                      onChange(updateChoiceSelection(value, choice.value, true, false));
                    }
                  }}
                />
              </label>
            );
          })}
        </div>
        {options?.helpText ? (
          <small style={helpTextStyle}>{localizedString(options.helpText, i18n)}</small>
        ) : null}
      </fieldset>
    );
  }

  if (multiple) {
    return (
      <fieldset id={id} style={fieldsetStyle}>
        <legend style={legendStyle}>{legend}</legend>
        {choicesList.map((choice, index) => {
          const inputId = choiceInputId(id, choice.value, index);

          return (
            <label key={choice.value} htmlFor={inputId} style={checkboxChoiceRowStyle}>
              <input
                id={inputId}
                type="checkbox"
                checked={selected.has(choice.value)}
                value={choice.value}
                style={choiceControlStyle}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onChange(
                    updateChoiceSelection(value, choice.value, event.currentTarget.checked, true),
                  );
                }}
              />
              {choice.icon ? renderChoiceCardLabel(choice, i18n) : choiceLabel(choice, i18n)}
            </label>
          );
        })}
        {options?.helpText ? (
          <small style={helpTextStyle}>{localizedString(options.helpText, i18n)}</small>
        ) : null}
      </fieldset>
    );
  }

  return (
    <div id={id} tabIndex={-1}>
      <Radio.Group
        legend={legend}
        appearance="card"
        value={typeof value === "string" ? value : ""}
        onValueChange={(nextValue) =>
          onChange(updateChoiceSelection(value, String(nextValue), true, false))
        }
        description={localizedString(options?.helpText, i18n) || undefined}
      >
        {choicesList.map((choice) => {
          const hasIcon = Boolean(choice.icon);

          return (
            <Radio.Item
              key={choice.value}
              value={choice.value}
              label={hasIcon ? renderChoiceCardLabel(choice, i18n) : choiceLabel(choice, i18n)}
              description={
                hasIcon ? undefined : localizedString(choice.description, i18n) || undefined
              }
            />
          );
        })}
      </Radio.Group>
    </div>
  );
}

export const fields = {
  object: ObjectField,
  structure: StructureField,
  link: LinkField,
  choices: ChoicesField,
  "object-form": ObjectField,
  list: StructureField,
};
