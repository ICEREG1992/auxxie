var taglines = ["coulda, shoulda, woulda",
"you shone like the sun",
"dressed up in evening wear",
"midnight into morning coffee",
"fritos, tab, and mountain dew",
"cold as cold as cold can be",
"say i'm the only bee in your bonnet",
"i'm not a real doctor but i am a real worm",
"U2 and blondie and music still on mtv",
"steady as she goes",
"go and dance yourself clean",
"visions, infinite visions",
"what's it like there, tomorrow?",
"a white chrysler lebaron",
"swim out past the breakers",
"cause all i do is dance",
"watching, waiting, commiserating",
"this that put the kids to bed"];

var config = {
	apiKey: "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
	authDomain: "auxxie-temp.firebaseapp.com",
	databaseURL: "https://auxxie-temp.firebaseio.com",
	storageBucket: "auxxie-temp.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

// authenticate the youtube data api
gapi.load('auth2', function() {
	gapi.auth2.init({
		client_id: '287328403783-5umbm14cbunh5dqpj3edk26fmb7h17jf.apps.googleusercontent.com'
	}).then(function (authInstance) {
		loadClient();
	});
})

// functions

function loadClient() {
	gapi.client.setApiKey("AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ"); // my Browser key in Google API console
	return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(function() { console.log("GAPI client loaded for API"); },
			function(err) { console.error("Error loading gAPI client for API", err); });
}

function submitPlaylistForm() {
	var inputLink = document.getElementById("playlist-form-textbox").value;
	var queryString = inputLink.split('?')[1];
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.has('list')) {
		playlistId = urlParams.get('list');
		// now that we have the list id, we can query the youtube data api and get the whole set of videos
		claimRoom(playlistId);
	} else {
		console.error('not a proper playlist link! figure out what to do here.');
	}
}

//Claim the room if it has not yet been claimed
function claimRoom(id) {
	var ticket = database.ref('/openrooms').limitToFirst(1)
	ticket.once('value').then(function(snapshot) {
		for (var key in snapshot.val()) {
			// remove pair from openrooms
			database.ref('/openrooms').child(key).remove();
			
			// create closedrooms entry in the update map
			var update = {};
			var bgvideosupdate = {};
			update['timestamp'] = Date.now();
			update['key'] = snapshot.val()[key];
			update['/users/host'] = 0;
			gapi.client.youtube.playlistItems.list({
				"part": "contentDetails",
				"playlistId": playlistId,
				"key": "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
				"maxResults": 50
			}).then(function(response) {
				if (response.result !== undefined) {
					for (var i = 0; i < Object.keys(response.result.items).length; i++) {
						var videoId = response.result.items[i].contentDetails.videoId;
						console.log(response.result.items[i].contentDetails.videoId);
						bgvideosupdate[i] = videoId;
					}
				} else {
					console.error("Youtube API was unable to load data id " + id + ".");
				}
			}).then(function(e) {
				// push the big update and redirect to the proper room url
				database.ref().child('closedrooms').child(snapshot.val()[key]).update(update);
				database.ref().child('closedrooms').child(snapshot.val()[key]).child('bgvideos').update(bgvideosupdate);
				window.location.replace("https://auxxie-temp.firebaseapp.com/room?n=" + paddy(key, 6));
			});
		}
	});
}

function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}