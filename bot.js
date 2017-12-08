const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require('ytdl-core');
const CleverBot = require('cleverbot-node');
const setting = require('./setting.json')
const firebase = require('./config');
const moment = require('moment');
const ngrok = require('ngrok');

const YouTube = require('simple-youtube-api');
var songs = [];
var repeat = [];
var replay = false;
let prefix = "!";


var cleverBot = new CleverBot;
var youtube = new YouTube(setting.googleApi);
const googleTranslate = require('google-translate')(setting.googleApi);

var db = firebase.db.ref();

client.login(setting.token);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
});


client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	let command = message.content.split(" ")[0];
	let arg = message.content.split(" ")[1];
	let arg2 = message.content.split(" ")[2];
	let arg3 = message.content.split(" ")[3];
	command = command.slice(prefix.length);


	if (command === "ping") {
		message.channel.sendMessage(`\`${Date.now() - message.createdTimestamp} ms\``);
	}

	if (command === "play") {
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) {
			return message.channel.sendMessage(":x: You must be in a voice channel first!");
		}
		voiceChannel.join()
			.then(connection => {
		
				// ngrok.connect(8080, (err, url) => {
				// 	message.channel.sendMessage(`Server is serving here ${url}`)
				// 	if(err){
				// 		console.log(err)
				// 		return
				// 	}
				// });

				let dispatcher;
				(function play(song) {
					console.log('begin')
					if (song === undefined) {
						if(replay === true){
							if(songs.length == 0){
								console.log('replay case')
								songs = repeat.slice(0);
								repeat = []
								play(songs.shift())
								return;
							}
						}
						message.channel.sendMessage(`\`Empty song\``)
						console.log('empty executed')
						return;
					}
					
					repeat.push({
						url: song.url,
						title: song.title,
						requester: song.requester
					});
				
					let stream = yt(song.url, {
						audioonly: true
					});
					
					let dispatcher = connection.playStream(stream)
					
					message.channel.sendMessage(`Now playing: \`${song.title}\``)
					let collector = message.channel.createCollector(m => m);
					collector.on('message', m => {
						if (m.content.startsWith(prefix + 'pause')) {
							message.channel.sendMessage(`\`pause\`, !resume to resume the streaming`).then(() => {dispatcher.pause()})
						} else if (m.content.startsWith(prefix + 'resume')) {
							message.channel.sendMessage(`resume`).then(() => {dispatcher.resume()})
						} else if (m.content.startsWith(prefix + 'skip')) {
							message.channel.sendMessage(`skipped`).then(() => {dispatcher.end()})
						} else if (m.content.startsWith(prefix + 'vol++')){
							if (Math.round(dispatcher.volume*50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
							message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith(prefix + 'vol--')){
							if (Math.round(dispatcher.volume*50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
							message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith(prefix + 'time')){
							message.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
						} else if(m.content.startsWith(prefix + 'playing')){
							message.channel.sendMessage(`Now Playing: \`${song.title}\` `)
						} 
					})

					dispatcher.on('end', (user) => {
						collector.stop();
						if(user){
							console.log('before shift')
							dispatcher = null
							play(songs.shift());
						}else{
							console.log(user)
							play(songs.shift());
						}
						
					});

					dispatcher.on('error', (err) => {
						console.log(`Error: ${err}`)
						collector.stop();
						play(songs.shift());
					})
				})(songs.shift())
			

			}).catch(console.error)
	}

	if (command === "add") {
		if (arg === undefined || arg == '') {
			message.channel.sendMessage(`Please assign youtube link`);
			return;
		}
		yt.getInfo(arg, (err, info) => {
			if (err) {
				message.channel.sendMessage(`${err}`);
				return;
			}
			songs.push({
				url: info.video_url,
				title: info.title,
				requester: message.author.username
			});
			message.channel.sendMessage(`${info.title} has been added`);
			console.log(songs);
		})
	}

	if (command === 'queue') {
		let list;
		if (songs.length == 0) {
			message.channel.sendMessage(`Empty playlist`)
		} else {
			songs.forEach((song, i) => {
				message.channel.sendMessage(`${i}. ${song.title}, request by ${song.requester}`)
			})
		}
	}

	if(command === 'replay'){
		replay = !replay;
		message.channel.sendMessage(`Replay: ${replay}`)
	}

	if (command === 'join') {
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) {
			return message.channel.sendMessage(":x: You must be in a voice channel first!");
		}
		voiceChannel.join().then(connection => {
			message.channel.sendMessage(`joined voice channel: ${connection.channel}`);
		}).catch( (err) => {
			message.channel.sendMessage(`${err}`);
		})
	}

	if (command === 'avatar') {
		message.reply(message.author.displayAvatarURL);
	}

	if (command === 'clever') {
		if(arg === undefined || arg == '') {return}

		cleverBot.configure({
			botapi: setting.cleverApi
		});

		var separate = message.content.split(" ")
		var removed = separate.splice(1).join(" ")
		console.log('Say: ' + removed);
		cleverBot.write(removed, (response) => {
			message.channel.sendMessage(response.output);
		});			

		//test
		// googleTranslate.detectLanguage(arg, (err, detection) => {
		// 	console.log('arg: ' + arg)

		// 	if(detection.language != 'en'){
		// 		googleTranslate.translate(arg, 'en', (err, translation) => {
		// 			let translateText = translation.translatedText;
		// 			console.log('transalte to eng: ' + translateText )
		// 			cleverBot.write(translateText, (response) => {
		// 				console.log('response in eng: ' + response.output)
		// 				googleTranslate.translate(response.output, detection.language, (err, translation) => {
		// 					message.channel.sendMessage(translation.translatedText);
		// 				})
		// 			});		
		// 		})		
		// 	}else{
		// 		cleverBot.write(arg, (response) => {
		// 			message.channel.sendMessage(response.output);
		// 		});	
		// 	}
		// 	if(err) {
		// 		console.log(err)
		// 		return
		// 	}		
		// })
	}

	if (command === 'shuffle') {
		if(songs === undefined){
			message.channel.sendMessage(`\`Empty song\``)	
			return;	
		}else{
			shuffle(songs);
			console.log('shuffle the songs')
		}
	}

	if (command === 'db') {
		if(arg === undefined || arg == '') {
			message.channel.sendMessage(`
				find: show dbs,
				find <db_name> : show information inside db,
				add <youtube_url>: add track to db,
				create: create db
			`)
			return
		}

		if(arg === 'find'){
			if(arg2 === undefined || arg2 == ''){
				db.child('playlist').once('value', snapshot => {
					var i = 0;
					snapshot.forEach( snap => {
						message.channel.sendMessage(`#${i+1}, ${snap.key}`)
						i++;
					})
				})
				return;
			}else{
				db.child('playlist').child(message.author.username).child('track').once('value', snapshot => {
					var i = 0;
					var totalLength = 0;
					snapshot.forEach( snap => {
						totalLength += snap.val().length/60;
						message.channel.sendMessage(`#${i+1}, ${snap.val().title}}`)
						i++;
					})
					message.channel.sendMessage(`Total Minutes: ${totalLength}`)
				})
			}
		}else if(arg === 'create'){
			if(arg2 === undefined || arg2 == '') {
				db.child('playlist').child(message.author.username).set({
					Date: moment().format('MMMM Do YYYY h:mm:ss a')
				});
				message.channel.sendMessage(`Successfully create your playlist: ${message.author.username}`)
			}
		}else if(arg === 'add'){
			if(arg2 === undefined || arg2 == '') {return}

			yt.getInfo(arg2, (err, info) => {
				var id = yt.getURLVideoID(arg2)
				if (err) {
					message.channel.sendMessage(`${err}`);
					return;
				}else{
					db.child('playlist').child(message.author.username).child('track').child(id).set({
						url: info.video_url,
						title: info.title,
						length: info.length_seconds
					}, (err) => {
						console.log(err)
					})
				}
				message.channel.sendMessage(`${info.title} has been added to ${message.author.username}`);
			})

		}else if(arg === 'use'){
			if(arg2 === undefined || arg2 == ''){
				arg2 = message.author.username;
			}
			db.child('playlist').child(arg2).child('track').once('value', snapshot => {
				songs = [];
				snapshot.forEach( snap => {
					songs.push({
						url: snap.val().url,
						title: snap.val().title,
						requester: message.author.username 
					})
				})
				message.channel.sendMessage(`Successfully added to current playlist`)
			}).catch(console.log)
		}
	}

	if (command === 'youtube') {
		if(arg === 'playlist'){
			if(arg2 === undefined ) {return}
			if(arg2 !== undefined || arg2 != ' '){
				if(arg3 === undefined ) {return}
				if(arg2 === 'info'){
					console.log('arg2: ' + arg2)
					if(arg3 !== undefined || arg3 != ' '){
						youtube.getPlaylist(arg3)
						.then(playlist => {
							console.log(`The playlist's title is ${playlist.title}`);
							playlist.getVideos()
								.then(videos => {
									console.log(`This playlist has ${videos.length === 50 ? '50+' : videos.length} videos.`);
									for(var i=0; i<videos.length; i++){
										console.log(`${i+1}, ${videos[i].url} `)
									}
								})
								.catch(console.log);
						})
					}
				}
				
				if(arg2 === 'add'){
					if(arg3 !== undefined || arg3 != ' '){
						youtube.getPlaylist(arg3)
						.then(playlist => {
							playlist.getVideos()
								.then(videos => {
									for(var i=0; i<videos.length; i++){
										songs.push({
											url: videos[i].url,
											title: videos[i].title,
											requester: message.author.username
										})
										console.log(videos[i].title)
									}
									console.log('add success')
								}).catch(console.log);
						}).catch(console.log);
						message.channel.sendMessage('Added playlist')
					}
				}
				
			}
		}
		
	}
	
	if (command === 'clear'){
		songs = [];

		message.channel.sendMessage('cleared')
	}

	if (command === 'help') {
		message.channel.sendMessage(`Commands:
			!ping: return timeStamp
			!play: play song in playlist
				!pause
				!resume
				!skip(bug)
				!vol++
				!vol--
				!time
				!playing
			!add <youtbe_url>: add song to playlist
			!join: join voiceChannel
			!avatar: Return requester's profile image
			!clever <text>: communicate with chat bot <support any language> /beta
			!shuffle: shuffle playlist
			!clear: clear all the song in playlist
			!replay: set loop for playlist
			!youtube 
				playlist
					info <youtube_playlist_url>: show information of playlist
					add  <youtube_playlist_url>
			!db 
				find: show dbs,
				find <db_name> : show information inside db,
				add <youtube_url>: add track to db,
				create: create db
		`)
	}
	
	

	// Shuffle Algorithm Function
	function shuffle(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

})

