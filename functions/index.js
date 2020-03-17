const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();
var timer = {};

exports.startTimer = functions.https.onCall((roomNumber) => {
	cors(req, res, () => {
		res.set('Access-Control-Allow-Origin', '*');
		timer[roomNumber] = setTimeout(closeRoom(roomNumber), 18000); // if 18 seconds pass without data update, close the room
		let room = db.ref('/openrooms').child(roomNumber);
		room.on('child_changed', function(childSnapshot) {
			clearTimeout(timer[roomNumber]);
			timer[roomNumber] = setTimeout(closeRoom(roomNumber), 18000) // if 18 seconds pass without data update, close the room
		})
	});
});

function closeRoom(roomNumber) {
	let room = db.ref('/openrooms').child(roomNumber);
	room.once('value').then(function(snapshot) {
		for (var key in snapshot.val()) {
			// add pair to openrooms
			var update = {};
			update['/openrooms/' + key] = snapshot.val()[key];
			db.ref().update(update);

			// remove pair from closedrooms
			db.ref('/closedrooms').child(key).remove();
		}
	});
}