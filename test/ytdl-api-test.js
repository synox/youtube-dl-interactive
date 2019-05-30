import test from 'ava'
import ytldlApi from '../ytdl-api'

test('parse youtube info', async t => {
	const info = await ytldlApi.getInfo(
		'https://www.youtube.com/watch?v=HLqIbhzrrls'
	)
	t.is(info.height, 1024)
})

test('supportsSubtitles', async t => {
	t.truthy(await ytldlApi.supportsSubtitles('mp4'))
	t.truthy(await ytldlApi.supportsSubtitles('webm'))
	t.truthy(await ytldlApi.supportsSubtitles('mkv'))
	t.falsy(await ytldlApi.supportsSubtitles('mov'))
	t.falsy(await ytldlApi.supportsSubtitles(undefined))
})
