const inquirer = require('inquirer')
const byteSize = require('byte-size')


exports.formatMenu = async function (formats) {
    let remainingFormats = formats

    // By default, we ignore 'video only' files
    remainingFormats = remainingFormats.filter(f => f.acodec !== 'none')

    remainingFormats = await exports.filterByProperty(
        'Select resolution:',
        f => (f.resolution || 'audio only'),
        remainingFormats
    )

    // remainingFormats = await exports.filterByProperty(
    // 	'Select extension:',
    // 	f => f.extension,
    // 	remainingFormats
    // )

    if (remainingFormats.length > 1) {
        remainingFormats = [await exports.selectOne(remainingFormats)]
    }

    const formatString = remainingFormats[0].format_id
    return {formatString, extension: remainingFormats[0].ext}
}


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

