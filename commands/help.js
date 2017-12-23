const fs = require('fs');

exports.run = (client, message, args) => { // eslint-disable-line no-unused-vars
    let anArr = []
    var embed = {
        "color": 15105570,
        "fields": []
    }

    fs.readdir('./dm_commands/', (err, files) => {
        files.forEach( dm_command => {
            let dm_commandFile = require(`../dm_commands/${dm_command}`);
            embed = {
                "color": 15105570,
                "fields": []
            }
            embed["fields"].push(dm_commandFile.help)
        })
        message.channel.send("Commands for Direct Message",{embed})
    })

    fs.readdir('./commands/', (err, files) => {
        files.forEach( command => {
            let commandFile = require(`./${command}`);
            // console.log(commandFile.help)
            embed["fields"].push(commandFile.help)
        })
        message.channel.send("Commands for Message Channel",{embed})
    });
}

exports.help = {
    name: "!help",
    value: "List all commands",
  };