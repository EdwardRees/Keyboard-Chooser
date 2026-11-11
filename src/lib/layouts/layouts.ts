import type { LayoutId } from '../config/options';

/** Positions and sizes are in units of one standard key (1u). x/y is the top-left corner. */
export interface Key {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Layout {
	id: LayoutId;
	keys: Key[];
	width: number;
	height: number;
}

type Item = number | { gap: number };

const gap = (n: number): Item => ({ gap: n });
const ones = (n: number): number[] => Array.from({ length: n }, () => 1);

/** Lay out a row of keys left to right; numbers are key widths, `gap()` adds empty space. */
function row(y: number, items: Item[], x0 = 0, h = 1): Key[] {
	const keys: Key[] = [];
	let x = x0;
	for (const item of items) {
		if (typeof item === 'number') {
			keys.push({ x, y, w: item, h });
			x += item;
		} else {
			x += item.gap;
		}
	}
	return keys;
}

// The five rows of a standard ANSI main block, each 15u wide (61 keys in total).
const NUMBER_ROW = [...ones(13), 2];
const TOP_ROW = [1.5, ...ones(12), 1.5];
const HOME_ROW = [1.75, ...ones(11), 2.25];
const SHIFT_ROW = [2.25, ...ones(10), 2.75];
const BOTTOM_ROW = [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25];

/** A function row of Esc plus F1-F12 stretched across `span` units after Esc. */
function stretchedFunctionRow(y: number, span: number): Key[] {
	return [
		...row(y, [1]),
		...row(
			y,
			Array.from({ length: 12 }, () => span / 12),
			1
		)
	];
}

/** The 17-key numpad. `y` is the row of the NumLock key. */
function numpad(x: number, y: number): Key[] {
	return [
		...row(y, [1, 1, 1, 1], x),
		...row(y + 1, [1, 1, 1], x),
		{ x: x + 3, y: y + 1, w: 1, h: 2 }, // +
		...row(y + 2, [1, 1, 1], x),
		...row(y + 3, [1, 1, 1], x),
		{ x: x + 3, y: y + 3, w: 1, h: 2 }, // Enter
		...row(y + 4, [2, 1], x)
	];
}

/** Everything except the function row: main block plus the 65%-style right column and arrows. */
function sixtyFiveRows(y0: number): Key[] {
	return [
		...row(y0, [...NUMBER_ROW, 1]),
		...row(y0 + 1, [...TOP_ROW, 1]),
		...row(y0 + 2, [...HOME_ROW, 1]),
		...row(y0 + 3, [2.25, ...ones(10), 1.75, 1, 1]),
		...row(y0 + 4, [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1])
	];
}

/**
 * Main block plus the navigation cluster and arrows of a tenkeyless board.
 * `navX` is where the three-column cluster starts, `y0` the first main row.
 */
function tenkeylessBody(navX: number, y0: number): Key[] {
	return [
		...row(y0, NUMBER_ROW),
		...row(y0, [1, 1, 1], navX),
		...row(y0 + 1, TOP_ROW),
		...row(y0 + 1, [1, 1, 1], navX),
		...row(y0 + 2, HOME_ROW),
		...row(y0 + 3, SHIFT_ROW),
		...row(y0 + 3, [1], navX + 1),
		...row(y0 + 4, BOTTOM_ROW),
		...row(y0 + 4, [1, 1, 1], navX)
	];
}

function finish(id: LayoutId, keys: Key[]): Layout {
	return {
		id,
		keys,
		width: Math.max(...keys.map((k) => k.x + k.w)),
		height: Math.max(...keys.map((k) => k.y + k.h))
	};
}

function build(id: LayoutId): Layout {
	switch (id) {
		case '40':
			return finish(id, [
				...row(0, [1.5, ...ones(10), 1.5]),
				...row(1, [1.75, ...ones(9), 2.25]),
				...row(2, [2.25, ...ones(7), 1, 1, 1.75]),
				...row(3, [1.25, 1.25, 1.25, 6.25, 1.25, 1.75])
			]);
		case '60':
			return finish(id, [
				...row(0, NUMBER_ROW),
				...row(1, TOP_ROW),
				...row(2, HOME_ROW),
				...row(3, SHIFT_ROW),
				...row(4, BOTTOM_ROW)
			]);
		case '65':
			return finish(id, sixtyFiveRows(0));
		case '75':
			return finish(id, [
				...row(0, [1]),
				...row(
					0,
					Array.from({ length: 12 }, () => 14 / 12),
					1
				),
				...row(0, [1], 15),
				...sixtyFiveRows(1)
			]);
		case '80':
			return finish(id, [
				...stretchedFunctionRow(0, 14),
				...row(0, [1, 1, 1], 15),
				...tenkeylessBody(15, 1)
			]);
		case 'tkl':
			return finish(id, [
				...row(0, [
					1,
					gap(1),
					1,
					1,
					1,
					1,
					gap(0.5),
					1,
					1,
					1,
					1,
					gap(0.5),
					1,
					1,
					1,
					1,
					gap(0.25),
					1,
					1,
					1
				]),
				...tenkeylessBody(15.25, 1.5)
			]);
		case '98':
			return finish(id, [...stretchedFunctionRow(0, 15), ...sixtyFiveRows(1), ...numpad(16, 1)]);
		case '100':
			return finish(id, [
				...row(0, [
					1,
					gap(1),
					1,
					1,
					1,
					1,
					gap(0.5),
					1,
					1,
					1,
					1,
					gap(0.5),
					1,
					1,
					1,
					1,
					gap(0.25),
					1,
					1,
					1
				]),
				...tenkeylessBody(15.25, 1.5),
				...numpad(18.5, 1.5)
			]);
	}
}

const cache = new Map<LayoutId, Layout>();

export function getLayout(id: LayoutId): Layout {
	let layout = cache.get(id);
	if (!layout) {
		layout = build(id);
		cache.set(id, layout);
	}
	return layout;
}
