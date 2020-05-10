import { fileURLToPath } from "url";
import * as path from "path";
import { readFile, writeFile } from "fs/promises";
import { parseV8Log } from "../src/index.js";

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const pkgRoot = (...args) => path.join(__dirname, "..", ...args);

/**
 * @param {import('tape').Test} t
 * @param {string} logFileName
 * @param {import('../').Options} [options]
 */
export async function runParser(t, logFileName, options) {
	const logPath = pkgRoot("test", "logs", logFileName);

	// TODO: Consider replacing paths in log with comparable native paths
	// to test logs generated on Windows and Linux
	const logContents = await readFile(logPath, "utf8");

	const origConsoleError = console.error;
	const errorArgs = [];
	console.error = function (...args) {
		origConsoleError.apply(console, args);
		errorArgs.push(args);
	};

	let result;
	try {
		result = await parseV8Log(logContents, options);
	} finally {
		console.error = origConsoleError;
	}

	t.equal(errorArgs.length, 0, "No console.error calls");

	return result;
}

export async function writeSnapshot(logFileName, result) {
	const outFileName = logFileName.replace(".v8.log", ".json");
	const outPath = path.join(__dirname, "snapshots", outFileName);
	await writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
}

/**
 * @param {import('tape').Test} t
 * @param {string} message
 * @param {Array<import('../').Entry>} entries
 * @param {import('../').Entry} expectedEntry
 */
export function validateEntry(t, message, entries, expectedEntry) {
	const { functionName, file, line, column } = expectedEntry;
	const matches = entries.filter((entry) => {
		return (
			entry.functionName === functionName &&
			entry.file === file &&
			entry.line === line &&
			entry.column === column
		);
	});

	if (matches.length !== 1) {
		throw new Error(
			`Expected to only find one match for "${functionName} ${file}:${line}:${column}". Found ${matches.length}.`
		);
	}

	t.deepEqual(matches[0], expectedEntry, message);
}