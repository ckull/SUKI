
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const firebase = require('./config')
const yt = require('ytdl-core')
const moment = require('moment')
const setting = require("./setting.json");
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ngrok = require('ngrok')
var express = require('express')
var localtunnel = require('localtunnel');
var global = require('./global')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    client.user.setPresence({ game: { name: '!help for help' } });
});


client.on("message", message => {
 
    global.message = message
  if (message.author.bot) return;
  if(message.content.indexOf(setting.prefix) !== 0) return;

  // This is the best way to define args. Trust me.
  const args = message.content.slice(setting.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  // The list of if/else is replaced with those simple 2 lines:
  if(message.channel.type === 'dm'){
    try {
      let dm_commandFile = require(`./dm_commands/${command}.js`);
      dm_commandFile.run(client, message, args);
    } catch (err) {
      console.error(err);
    }
  }else{
    try {
      let commandFile = require(`./commands/${command}.js`);
      commandFile.run(client, message, args);
    } catch (err) {
      console.error(err);
    }
  }
  
});

client.login(setting.token);

var db = firebase.db.ref();


db.child('playlist').child('global').child('track').orderByChild('timestamp').on('value', snapshot => {
  global.playlist = []
  snapshot.forEach(snap => {
      var song = snap.val()
      global.playlist.push(song)
  })
})


server.listen(3000);
//Server
app.use(express.static('./dist'))
app.get('/', function (request, response) {
    response.render('index.html')
})

ngrok.connect(3000, (err, url) => {
    if(err){
        console.log(err)
    }
    console.log('Live: ' + url)
    global.url = url
})

io.on('connection', client =>  {

  global.Client = client
  console.log('User Connected', client.id)
 
  io.emit('connectLive', Object.keys(io.sockets.connected).length)
  
  client.on('disconnect', function () {
      console.log('User Disconnected ', client.id)
      io.emit('connectLive', Object.keys(io.sockets.connected).length)
  })

  client.on('reconnect', function () {
      console.log('User Reconnect ', client.id)
      global.dispatcher.end()
  })

  client.on('add', (data) => {
      console.log(data)
      addSong(data);
  })

  client.on('volume', (data) => {
      volume(data)
  })

  client.on('play', (data) => {
      if(global.dispatcher !== null){
          global.dispatcher = null
      }
      play(data)
      console.log('client on play dispatcher: ' + global.dispatcher)
  })

  client.on('skip', () => {
      skip()
  })

  client.on('pause', () => {
      pause()
  })

  client.on('resume', () => {
      resume()
  })
});

addSong = (url) => {
  if (url !== undefined || url !== '') {
      console.log('not equal to undefined')
      yt.getInfo(url, (err, info) => {
          if (err) {
              console.log(err)
              return;
          }
          db.child('playlist').child('global').child('track').child(info.video_id).set({
              url: info.video_url,
              title: info.title,
              author: info.author,
              thumbnail: info.thumbnail_url,
              length: Math.round((info.length_seconds / 60) * 100) / 100,
              timestamp: moment().unix(),
              image: info.iurlhq
          })
          // message.channel.sendMessage(`${info.title} has been added`);
      })
  } else {
      console.log('wrong input')
  }
}

var next = 0;
play = (index) => {
  if (global.voiceChannel !== null) {
      global.Client.emit('voiceChannel', true)
      console.log('title: ' + global.playlist[index].title)
      let stream = yt(global.playlist[index].url, {
          audioonly: true
      })
      global.dispatcher = global.connection.playStream(stream)
      global.message.channel.send('```css'+ '\n' + '[Now Playing]: ' + global.playlist[index].title + '```')
      global.dispatcher.on('end', () => {
          if (global.dispatcher !== null) {
              next = index + 1
              if (index >= global.playlist.length - 1) {
                  console.log('end playlist')
                  global.Client.emit('endPlaylist')
                  return
              } else {
                  play(next)
                  global.Client.emit('autoNext', next)
              }
          }
      })
  } else {
      global.Client.emit('voiceChannel', false)
      console.log('No connection in voiceChannel')
  }
}

skip = () => {
  console.log('skip')
  if (global.dispatcher !== null) {
      console.log('end')
      global.dispatcher.end()
  } else {
      console.log('null')
  }
}

pause = () => {
  if (global.dispatcher !== null) {
      console.log('pause')
      global.dispatcher.pause()
  }
}

resume = () => {
  if (global.dispatcher !== null) {
      console.log('resume')
      global.dispatcher.resume()
  }
}

volume = (data) => {
  if (global.dispatcher !== null) {
      console.log('dispatcher volume: ' + global.dispatcher.volume)
      global.dispatcher.setVolume(data / 100)
      console.log('After set: ' + global.dispatcher.volume)
  }
}



