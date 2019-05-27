const inquirer = require('inquirer')
const _ = require('lodash')

exports.filterByResolution = async function (formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select resolution:',
			choices: [...new Set(formats.map(f => f.resolution))]
		}
	])
	return formats.filter(f => f.resolution === answers.q)
}

exports.filterByExtension = async function (formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select extension:',
			choices: [...new Set(formats.map(f => f.extension))]
		}
	])
	return formats.filter(f => f.extension === answers.q)

}

exports.selectOne = async function (formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Several matches. Select an option:',
			choices: formats.map(f => {
				return { name: f.extension + ' | ' + f.note, value: f }
			})
		}
	])
	return answers.q
}

exports.askIncludeSubs = async function () {
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

