const inquirer = require('inquirer')
const byteSize = require('byte-size')


exports.formatMenu = async function (formats) {

    const { videoAndAudioFormatId, videoFormatId, videoFormat } = await selectVideo(formats);

    // the presents need no further selection
    if (videoAndAudioFormatId) {
        return { formatString: videoAndAudioFormatId }
    }

    const audioFormatId = await selectAudio(formats, videoFormat);

    if (!videoFormatId) {
        // the special case 'audio only' has no video data
        return { formatString: audioFormatId, isAudioOnly: true }
    } else {
        return { formatString: `${videoFormatId}+${audioFormatId}` }
    }
}


exports.selectOneVideo = async function (formats) {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'q',
            message: 'Select a video file:',
            choices: formats.map(f => {
                return { name: exports.createVideoDescription(f), value: f }
            })
        }
    ])
    return answers.q
}


exports.createVideoDescription = function (f) {
    const formatResolution = f.width + 'x' + f.height;
    return `${f.ext.padEnd(4)} ${formatResolution.padEnd(9)} ${f.format_note.padEnd(10)} ${String(byteSize(f.filesize, { units: 'iec' })).padEnd(8)} ${exports.createAudioShortDescription(f, 'audio: ')}`;
}

exports.createAudioDescription = function (f) {
    return `${f.ext.padEnd(4)} ${f.acodec.padEnd(9)} @${String(f.abr).padStart(3)}k ${f.format_note.padEnd(10)} ${byteSize(f.filesize, { units: 'iec' })}`;
}
exports.createAudioShortDescription = function (f, prefix='') {
    if (f.acodec && f.acodec !== 'none') {
        return `${prefix}${f.acodec.padEnd(9)} @${String(f.abr).padStart(3)}k`;
    } else {
        return ''
    }
}

async function selectVideo(formats) {
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'q',
        message: 'What do you want?',
        pageSize: 10,
        choices: [
            { name: 'best video + best audio', value: { formatId: 'bestvideo+bestaudio/best' } },
            { name: 'worst video + worst audio', value: { formatId: 'worstvideo+worstaudio/worst' } },
            { name: '<480p mp4', value: { formatId: 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]' } },
            { name: 'audio only', value: { audioOnly: true } },
            new inquirer.Separator('--- custom resolution: ---'),
            ...getResolutionChoices(formats),
        ]
    }
    ]);

    const answer = answers.q
    if (answer.formatId) {
        return { videoAndAudioFormatId: answer.formatId }
    }

    if (answer.resolution) {
        const height = answer.resolution
        const videoFormat = await exports.selectOneVideo(
            formats.filter(f => f.height === height)
        )
        const videoFormatId = videoFormat.format_id
        return { videoFormatId, videoFormat }
    } else {
        // audio only has no video format id
        return { videoFormatId: null }
    }
}

function getResolutionChoices(formats) {
    const resolutions = getResolutions(formats)
    return resolutions.map(f => {
        return {
            name: f + 'p',
            value: { resolution: f }
        };
    });
}

function getResolutions(formats) {
    let resolutions = formats
        .filter(f => !!f.height)
        .map(f => f.height);

    const resolutionsUnique = [...new Set(resolutions)]
        .sort(f => f.height)
        .reverse();
    return resolutionsUnique;
}

async function selectAudio(formats, videoFormat) {
    const choices = []


    if (videoFormat && videoFormat.acodec !== 'none') {
        choices.push({
            name: `use audio included in the video: ${exports.createAudioShortDescription(videoFormat)}`,
            value: { format_id: videoFormat.format_id }
        })
    }

    choices.push(...[
        { name: 'best audio', value: { format_id: 'bestaudio' } },
        { name: 'worst audio', value: { format_id: 'worstaudio' } },
        new inquirer.Separator('--- custom: ---'),
        ...formats
            .filter(f => !!f.acodec && f.acodec !== 'none')
            .map(f => {
                return {
                    name: exports.createAudioDescription(f),
                    value: { format: f, format_id: f.format_id }
                };
            }),
    ]);


    const audioAnswers = await inquirer.prompt([{
        message: 'Select audio:',
        type: 'list',
        name: 'q',
        pageSize: 10,
        choices: choices
    }
    ]);
    return audioAnswers.q.format_id;
}

