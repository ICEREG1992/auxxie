var roomnum;
var roomref;

var config = {
	apiKey: "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
	authDomain: "auxxie-temp.firebaseapp.com",
	databaseURL: "https://auxxie-temp.firebaseio.com",
	storageBucket: "auxxie-temp.appspot.com"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();
var functions = firebase.functions();
var addMessage = firebase.functions().httpsCallable('startTimer');

roomnum = claimRoom();

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
			update['/closedrooms/' + key + '/bgvideos/0/length'] = 10;
			update['/closedrooms/' + key + '/n'] = 0;
			update['/closedrooms/' + key + '/videos/0/id'] = 'W9nZ6u15yis';
			update['/closedrooms/' + key + '/videos/0/length'] = 10;
			update['/closedrooms/' + key + '/key'] = snapshot.val()[key];
			database.ref().update(update);
			roomref = '/closedrooms/' + key;

			// remove pair from openrooms
			database.ref('/openrooms').child(key).remove();
			var startTimer = functions.httpsCallable('startTimer');
			startTimer(snapshot.val()[key]);
			return snapshot.val()[key];
		}
	});
}

function writeOpenRooms(num) {
  database.ref('/openrooms').set({ 1: '000001'});
  for (var i = 2; i < num + 1; i++) {
  	var newRoomKey = database.ref('openrooms').push().key;    // { i: paddy(i, 6); }
  	newRoomKey = i;
  	var update = {};
  	update['/openrooms/' + newRoomKey] = paddy(i, 6);
  	database.ref().update(update); 
  }
  database.ref('closedrooms').set({ 0: '000000' });	
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