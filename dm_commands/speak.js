const googleTTS = require('google-tts-api')
const request = require('request')
var global = require('../global')

exports.run = (client, message, args) => {
    var dispatcher = global.dispatcher
    var connection = global.connection
    var voiceChannel = global.voiceChannel

    console.log('DM: ' + message.content)
    // !voiceChannel
    if (!voiceChannel) {
        message.channel.send(`${client.user} must be in voiceChannel first!`)
    } else {
        let input = args.join(" ")
        googleTTS(input, 'th', 1) // speed normal = 1 (default), slow = 0.24
            .then(url => {
                stream = request(url)
                var dispatcher = connection.playStream(stream, {volume: 2})

                dispatcher.on('end', () => {
                    dispatcher = null
                })
            })
            .catch(err => {
                console.error(err);
            });

    }
}

exports.help = {
    name: "!speak <sentence, words>",
    value: "Bot will speak to what requester type (Thai speaker)"
}