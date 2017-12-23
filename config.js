const setting = require('./setting.json')

//Firebase
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "discordbot-187811",
    clientEmail: "firebase-adminsdk-d36xt@discordbot-187811.iam.gserviceaccount.com",
    privateKey: setting.firebase
  }),
  databaseURL: "https://discordbot-187811.firebaseio.com"
});
var db = admin.database();
exports.db = db;

//Spotify
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: setting.spotify.clientId,
    clientSecret: setting.spotify.clientSecret,
    redirectUri: 'http://localhost:3000/callback'
});

spotifyApi.clientCredentialsGrant().then( (data) => {
  console.log('The access token is ' + data.body['access_token']);
  spotifyApi.setAccessToken(data.body['access_token']);
},  (err) =>  {
  console.log('Something went wrong!', err);
})

exports.spotifyApi = spotifyApi