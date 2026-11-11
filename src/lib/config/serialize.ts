import { FIELD_ORDER, OPTIONS, type CompleteSelections } from './options';
import { isWebAddress } from './link';

/** The version this app writes. */
export const CONFIG_VERSION = 2;

/** Fields added in version 2. Version 1 files do not have them and import with these left blank. */
const ADDED_IN_V2: readonly string[] = ['keycapLink', 'keycapLook'];

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
	const version = record.version;
	if (version !== 1 && version !== CONFIG_VERSION) {
		return fail(
			`Unsupported version: ${String(version)}. This app reads versions 1 and ${CONFIG_VERSION}.`
		);
	}

	const fieldsInFile = FIELD_ORDER.filter(
		(f) => version === CONFIG_VERSION || !ADDED_IN_V2.includes(f)
	);
	const expected = new Set<string>(['version', ...fieldsInFile]);
	for (const key of keys) {
		if (!expected.has(key)) return fail(`Unexpected field: ${key}.`);
	}
	for (const field of fieldsInFile) {
		if (!Object.hasOwn(record, field)) return fail(`Missing field: ${field}.`);
	}

	const out: Record<string, unknown> = {};
	for (const field of FIELD_ORDER) {
		if (!fieldsInFile.includes(field)) {
			out[field] = ''; // a version 1 file: the new fields start blank
			continue;
		}
		const value = record[field];
		if (field === 'notes' || field === 'keycapLook') {
			if (typeof value !== 'string') return fail(`The ${field} field must be text.`);
			out[field] = value;
			continue;
		}
		if (field === 'keycapLink') {
			if (typeof value !== 'string' || (value !== '' && !isWebAddress(value))) {
				return fail(
					'The keycapLink field must be empty or a web address starting with http:// or https://.'
				);
			}
			out[field] = value;
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
