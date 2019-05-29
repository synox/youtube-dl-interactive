#!/usr/bin/env node
'use strict'
const meow = require('meow')
const logSymbols = require('log-symbols')
const shell = require('shelljs')
const ytdlApi = require('./ytdl-api')
const ora = require('ora')
const updateNotifier = require('update-notifier')
const menu = require('./menu')
const pkg = require('./package.json')
const chalk = require('chalk')

const cli = meow(`
		Usage: youtube-dl-interactive URL

		Options:
		  --help, -h  output usage information
		  --version        output the version number
		  --demo           use sample data, no remote calls

		`, {
		flags: {
			demo: {
				type: 'boolean',
			}
		}
	}
)

async function init(args, flags) {
	if (!shell.which('youtube-dl')) {
		shell.echo('Sorry, this script requires youtube-dl.')
		shell.echo('See https://github.com/ytdl-org/youtube-dl.')
		shell.exit(1)
	}

	updateNotifier({ pkg }).notify()

	if (flags.demo) {
		console.log(logSymbols.warning, chalk.bgYellowBright('Running demo with local data, not making remote calls'))
		await run(null, true);
	} else {
		if (args.length !== 1) {
			cli.showHelp(1)
		}
		const url = args[0]
		await run(url, false);
	}
}

init(cli.input, cli.flags).catch(error => {
	console.error(error)
	process.exit(1)
})

async function run(url, isDemo) {
	let formats = isDemo
		? require('./test/samples/thankyousong.json').formats
		: await fetchFormatOptions(url)

	if (!formats) {
		return
	}
	const formatSelection = await menu.formatMenu(formats);
	console.log(logSymbols.success, `OK, downloading format #${formatSelection.format_id}: ${menu.createDescription(formatSelection)}`);
	let options = '-f ' + formatSelection.format_id;
	if (ytdlApi.supportsSubtitles(formatSelection.ext)) {
		options += ' --all-subs --embed-subs';
	}
	if (isDemo) {
		console.log(logSymbols.warning, `End of demo. would now call: youtube-dl ${options} "${url}"`)
	} else {
		shell.exec(`youtube-dl ${options} "${url}"`);
	}
}

async function fetchFormatOptions(url) {
	const spinner = ora('Loading formats').start()
	try {
		const info = await ytdlApi.getInfo(url)
		spinner.stop()
		return info.formats
	} catch (error) {
		spinner.fail('can not load formats')
		console.error(error)
		return null
	}



}

