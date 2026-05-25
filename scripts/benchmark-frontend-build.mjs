/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { spawn } from 'node:child_process';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const rootDir = resolve(import.meta.dirname, '..');
const outputDir = resolve(rootDir, 'built/_frontend_vite_');
const resultDir = resolve(rootDir, 'built/benchmark/frontend-build');

const args = process.argv.slice(2);
const separatorIndex = args.indexOf('--');
const optionArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
const commandArgs = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

let label = 'frontend-build';
let runs = 3;

for (const arg of optionArgs) {
	if (arg.startsWith('--label=')) {
		label = arg.slice('--label='.length);
	} else if (arg.startsWith('--runs=')) {
		runs = Number.parseInt(arg.slice('--runs='.length), 10);
	}
}

if (!Number.isInteger(runs) || runs < 1) {
	throw new Error(`Invalid --runs value: ${runs}`);
}

if (commandArgs.length === 0) {
	throw new Error('Missing build command. Use: node scripts/benchmark-frontend-build.mjs --label=name --runs=3 -- pnpm --filter frontend build');
}

function runCommand(command, commandArgs, options = {}) {
	return new Promise((resolvePromise) => {
		const startedAt = performance.now();
		const child = spawn(command, commandArgs, {
			cwd: rootDir,
			env: process.env,
			stdio: 'inherit',
			shell: false,
			...options,
		});

		child.on('close', (exitCode, signal) => {
			resolvePromise({
				exitCode,
				signal,
				durationMs: performance.now() - startedAt,
			});
		});
	});
}

async function walkFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...await walkFiles(fullPath));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}

async function collectOutputStats() {
	const files = await walkFiles(outputDir).catch(error => {
		if (error?.code === 'ENOENT') {
			return [];
		}
		throw error;
	});

	const totals = {
		fileCount: files.length,
		totalBytes: 0,
		jsBytes: 0,
		cssBytes: 0,
		localeJsFileCount: 0,
		localeJsonFileCount: 0,
	};

	for (const file of files) {
		const fileStat = await stat(file);
		const normalized = relative(outputDir, file).replaceAll('\\', '/');
		totals.totalBytes += fileStat.size;

		if (normalized.endsWith('.js')) {
			totals.jsBytes += fileStat.size;
		}
		if (normalized.endsWith('.css')) {
			totals.cssBytes += fileStat.size;
		}
		if (/\.[a-z]{2}(?:-[A-Z]{2})?\.js$/.test(normalized)) {
			totals.localeJsFileCount++;
		}
		if (/^[^/]+\.json$/.test(normalized) || normalized.includes('/locales/')) {
			totals.localeJsonFileCount++;
		}
	}

	return totals;
}

function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1) {
		return sorted[middle];
	}
	return (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatMs(value) {
	return `${Math.round(value)} ms`;
}

await mkdir(resultDir, { recursive: true });

console.log(`[benchmark] prebuild: pnpm build-pre`);
const buildPre = await runCommand('pnpm', ['build-pre']);
if (buildPre.exitCode !== 0) {
	process.exit(buildPre.exitCode ?? 1);
}

console.log(`[benchmark] prebuild: pnpm --filter i18n build`);
const i18nBuild = await runCommand('pnpm', ['--filter', 'i18n', 'build']);
if (i18nBuild.exitCode !== 0) {
	process.exit(i18nBuild.exitCode ?? 1);
}

const results = [];

for (let index = 0; index < runs; index++) {
	const runNumber = index + 1;
	console.log(`[benchmark] ${label}: run ${runNumber}/${runs}`);
	await rm(outputDir, { recursive: true, force: true });

	const build = await runCommand(commandArgs[0], commandArgs.slice(1));
	const output = await collectOutputStats();
	const result = {
		run: runNumber,
		durationMs: build.durationMs,
		exitCode: build.exitCode,
		signal: build.signal,
		output,
	};
	results.push(result);

	if (build.exitCode !== 0) {
		break;
	}
}

const successfulDurations = results
	.filter(result => result.exitCode === 0)
	.map(result => result.durationMs);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const summary = {
	label,
	runs,
	command: commandArgs,
	env: {
		NODE_ENV: process.env.NODE_ENV ?? null,
		VVI_BUILD_STRATEGY: process.env.VVI_BUILD_STRATEGY ?? null,
	},
	prebuild: {
		buildPre,
		i18nBuild,
	},
	results,
	statistics: successfulDurations.length > 0 ? {
		successfulRuns: successfulDurations.length,
		minMs: Math.min(...successfulDurations),
		maxMs: Math.max(...successfulDurations),
		medianMs: median(successfulDurations),
	} : {
		successfulRuns: 0,
	},
};

const baseName = `${timestamp}-${label}`;
await writeFile(join(resultDir, `${baseName}.json`), JSON.stringify(summary, null, '\t'), 'utf-8');

const lines = [
	`# ${label}`,
	'',
	`- Command: \`${commandArgs.join(' ')}\``,
	`- Successful runs: ${summary.statistics.successfulRuns}/${runs}`,
];

if (summary.statistics.successfulRuns > 0) {
	lines.push(
		`- Median: ${formatMs(summary.statistics.medianMs)}`,
		`- Min: ${formatMs(summary.statistics.minMs)}`,
		`- Max: ${formatMs(summary.statistics.maxMs)}`,
		'',
		'| Run | Duration | Files | Total bytes | JS bytes | CSS bytes | Locale JS files |',
		'| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
		...results.map(result => `| ${result.run} | ${formatMs(result.durationMs)} | ${result.output.fileCount} | ${result.output.totalBytes} | ${result.output.jsBytes} | ${result.output.cssBytes} | ${result.output.localeJsFileCount} |`),
	);
}

await writeFile(join(resultDir, `${baseName}.md`), `${lines.join('\n')}\n`, 'utf-8');

console.log(`[benchmark] wrote ${join('built/benchmark/frontend-build', `${baseName}.json`)}`);

if (results.some(result => result.exitCode !== 0)) {
	process.exit(results.find(result => result.exitCode !== 0)?.exitCode ?? 1);
}
