#!/usr/bin/env node
'use strict'
const meow = require('meow')
const logSymbols = require('log-symbols')
const shell = require('shelljs');
const parseColumns = require('parse-columns');
const ora = require('ora');
const _ = require('lodash');
const { askExtension, askIncludeSubs, askResolution } = require('./questions');

const cli = meow(
	`Usage: youtube-dl-interactive URL
	 `
)

async function init(args) {
	if (!shell.which('youtube-dl')) {
		shell.echo('Sorry, this script requires youtube-dl.');
		shell.echo('See https://github.com/ytdl-org/youtube-dl.');
		shell.exit(1);
	}

	if (args.length !== 1) {
		cli.showHelp(1)
	}
	const url = args[0]

	let formatSelection = await selectFormat(url);

	let options = '-f ' + formatSelection.format
	if (await askIncludeSubs()) {
		options += ' --all-subs --embed-subs'
	}

	console.log(logSymbols.success, 'OK, we will download format with number ' + formatSelection.format)
	shell.exec(`youtube-dl ${options} "${url}"`)
}

init(cli.input).catch(error => {
	console.error(logSymbols.error, error)
	process.exit(1)
})

async function selectFormat(url) {
	const formats = await fetchFormatOptions(url);
	let remainingFormats = formats;

	// by default, we ignore video only files
	remainingFormats = remainingFormats.filter(f => f.note.indexOf('video only') === -1);

	const resolution = await askResolution(remainingFormats);
	remainingFormats = remainingFormats.filter(f => f.resolution == resolution);

	const extension = await askExtension(remainingFormats);
	remainingFormats = remainingFormats.filter(f => f.extension == extension);

	// hopefully only one format remains here.
	return remainingFormats[0];
}

async function fetchFormatOptions(url) {
	const spinner = ora('Loading formats').start()
	const qualitiesOutput = shell.exec(`youtube-dl -F "${url}"`, { silent: true }).stdout;
	spinner.stop()

	const withoutLogs = qualitiesOutput
		.split("\n")
		.filter(line => line.indexOf("[") !== 0)
		.join("\n");

	return parseColumns(withoutLogs, {});

}
