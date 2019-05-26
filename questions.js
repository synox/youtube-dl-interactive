const inquirer = require('inquirer')
const _ = require('lodash')

exports.askResolution = async function(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select resolution:',
			choices: _.uniq(formats.map(f => f.resolution))
		}
	])
	return answers.q
}

exports.askExtension = async function(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select extension:',
			choices: formats.map(f => f.extension + ' | ' + f.note)
		}
	])
	return answers.q.split(' |')[0]
}

exports.askIncludeSubs = async function() {
	const answers = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'q',
			message: 'Include subtitles?',
			default: true
		}
	])
	return answers.q
}
