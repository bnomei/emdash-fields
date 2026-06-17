import { Button, Input, Radio, Select, Textarea } from "@cloudflare/kumo";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import type { CSSProperties, ChangeEvent } from "react";
import type {
  ChoicesOptions,
  FieldsChoice,
  FieldsSubField,
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

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asList(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map((item) => asRecord(item)) : [];
}

function choices(value?: FieldsChoice[] | string[]): FieldsChoice[] {
  return (value ?? []).map((choice) =>
    typeof choice === "string" ? { value: choice, label: choice } : choice,
  );
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

function choiceInputId(id: string, value: string) {
  return `${id}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
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

function renderChoiceCardLabel(choice: FieldsChoice) {
  return (
    <span style={choiceCardContentStyle}>
      {renderChoiceIcon(choice)}
      <span style={choiceCardTextStyle}>
        <span style={choiceCardLabelStyle}>{choice.label ?? choice.value}</span>
        {choice.description ? (
          <span style={choiceDescriptionStyle}>{choice.description}</span>
        ) : null}
      </span>
    </span>
  );
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
) {
  const id = `${idPrefix}-${field.key}`;
  const type = field.type ?? "text";
  const commonProps = {
    id,
    name: field.key,
    required: field.required,
    placeholder: field.placeholder,
    value: typeof value === "string" || typeof value === "number" ? value : "",
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(readInputValue(event, type)),
  };

  const selectChoices = choices(field.options);

  return (
    <div key={field.key} style={fieldStyle}>
      {type === "boolean" ? null : <span style={labelStyle}>{field.label}</span>}
      {type === "textarea" ? (
        <Textarea {...commonProps} aria-label={field.label} className="min-h-24 w-full" rows={4} />
      ) : type === "boolean" ? (
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            name={field.key}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.currentTarget.checked)
            }
          />
          {field.label}
        </label>
      ) : type === "select" ? (
        <Select
          aria-label={field.label}
          className="w-full"
          items={[
            { value: "", label: "Select..." },
            ...selectChoices.map((choice) => ({
              value: choice.value,
              label: choice.label ?? choice.value,
            })),
          ]}
          value={typeof value === "string" ? value : ""}
          onValueChange={(nextValue) => onChange(String(nextValue))}
        />
      ) : (
        <Input
          {...commonProps}
          aria-label={field.label}
          className="w-full"
          type={
            type === "number" || type === "integer" ? "number" : type === "url" ? "url" : "text"
          }
          step={type === "integer" ? 1 : undefined}
        />
      )}
      {field.suffix ? <small style={helpTextStyle}>{field.suffix}</small> : null}
    </div>
  );
}

function renderObjectFields(
  fields: FieldsSubField[],
  value: JsonRecord,
  onChange: (value: JsonRecord) => void,
  idPrefix: string,
) {
  return fields.map((field) =>
    renderSubField(
      field,
      value[field.key],
      (nextValue) => onChange({ ...value, [field.key]: nextValue }),
      idPrefix,
    ),
  );
}

function summary(template: string | undefined, item: JsonRecord, fallback: string) {
  if (!template) return fallback;
  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, key: string) => {
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
  const data = asRecord(value);
  const fields = options?.fields ?? [];

  if (!fields.length) {
    return <p>Widget misconfigured: object requires options.fields.</p>;
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      {renderObjectFields(fields, data, (nextValue) => onChange(nextValue), id)}
      {options?.helpText ? <small style={helpTextStyle}>{options.helpText}</small> : null}
    </div>
  );
}

export function StructureField({
  value,
  onChange,
  id = "fields-structure",
  options,
}: FieldWidgetProps<StructureOptions>) {
  const items = asList(value);
  const fields = options?.fields ?? [];
  const itemLabel = options?.itemLabel ?? "Item";
  const sortable = options?.sortable !== false;

  if (!fields.length) {
    return <p>Widget misconfigured: structure requires options.fields.</p>;
  }

  function updateItems(nextItems: JsonRecord[]) {
    onChange(nextItems);
  }

  function moveItem(fromIndex: number, toIndex: number) {
    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);
    if (!moved) return;
    nextItems.splice(toIndex, 0, moved);
    updateItems(nextItems);
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      {items.map((item, index) => (
        <section key={index} style={rowStyle}>
          <strong>{summary(options?.summary, item, `${itemLabel} ${index + 1}`)}</strong>
          {renderObjectFields(
            fields,
            item,
            (nextItem) => {
              const nextItems = [...items];
              nextItems[index] = nextItem;
              updateItems(nextItems);
            },
            `${id}-${index}`,
          )}
          <div style={buttonRowStyle}>
            <Button
              type="button"
              size="sm"
              variant="secondary-destructive"
              icon={TrashIcon}
              disabled={typeof options?.min === "number" && items.length <= options.min}
              onClick={() => updateItems(items.filter((_item, itemIndex) => itemIndex !== index))}
            >
              Remove
            </Button>
            {sortable ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  icon={ArrowUpIcon}
                  disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  icon={ArrowDownIcon}
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                >
                  Down
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
        onClick={() => updateItems([...items, {}])}
      >
        Add {itemLabel}
      </Button>
      {options?.helpText ? <small style={helpTextStyle}>{options.helpText}</small> : null}
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
}: FieldWidgetProps<Record<string, unknown>>) {
  const data = asRecord(value) as LinkValue;

  function update(nextValue: Partial<LinkValue>) {
    onChange({ ...data, ...nextValue });
  }

  return (
    <div id={id} tabIndex={-1} style={wrapperStyle}>
      <div style={fieldStyle}>
        <span style={labelStyle}>Type</span>
        <Select
          aria-label="Link type"
          className="w-full"
          items={[
            { value: "url", label: "URL" },
            { value: "email", label: "Email" },
            { value: "tel", label: "Telephone" },
            { value: "entry", label: "Entry" },
            { value: "media", label: "Media" },
          ]}
          value={data.type ?? "url"}
          onValueChange={(nextValue) => update({ type: String(nextValue) as LinkValue["type"] })}
        />
      </div>
      <div style={fieldStyle}>
        <span style={labelStyle}>Value</span>
        <Input
          id={`${id}-value`}
          aria-label="Link value"
          className="w-full"
          value={data.value ?? ""}
          onChange={(event) => update({ value: event.currentTarget.value })}
        />
      </div>
      <div style={fieldStyle}>
        <span style={labelStyle}>Text</span>
        <Input
          id={`${id}-text`}
          aria-label="Link text"
          className="w-full"
          value={data.text ?? ""}
          onChange={(event) => update({ text: event.currentTarget.value })}
        />
      </div>
      <label style={checkboxRowStyle}>
        <input
          type="checkbox"
          checked={data.target === "_blank"}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update({ target: event.currentTarget.checked ? "_blank" : "_self" })
          }
        />
        Open in new tab
      </label>
    </div>
  );
}

export function ChoicesField({
  value,
  onChange,
  id = "fields-choices",
  options,
}: FieldWidgetProps<ChoicesOptions>) {
  const choicesList = choices(options?.choices ?? options?.options);
  const multiple = Boolean(options?.multiple);
  const horizontal = options?.orientation === "horizontal";
  const selected = multiple
    ? new Set(
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : [],
      )
    : new Set(typeof value === "string" ? [value] : []);

  if (!choicesList.length) {
    return <p>Widget misconfigured: choices requires options.choices.</p>;
  }

  if (horizontal) {
    return (
      <fieldset id={id} style={fieldsetStyle}>
        <legend style={legendStyle}>Choices</legend>
        <div style={horizontalChoiceGridStyle(options?.columns, choicesList.length)}>
          {choicesList.map((choice) => {
            const checked = selected.has(choice.value);
            const inputId = choiceInputId(id, choice.value);

            return (
              <label
                key={choice.value}
                htmlFor={inputId}
                style={{
                  ...choiceCardStyle,
                  ...(checked ? selectedChoiceCardStyle : {}),
                }}
              >
                {renderChoiceCardLabel(choice)}
                <input
                  id={inputId}
                  type={multiple ? "checkbox" : "radio"}
                  checked={checked}
                  name={multiple ? `${id}-${choice.value}` : id}
                  value={choice.value}
                  style={choiceControlStyle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (multiple) {
                      const nextSelected = new Set(selected);
                      if (event.currentTarget.checked) {
                        nextSelected.add(choice.value);
                      } else {
                        nextSelected.delete(choice.value);
                      }
                      onChange([...nextSelected]);
                      return;
                    }

                    if (event.currentTarget.checked) {
                      onChange(choice.value);
                    }
                  }}
                />
              </label>
            );
          })}
        </div>
        {options?.helpText ? <small style={helpTextStyle}>{options.helpText}</small> : null}
      </fieldset>
    );
  }

  if (multiple) {
    return (
      <div id={id} tabIndex={-1} style={fieldStyle}>
        <span style={labelStyle}>Choices</span>
        {choicesList.map((choice) => (
          <label key={choice.value} style={checkboxChoiceRowStyle}>
            <input
              type="checkbox"
              checked={selected.has(choice.value)}
              value={choice.value}
              style={choiceControlStyle}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const nextSelected = new Set(selected);
                if (event.currentTarget.checked) {
                  nextSelected.add(choice.value);
                } else {
                  nextSelected.delete(choice.value);
                }
                onChange([...nextSelected]);
              }}
            />
            {choice.icon ? renderChoiceCardLabel(choice) : (choice.label ?? choice.value)}
          </label>
        ))}
        {options?.helpText ? <small style={helpTextStyle}>{options.helpText}</small> : null}
      </div>
    );
  }

  return (
    <div id={id} tabIndex={-1}>
      <Radio.Group
        legend="Choices"
        appearance="card"
        value={typeof value === "string" ? value : ""}
        onValueChange={(nextValue) => onChange(nextValue)}
        description={options?.helpText}
      >
        {choicesList.map((choice) => {
          const hasIcon = Boolean(choice.icon);

          return (
            <Radio.Item
              key={choice.value}
              value={choice.value}
              label={hasIcon ? renderChoiceCardLabel(choice) : (choice.label ?? choice.value)}
              description={hasIcon ? undefined : choice.description}
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
