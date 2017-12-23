let playlist = []
var global = require('../global')
var mlg = require('../MLG.json')
var request = require('request')

exports.run = (client, message, args) => {

    var dispatcher = global.dispatcher
    var connection = global.connection
    var voiceChannel = global.voiceChannel

    args = args.join(" ")
    if (!voiceChannel) {
        message.channel.send('```css\n' + '[ Bot must be in voiceChannel first! ]' + '```')
    } else {
        mlg.forEach(data => {
            playlist = []
            playlist.push(data)
            console.log(data.title); 
            if (args === data.title) {
                var stream = request(data.url)
                dispatcher = connection.playStream(stream, {volume: 2})

                dispatcher.on('end', () => {
                    dispatcher = null
                })
            }
        })
    }
}

mlg.forEach(data => {
    playlist.push(data.title)
})

var string = playlist.join('\r\n')


exports.help = {
    name: "!mlg <track>",
    value: "Stream mlg sound \n\nAvailable track: \n" + '```fix\n' + string + '```'
  };