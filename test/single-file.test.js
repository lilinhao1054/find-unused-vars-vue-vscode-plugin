const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fuvv = require('../main');


const testTemplate = (testCase, expected) => async () => {
	const sortById = (a, b) => a.id.localeCompare(b.id);

	const code = fs.readFileSync(path.resolve(__dirname, `./single-file/${testCase}.vue`)).toString();
	const locArr = await fuvv(code);
	const resolvedActual = locArr.map(loc => ({ id: loc.identifierName, start: { line: loc.start.line, column: loc.start.column }, end: { line: loc.end.line, column: loc.end.column }, _t: loc._t })).sort(sortById);
	const resolvedExpected = expected.sort(sortById);
	assert.deepEqual(resolvedActual, resolvedExpected);
};

suite('Extension Test Suite', () => {

	test('basic test', testTemplate('basic', [
		{
			id: "jkl",
			start: {
				line: 16,
				column: 8,
			},
			end: {
				line: 16,
				column: 11,
			},
			_t: 'props',
		},
		{
			id: "negativeCount",
			start: {
				line: 36,
				column: 8,
			},
			end: {
				line: 36,
				column: 21,
			},
			_t: "computed",
		}
	]));

	test('export-default test', testTemplate('export-default', [
		{
			id: "unused",
			start: {
				line: 9,
				column: 12,
			},
			end: {
				line: 9,
				column: 18,
			},
			_t: 'data',
		}
	]));

	test('multi-style test', testTemplate('multi-style', [
		{
			id: "jkl",
			start: {
				line: 16,
				column: 8,
			},
			end: {
				line: 16,
				column: 11,
			},
			_t: 'props',
		},
		{
			id: "negativeCount",
			start: {
				line: 36,
				column: 8,
			},
			end: {
				line: 36,
				column: 21,
			},
			_t: "computed",
		}
	]));

	test('no-format test', testTemplate('no-format', [
		{
			id: "abc",
			start: {
				line: 6,
				column: 45,
			},
			end: {
				line: 6,
				column: 48,
			},
			_t: 'props',
		},
		{
			id: "negativeCount",
			start: {
				line: 29,
				column: 0,
			},
			end: {
				line: 29,
				column: 13,
			},
			_t: "computed",
		}
	]));

	test('no-style test', testTemplate('no-style', [
		{
			id: "jkl",
			start: {
				line: 16,
				column: 8,
			},
			end: {
				line: 16,
				column: 11,
			},
			_t: 'props',
		},
		{
			id: "negativeCount",
			start: {
				line: 36,
				column: 8,
			},
			end: {
				line: 36,
				column: 21,
			},
			_t: "computed",
		}
	]));

	test('props-array test', testTemplate('props-array', [
		{
			id: 'jkl',
			start: {
				line: 6,
				column: 20,
			},
			end: {
				line: 6,
				column: 23,
			},
			_t: 'props'
		}
	]));

	test('used-in-script test', testTemplate('used-in-script', [
		{
			id: 'doubleCount',
			start: {
				line: 12,
				column: 8,
			},
			end: {
				line: 12,
				column: 19,
			},
			_t: 'computed'
		}
	]));

	test('with-comment test', testTemplate('with-comment', [
		{
			id: 'count',
			start: {
				line: 8,
				column: 12,
			},
			end: {
				line: 8,
				column: 17,
			},
			_t: 'data',
		},
		{
			id: 'increment',
			start: {
				line: 12,
				column: 8,
			},
			end: {
				line: 12,
				column: 17,
			},
			_t: 'methods',
		},
		{
			id: 'decrement',
			start: {
				line: 15,
				column: 8,
			},
			end: {
				line: 15,
				column: 17,
			},
			_t: 'methods',
		}
	]));

	test('with-import test', testTemplate('with-import', [
		{
			id: 'unused',
			start: {
				line: 17,
				column: 12,
			},
			end: {
				line: 17,
				column: 18,
			},
			_t: 'data',
		}
	]));

	test('with-scope test', testTemplate('with-scope', [
		{
			id: 'relatedMetricList',
			start: {
				line: 39,
				column: 8,
			},
			end: {
				line: 39,
				column: 25,
			},
			_t: 'props',
		},
		{
			id: 'item',
			start: {
				line: 46,
				column: 12,
			},
			end: {
				line: 46,
				column: 16,
			},
			_t: 'data',
		}
	]));
});
