var roomNum;
var roomRef;
var bgIndex = 0;

var config = {
	apiKey: "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
	authDomain: "auxxie-temp.firebaseapp.com",
	databaseURL: "https://auxxie-temp.firebaseio.com",
	storageBucket: "auxxie-temp.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

// Load the IFrame Player API code
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);


// Claims the room if it is empty, otherwise populates the elements welcoming user to current room
if (urlParams.has('n')) {
	roomNum = urlParams.get('n');
	roomRef = database.ref('/closedrooms/' + roomNum);
	document.getElementById('room-title').innerHTML = 'room ' + roomNum;
	document.getElementById('link-info').innerHTML = 'go to<br><b>auxxie-temp.firebaseapp.com/r/' + roomNum + '</b><br>to join'
} else {
	document.getElementById("room-title").innerHTML = 'room error!';
	document.getElementById('link-info').innerHTML = 'room not specified. head back to <br><b>auxxie-temp.firebaseapp.com</b><br>to create a new room.';
}

// authenticate the youtube data api
gapi.load('auth2', function() {
	gapi.auth2.init({
		client_id: '287328403783-5umbm14cbunh5dqpj3edk26fmb7h17jf.apps.googleusercontent.com'
	}).then(function (authInstance) {
		loadApiClient();
	});
})

// create and queue the iframe
spawnFrame();

// functions //

function loadApiClient() {
	gapi.client.setApiKey("AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ"); // my Browser key in Google API console
	return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(function() { console.log("GAPI client loaded for API"); },
			function(err) { console.error("Error loading gAPI client for API", err); });
}

function writeOpenRooms(num) {
	database.ref('/openrooms').set({ 111111: '111111'});
	database.ref('/closedrooms').set({});
	var update = {};
	for (var i = 111112; i < num + 111110; i++) {
		var newRoomKey = database.ref('openrooms').push().key;    // { i: paddy(i, 6); }
		newRoomKey = i;
		update['/openrooms/' + newRoomKey] = paddy(i, 6);
	}
	database.ref().update(update);
}

function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

// shuffles array and returns it
function shuffle(arr) {
	let i, j ,tmp;
	for(i = arr.length -1; i >0;i--){
		j = Math.floor(Math.random()*(i+1));
		tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
}

// video functions //

function onPlayerReady(event) {
	if (event.target.getDuration() <= 0) {
		console.log('Video likely to be removed');
	} else {
		event.target.playVideo();
	}
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		nextVideo();
	}
}

function nextVideo() {
	getNextVideo().then(function(id) {
		player.loadVideoById(id);
	});
	setTimeout(function() {
		if (player.getPlayerState() == -1) {
			console.log("This video is probably unavaibale... skipping...");
			nextVideo();
		}
	}, 3000);
}

function getNextVideo() {
	return new Promise(function (resolve, reject) {
		// check if the queue has any videos in it
		// if it does, play the video at the top of the queue
		// if not, play the next video in bgvideos
		roomRef.child('videos').limitToFirst(1).once('value').then(function(snapshot) {
			if (snapshot.numChildren()) {
				// if there is a video at the top of the queue, we get it through
				// forEach so we don't have to know its key
				snapshot.forEach(function(childSnapshot) {
					roomRef.child('videos').child(childSnapshot.key).remove();
					resolve(childSnapshot.child('id').val());
				});
			} else {
				// if there's not a video in the queue, pluck one from bgvideos
				roomRef.child('bgvideos').limitToFirst(1).once('value').then(function(bgSnapshot) {
					if (bgSnapshot.numChildren()) {
						bgSnapshot.forEach(function(childSnapshot) {
							roomRef.child('bgvideos').child(childSnapshot.key).remove();
							resolve(childSnapshot.val());
						});
					} else {
						// if there's not a video in bgvideos, then it needs to be replenished
						refreshBgvideos();
					}
				});
			}
		});
	});
}

function spawnFrame() {
	player = null; // required?
	getNextVideo().then(function(id) {
		player = new YT.Player('ytplayer', {
			height: '390',
			width: '640',
			videoId: id,
			playerVars: {
				'autoplay': 1
			},
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
	});
}

function refreshBgvideos() {
	console.log("out of videos! figure out how to avoid this later.");
	// ideally you'd want to reload the playlist but we're not currently
	// saving that id. so we may need to add the id to our database structure, or
	// change how we're deleting videos from bgvideos.
}