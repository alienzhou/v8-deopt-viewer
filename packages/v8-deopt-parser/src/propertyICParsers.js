import { parseString } from "./v8-tools-core/logreader.js";
import { MIN_SEVERITY, UNKNOWN_SEVERITY } from "./utils.js";

const UNINITIALIZED = "unintialized";
const PREMONOMORPHIC = "premonomorphic";
const MONOMORPHIC = "monomorphic";
const RECOMPUTE_HANDLER = "recompute_handler";
const POLYMORPHIC = "polymorphic";
const MEGAMORPHIC = "megamorphic";
const GENERIC = "generic";
export const UNKNOWN = "unknown";

/**
 * @param {string} rawState Raw Inline Cache state from V8
 * @returns {import('./index').ICState}
 */
function parseIcState(rawState) {
	// ICState mapping in V8: https://github.com/v8/v8/blob/23dace88f658c44b5346eb0858fdc2c6b52e9089/src/ic/ic.cc#L44
	switch (rawState) {
		case "0":
			return UNINITIALIZED;
		case ".":
			return PREMONOMORPHIC;
		case "1":
			return MONOMORPHIC;
		case "^":
			return RECOMPUTE_HANDLER;
		case "P":
			return POLYMORPHIC;
		case "N":
			return MEGAMORPHIC;
		case "G":
			return GENERIC;
		case "X":
			return UNKNOWN;
		default:
			throw new Error("parse: unknown ic code state: " + rawState);
	}
}

/**
 * @param {import('./index').ICState} state
 * @returns {number}
 */
export function severityIcState(state) {
	switch (state) {
		case UNINITIALIZED:
			return MIN_SEVERITY;
		case PREMONOMORPHIC:
			return MIN_SEVERITY;
		case MONOMORPHIC:
			return MIN_SEVERITY;
		case RECOMPUTE_HANDLER:
			return MIN_SEVERITY;
		case POLYMORPHIC:
			return MIN_SEVERITY + 1;
		case MEGAMORPHIC:
			return MIN_SEVERITY + 2;
		case GENERIC:
			return MIN_SEVERITY + 2;
		case UNKNOWN:
			return UNKNOWN_SEVERITY;
		default:
			throw new Error("severity: unknown ic code state : " + state);
	}
}

export const propertyICFieldParsers = [
	parseInt, // profile code
	parseInt, // line
	parseInt, // column
	parseIcState, // old_state
	parseIcState, // new_state
	parseInt, // map ID
	parseString, // propertyKey
	parseString, // modifier
	parseString, // slow_reason
];
