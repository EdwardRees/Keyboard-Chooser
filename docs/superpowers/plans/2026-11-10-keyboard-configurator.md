# Keyboard Configurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A step-by-step wizard where a client picks their custom keyboard options, sees a live key-grid preview, and exports/imports the result as JSON.

**Architecture:** Pure-data modules (option definitions, layout geometry, JSON serialize/parse) are built and tested first. A small rune-based `Wizard` class holds selections and step rules. Svelte components render the preview, cards, progress bar and each step; `+page.svelte` wires them together. All state is in the browser; the JSON file is the only saved record.

**Tech Stack:** SvelteKit 3 / Svelte 5 (runes forced on), TypeScript, Tailwind CSS 4, Vitest (`server` project for `*.spec.ts`, Playwright-browser `client` project for `*.svelte.spec.ts`), bun.

**Spec:** `docs/superpowers/specs/2026-11-10-keyboard-configurator-design.md`

## Global Constraints

- Project is **not a git repository**: no commit steps. Verify each task with the commands given.
- Import alias: `#lib` → `src/lib/index.js`, `#lib/*` → `src/lib/*` (use `#lib/...` imports).
- Runes mode only (`$state`, `$derived`, `$props`); no legacy `export let` or stores.
- Tests: `bun run test` (all), or `bunx vitest --run --project server <file>` / `--project client <file>`. Browser tests need `bunx playwright install chromium` once.
- Wizard steps in order: Layout, Switch type, Board color, Keycaps, Extras, Summary.
- Layout ids: `40`, `60`, `65`, `75`, `80`, `98`, `tkl`, `100`. Switch ids: `linear`, `tactile`, `clicky`, `silent-linear`, `silent-tactile`.
- No accounts, database, server storage, pricing, checkout, or emailing.
- ANSI layouts only. No ISO.
- JSON: `version` field starts at `1`; no timestamps; stable key order; byte-identical export → import → export.
- Required before Next: layout, switch type, board color, keycap color. Every other choice defaults to `"unsure"` ("Not sure, you decide").
- Progress bar may jump back to any visited step, never ahead of the furthest step reached.
- Import lands on the Summary step. Export exists only on Summary.
- Plain-language descriptions for every switch type and extra (clients don't know jargon).
- Preview always visible beside the choices on tablet/laptop; stacked above on narrow screens.

## Review Focus

1. Import of well-formed JSON with an unknown option value (e.g. `"layout": "42"`) → rejected with an error, current selections unchanged.
2. Import of non-JSON, empty file, `null`, an array, or JSON with an extra top-level key (including `__proto__`) → rejected, nothing changes.
3. Notes containing unicode, emoji, quotes, and newlines survive export → import → export byte-identically.
4. Importing while mid-wizard (e.g. on step 2) replaces all selections and lands on Summary; importing the same file twice is harmless.
5. Changing an earlier choice (e.g. layout) after later steps are filled keeps the later choices and the furthest step.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/config/options.ts` | Option ids, labels, plain-language descriptions, color hex values, `Selections` types |
| `src/lib/config/serialize.ts` | `exportConfig`, `parseConfig` |
| `src/lib/config/wizard.svelte.ts` | `Wizard` class: selections, step rules, import landing |
| `src/lib/layouts/layouts.ts` | Key geometry for the 8 layouts |
| `src/lib/components/KeyboardPreview.svelte` | SVG preview |
| `src/lib/components/OptionCard.svelte` | Selectable card |
| `src/lib/components/ProgressBar.svelte` | Step progress + jump-back |
| `src/lib/components/steps/*.svelte` | One component per step |
| `src/routes/+page.svelte` | Wizard shell wiring everything |
| Remove | `src/lib/vitest-examples/` (starter demo) once real tests exist |

---

### Task 1: Option definitions and types

**Files:**
- Create: `src/lib/config/options.ts`
- Test: `src/lib/config/options.spec.ts`

**Interfaces:**
- Produces:
  - `type LayoutId = '40'|'60'|'65'|'75'|'80'|'98'|'tkl'|'100'`
  - `type SwitchType = 'linear'|'tactile'|'clicky'|'silent-linear'|'silent-tactile'`
  - `type CaseColor = 'black'|'white'|'gray'|'navy'|'forest'|'pink'|'lavender'`
  - `type KeycapColor = 'white'|'black'|'gray'|'cream'|'navy'|'pink'`
  - `type KeycapProfile = 'cherry'|'oem'|'sa'|'low-profile'|'unsure'`
  - `type CaseMaterial = 'plastic'|'aluminum'|'unsure'`; `HotSwap = 'yes'|'no'|'unsure'`; `Connectivity = 'wired'|'wireless'|'unsure'`; `Backlighting = 'none'|'white'|'rgb'|'unsure'`; `Knob = 'yes'|'no'|'unsure'`; `Budget = 'under-100'|'100-200'|'200-350'|'350-plus'|'unsure'`
  - `interface Option<T extends string> { id: T; label: string; description: string; hex?: string }`
  - `interface CompleteSelections { layout: LayoutId; switchType: SwitchType; caseColor: CaseColor; keycapColor: KeycapColor; keycapProfile: KeycapProfile; caseMaterial: CaseMaterial; hotSwap: HotSwap; connectivity: Connectivity; backlighting: Backlighting; knob: Knob; budget: Budget; notes: string }`
  - `type Selections = Omit<CompleteSelections, 'layout'|'switchType'|'caseColor'|'keycapColor'> & { layout: LayoutId|null; switchType: SwitchType|null; caseColor: CaseColor|null; keycapColor: KeycapColor|null }`
  - `const OPTIONS: { layout: Option<LayoutId>[]; switchType: Option<SwitchType>[]; caseColor: ...; keycapColor: ...; keycapProfile: ...; caseMaterial: ...; hotSwap: ...; connectivity: ...; backlighting: ...; knob: ...; budget: ... }`
  - `const FIELD_ORDER: (keyof CompleteSelections)[]` — `['layout','switchType','caseColor','keycapColor','keycapProfile','caseMaterial','hotSwap','connectivity','backlighting','knob','budget','notes']` (the JSON key order after `version`)
  - `function emptySelections(): Selections` — required four `null`, all others `'unsure'`, `notes: ''`

- [ ] **Step 1: Write failing tests** in `options.spec.ts`:
  - `OPTIONS.layout.map(o => o.id)` equals `['40','60','65','75','80','98','tkl','100']`.
  - `OPTIONS.switchType.map(o => o.id)` equals the five switch ids in spec order.
  - Every option in every group has a non-empty `label` and `description`; every `caseColor` and `keycapColor` option has a `hex` matching `/^#[0-9a-f]{6}$/i`.
  - Every group except `layout, switchType, caseColor, keycapColor` includes an option with id `'unsure'`.
  - `emptySelections()` returns `layout: null`, `switchType: null`, `caseColor: null`, `keycapColor: null`, `hotSwap: 'unsure'`, `budget: 'unsure'`, `notes: ''`.
  - `FIELD_ORDER` has 12 entries and each is a key of `emptySelections()`.
- [ ] **Step 2: Run** `bunx vitest --run --project server src/lib/config/options.spec.ts` → FAIL (module not found).
- [ ] **Step 3: Implement** `options.ts` per the Interfaces above. Descriptions are plain language (e.g. linear: "Smooth and even, no bump. Quiet and fast."; tactile: "A small bump you can feel on every press."; clicky: "A bump plus a loud click you can hear."; silent-linear / silent-tactile: the same feels with dampened sound). Layout descriptions say what's included (e.g. 60%: "No arrows or function row"). "Not sure, you decide" is the label for every `'unsure'` option.
- [ ] **Step 4: Run** the same command → PASS.

---

### Task 2: JSON export and import

**Files:**
- Create: `src/lib/config/serialize.ts`
- Test: `src/lib/config/serialize.spec.ts`

**Interfaces:**
- Consumes: `CompleteSelections`, `OPTIONS`, `FIELD_ORDER` from Task 1.
- Produces:
  - `const CONFIG_VERSION = 1`
  - `function exportConfig(selections: CompleteSelections): string` — `JSON.stringify` of `{ version: 1, ...fields in FIELD_ORDER }` with 2-space indent and a trailing `"\n"`.
  - `type ParseResult = { ok: true; selections: CompleteSelections } | { ok: false; error: string }`
  - `function parseConfig(text: string): ParseResult`

- [ ] **Step 1: Write failing tests** in `serialize.spec.ts` using a `sample: CompleteSelections` (65 / tactile / black / white / cherry / aluminum / yes / wired / rgb / no / 100-200 / notes `'Likes it quiet'`):
  - `exportConfig(sample)` parses as JSON with first key `version === 1` and keys exactly `['version', ...FIELD_ORDER]`.
  - Round trip: `parseConfig(exportConfig(sample))` is `{ok: true, selections}` deep-equal to `sample`, and `exportConfig(selections) === exportConfig(sample)`.
  - Notes `'Café ☕ "quoted"\nline two 🎹'` round-trip byte-identically (Review Focus 3).
  - Rejections, each `ok: false` with a non-empty `error`: `''`, `'not json'`, `'null'`, `'[]'`, version `2` (error mentions "version"), version missing, a missing field, `layout: '42'` (error names `layout`), `notes: 5`, an extra top-level key `"extra": 1`, and text built with `'{"__proto__": {}, "version": 1}'` (Review Focus 1, 2).
- [ ] **Step 2: Run** `bunx vitest --run --project server src/lib/config/serialize.spec.ts` → FAIL.
- [ ] **Step 3: Implement** `serialize.ts`. `parseConfig` wraps `JSON.parse` in try/catch, requires a plain object, checks `Object.keys` equals exactly `version` + `FIELD_ORDER` (any other key → error), checks `version === CONFIG_VERSION`, checks each option field's value is one of `OPTIONS[field].map(o => o.id)`, and `notes` is a string. Build the result object field by field (never spread the parsed object).
- [ ] **Step 4: Run** the same command → PASS.

---

### Task 3: Wizard state

**Files:**
- Create: `src/lib/config/wizard.svelte.ts`
- Test: `src/lib/config/wizard.svelte.spec.ts` (client project, since it uses runes)

**Interfaces:**
- Consumes: `Selections`, `CompleteSelections`, `emptySelections` (Task 1).
- Produces:
  - `const STEPS = ['layout','switch','color','keycaps','extras','summary'] as const`
  - `class Wizard` with `$state` fields `selections: Selections`, `step: number` (index into STEPS, starts 0), `furthest: number` (starts 0), and:
    - `get canAdvance(): boolean` — current step's required choices are present (layout: `layout`; switch: `switchType`; color: `caseColor`; keycaps: `keycapColor`; extras: always true; summary: false)
    - `next(): void` — no-op unless `canAdvance`; advances `step`, raises `furthest` if needed
    - `back(): void` — no-op at step 0
    - `goTo(index: number): void` — no-op if `index > furthest` or out of range
    - `get complete(): CompleteSelections | null` — non-null only when all four required fields are set
    - `importConfig(c: CompleteSelections): void` — replaces `selections` (copy), sets `step = furthest = STEPS.length - 1`

- [ ] **Step 1: Write failing tests** in `wizard.svelte.spec.ts`:
  - New wizard: `step 0`, `canAdvance false`; after `selections.layout = '65'`, `canAdvance true`; `next()` → `step 1`.
  - `next()` with nothing chosen leaves `step 0`.
  - Fill required fields and `next()` to the extras step: `canAdvance` is true with no extras touched; `next()` reaches summary (`step 5`); `complete` is non-null.
  - `goTo(5)` from step 0 does nothing; after reaching step 3, `goTo(1)` works, `goTo(4)` does nothing, `furthest` stays 3 (Review Focus 5).
  - Changing `selections.layout` while on step 0 after furthest was 3 keeps `switchType` and `furthest`.
  - `importConfig(sample)` from step 1 → `step 5`, `furthest 5`, `selections` deep-equal to `sample`; calling it again changes nothing (Review Focus 4).
  - `complete` is `null` when `caseColor` is `null`.
- [ ] **Step 2: Run** `bunx vitest --run --project client src/lib/config/wizard.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** `wizard.svelte.ts` as a class with `$state` fields.
- [ ] **Step 4: Run** the same command → PASS.

---

### Task 4: Layout geometry

**Files:**
- Create: `src/lib/layouts/layouts.ts`
- Test: `src/lib/layouts/layouts.spec.ts`

**Interfaces:**
- Consumes: `LayoutId` (Task 1).
- Produces:
  - `interface Key { x: number; y: number; w: number; h: number }` — units of one standard key (1u); `x`/`y` are the top-left
  - `interface Layout { id: LayoutId; keys: Key[]; width: number; height: number }`
  - `function getLayout(id: LayoutId): Layout`

Plan's decisions on key counts (ANSI, with the conventional gaps/clusters): `60` → 61, `65` → 68, `75` → 82, `80` → 87 (TKL keys, no gaps between clusters), `tkl` → 87 (same keys with gaps between function row groups and clusters), `98` → 98, `100` → 104. `40` → 40–47 keys (builder's pick, a 4-row board with no number row).

- [ ] **Step 1: Write failing tests** in `layouts.spec.ts`:
  - Key counts equal the numbers above for 60/65/75/80/tkl/98/100; the 40 count is between 40 and 47.
  - For every layout: all keys are within `[0, width] × [0, height]`, `w > 0 && h > 0`, and no two keys overlap (allow 0.001 tolerance).
  - `getLayout('tkl').width > getLayout('80').width` (gaps) and `getLayout('100').width > getLayout('tkl').width`.
  - Total area ordering: widths/heights grow from 40 → 60 → 65 → 75 so sizes read as clearly different (`height` of `40` < `60` < `75`).
- [ ] **Step 2: Run** `bunx vitest --run --project server src/lib/layouts/layouts.spec.ts` → FAIL.
- [ ] **Step 3: Implement** `layouts.ts`. Build each layout from small row builders (rows as arrays of key widths, with gap markers) rather than listing coordinates by hand. Share rows between layouts (e.g. the 60% alphas are reused by 65/75/80/tkl/98/100).
- [ ] **Step 4: Run** the same command → PASS.

---

### Task 5: Keyboard preview component

**Files:**
- Create: `src/lib/components/KeyboardPreview.svelte`
- Test: `src/lib/components/KeyboardPreview.svelte.spec.ts`

**Interfaces:**
- Consumes: `getLayout` (Task 4), `OPTIONS` hex lookups (Task 1).
- Produces: `<KeyboardPreview layout caseColor keycapColor knob backlight />` with props `layout: LayoutId | null`, `caseColor: CaseColor | null`, `keycapColor: KeycapColor | null`, `knob: Knob`, `backlight: Backlighting`.

Behavior: when `layout` is null shows a placeholder message ("Pick a layout to see your keyboard"). Otherwise an SVG: a case rectangle in the case color (neutral gray if `caseColor` null), one `rect` per key with `data-testid="key"` in the keycap color (light neutral if null). `knob === 'yes'` adds an element with `data-testid="knob"`. `backlight` of `white` or `rgb` adds a glow element with `data-testid="backlight"` (`rgb` uses a multicolor gradient).

- [ ] **Step 1: Write failing tests**: with `layout='60'` there are 61 `key` elements; with `layout=null` the placeholder text shows and no keys; case rect `fill` equals the hex of `'navy'` when `caseColor='navy'`; `knob='yes'` shows `knob`, `'no'` and `'unsure'` do not; `backlight='rgb'` shows `backlight`, `'none'` and `'unsure'` do not.
- [ ] **Step 2: Run** `bunx vitest --run --project client src/lib/components/KeyboardPreview.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** the component; scale with `viewBox` from layout width/height so it fits any container.
- [ ] **Step 4: Run** → PASS.

---

### Task 6: Shared UI pieces (OptionCard, ProgressBar)

**Files:**
- Create: `src/lib/components/OptionCard.svelte`, `src/lib/components/ProgressBar.svelte`
- Test: `src/lib/components/OptionCard.svelte.spec.ts`, `src/lib/components/ProgressBar.svelte.spec.ts`

**Interfaces:**
- Produces:
  - `<OptionCard label description selected onselect swatch? >` — props `label: string`, `description?: string`, `selected: boolean`, `onselect: () => void`, `swatch?: string` (hex shown as a color chip), plus a `children` snippet for extra content (e.g. a layout drawing). Renders a `button` with `aria-pressed={selected}`.
  - `<ProgressBar steps current furthest ongoto>` — props `steps: readonly string[]` (display labels), `current: number`, `furthest: number`, `ongoto: (i: number) => void`. Each segment is a `button`; segments beyond `furthest` are `disabled`; the current one has `aria-current="step"`.

- [ ] **Step 1: Write failing tests**: OptionCard shows label and description, calls `onselect` on click, and has `aria-pressed="true"` only when `selected`. ProgressBar renders one button per step, buttons after `furthest` are disabled, clicking an enabled one calls `ongoto` with its index, clicking a disabled one does not.
- [ ] **Step 2: Run** `bunx vitest --run --project client src/lib/components/OptionCard.svelte.spec.ts src/lib/components/ProgressBar.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** both with Tailwind classes; large touch targets (client may use a tablet).
- [ ] **Step 4: Run** → PASS.

---

### Task 7: Choice steps (Layout, Switch, Board color, Keycaps)

**Files:**
- Create: `src/lib/components/steps/LayoutStep.svelte`, `SwitchStep.svelte`, `ColorStep.svelte`, `KeycapsStep.svelte`
- Test: `src/lib/components/steps/steps.svelte.spec.ts`

**Interfaces:**
- Consumes: `Wizard` (Task 3), `OPTIONS` (Task 1), `OptionCard` (Task 6), `getLayout` (Task 4).
- Produces: each step is `<XStep wizard={wizard} />` with prop `wizard: Wizard`, writing directly to `wizard.selections`.
  - `LayoutStep`: one card per layout, each with a small key-grid thumbnail (reuse the SVG rendering approach from the preview, or render `KeyboardPreview`-style rects) and the one-line description.
  - `SwitchStep`: five cards with label and plain-language description.
  - `ColorStep`: color cards with `swatch`.
  - `KeycapsStep`: two groups, "Keycap color" (swatch cards) and "Keycap profile" (cards incl. "Not sure, you decide"), each with a heading.

- [ ] **Step 1: Write failing tests** (one `describe` per step, rendering with a fresh `new Wizard()`): LayoutStep shows 8 cards, clicking the "65%" card sets `wizard.selections.layout === '65'`; SwitchStep shows 5 cards and clicking "Tactile" sets `switchType === 'tactile'`; ColorStep clicking a swatch card sets `caseColor`; KeycapsStep sets `keycapColor` and `keycapProfile` independently, and `keycapProfile` starts as `'unsure'`.
- [ ] **Step 2: Run** `bunx vitest --run --project client src/lib/components/steps/steps.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** the four components. Cards reflect `selected` from `wizard.selections`.
- [ ] **Step 4: Run** → PASS.

---

### Task 8: Extras and Summary steps (export/import UI)

**Files:**
- Create: `src/lib/components/steps/ExtrasStep.svelte`, `src/lib/components/steps/SummaryStep.svelte`
- Test: `src/lib/components/steps/summary.svelte.spec.ts`

**Interfaces:**
- Consumes: `Wizard`, `OPTIONS`, `exportConfig`, `parseConfig`, `OptionCard`.
- Produces:
  - `<ExtrasStep wizard />`: six single-choice groups (case material, hot-swap, wired/wireless, backlighting, knob, budget), each with a plain-language intro line and cards; "Not sure, you decide" is pre-selected.
  - `<SummaryStep wizard />`: a list of every choice (label of the chosen option); rows whose value is `'unsure'` get a visible "owner decides" marker; a notes `textarea` bound to `wizard.selections.notes`; a "Download JSON" button (builds a `Blob` from `exportConfig(wizard.complete)`, downloads as `keyboard-config.json`; disabled/hidden when `wizard.complete` is null); an "Import JSON" file input that reads the file text, calls `parseConfig`, then `wizard.importConfig` on success or shows the `error` in a `role="alert"` element and leaves the wizard untouched on failure.
  - Export the helper `function downloadText(filename: string, text: string): void` from `src/lib/download.ts` so tests can mock it.

- [ ] **Step 1: Write failing tests** in `summary.svelte.spec.ts`: ExtrasStep clicking "Aluminum" sets `caseMaterial === 'aluminum'`; SummaryStep with a complete wizard lists the chosen layout label and marks `unsure` rows; typing in notes updates `selections.notes`; clicking "Download JSON" calls `downloadText` (mocked via `vi.mock('#lib/download')`) with `'keyboard-config.json'` and text equal to `exportConfig(wizard.complete!)`; importing a valid file (simulate with `setInputFiles`) updates `wizard.selections` to match; importing a file with `"layout": "42"` shows an alert and leaves `wizard.selections` unchanged (Review Focus 1).
- [ ] **Step 2: Run** `bunx vitest --run --project client src/lib/components/steps/summary.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** both components and `download.ts`.
- [ ] **Step 4: Run** → PASS.

---

### Task 9: Page wiring and cleanup

**Files:**
- Modify: `src/routes/+page.svelte` (replace placeholder)
- Modify: `src/routes/+layout.svelte` only if a `<title>` is needed
- Delete: `src/lib/vitest-examples/`
- Test: `src/routes/page.svelte.spec.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: the finished wizard page. Layout: header with title "Build your keyboard", `ProgressBar` (labels: Layout, Switches, Board color, Keycaps, Extras, Summary), a two-column area (current step on one side, `KeyboardPreview` on the other, stacked on narrow screens), and Back / Next buttons (Next disabled when `!wizard.canAdvance`, hidden on Summary). Preview props come from `wizard.selections` (`knob` from `selections.knob`, `backlight` from `selections.backlighting`).

- [ ] **Step 1: Write failing tests** in `src/routes/page.svelte.spec.ts`: the page opens on the Layout step with Next disabled; choosing "65%" enables Next and the preview shows 68 keys; walking through the required choices reaches the Summary where "Download JSON" is available; progress-bar segments after the furthest step are disabled; going Back keeps earlier selections.
- [ ] **Step 2: Run** `bunx vitest --run --project client src/routes/page.svelte.spec.ts` → FAIL.
- [ ] **Step 3: Implement** `+page.svelte` creating `const wizard = new Wizard()` and rendering the step component for `STEPS[wizard.step]`. Delete `src/lib/vitest-examples/`.
- [ ] **Step 4: Verify everything**:
  - `bun run test` → all pass.
  - `bun run check` → 0 errors.
  - `bun run lint` → pass (run `bun run format` first if it fails).
  - `bun run build` → succeeds.
- [ ] **Step 5: Manual check** with `bun run dev`: click through all six steps at a laptop width and a narrow width; export a file; reload; import it; confirm you land on Summary with the same choices and that re-export produces an identical file (`diff` the two downloads).
