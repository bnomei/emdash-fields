DEVANA-FINDING: v1
DEVANA-STATE: fixed | P2 | medium | security=no
DEVANA-KEY: src/admin.tsx:234 | link-alien-fields-persist

# Link field preserves invalid type and target values

## Finding

`normalizeLinkValue` and `updateLinkValue` pass through any string `type` and `target` without validating against the `LinkValue` union. The UI can show defaults that do not match persisted JSON, and saves without touching those controls leave alien values in stored data.

## Violated Invariant Or Contract

`LinkValue.type` is `"url" | "email" | "tel" | "entry" | "media"` and `LinkValue.target` is `"_blank" | "_self"` (`src/types.ts`). Helpers and the widget should normalize or surface invalid enum members.

## Oracle

`LinkValue` type definitions in `src/types.ts`. `LinkField` type select uses `value={data.type ?? "url"}` (616) with a fixed item list. Target checkbox uses `checked={data.target === "_blank"}` (648) and only writes `"_blank"` or `"_self"` on toggle.

## Counterexample

**Invalid type:** Load `{ type: "javascript", value: "https://example.com" }`. Select shows `"javascript"` with no matching item. User edits value text and saves; `type: "javascript"` persists.

**Invalid target:** Load `{ type: "url", value: "https://x.test", target: "_parent" }`. Checkbox is unchecked (`!== "_blank"`). User saves without toggling; `target: "_parent"` persists.

## Why It Might Matter

Imported JSON with out-of-union `type` or `target` values survives round-trips through the admin UI. Frontend link renderers expecting the documented unions may mis-handle `_parent` or unknown types.

## Proof

Read-path pass-through: `normalizeLinkValue` is `normalizeObjectValue(value) as LinkValue` with no enum check (234–236). Write-path shallow merge in `updateLinkValue` (238–240). UI controls do not normalize alien values on mount or on unrelated edits.

## Counterevidence Checked

`tests/transformations.test.mjs` tests invalid roots and valid merges only. `onValueChange` cast `as LinkValue["type"]` (617) adds no runtime guard. Normal UI interaction through the fixed select only produces valid types.

## Suggested Next Step

Validate and coerce `type`/`target` in `normalizeLinkValue`, or normalize on mount when values fall outside the union.

## Agent Handoff

After working this report, preserve the original finding body. Update line 2 `DEVANA-STATE: ...` and the final `DEVANA-SUMMARY:` status/priority/confidence prefix. Use one of: `open`, `fixed`, `invalid`, `stale`, `duplicate`, `wontfix`. Keep `DEVANA-KEY:` stable unless the same finding moved. Add dated notes below with evidence checked.

## Status Notes

- 2026-06-27: open by Devana. Initial report written from static source inspection.
- 2026-06-27: fixed. `normalizeLinkValue` now validates `type` against `["url","email","tel","entry","media"]` and `target` against `["_blank","_self"]`, deleting any value outside the union. This stops stored JSON from diverging from the controls: an alien `type` (e.g. `"javascript"`) is dropped so the select shows its `"url"` default, and an alien `target` (e.g. `"_parent"`) is dropped so the unchecked checkbox matches storage; both clear on the next save. `value`/`text` and any unknown extra keys are preserved (spread, then targeted deletes). Since `LinkField` reads through `normalizeLinkValue` and `updateLinkValue` merges onto that normalized base, the write path is clean too. Added a regression test; typecheck clean; full suite (30 tests) passes. See [[link-invalid-root-lost]].

DEVANA-KEY: src/admin.tsx:234 | link-alien-fields-persist
DEVANA-SUMMARY: fixed | P2 | medium | Invalid link `type` and `target` strings pass through normalization and survive save without user correction.