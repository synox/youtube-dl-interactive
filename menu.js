const inquirer = require('inquirer')
const byteSize = require('byte-size')

exports.formatMenu = async function(formats) {
	// Select video preset or resolution (it may include a audio track)
	let {
		finalFormatId,
		videoFormatId,
		audioFormatId,
		height
	} = await selectPresetOrResolution(formats)

	// FinalFormatId means no further selection is required
	if (!finalFormatId) {
		let videoFormat
		// Specifiy which video with this height
		if (height) {
			videoFormat = await exports.selectOneVideo(
				formats.filter(f => f.height === height)
			)
			videoFormatId = videoFormat.format_id
		}

		// Specify audio track
		audioFormatId = await selectAudio(formats, videoFormat)
	}

	if (finalFormatId) {
		return {formatString: finalFormatId, hasVideo: true, hasAudio: true}
	}

	if (videoFormatId && audioFormatId) {
		if (videoFormatId === audioFormatId) {
			return {formatString: videoFormatId, hasVideo: true, hasAudio: true}
		}

		return {
			formatString: `${videoFormatId}+${audioFormatId}`,
			hasVideo: true,
			hasAudio: true
		}
	}

	if (videoFormatId) {
		// The special case 'video only' has no audio
		return {formatString: videoFormatId, hasVideo: true, hasAudio: false}
	}

	// The special case 'audio only' has no video data
	return {formatString: audioFormatId, hasVideo: false, hasAudio: true}
}

async function selectPresetOrResolution(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'What do you want?',
			pageSize: 10,
			choices: [
				{
					name: 'best video + best audio',
					value: {finalFormatId: 'bestvideo+bestaudio/best'}
				},
				{
					name: 'worst video + worst audio',
					value: {finalFormatId: 'worstvideo+worstaudio/worst'}
				},
				{
					name: '<480p mp4',
					value: {
						finalFormatId:
							'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]'
					}
				},
				{name: 'audio only', value: {}},
				new inquirer.Separator('--- specify resolution: ---'),
				...getResolutions(formats).map(resolution => ({
					name: resolution + 'p',
					value: {height: resolution}
				}))
			]
		}
	])

	return answers.q
}

exports.selectOneVideo = async function(formats) {
	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'q',
			message: 'Select a video file:',
			choices: formats.map(f => ({
				name: exports.createVideoDescription(f),
				value: f
			}))
		}
	])
	return answers.q
}

async function selectAudio(formats, selectedVideoFormat) {
	const choices = []

	if (selectedVideoFormat && selectedVideoFormat.acodec !== 'none') {
		choices.push({
			name: `Use audio included in the video: ${exports.createAudioShortDescription(
				selectedVideoFormat
			)}`,
			value: selectedVideoFormat.format_id
		})
		choices.push(new inquirer.Separator())
	}

	choices.push({name: 'best audio', value: 'bestaudio'})
	choices.push({name: 'worst audio', value: 'worstaudio'})
	choices.push(new inquirer.Separator('--- specify: ---'))
	choices.push(
		...getAudioFormats(formats).map(f => ({
			name: exports.createAudioDescription(f),
			value: f.format_id
		}))
	)

	const audioAnswers = await inquirer.prompt([
		{
			message: 'Select audio:',
			type: 'list',
			name: 'q',
			pageSize: 10,
			choices
		}
	])
	return audioAnswers.q
}

function getResolutions(formats) {
	const resolutions = formats.filter(f => Boolean(f.height)).map(f => f.height)

	return [...new Set(resolutions)].sort(f => f.height).reverse()
}

function getAudioFormats(formats) {
	return formats.filter(f => f.acodec && f.acodec !== 'none')
}

exports.createVideoDescription = function(f) {
	return (
		paddingRight(f.ext, 4) +
		paddingRight(f.width ? f.width + 'x' + f.height : null, 9) +
		paddingRight(f.format_note, 10) +
		paddingRight(byteSize(f.filesize, {units: 'iec'}), 8) +
		exports.createAudioShortDescription(f, 'audio: ') +
		'(' +
		f.format_id +
		')'
	)
}

const paddingRight = function(value, width) {
	if (!value) {
		value = ''
	}

	// Value might be an object. Wrap it so we can call padEnd on it.
	value = String(value)
	return value.padEnd(width) + ' '
}

const paddingLeft = function(value, width, suffix = '') {
	if (value) {
		value += suffix
	} else {
		value = ''
	}

	// Value might be an object. Wrap it so we can call padEnd on it.
	value = String(value)
	return value.padStart(width) + ' '
}

exports.createAudioDescription = function(f) {
	return (
		paddingRight(f.ext, 4) +
		paddingRight(f.acodec, 9) +
		'@ ' +
		paddingLeft(f.abr, 3, 'k') +
		paddingRight(f.format_note, 10) +
		paddingLeft(byteSize(f.filesize, {units: 'iec'}), 7) +
		'(' +
		f.format_id +
		')'
	)
}

exports.createAudioShortDescription = function(f, prefix = '') {
	if (f.acodec && f.acodec !== 'none') {
		return (
			prefix + paddingRight(f.acodec, 9) + '@ ' + paddingLeft(f.abr, 3, 'k')
		)
	}

	return ''
}
