const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require('ytdl-core');
const CleverBot = require('cleverbot-node');

const YouTube = require('simple-youtube-api');
var songs = [];
let prefix = "!";
const api = 'YOUR_GOOGLE_API_HERE'
const botApi = 'YOUR_CLEVER_API_HERE'
const token = 'YOUR_TOKEN_HERE'

var cleverBot = new CleverBot;
var youtube = new YouTube(api);
const googleTranslate = require('google-translate')(api);

client.login(token);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.username}!`);
});


client.on('message', message => {
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
		
				let dispatcher;
				(function play(song) {
					console.log('begin')
					if (song === undefined) {
						message.channel.sendMessage(`\`Empty song\``)
						return;
					}
					console.log(`Song URL: ${song.url}`)
					let stream = yt(song.url, {
						audioonly: true
					});
					
					let dispatcher = connection.playStream(stream, {seek: 0, volume: 1});
					message.channel.sendMessage(`Now playing: \`${song.title}\``)
					let collector = message.channel.createCollector(m => m);
					collector.on('message', m => {
						if (m.content.startsWith(prefix + 'pause')) {
							message.channel.sendMessage(`pause`).then(() => {dispatcher.pause()})
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
		if (songs.length == 0) {
			message.channel.sendMessage(`Empty playlist`)
		} else {
			songs.forEach((song, i) => {
				message.channel.sendMessage(`${i+1}, ${song.title}`)
			})
		}
	}

	if (command === 'join') {
		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) {
			return message.channel.sendMessage(":x: You must be in a voice channel first!");
		}
		voiceChannel.join().then(connection => {
			message.channel.sendMessage(`joined voice channel: ${connection.channel}`);
		}).catch(err => {
			message.channel.sendMessage(`${err}`);
		})
	}

	if (command === 'avatar') {
		message.reply(message.author.displayAvatarURL);
	}

	if (command === 'clever') {

		cleverBot.configure({
			botapi: botApi 
		});
		//test
		googleTranslate.detectLanguage(arg, (err, detection) => {
			if(detection.language != 'en'){
				googleTranslate.translate(arg, 'en', (err, translation) => {
					let translateText = translation.translatedText;
					console.log('transalte to eng: ' + translateText )
					cleverBot.write(translateText, (response) => {
						console.log('response in eng: ' + response.output)
						googleTranslate.translate(response.output, detection.language, (err, translation) => {
							message.channel.sendMessage(translation.translatedText);
						})
					});		
				})		
			}else{
				cleverBot.write(arg, (response) => {
					message.channel.sendMessage(response.output);
				});	
			}			
		})
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
		message.channel.sendMessage('Added playlist')
	}

	if (command === 'help') {
		message.channel.sendMessage(`Command List:
			!ping: return timeStamp
			!play: stream song
				!pause, !resume, !skip(bug), !vol++, !vol--, !time, !playing
			!add <youtbe_url>: add song to playlist
			!join: join voiceChannel
			!avatar: Return requester's profile image
			!clever <text>: comunicate with chat bot <support any language>
			!shuffle: shuffle playlist
			!clear: clear playlist
			!youtube 
				playlist
					info <youtube_playlist_url>
					add  <youtube_playlist_url>
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
});


