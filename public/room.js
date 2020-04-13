var roomNum;
var roomref;

var config = {
	apiKey: "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
	authDomain: "auxxie-temp.firebaseapp.com",
	databaseURL: "https://auxxie-temp.firebaseio.com",
	storageBucket: "auxxie-temp.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (!urlParams.has('n')) {
	claimRoom();
} else {
	roomNum = urlParams.get('n');
	document.getElementById('roomtitle').innerHTML = 'welcome to room ' + roomNum;
}


// functions //

function claimRoom() {
	var ticket = database.ref('/openrooms').limitToFirst(1)
	ticket.once('value').then(function(snapshot) {
		for (var key in snapshot.val()) {
			document.getElementById('roomtitle').innerHTML = 'welcome to room ' + snapshot.val()[key];
			
			// add pair to closedrooms
			var update = {};
			var bgvideos = {};
			var videos = {};
			update['/closedrooms/' + key + '/bgvideos/0/id'] = 'W9nZ6u15yis';
			update['/closedrooms/' + key + '/videos/0/id'] = 'W9nZ6u15yis';
			update['/closedrooms/' + key + '/videos/0/length'] = 'PT10S';
			update['/closedrooms/' + key + '/videos/0/title'] = 'Black Screen 10 seconds HD';
			update['/closedrooms/' + key + '/videos/0/author'] = 'Harrison Suderman';
			update['/closedrooms/' + key + '/timestamp'] = Date.now();
			update['/closedrooms/' + key + '/key'] = snapshot.val()[key];
			update['/closedrooms/' + key + '/users/host'] = 0;
			database.ref().update(update);
			roomref = '/closedrooms/' + key;

			// remove pair from openrooms
			database.ref('/openrooms').child(key).remove();
			window.location.replace("https://auxxie-temp.firebaseapp.com/room?n=" + paddy(key, 6));
			// no return, the redirect nukes all js
		}
	});
}

function writeOpenRooms(num) {
  database.ref('/openrooms').set({ 111111: '111111'});
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