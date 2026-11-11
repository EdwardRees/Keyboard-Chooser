# Keyboard Selector

A guided keyboard configurator for custom mechanical keyboard builds. A client clicks through the options one step at a time while a live key-grid preview updates. At the end you get a saved summary (a JSON file) that you can build from, and re-open later.

Built with SvelteKit (Svelte 5), TypeScript and Tailwind CSS 4.

## The client walk-through

1. **Layout:** 40%, 60%, 65%, 75%, 80%, 98%, TKL, 100%/Full, each drawn to scale.
2. **Switch type:** linear, tactile, clicky, silent-linear, silent-tactile, each described in plain language.
3. **Board color**
4. **Keycaps:** color and profile, plus two optional boxes: a link to a keycap set the client likes, and a description of the look they want ("cute", "cool"). These don't change the preview. They just tell you what the client is after.
5. **Extras:** case material, hot-swap, wired/wireless, backlighting, volume knob, budget. Each defaults to "Not sure, you decide".
6. **Summary:** every choice on one screen, plus a notes box and **Download JSON**.

Required before moving on: layout, switch type, board color and keycap color. The progress bar lets a client jump back to earlier steps, never ahead of the furthest step reached.

Anything left as "Not sure, you decide" is marked "Owner decides" on the summary.

## Saving and reopening a configuration

- **Download JSON** (summary step) saves the selections as `keyboard-config.json`.
- **Import JSON** (available on every step) loads a saved file and jumps to the summary.
- The keycap link must be a full `http://` or `https://` address. Anything else is refused, and the app never opens or fetches the link. On the summary it shows as a link that opens in a new tab.
- Files saved by the first version of the app (version 1) still import, with the link and description left blank. Files are always saved as version 2.
- Exporting, importing and exporting again produces an identical file. The file has no timestamps and a stable key order.
- A file that is malformed, has missing or extra fields, has an unknown option value, or has an unsupported version is rejected with a message, and nothing changes.
- Nothing is stored on a server or in the browser. Reloading the page starts over, so download the JSON to keep a configuration.

Example file:

```json
{
	"version": 2,
	"layout": "65",
	"switchType": "tactile",
	"caseColor": "black",
	"keycapColor": "white",
	"keycapProfile": "cherry",
	"keycapLink": "https://example.com/keycaps/set",
	"keycapLook": "cute pastel",
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
| `src/lib/config/link.ts`          | Checks that a keycap link is a safe `http(s)` web address                               |
| `src/lib/config/serialize.ts`     | JSON export and import (`exportConfig`, `parseConfig`)                                  |
| `src/lib/config/wizard.svelte.ts` | Wizard state: current step, selections, step rules                                      |
| `src/lib/layouts/layouts.ts`      | Key positions for each of the eight layouts                                             |
| `src/lib/components/`             | Preview, option cards, progress bar, import button                                      |
| `src/lib/components/steps/`       | One component per wizard step                                                           |
| `src/routes/+page.svelte`         | The wizard page that ties it together                                                   |
| `docs/superpowers/specs/`         | The design document                                                                     |
| `docs/superpowers/plans/`         | The implementation plan                                                                 |

### Changing the options

Add or edit options in `src/lib/config/options.ts`. If you change which values a field accepts, the JSON format changes too, so bump `CONFIG_VERSION` in `src/lib/config/serialize.ts`. Files with an unsupported version are rejected on import. To keep older files working, teach `parseConfig` to read the old version, the way it does for version 1.

Layouts are built from rows of key widths in `src/lib/layouts/layouts.ts`, in units of one standard key (1u). Layouts are ANSI only.
