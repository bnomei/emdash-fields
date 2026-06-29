import assert from "node:assert/strict";
import { test } from "node:test";
import { interpretNumericValue, numericChangeCommit, parseNumericInput } from "../dist/admin.mjs";

test("numeric input emits undefined for empty values", () => {
  assert.equal(parseNumericInput("", "number"), undefined);
  assert.equal(parseNumericInput("   ", "integer"), undefined);
});

test("numeric input emits undefined for invalid values instead of NaN", () => {
  assert.equal(parseNumericInput("not-a-number", "number"), undefined);
  assert.equal(parseNumericInput("123abc", "integer"), undefined);
  assert.equal(parseNumericInput("Infinity", "number"), undefined);
});

test("number input accepts integer, decimal, and boundary finite values", () => {
  assert.equal(parseNumericInput("42", "number"), 42);
  assert.equal(parseNumericInput("3.14", "number"), 3.14);
  assert.equal(
    parseNumericInput(String(Number.MAX_SAFE_INTEGER), "number"),
    Number.MAX_SAFE_INTEGER,
  );
  assert.equal(
    parseNumericInput(String(Number.MIN_SAFE_INTEGER), "number"),
    Number.MIN_SAFE_INTEGER,
  );
});

test("integer input accepts integers and rejects decimals", () => {
  assert.equal(parseNumericInput("42", "integer"), 42);
  assert.equal(parseNumericInput("-9007199254740991", "integer"), Number.MIN_SAFE_INTEGER);
  assert.equal(parseNumericInput("3.14", "integer"), undefined);
});

test("numeric interpretation coerces strings and rejects off-type values", () => {
  assert.equal(interpretNumericValue("42", "number"), 42);
  assert.equal(interpretNumericValue("42", "integer"), 42);
  assert.equal(interpretNumericValue("3.14", "number"), 3.14);
  assert.equal(interpretNumericValue(7, "integer"), 7);
  assert.equal(interpretNumericValue("3.14", "integer"), undefined);
  assert.equal(interpretNumericValue(3.14, "integer"), undefined);
  assert.equal(interpretNumericValue(Infinity, "number"), undefined);
  assert.equal(interpretNumericValue("abc", "number"), undefined);
  assert.equal(interpretNumericValue(["42"], "number"), undefined);
  assert.equal(interpretNumericValue(undefined, "number"), undefined);
});

test("numeric commit holds in-progress drafts instead of wiping the value", () => {
  assert.deepEqual(numericChangeCommit("", "number"), { type: "clear" });
  assert.deepEqual(numericChangeCommit("   ", "integer"), { type: "clear" });
  assert.deepEqual(numericChangeCommit("3.14", "number"), { type: "set", value: 3.14 });
  assert.deepEqual(numericChangeCommit("-5", "integer"), { type: "set", value: -5 });
  assert.deepEqual(numericChangeCommit("3.", "number"), { type: "set", value: 3 });
  assert.deepEqual(numericChangeCommit("-", "integer"), { type: "hold" });
  assert.deepEqual(numericChangeCommit("12.3", "integer"), { type: "hold" });
});
