import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LinkField, ObjectField } from "../dist/admin.mjs";
import {
  fieldMessage,
  formatFieldMessage,
  localeFallbacks,
  localizedString,
} from "../dist/index.mjs";

test("field messages follow the EmDash-style fallback chain", () => {
  const i18n = {
    locale: "fr-CA",
    defaultLocale: "en",
    locales: ["en", "fr", "fr-CA"],
    fallback: { "fr-CA": "fr", fr: "en" },
    messages: {
      fr: { remove: "Supprimer" },
      en: { addItem: "Append {item}" },
    },
  };

  assert.deepEqual(localeFallbacks(i18n), ["fr-CA", "fr", "en"]);
  assert.equal(fieldMessage("remove", i18n), "Supprimer");
  assert.equal(formatFieldMessage("addItem", i18n, { item: "row" }), "Append row");
});

test("field messages keep an English source override as the final fallback", () => {
  const i18n = {
    locale: "it",
    defaultLocale: "fr",
    locales: ["fr", "it"],
    messages: {
      en: { remove: "Delete" },
    },
  };

  assert.deepEqual(localeFallbacks(i18n), ["it", "fr"]);
  assert.equal(fieldMessage("remove", i18n), "Delete");
  assert.equal(localizedString({ en: "Title", fr: "" }, i18n), "Title");
});

test("localized schema strings resolve with the same fallback chain", () => {
  const i18n = {
    locale: "fr-CA",
    defaultLocale: "en",
    locales: ["en", "fr", "fr-CA"],
    fallback: { "fr-CA": "fr", fr: "en" },
  };

  assert.equal(localizedString({ en: "Title", fr: "Titre" }, i18n), "Titre");
  assert.equal(localizedString({ en: "Title" }, i18n), "Title");
});

test("object field renders localized authored labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(ObjectField, {
      value: {},
      onChange() {},
      options: {
        fields: [
          {
            key: "title",
            label: { en: "Title", de: "Titel" },
            placeholder: { en: "Enter title", de: "Titel eingeben" },
            suffix: { en: "Shown publicly", de: "Wird oeffentlich angezeigt" },
          },
        ],
        helpText: { en: "Object help", de: "Objekt-Hilfe" },
        i18n: {
          locale: "de",
          defaultLocale: "en",
          locales: ["en", "de"],
          fallback: { de: "en" },
        },
      },
    }),
  );

  assert.match(html, />Titel</);
  assert.match(html, /placeholder="Titel eingeben"/);
  assert.match(html, />Wird oeffentlich angezeigt</);
  assert.match(html, />Objekt-Hilfe</);
});

test("link field renders localized plugin messages from i18n overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(LinkField, {
      value: {},
      onChange() {},
      options: {
        i18n: {
          locale: "de",
          defaultLocale: "en",
          locales: ["en", "de"],
          fallback: { de: "en" },
          messages: {
            de: {
              type: "Art",
              value: "Wert",
              text: "Text",
              openInNewTab: "In neuem Tab oeffnen",
            },
          },
        },
      },
    }),
  );

  assert.match(html, /Art/);
  assert.match(html, />Wert</);
  assert.match(html, />Text</);
  assert.match(html, />In neuem Tab oeffnen</);
});
