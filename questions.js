const inquirer = require('inquirer')

exports.filterByProperty = async function(message, property, list) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message,
			choices: [...new Set(list.map(f => f[property]))]
		}
	])
	return list.filter(f => f[property] === answers.q)
}

exports.selectOne = async function(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Several matches. Select an option:',
			choices: formats.map(f => {
				return {name: f.extension + ' | ' + f.note, value: f}
			})
		}
	])
	return answers.q
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
