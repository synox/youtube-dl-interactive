const inquirer = require('inquirer')
const byteSize = require('byte-size')

exports.filterByProperty = async function(message, displayFun, list) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message,
			choices: [...new Set(list.map(displayFun))]
		}
	])
	return list.filter(f => displayFun(f) === answers.q)
}

exports.selectOne = async function(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Several matches. Select an option:',
			choices: formats.map(f => {
				return {name: exports.createDescription(f), value: f}
			})
		}
	])
	return answers.q
}
 

exports.createDescription = function(f) {
	return `${f.ext} | ${f.format} (${byteSize(f.filesize, { units: 'iec' })})`;
}

