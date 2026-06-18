export type LocalizedString = string | Record<string, string | undefined>;

export type FieldsMessageKey =
  | "addItem"
  | "choices"
  | "choicesRequiresChoices"
  | "down"
  | "email"
  | "entry"
  | "item"
  | "link"
  | "media"
  | "object"
  | "objectRequiresFields"
  | "openInNewTab"
  | "remove"
  | "select"
  | "structure"
  | "structureRequiresFields"
  | "telephone"
  | "text"
  | "type"
  | "up"
  | "url"
  | "value";

export type FieldsI18nMessages = Partial<
  Record<string, Partial<Record<FieldsMessageKey, string | undefined>>>
>;

export type FieldsI18nConfig = {
  locale?: string;
  defaultLocale?: string;
  locales?: string[];
  fallback?: Record<string, string>;
  messages?: FieldsI18nMessages;
};

export const DEFAULT_LOCALE = "en";

export const DEFAULT_FIELDS_I18N = {
  defaultLocale: DEFAULT_LOCALE,
  locales: [DEFAULT_LOCALE],
  messages: {
    en: {
      addItem: "Add {item}",
      choices: "Choices",
      choicesRequiresChoices: "Widget misconfigured: choices requires options.choices.",
      down: "Down",
      email: "Email",
      entry: "Entry",
      item: "Item",
      link: "Link",
      media: "Media",
      object: "Object",
      objectRequiresFields: "Widget misconfigured: object requires options.fields.",
      openInNewTab: "Open in new tab",
      remove: "Remove",
      select: "Select...",
      structure: "Structure",
      structureRequiresFields: "Widget misconfigured: structure requires options.fields.",
      telephone: "Telephone",
      text: "Text",
      type: "Type",
      up: "Up",
      url: "URL",
      value: "Value",
    },
  },
} satisfies {
  defaultLocale: string;
  locales: string[];
  messages: Record<typeof DEFAULT_LOCALE, Record<FieldsMessageKey, string>>;
};

export function normalizeLocale(locale: string | null | undefined): string {
  return (locale ?? DEFAULT_LOCALE).trim() || DEFAULT_LOCALE;
}

export function localeFallbacks(i18n: FieldsI18nConfig | string | null | undefined): string[] {
  const config = typeof i18n === "string" ? { locale: i18n } : (i18n ?? {});
  const defaultLocale = normalizeLocale(config.defaultLocale ?? DEFAULT_FIELDS_I18N.defaultLocale);
  const startLocale = normalizeLocale(config.locale ?? defaultLocale);
  const chain: string[] = [startLocale];
  const visited = new Set(chain);
  let current = startLocale;

  while (config.fallback?.[current]) {
    const next = config.fallback[current];
    if (!next || visited.has(next)) break;
    chain.push(next);
    visited.add(next);
    current = next;
  }

  if (!visited.has(defaultLocale)) {
    chain.push(defaultLocale);
  }

  return chain;
}

export function localizedString(
  value: LocalizedString | null | undefined,
  i18n: FieldsI18nConfig | string | null | undefined,
  fallback = "",
): string {
  if (typeof value === "string") return value;
  if (!value) return fallback;

  for (const candidate of localeFallbacks(i18n)) {
    const translated = value[candidate];
    if (typeof translated === "string" && translated.length > 0) return translated;
  }

  const source = value[DEFAULT_LOCALE];
  if (typeof source === "string" && source.length > 0) return source;

  const first = Object.values(value).find(
    (translated): translated is string => typeof translated === "string" && translated.length > 0,
  );
  return first ?? fallback;
}

export function formatLocalizedString(
  value: LocalizedString,
  i18n: FieldsI18nConfig | string | null | undefined,
  replacements: Record<string, string | number>,
): string {
  const template = localizedString(value, i18n);
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const replacement = replacements[key];
    return replacement === undefined ? match : String(replacement);
  });
}

export function fieldMessage(
  key: FieldsMessageKey,
  i18n: FieldsI18nConfig | string | null | undefined,
): string {
  const config = typeof i18n === "string" ? { locale: i18n } : (i18n ?? {});

  for (const locale of localeFallbacks(config)) {
    const override = config.messages?.[locale]?.[key];
    if (typeof override === "string" && override.length > 0) return override;

    const defaultMessage = DEFAULT_FIELDS_I18N.messages.en[key];
    if (locale === DEFAULT_LOCALE && defaultMessage) return defaultMessage;
  }

  const sourceOverride = config.messages?.[DEFAULT_LOCALE]?.[key];
  if (typeof sourceOverride === "string" && sourceOverride.length > 0) return sourceOverride;

  return DEFAULT_FIELDS_I18N.messages.en[key] ?? key;
}

export function formatFieldMessage(
  key: FieldsMessageKey,
  i18n: FieldsI18nConfig | string | null | undefined,
  replacements: Record<string, string | number>,
): string {
  return fieldMessage(key, i18n).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
    const replacement = replacements[name];
    return replacement === undefined ? match : String(replacement);
  });
}
