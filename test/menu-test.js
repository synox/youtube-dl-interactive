import test from 'ava'
import menu from '../menu'

const {formats} = require('./samples/thankyousong.json')

test('show video description', async t => {
	t.is(
		await menu.createVideoDescription(formats[8]),
		'mp4  426x240   240p       2.2 MiB  (133)'
	)
})

test('show video description with audio', async t => {
	t.is(
		await menu.createVideoDescription(formats[17]),
		'mp4  640x360   medium     8.5 MiB  audio: mp4a.40.2 @ 96k (18)'
	)
})

test('show video description when some fields are not defined', async t => {
	t.is(
		await menu.createVideoDescription({format_id: 'HDTV'}),
		'                          NaN      (HDTV)'
	)
})

test('show audio short description ', async t => {
	t.is(
		await menu.createAudioShortDescription(formats[17], 'audio: '),
		'audio: mp4a.40.2 @ 96k '
	)
})

test('show audio short description when some fields are not defined', async t => {
	t.is(
		await menu.createAudioShortDescription({acodec: 'mp4a'}),
		'mp4a      @     '
	)
})

test('show audio description ', async t => {
	t.is(
		await menu.createAudioDescription(formats[17]),
		'mp4  mp4a.40.2 @ 96k medium     8.5 MiB (18)'
	)
})

test('show audio description when some fields are not defined', async t => {
	t.is(
		await menu.createAudioDescription({format_id: 22}),
		'               @                    NaN (22)'
	)
})
