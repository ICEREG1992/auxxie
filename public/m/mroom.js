var roomNum;
var roomRef;
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
	window.location.replace("https://auxxie-temp.firebaseapp.com/m/");
} else {
	database.ref('closedrooms/' + urlParams.get('n')).once("value").then(function(snapshot) {
		roomNum = urlParams.get('n');
		document.getElementById('roomtitle').innerHTML = 'room ' + roomNum;
		if (snapshot.exists()) {
			joinRoom();
		}
	});
}

function joinRoom() {
	roomRef = database.ref('closedrooms/' + roomNum);
	incrementUsers();
}

function incrementUsers() {
	roomRef.child('n').once("value").then(function(snapshot) {
		var userCount = snapshot.val();
		userCount++;
		var update = {};
		update[n] = userCount;
		roomRef.update(update);
	});
}