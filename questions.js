const inquirer = require('inquirer')
const _ = require('lodash')

exports.askResolution = async function (formats) {
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

exports.askExtension = async function (formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select extension:',
			choices: formats.map(f => {
				return { name: f.extension + ' | ' + f.note, value: f.extension  }
			})
		}
	])
	return answers.q
}

exports.selectAny = async function (formats) {
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


function transformForUi(format) {
	console.log('transofrm', format)
	return format.extension + ' | ' + format.note;
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

