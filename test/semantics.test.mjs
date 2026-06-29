import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChoicesField, LinkField, ObjectField } from "../dist/admin.mjs";

function renderWithoutWarnings(element) {
  const warnings = [];
  const warn = console.warn;
  console.warn = (...args) => warnings.push(args.join(" "));
  try {
    return { html: renderToStaticMarkup(element), warnings };
  } finally {
    console.warn = warn;
  }
}

test("text-like subfields render connected labels without Kumo warnings", () => {
  const { html, warnings } = renderWithoutWarnings(
    React.createElement(ObjectField, {
      value: {},
      onChange() {},
      options: {
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "summary", label: "Summary", type: "textarea" },
          { key: "count", label: "Count", type: "number" },
        ],
      },
    }),
  );

  assert.equal(warnings.length, 0);
  assert.match(html, /<label id="fields-object-title-label" for="fields-object-title"/);
  assert.match(html, /aria-labelledby="fields-object-title-label"/);
  assert.match(html, /<label id="fields-object-summary-label" for="fields-object-summary"/);
  assert.match(html, /aria-labelledby="fields-object-summary-label"/);
  assert.match(html, /<label id="fields-object-count-label" for="fields-object-count"/);
  assert.match(html, /aria-labelledby="fields-object-count-label"/);
});

test("number subfield displays a quoted numeric string value", () => {
  const { html } = renderWithoutWarnings(
    React.createElement(ObjectField, {
      value: { count: "42" },
      onChange() {},
      options: {
        fields: [{ key: "count", label: "Count", type: "number" }],
      },
    }),
  );

  assert.match(html, /value="42"/);
});

test("link inputs render connected labels without Kumo warnings", () => {
  const { html, warnings } = renderWithoutWarnings(
    React.createElement(LinkField, {
      value: {},
      onChange() {},
    }),
  );

  assert.equal(warnings.length, 0);
  assert.match(html, /<label id="fields-link-value-label" for="fields-link-value"/);
  assert.match(html, /aria-labelledby="fields-link-value-label"/);
  assert.match(html, /<label id="fields-link-text-label" for="fields-link-text"/);
  assert.match(html, /aria-labelledby="fields-link-text-label"/);
  assert.match(html, /<label for="fields-link-target"/);
  assert.match(html, /id="fields-link-target"/);
});

test("empty choices array falls back to the options alias", () => {
  const { html } = renderWithoutWarnings(
    React.createElement(ChoicesField, {
      value: null,
      onChange() {},
      id: "choices",
      options: {
        choices: [],
        options: ["alpha", "beta"],
      },
    }),
  );

  assert.doesNotMatch(html, /misconfigured/i);
  assert.match(html, /alpha/);
  assert.match(html, /beta/);
});

test("choice collections expose semantic groups and unique labelled controls", () => {
  const { html } = renderWithoutWarnings(
    React.createElement(ChoicesField, {
      value: [],
      onChange() {},
      id: "choices",
      options: {
        multiple: true,
        choices: [
          { value: "a/b", label: "Slash" },
          { value: "a-b", label: "Dash" },
        ],
      },
    }),
  );

  assert.match(html, /<fieldset id="choices"/);
  assert.match(html, /<legend[^>]*>Choices<\/legend>/);
  assert.match(html, /<label for="choices-0-a-b"/);
  assert.match(html, /id="choices-0-a-b"/);
  assert.match(html, /<label for="choices-1-a-b"/);
  assert.match(html, /id="choices-1-a-b"/);
  const inputIds = [...html.matchAll(/<input[^>]+id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(inputIds, ["choices-0-a-b", "choices-1-a-b"]);
  assert.equal(new Set(inputIds).size, inputIds.length);
});
