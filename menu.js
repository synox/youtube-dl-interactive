const inquirer = require('inquirer')
const byteSize = require('byte-size')


exports.formatMenu = async function (formats) {

    // -- VIDEO --
    let resolutions = formats
        .filter(f => !!f.height)
        .map(f => f.height)

    resolutions = [...new Set(resolutions)]
        .sort(f => f.height)
        .reverse()

    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'q',
        message: 'What do you want?',
        pageSize: 10,
        choices: [
            { name: 'best video + best audio', value: { preset: 'bestvideo+bestaudio/best' } },
            { name: 'worst video + worst audio', value: { preset: 'worstvideo+worstaudio/worst' } },
            { name: '<480p mp4', value: { preset: 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]', extension: 'mp4' } },
            { name: 'audio only', value: { audioOnly: true } },
            new inquirer.Separator('--- custom resolution: ---'),
            ...resolutions.map(f => { return { name: f + 'p', value: { resolution: f } } }),
        ]
    }
    ])

    if ('preset' in answers.q) {
        // using a preset, return the answer
        return { formatString: answers.q.preset, extension: answers.q.ext }
    }

    if ( 'audioOnly' in answers.q) {
        const audioFormatId = await selectAudio(formats);
        const formatString = `${audioFormatId}`
        return { formatString, isAudioOnly: true }
    }

    const height = answers.q.resolution
    const videoFormat = await exports.selectOne(
        formats.filter(f => f.height === height)
    )
    const videoFormatId = videoFormat.format_id
   

    // -- AUDIO --
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

exports.selectOne = async function (formats) {
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


exports.selectOneAudio = async function (formats) {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'q',
            message: 'Select a video file:',
            choices: formats.map(f => {
                return { name: exports.createAudioDescription(f), value: f }
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
    const formatResolution = f.width + 'x' + f.height;
    return `${f.ext.padEnd(4)} ${f.acodec.padEnd(9)} @${String(f.abr).padStart(3)}k ${f.format_note.padEnd(10)} ${byteSize(f.filesize, { units: 'iec' })}`;
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

