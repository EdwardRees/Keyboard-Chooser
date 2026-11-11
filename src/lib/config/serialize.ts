import { FIELD_ORDER, OPTIONS, type CompleteSelections } from './options';

export const CONFIG_VERSION = 1;

export type ParseResult =
	{ ok: true; selections: CompleteSelections } | { ok: false; error: string };

export function exportConfig(selections: CompleteSelections): string {
	const out: Record<string, unknown> = { version: CONFIG_VERSION };
	for (const field of FIELD_ORDER) out[field] = selections[field];
	return JSON.stringify(out, null, 2) + '\n';
}

function fail(error: string): ParseResult {
	return { ok: false, error };
}

export function parseConfig(text: string): ParseResult {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return fail('This file is not valid JSON.');
	}
	if (typeof data !== 'object' || data === null || Array.isArray(data)) {
		return fail('This file is not a keyboard configuration.');
	}

	const record = data as Record<string, unknown>;
	const keys = Object.keys(record);

	if (!('version' in record)) return fail('This file has no version number.');
	if (record.version !== CONFIG_VERSION) {
		return fail(
			`Unsupported version: ${String(record.version)}. This app reads version ${CONFIG_VERSION}.`
		);
	}

	const expected = new Set<string>(['version', ...FIELD_ORDER]);
	for (const key of keys) {
		if (!expected.has(key)) return fail(`Unexpected field: ${key}.`);
	}
	for (const field of FIELD_ORDER) {
		if (!Object.hasOwn(record, field)) return fail(`Missing field: ${field}.`);
	}

	const out: Record<string, unknown> = {};
	for (const field of FIELD_ORDER) {
		const value = record[field];
		if (field === 'notes') {
			if (typeof value !== 'string') return fail('The notes field must be text.');
			out.notes = value;
			continue;
		}
		const allowed: readonly string[] = OPTIONS[field].map((o) => o.id);
		if (typeof value !== 'string' || !allowed.includes(value)) {
			return fail(`Unknown value for ${field}: ${JSON.stringify(value)}.`);
		}
		out[field] = value;
	}
	return { ok: true, selections: out as unknown as CompleteSelections };
}
