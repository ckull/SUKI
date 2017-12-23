var global = require('../global')

exports.run = (client, message, args) => {

    global.voiceChannel = message.member.voiceChannel

    // ! global.voiceChannel
    if (! global.voiceChannel) {
        return message.channel.send(":x: You must be in a voice channel first!");
    }

    // global.voiceChannel
     global.voiceChannel.join().then( connection => {
        global.connection = connection
        return message.channel.send({
            embed: {
                color: '3066993',
                title: `Join voiceChannel:  ${connection.channel}`,
                description: 'Live: ' + global.url
            }
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.help = {
    name: "!join",
    value: "let the bot join the voiceChannel"
  };