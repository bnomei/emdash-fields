import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const source = await readFile(new URL("../src/admin.tsx", import.meta.url), "utf8");

test("text-like subfields render visible labels connected to inputs", () => {
  assert.match(source, /<label htmlFor=\{id\} style=\{labelStyle\}>/);
  assert.match(source, /<Textarea \{\.\.\.commonProps\}/);
  assert.match(source, /<Input\s+\{\.\.\.commonProps\}/);
});

test("link inputs and checkboxes use explicit label associations", () => {
  assert.match(source, /<label htmlFor=\{`\$\{id\}-value`\} style=\{labelStyle\}>/);
  assert.match(source, /<label htmlFor=\{`\$\{id\}-text`\} style=\{labelStyle\}>/);
  assert.match(source, /<label htmlFor=\{`\$\{id\}-target`\} style=\{checkboxRowStyle\}>/);
});

test("choice collections expose semantic groups and labelled controls", () => {
  assert.match(source, /<fieldset id=\{id\} style=\{fieldsetStyle\}>/);
  assert.match(source, /<legend style=\{legendStyle\}>\{legend\}<\/legend>/);
  assert.match(source, /htmlFor=\{inputId\}/);
  assert.match(source, /id=\{inputId\}/);
});
