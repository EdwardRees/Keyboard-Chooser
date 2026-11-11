# Keyboard Configurator: Design

Date: 2026-11-10
Status: Builder check done, awaiting owner approval

## Intent and why

The owner builds custom mechanical keyboards for other people. Today they
find out what a client wants by talking it through: size first (with
pictures and examples), then the feel they want (a "normal" keyboard like
they already use, something smoother, or something clicky and loud), then
board color, then keycaps. This app turns that conversation into a guided,
visual walk-through that the client clicks through, ending in a saved
summary the owner can build from.

Clients are usually not keyboard people. They do not know the words
"linear" or "tactile". The app has to let them describe what they want in
plain language and visuals, while the owner still gets precise
terminology in the output.

## Users

- **Client:** clicks through the wizard, often sitting with the owner.
  Non-technical. Needs plain-language descriptions and pictures.
- **Owner:** reads the finished summary and the exported JSON, and can
  re-import a JSON file to reopen a configuration.

## Goals

- A step-by-step wizard (owner chose this over a single scrolling page):
  one question per screen, large visual cards, Back/Next, a progress bar
  across the top, and a live keyboard preview that updates after every
  choice.
- A summary screen listing every choice, with a free-text notes box.
- Export the configuration as a JSON file, and import one to restore the
  wizard to exactly that state.
- Draw the keyboard layouts as simple key-grid diagrams (the project has
  none; the owner has no drawings and asked for them to be created).

## Non-goals

- No accounts, login, database, or server-side storage.
- No pricing engine or ordering/checkout. (Budget may appear as a plain
  choice, not a calculation.)
- No photorealistic keyboard rendering. Key-grid diagrams are enough.
- No emailing or sending from the app. The owner shares the JSON file.

## Anti-goals (failure even if it technically works)

- A client faces jargon with no explanation.
- Too many steps or options overwhelm a first-timer.
- An exported file that does not import back to the identical state.

## The wizard

Steps, in order. Items marked (guess) are the assistant's suggestions, not
the owner's words; the owner said they were "perfect" for the options.

1. **Layout:** 40%, 60%, 65%, 75%, 80%, 98%, TKL, 100%/Full. Each card has
   a key-grid drawing and a one-line description.
2. **Switch type:** linear, tactile, clicky, silent-linear, silent-tactile.
   Each has a plain-language description of how it feels and sounds
   (for example, linear: smooth with no bump; tactile: a bump you can feel
   on each press; clicky: a bump plus an audible click).
3. **Board color:** swatches. The preview recolors the case.
4. **Keycaps:** color and profile/material (guess).
5. **Extras (guess):** case material (plastic, aluminum), hot-swap
   sockets, wired or wireless, backlighting (none, white, RGB), a volume
   knob, budget range.
6. **Summary:** all choices on one screen, a free-text notes box, and the
   Export / Import buttons.

Some extras, such as hot-swap or case material, may be better as the
owner's decision than the client's. This is left to the builder to
present sensibly (for example, with a "not sure, owner decides" choice).

## Export and import

- Format: JSON, downloaded as a file.
- Includes a schema version number (assistant's call) so files still load
  after options are added later.
- Import restores the wizard to exactly the saved selections. Invalid or
  unrecognized files show a clear error and change nothing.
- Round trip must be exact: export, import, export again gives the same
  file.

## Constraints and how it gets made

The following are the assistant's calls; the owner has not weighed in:

- Built inside the existing project: SvelteKit 5 with TypeScript,
  Tailwind CSS 4, Vitest with Playwright browser testing. Package manager
  is bun. The project is a blank starter today (one placeholder page).
- State lives in the browser only. The JSON file is the saved record.
- Layout diagrams are generated from data (rows of keys with widths) and
  rendered as SVG or CSS, not hand-drawn image files.
- The wizard works on tablet and laptop screens; phone support is nice
  but not required (assistant's call).

## Calls made after the builder check (assistant's calls, owner to review)

1. **Extras and keycaps shape.** Keycaps is one screen with two groups
   (color, profile). Extras is one screen of small single-choice groups
   (case material, hot-swap, wired/wireless, backlighting, knob yes/no,
   budget range). Every choice is single-select. Every extras group has a
   "Not sure, you decide" option, which is the default. Summary
   highlights "you decide" items so the owner sees what to follow up on.
2. **Export format.** Includes a `version` field (starts at 1). No
   timestamps, stable key order, so export, import, export is
   byte-identical. Notes text is included and round-trips. Import rejects
   files that are malformed, missing fields, have unknown option values,
   or have an unrecognized or newer version, with a clear message and no
   change to the current state.
3. **After import.** The wizard lands on the summary screen. The file
   holds selections only, not the current step. Layout, switch type,
   board color, and keycap color require a choice before Next, so a
   completed configuration is always full. Export is available only on
   the summary screen. The progress bar lets the client jump back to
   earlier steps, not ahead of the furthest step reached.
4. **Preview.** Always visible beside the choices on tablet and laptop
   (stacked above on narrow screens). It shows layout, case color,
   keycap color, and a knob and a backlight glow when chosen. Switch
   type has no visual change; its card shows a short text description
   of feel and sound instead.
5. **Layout geometry.** ANSI only. Layouts should follow the real
   standard key arrangements closely enough to be recognizable (function
   row, arrow cluster, navigation cluster, numpad where present). ISO is
   out of scope.
6. **One flow.** There is no separate owner mode. The owner uses the
   same screens; the summary and JSON are their output.

## Left to the builder

- Visual styling, color palette, and typography.
- Exact wording of the switch and extras descriptions (should be plain
  language; owner can edit later).
- The list of board and keycap colors.
- Key-grid geometry for each layout, as long as sizes read as clearly
  different from each other.
- Component and file structure.
- How the progress bar and Back/Next behave on edge cases (for example,
  can a client skip ahead from the progress bar?).
