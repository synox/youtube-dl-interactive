#!/usr/bin/env node
'use strict'
const meow = require('meow')
const logSymbols = require('log-symbols')
const shell = require('shelljs')
const ytdlApi = require('./ytdl-api')
const ora = require('ora')
const updateNotifier = require('update-notifier')
const questions = require('./questions')
const pkg = require('./package.json')

const cli = meow(`Usage: youtube-dl-interactive URL
	 `)

async function init(args) {
	if (!shell.which('youtube-dl')) {
		shell.echo('Sorry, this script requires youtube-dl.')
		shell.echo('See https://github.com/ytdl-org/youtube-dl.')
		shell.exit(1)
	}

	updateNotifier({ pkg }).notify()

	if (args.length !== 1) {
		cli.showHelp(1)
	}

	const url = args[0]

	const formatSelection = await selectFormat(url)
	if (formatSelection) {
		console.log(
			logSymbols.success,
			`OK, downloading format #${formatSelection.format_id}: ${questions.createDescription(formatSelection)}`
		)

		let options = '-f ' + formatSelection.format_id

		if (ytdlApi.supportsSubtitles(formatSelection.ext)) {
			options += ' --all-subs --embed-subs'
		}
		shell.exec(`youtube-dl ${options} "${url}"`)
	}
}

init(cli.input).catch(error => {
	console.error(error)
	process.exit(1)
})

async function selectFormat(url) {
	const formats = await fetchFormatOptions(url)
	if (!formats) {
		console.error('can not load formats')
		return null
	}

	let remainingFormats = formats

	// By default, we ignore 'video only' files
	remainingFormats = remainingFormats.filter(f => f.acodec !== 'none')

	remainingFormats = await questions.filterByProperty(
		'Select resolution:',
		f => (f.resolution || 'audio only'),
		remainingFormats
	)

	// remainingFormats = await questions.filterByProperty(
	// 	'Select extension:',
	// 	f => f.extension,
	// 	remainingFormats
	// )

	if (remainingFormats.length > 1) {
		return questions.selectOne(remainingFormats)
	}

	return remainingFormats[0]
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

