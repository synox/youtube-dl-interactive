import test from 'ava';
import menu from '../menu'

const formats = require('./samples/thankyousong.json').formats

test('show video description', async t => {
    t.is(await menu.createVideoDescription(formats[8]), 'mp4  426x240   240p       2.2 MiB  ')
});

test('show video description with audio', async t => {
    t.is(await menu.createVideoDescription(formats[17]), 'mp4  640x360   medium     8.5 MiB  audio: mp4a.40.2 @ 96k')
});


test('show audio short description ', async t => {
    t.is(await menu.createAudioShortDescription(formats[17], 'audio: '), 'audio: mp4a.40.2 @ 96k')
});

test('show audio description ', async t => {
    t.is(await menu.createAudioDescription(formats[17]), 'mp4  mp4a.40.2 @ 96k medium     8.5 MiB')
});

