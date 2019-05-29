const inquirer = require('inquirer')
const byteSize = require('byte-size')


exports.formatMenu = async function (formats) {

    const answer = await selectVideo(formats);

    // the presents need no further selection
    if (answer.isFinalFormatId) {
        return { formatString: answer.formatId }
    }

    // the special case 'audio only' has no video data
    if (answer.audioOnly) {
        const audioFormatId = await selectAudio(formats);
        return { formatString: audioFormatId, isAudioOnly: true }
    }

    const height = answer.resolution
    const videoFormat = await exports.selectOneVideo(
        formats.filter(f => f.height === height)
    )
    const videoFormatId = videoFormat.format_id

    const audioFormatId = await selectAudio(formats);

    const formatString = `${videoFormatId}+${audioFormatId}`
    return { formatString, isAudioOnly: false }
}


exports.filterByProperty = async function (message, displayFun, list) {
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
    return `${f.ext.padEnd(4)} ${formatResolution.padEnd(9)} ${f.format_note.padEnd(10)} ${byteSize(f.filesize, { units: 'iec' })}`;
}

exports.createAudioDescription = function (f) {
    return `${f.ext.padEnd(4)} ${f.acodec.padEnd(9)} @${String(f.abr).padStart(3)}k ${f.format_note.padEnd(10)} ${byteSize(f.filesize, { units: 'iec' })}`;
}

async function selectVideo(formats) {
    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'q',
        message: 'What do you want?',
        pageSize: 10,
        choices: [
            { name: 'best video + best audio', value: { isFinalFormatId: true, formatId: 'bestvideo+bestaudio/best' } },
            { name: 'worst video + worst audio', value: { isFinalFormatId: true, formatId: 'worstvideo+worstaudio/worst' } },
            { name: '<480p mp4', value: { isFinalFormatId: true, formatId: 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]' } },
            { name: 'audio only', value: { audioOnly: true, resolution: 'none' } },
            new inquirer.Separator('--- custom resolution: ---'),
            ...getResolutionChoices(formats),
        ]
    }
    ]);
    return answers.q;
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

async function selectAudio(formats) {
    const audioAnswers = await inquirer.prompt([{
        message: 'Select audio:',
        type: 'list',
        name: 'q',
        pageSize: 10,
        choices: [
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
        ]
    }
    ]);
    const audioFormatId = audioAnswers.q.format_id;
    return audioFormatId;
}

