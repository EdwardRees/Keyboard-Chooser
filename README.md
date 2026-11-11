# Keyboard Selector

A guided keyboard configurator for custom mechanical keyboard builds. A client clicks through the options one step at a time while a live key-grid preview updates. At the end you get a saved summary (a JSON file) that you can build from, and re-open later.

Built with SvelteKit (Svelte 5), TypeScript and Tailwind CSS 4.

## The client walk-through

1. **Layout:** 40%, 60%, 65%, 75%, 80%, 98%, TKL, 100%/Full, each drawn to scale.
2. **Switch type:** linear, tactile, clicky, silent-linear, silent-tactile, each described in plain language.
3. **Board color**
4. **Keycaps:** color and profile.
5. **Extras:** case material, hot-swap, wired/wireless, backlighting, volume knob, budget. Each defaults to "Not sure, you decide".
6. **Summary:** every choice on one screen, plus a notes box and **Download JSON**.

Required before moving on: layout, switch type, board color and keycap color. The progress bar lets a client jump back to earlier steps, never ahead of the furthest step reached.

Anything left as "Not sure, you decide" is marked "Owner decides" on the summary.

## Saving and reopening a configuration

- **Download JSON** (summary step) saves the selections as `keyboard-config.json`.
- **Import JSON** (available on every step) loads a saved file and jumps to the summary.
- Exporting, importing and exporting again produces an identical file. The file has no timestamps and a stable key order.
- A file that is malformed, has missing or extra fields, has an unknown option value, or has an unsupported version is rejected with a message, and nothing changes.
- Nothing is stored on a server or in the browser. Reloading the page starts over, so download the JSON to keep a configuration.

Example file:

```json
{
	"version": 1,
	"layout": "65",
	"switchType": "tactile",
	"caseColor": "black",
	"keycapColor": "white",
	"keycapProfile": "cherry",
	"caseMaterial": "aluminum",
	"hotSwap": "unsure",
	"connectivity": "wired",
	"backlighting": "rgb",
	"knob": "no",
	"budget": "100-200",
	"notes": "Likes it quiet"
}
```

## Developing

This project uses [bun](https://bun.sh).

```sh
bun install
bunx playwright install chromium   # one time, needed for the browser tests

bun run dev        # start the dev server
bun run test       # run all tests
bun run check      # type check
bun run lint       # check formatting (bun run format to fix)
bun run build      # production build
```

To deploy, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your host. The project currently uses `adapter-auto`.

## Project layout

| Path                              | What it holds                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `src/lib/config/options.ts`       | Every option (ids, labels, plain-language descriptions, colors) and the selection types |
| `src/lib/config/serialize.ts`     | JSON export and import (`exportConfig`, `parseConfig`)                                  |
| `src/lib/config/wizard.svelte.ts` | Wizard state: current step, selections, step rules                                      |
| `src/lib/layouts/layouts.ts`      | Key positions for each of the eight layouts                                             |
| `src/lib/components/`             | Preview, option cards, progress bar, import button                                      |
| `src/lib/components/steps/`       | One component per wizard step                                                           |
| `src/routes/+page.svelte`         | The wizard page that ties it together                                                   |
| `docs/superpowers/specs/`         | The design document                                                                     |
| `docs/superpowers/plans/`         | The implementation plan                                                                 |

### Changing the options

Add or edit options in `src/lib/config/options.ts`. If you change which values a field accepts, the JSON format changes too, so bump `CONFIG_VERSION` in `src/lib/config/serialize.ts`. Files with a different version are rejected on import.

Layouts are built from rows of key widths in `src/lib/layouts/layouts.ts`, in units of one standard key (1u). Layouts are ANSI only.
