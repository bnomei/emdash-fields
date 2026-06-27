import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addStructureItem,
  moveStructureItem,
  normalizeChoices,
  normalizeChoiceSelection,
  normalizeLinkValue,
  normalizeObjectValue,
  normalizeStructureValue,
  removeStructureItem,
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

test("structure transformations ignore out-of-range item indexes", () => {
  const source = [{ label: "A" }];

  assert.deepEqual(updateStructureItem(source, 4, { label: "B" }), [{ label: "A" }]);
  assert.deepEqual(moveStructureItem(source, 0, 4), [{ label: "A" }]);
});

test("link values normalize invalid inputs and merge partial updates", () => {
  assert.deepEqual(normalizeLinkValue("bad"), {});

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

test("choices normalize string and object options", () => {
  assert.deepEqual(normalizeChoices(["alpha", { value: "beta", label: "Beta" }]), [
    { value: "alpha", label: "alpha" },
    { value: "beta", label: "Beta" },
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

test("single choice selections normalize to the selected string", () => {
  assert.deepEqual(normalizeChoiceSelection("alpha", false), ["alpha"]);
  assert.equal(updateChoiceSelection("alpha", "beta", true, false), "beta");
  assert.equal(updateChoiceSelection(undefined, "beta", false, false), "");
});
