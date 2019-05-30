const shell = require('shelljs')

exports.getInfo = async function(url) {
	// Dummy for testing:
	// return require('./test/samples/thankyousong.json')

	const run = shell.exec(`youtube-dl --simulate --dump-json "${url}"`, {
		silent: true
	})
	if (run.code !== 0) {
		throw new Error(
			`youtube-dl stopped with error:\n${run.stdout}\n${run.stderr}`
		)
	}

	return JSON.parse(run.stdout)
}

exports.supportsSubtitles = function(ext) {
	return ['mp4', 'webm', 'mkv'].includes(ext)
}
