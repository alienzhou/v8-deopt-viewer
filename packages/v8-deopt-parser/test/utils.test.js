import test from "tape";
import { isAbsolutePath, parseSourcePosition } from "../src/utils.js";

test("parseSourcePosition", (t) => {
	const validSourcePositions = [
		["/path/to/file", 11, 22],
		["C:\\path\\to\\file", 11, 22],
		["file:///path/to/file", 11, 22],
		["file:///C:/path/to/file", 11, 22],
		["http://a.com/path/to/file", 11, 22],
		["https://a.com/path/to/file", 11, 22],
		["", 11, 22],
	];
	validSourcePositions.forEach((inputs) => {
		const position = inputs.join(":");
		const result = parseSourcePosition(position);

		const expected = { file: inputs[0], line: inputs[1], column: inputs[2] };
		t.deepEqual(result, expected, "valid: " + position);
	});

	const invalidSourcePositions = [
		["/path/to/file", 11],
		["/path/to/file", 11, ""],
		["/path/to/file", "", 22],
		["/path/to/file", "", ""],
		["/path/to/file", "a", ""],
		["/path/to/file", "", "a"],
		["/path/to/file", "a", "a"],
		[11, 22],
	];
	invalidSourcePositions.forEach((inputs) => {
		const position = inputs.join(":");

		let didCatch = false;
		try {
			parseSourcePosition(position);
		} catch (e) {
			didCatch = true;
		}

		t.equal(didCatch, true, "invalid: " + position);
	});

	t.end();
});

test("isAbsolutePath", (t) => {
	const areAbsolute = [
		"/",
		"/tmp",
		"/tmp/sub/path",
		"C:\\",
		"A:\\",
		"C:\\Temp",
		"C:\\Temp\\With Spaces",
		"\\",
		"\\Temp",
		"\\Temp\\With Spaces",
		"file:///tmp/sub/path",
		"file:///C:/Windows/File/URL",
		"http://a.com/path",
		"https://a.com/path",
	];
	areAbsolute.forEach((path) => {
		t.equal(isAbsolutePath(path), true, `Absolute path: ${path}`);
	});

	const notAbsolute = [
		null,
		undefined,
		"",
		"internal/fs",
		"tmp",
		"tmp/sub/path",
		"Temp",
		"Temp\\With Spaces",
		"1:",
		"C:",
		"A",
		"2",
	];
	notAbsolute.forEach((path) => {
		t.equal(isAbsolutePath(path), false, `Relative path: ${path}`);
	});

	t.end();
});
