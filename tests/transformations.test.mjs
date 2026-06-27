import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addStructureItem,
  coerceBoolean,
  effectiveStructureBounds,
  isBooleanChecked,
  moveStructureItem,
  normalizeChoices,
  normalizeChoiceSelection,
  normalizeSingleChoice,
  normalizeLinkValue,
  normalizeObjectValue,
  normalizeObjectSubfieldValues,
  normalizeSelectSubfieldValue,
  normalizeStructureValue,
  normalizeStructureSubfieldValues,
  removeStructureItem,
  selectSubfieldValue,
  shouldNormalizeLinkValue,
  shouldNormalizeObjectSubfieldValues,
  shouldNormalizeStructureSubfieldValues,
  updateChoiceSelection,
  updateLinkValue,
  updateObjectValue,
  updateStructureItem,
} from "../dist/admin.mjs";

test("object values normalize invalid inputs to empty objects", () => {
  assert.deepEqual(normalizeObjectValue(undefined), {});
  assert.deepEqual(normalizeObjectValue(null), {});
  assert.deepEqual(normalizeObjectValue(["title"]), {});
  assert.deepEqual(normalizeObjectValue({ title: "Current" }), { title: "Current" });
});

test("object field updates preserve sibling values without mutating the source", () => {
  const source = { title: "Old", featured: true };

  const next = updateObjectValue(source, "title", "New");

  assert.deepEqual(next, { title: "New", featured: true });
  assert.deepEqual(source, { title: "Old", featured: true });
  assert.notEqual(next, source);
});

test("structure values normalize every row to an object", () => {
  assert.deepEqual(normalizeStructureValue(undefined), []);
  assert.deepEqual(
    normalizeStructureValue([{ label: "A" }, "bad", null, ["bad"], { label: "B" }]),
    [{ label: "A" }, {}, {}, {}, { label: "B" }],
  );
});

test("structure updates, adds, removes, and reorders rows immutably", () => {
  const source = [{ label: "A" }, { label: "B" }, { label: "C" }];

  assert.deepEqual(updateStructureItem(source, 1, { label: "Updated" }), [
    { label: "A" },
    { label: "Updated" },
    { label: "C" },
  ]);
  assert.deepEqual(addStructureItem(source), [{ label: "A" }, { label: "B" }, { label: "C" }, {}]);
  assert.deepEqual(removeStructureItem(source, 0), [{ label: "B" }, { label: "C" }]);
  assert.deepEqual(moveStructureItem(source, 2, 0), [
    { label: "C" },
    { label: "A" },
    { label: "B" },
  ]);
  assert.deepEqual(source, [{ label: "A" }, { label: "B" }, { label: "C" }]);
});

test("structure bounds clamp a contradictory min greater than max", () => {
  assert.deepEqual(effectiveStructureBounds(5, 2), { min: 2, max: 2 });
  assert.deepEqual(effectiveStructureBounds(1, 3), { min: 1, max: 3 });
  assert.deepEqual(effectiveStructureBounds(undefined, 3), { min: undefined, max: 3 });
  assert.deepEqual(effectiveStructureBounds(2, undefined), { min: 2, max: undefined });
  assert.deepEqual(effectiveStructureBounds(undefined, undefined), {
    min: undefined,
    max: undefined,
  });
});

test("structure transformations ignore out-of-range item indexes", () => {
  const source = [{ label: "A" }];

  assert.deepEqual(updateStructureItem(source, 4, { label: "B" }), [{ label: "A" }]);
  assert.deepEqual(moveStructureItem(source, 0, 4), [{ label: "A" }]);
});

test("link values normalize invalid inputs and merge partial updates", () => {
  assert.deepEqual(normalizeLinkValue(42), {});
  assert.deepEqual(normalizeLinkValue(["bad"]), {});
  assert.deepEqual(normalizeLinkValue(""), {});
  // a bare string root is preserved as the link's URL value
  assert.deepEqual(normalizeLinkValue("https://example.com"), { value: "https://example.com" });

  assert.deepEqual(
    updateLinkValue(
      { type: "email", value: "team@example.com", text: "Email us" },
      { target: "_blank" },
    ),
    { type: "email", value: "team@example.com", text: "Email us", target: "_blank" },
  );
  assert.deepEqual(updateLinkValue(null, { type: "url", value: "https://example.com" }), {
    type: "url",
    value: "https://example.com",
  });
});

test("link values drop type and target outside the documented unions", () => {
  assert.deepEqual(normalizeLinkValue({ type: "javascript", value: "https://x" }), {
    value: "https://x",
  });
  assert.deepEqual(normalizeLinkValue({ type: "url", value: "https://x", target: "_parent" }), {
    type: "url",
    value: "https://x",
  });
  assert.deepEqual(normalizeLinkValue({ type: "email", value: "a@b.c", target: "_blank" }), {
    type: "email",
    value: "a@b.c",
    target: "_blank",
  });
});

test("link values report when load-time normalization should be emitted", () => {
  assert.equal(
    shouldNormalizeLinkValue({ type: "javascript", value: "https://x" }),
    true,
  );
  assert.equal(shouldNormalizeLinkValue({ type: "url", value: "https://x" }), false);
  assert.equal(shouldNormalizeLinkValue("https://x"), true);
  assert.equal(shouldNormalizeLinkValue(""), false);
  assert.equal(shouldNormalizeLinkValue(42), false);
  assert.equal(shouldNormalizeLinkValue(["bad"]), false);
});

test("link field preserves a scalar URL root through the first edit", () => {
  const data = normalizeLinkValue("https://example.com");
  assert.deepEqual(updateLinkValue(data, { text: "Home" }), {
    value: "https://example.com",
    text: "Home",
  });
});

test("choices normalize string and object options", () => {
  assert.deepEqual(normalizeChoices(["alpha", { value: "beta", label: "Beta" }]), [
    { value: "alpha", label: "alpha" },
    { value: "beta", label: "Beta" },
  ]);
});

test("choices guarantee a string value for object choices", () => {
  // string-label fallback when value is missing
  assert.deepEqual(normalizeChoices([{ label: "Workers AI", icon: "AI" }]), [
    { value: "Workers AI", label: "Workers AI", icon: "AI" },
  ]);
  // malformed choice with no value and non-string label is dropped, valid kept
  assert.deepEqual(normalizeChoices([{ icon: "AI" }, { value: "ok", label: "Ok" }]), [
    { value: "ok", label: "Ok" },
  ]);
  // every returned choice has a string value
  for (const choice of normalizeChoices(["a", { label: "B" }, { value: "c" }])) {
    assert.equal(typeof choice.value, "string");
  }
});

test("choices drop later duplicate values so each card is independent", () => {
  assert.deepEqual(
    normalizeChoices([
      { value: "plan-a", label: "Plan A" },
      { value: "plan-a", label: "Plan B" },
      { value: "plan-b", label: "Plan B" },
    ]),
    [
      { value: "plan-a", label: "Plan A" },
      { value: "plan-b", label: "Plan B" },
    ],
  );
  assert.deepEqual(normalizeChoices(["x", "x", "y"]), [
    { value: "x", label: "x" },
    { value: "y", label: "y" },
  ]);
});

test("multiple choice selections preserve order while removing duplicates", () => {
  assert.deepEqual(normalizeChoiceSelection(["beta", "alpha", "beta", 42], true), [
    "beta",
    "alpha",
  ]);
  assert.deepEqual(updateChoiceSelection(["beta", "alpha"], "gamma", true, true), [
    "beta",
    "alpha",
    "gamma",
  ]);
  assert.deepEqual(updateChoiceSelection(["beta", "alpha", "gamma"], "alpha", false, true), [
    "beta",
    "gamma",
  ]);
  assert.deepEqual(updateChoiceSelection(["beta", "alpha"], "beta", true, true), ["beta", "alpha"]);
});

test("multiple choice mode preserves a scalar stored value on the first toggle", () => {
  assert.deepEqual(normalizeChoiceSelection("alpha", true), ["alpha"]);
  assert.deepEqual(updateChoiceSelection("alpha", "beta", true, true), ["alpha", "beta"]);
});

test("removing and re-adding a multiple choice moves it to the end", () => {
  const removed = updateChoiceSelection(["beta", "alpha"], "beta", false, true);

  assert.deepEqual(removed, ["alpha"]);
  assert.deepEqual(updateChoiceSelection(removed, "beta", true, true), ["alpha", "beta"]);
});

test("coerceBoolean parses quoted booleans for option flags", () => {
  assert.equal(coerceBoolean("false"), false);
  assert.equal(coerceBoolean("true"), true);
  assert.equal(coerceBoolean("0"), false);
  assert.equal(coerceBoolean("1"), true);
  assert.equal(coerceBoolean(true), true);
  assert.equal(coerceBoolean(false), false);
  assert.equal(coerceBoolean(undefined), false);
});

test("select subfield value stringifies numbers and blanks non-scalars", () => {
  assert.equal(selectSubfieldValue("Calm"), "Calm");
  assert.equal(selectSubfieldValue(1), "1");
  assert.equal(selectSubfieldValue(0), "0");
  assert.equal(selectSubfieldValue(undefined), "");
  assert.equal(selectSubfieldValue(null), "");
  assert.equal(selectSubfieldValue(["Calm"]), "");
  assert.equal(selectSubfieldValue({ value: "Calm" }), "");
});

test("select subfield values normalize against configured options", () => {
  assert.equal(normalizeSelectSubfieldValue("Calm", ["Calm", "Bold"]), "Calm");
  assert.equal(normalizeSelectSubfieldValue(1, ["1", "2"]), "1");
  assert.equal(normalizeSelectSubfieldValue(1, ["Calm", "Bold"]), "");
  assert.equal(normalizeSelectSubfieldValue(["Calm"], ["Calm"]), "");
});

test("object and structure subfield values normalize select fields on load", () => {
  const fields = [{ key: "tone", label: "Tone", type: "select", options: ["Calm", "Bold"] }];

  assert.deepEqual(normalizeObjectSubfieldValues({ tone: 1, title: "Intro" }, fields), {
    tone: "",
    title: "Intro",
  });
  assert.equal(shouldNormalizeObjectSubfieldValues({ tone: 1 }, fields), true);
  assert.equal(shouldNormalizeObjectSubfieldValues(["bad"], fields), false);

  assert.deepEqual(normalizeStructureSubfieldValues([{ tone: 1 }, "bad"], fields), [
    { tone: "" },
    "bad",
  ]);
  assert.equal(shouldNormalizeStructureSubfieldValues([{ tone: 1 }, "bad"], fields), true);
  assert.equal(shouldNormalizeStructureSubfieldValues(["bad"], fields), false);
});

test("object and structure subfield values normalize numeric fields on load", () => {
  const fields = [
    { key: "count", label: "Count", type: "number" },
    { key: "priority", label: "Priority", type: "integer" },
  ];

  assert.deepEqual(normalizeObjectSubfieldValues({ count: "42", priority: 3.14 }, fields), {
    count: 42,
    priority: undefined,
  });
  assert.equal(shouldNormalizeObjectSubfieldValues({ count: "42" }, fields), true);

  assert.deepEqual(normalizeStructureSubfieldValues([{ count: "42", priority: 3.14 }, "bad"], fields), [
    { count: 42, priority: undefined },
    "bad",
  ]);
  assert.equal(shouldNormalizeStructureSubfieldValues([{ count: "42" }, "bad"], fields), true);
});

test("boolean subfield checked state ignores truthy string false", () => {
  assert.equal(isBooleanChecked(true), true);
  assert.equal(isBooleanChecked("true"), true);
  assert.equal(isBooleanChecked("1"), true);
  assert.equal(isBooleanChecked(1), true);
  assert.equal(isBooleanChecked("false"), false);
  assert.equal(isBooleanChecked("0"), false);
  assert.equal(isBooleanChecked(""), false);
  assert.equal(isBooleanChecked(false), false);
  assert.equal(isBooleanChecked(null), false);
  assert.equal(isBooleanChecked(undefined), false);
});

test("single choice selections normalize to the selected string", () => {
  assert.deepEqual(normalizeChoiceSelection("alpha", false), ["alpha"]);
  assert.equal(updateChoiceSelection("alpha", "beta", true, false), "beta");
  assert.equal(updateChoiceSelection(undefined, "beta", false, false), "");
});

test("single choice mode coerces array stored values to their first string", () => {
  assert.deepEqual(normalizeChoiceSelection(["alpha"], false), ["alpha"]);
  assert.deepEqual(normalizeChoiceSelection(["alpha", "beta"], false), ["alpha"]);
  assert.deepEqual(normalizeChoiceSelection([42, "beta"], false), ["beta"]);
  assert.deepEqual(normalizeChoiceSelection([], false), []);
  assert.equal(normalizeSingleChoice(["alpha"]), "alpha");
  assert.equal(normalizeSingleChoice("alpha"), "alpha");
  assert.equal(normalizeSingleChoice(undefined), "");
  assert.equal(normalizeSingleChoice([]), "");
});
