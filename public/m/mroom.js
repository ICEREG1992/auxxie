var roomNum;
var roomRef;
var uID;
var config = {
	apiKey: "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ",
	authDomain: "auxxie-temp.firebaseapp.com",
	databaseURL: "https://auxxie-temp.firebaseio.com",
	storageBucket: "auxxie-temp.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();

// establish onclick code for the addForm popup, if you click outside the popup it hides
window.onclick = function(event) {
  var formRef = document.getElementById('add-form');
  if (event.target == formRef) {
    formRef.style.display = "none";
  }
}

// get the query (room number) from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
// if it has the room number in it, get the room associated with that number, and join it
if (!urlParams.has('n')) {
	window.location.replace("https://auxxie-temp.firebaseapp.com/m/");
} else {
	database.ref('closedrooms/' + urlParams.get('n')).once("value").then(function(snapshot) {
		roomNum = snapshot.key;
		document.getElementById('roomtitle').innerHTML = 'room ' + roomNum;
		if (snapshot.exists()) {
			joinRoom();
		}
	});
}

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

function joinRoom() {
	roomRef = database.ref('closedrooms/' + roomNum);
	incrementUsers();
	updateTimestamp();
	loadActiveQueue();
}

function incrementUsers() {
	roomRef.child('users').once("value").then(function(snapshot) {
		var userCount = snapshot.numChildren();
		uID = roomRef.child('users').push(userCount).key;
		// set disconnect here so i don't have to worry about async values
		roomRef.child('users').child(uID).onDisconnect().remove();
	});
}

function loadActiveQueue() {
	var queueElem = document.getElementById('queue');
	roomRef.child('videos').orderByChild('votecount').on('value', function(snapshot) {
		// clear the current html queue
		while (queueElem.firstChild) {
    		queueElem.removeChild(queueElem.lastChild);
 		}
 		snapshot.forEach(function(vid) {
 			console.log(vid.val());
 			var entryElem = document.createElement('div');
			entryElem.setAttribute('class', 'entry');
			entryElem.setAttribute('id', vid.key);

			var thumbElem = document.createElement('div');
			thumbElem.setAttribute('class', 'thumbnail');
			var videoID = vid.child('id').val();
			thumbElem.innerHTML = '<img src=\'' + 'https://i3.ytimg.com/vi/' + videoID + '/default.jpg\'>';

			var dataElem = document.createElement('div');
			dataElem.setAttribute('class', 'vid-data');

			var titleElem = document.createElement('div');
			titleElem.setAttribute('class', 'vid-title');
			titleElem.innerHTML = vid.child('title').val();

			var authorElem = document.createElement('div');
			authorElem.setAttribute('class', 'vid-author');
			authorElem.innerHTML = vid.child('author').val();

			var lengthElem = document.createElement('div');
			lengthElem.setAttribute('class', 'vid-length');
			lengthElem.innerHTML = moment.utc(moment.duration(vid.child('length').val()).as('milliseconds')).format('HH:mm:ss')

			var votesElem = document.createElement('div');
			votesElem.setAttribute('class', 'votes');

			var upElem = document.createElement('button');
			var downElem = document.createElement('button');
			if (vid.child('votes').child(uID).exists()) {
				switch (vid.child('votes').child(uID).val()) {
					case -1: upElem.setAttribute('class', 'vote-up');
						upElem.setAttribute('onclick', 'voteUp(this)');
						downElem.setAttribute('class', 'vote-down-clicked');
						downElem.setAttribute('onclick', 'unvoteDown(this)');
						break;
					case 0: upElem.setAttribute('class', 'vote-up');
						upElem.setAttribute('onclick', 'voteUp(this)');
						downElem.setAttribute('class', 'vote-down');
						downElem.setAttribute('onclick', 'voteDown(this)');
						break;
					case 1: upElem.setAttribute('class', 'vote-up-clicked');
						upElem.setAttribute('onclick', 'unvoteUp(this)');
						downElem.setAttribute('class', 'vote-down');
						downElem.setAttribute('onclick', 'voteDown(this)');
				}
			} else {
				upElem.setAttribute('class', 'vote-up');
				upElem.setAttribute('onclick', 'voteUp(this)');
				downElem.setAttribute('class', 'vote-down');
				downElem.setAttribute('onclick', 'voteDown(this)');
			}
			
			upElem.innerHTML = '▲';
			downElem.innerHTML = '▼';

			var countElem = document.createElement('div');
			countElem.setAttribute('class', 'vote-count');
			// sum votes for that video
			var sumVotes = 0;
			vid.child('votes').forEach( function(child) {
				sumVotes += child.val();
			});
			countElem.innerHTML = sumVotes;

			//assembly

			votesElem.appendChild(upElem);
			votesElem.appendChild(countElem);
			votesElem.appendChild(downElem);

			dataElem.appendChild(titleElem);
			dataElem.appendChild(authorElem);
			dataElem.appendChild(lengthElem);

			entryElem.appendChild(thumbElem);
			entryElem.appendChild(dataElem);
			entryElem.appendChild(votesElem);

			queueElem.appendChild(entryElem);
 		});
	});
}

function updateTimestamp() {
	var update = {};
	update['/timestamp'] = Date.now();
	roomRef.update(update);
}

function openAddForm() {
	var formRef = document.getElementById('add-form');
	formRef.style.display = "block";
}

function closeAddForm() {
	var formRef = document.getElementById('add-form');
	formRef.style.display = "none";
}

function submitAddForm() {
	var inputElem = document.getElementById("add-form-textbox");
	var inputUrl = inputElem.value;
	getData(getId(inputUrl));
	// roomRef.child('videos').once('value').then(function (snapshot) {
	// 	var index = snapshot.numChildren();
	// 	roomRef.child('videos').child(index).update(getData(id));
	// })
}

function getId(url) {
	var regex = '^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]+).*';
	var r = url.match(regex);
	return r[1];
}

function getData(id) {
	var data = {};
	gapi.client.youtube.videos.list({
		"part": "snippet,contentDetails",
		"id": id,
		"key": "AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ"
	}).then(function(response) {
		if (response.result.items[0] !== undefined) {
			data["author"] = response.result.items[0].snippet.channelTitle;
			data["id"] = response.result.items[0].id;
			data["length"] = response.result.items[0].contentDetails.duration;
			data["title"] = response.result.items[0].snippet.title;
			data["votecount"] = 0;

			roomRef.child('videos').once('value').then(function (snapshot) {
				var index = Date.now();
				roomRef.child('videos').child(index).update(data);
			})
		} else {
			console.log("Youtube API was unable to load data id " + id + ".");
		}
	});
}

function voteUp(elem) {
	// update room timeout since there's been activity
	updateTimestamp();
	// if the downvote button has been clicked, unclick it so the top button will show as the only one clicked
	var downButton = elem.parentElement.children[2];
	if (downButton.getAttribute('class') == 'vote-down-clicked') {
		downButton.setAttribute('class', 'vote-down');
		downButton.setAttribute('onclick', 'voteDown(this)');
	}
	// get the id of the video in the queue
	var vidNumber = elem.parentElement.parentElement.getAttribute('id');
	// find that video index in the database, then update its votes element to include the user's uID
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		// update the uID's vote number to 1, since this is an upvote
		var update = {};
		update[uID] = 1
		roomRef.child('videos').child(vidNumber).child('votes').update(update);
	}).then(function(e) {
		countVotes(vidNumber).then(function(val) {
			var update = {};
			update['votecount'] = val;
			roomRef.child('videos').child(vidNumber).update(update);
		});
	});
	// show the upvote button as clicked, and set onclick to unvoteUp
	elem.setAttribute('class', 'vote-up-clicked');
	elem.setAttribute('onclick', 'unvoteUp(this)');
}

function voteDown(elem) {
	// update room timeout since there's been activity
	updateTimestamp();
	// if the downvote button has been clicked, unclick it so the top button will show as the only one clicked
	var upButton = elem.parentElement.children[0];
	if (upButton.getAttribute('class') == 'vote-up-clicked') {
		upButton.setAttribute('class', 'vote-up');
		upButton.setAttribute('onclick', 'voteUp(this)');
	}
	// get the id of the video in the queue
	var vidNumber = elem.parentElement.parentElement.getAttribute('id');
	// find that video index in the database, then update its votes element to include the user's uID
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		// update the uID's vote number to -1, since this is a downvote
		var update = {};
		update[uID] = -1
		roomRef.child('videos').child(vidNumber).child('votes').update(update);
	}).then(function(e) {
		countVotes(vidNumber).then(function(val) {
			var update = {};
			update['votecount'] = val;
			roomRef.child('videos').child(vidNumber).update(update);
		});
	});
	// show the downvote button as clicked, and set onclick to unvoteDown
	elem.setAttribute('class', 'vote-down-clicked');
	elem.setAttribute('onclick', 'unvoteDown(this)');
}

function unvoteUp(elem) {
	updateTimestamp();
	// get the video html element
	var vid = elem.parentElement.parentElement;
	// get the id of the video in the queue
	var vidNumber = elem.parentElement.parentElement.getAttribute('id');
	// find that video index in the database, then update its votes element to include the user's uID
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		// update the uID's vote number to 0, since we;re removing any vote
		var update = {};
		update[uID] = 0
		roomRef.child('videos').child(vidNumber).child('votes').update(update);
	}).then(function(e) {
		countVotes(vidNumber).then(function(val) {
			var update = {};
			update['votecount'] = val;
			roomRef.child('videos').child(vidNumber).update(update);
		});
	});
	// show the upvote button as unclicked, and set onclick to voteUp
	elem.setAttribute('class', 'vote-up');
	elem.setAttribute('onclick', 'voteUp(this)');
}

function unvoteDown(elem) {
	updateTimestamp();
	// get the video html element
	var vid = elem.parentElement.parentElement;
	// get the id of the video in the queue
	var vidNumber = elem.parentElement.parentElement.getAttribute('id');
	// find that video index in the database, then update its votes element to include the user's uID
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		// update the uID's vote number to 0, since we're removing any vote
		var update = {};
		update[uID] = 0;
		roomRef.child('videos').child(vidNumber).child('votes').update(update);
	}).then(function(e) {
		countVotes(vidNumber).then(function(val) {
			var update = {};
			update['votecount'] = val;
			roomRef.child('videos').child(vidNumber).update(update);
		});
	});
	
	// show the upvote button as unclicked, and set onclick to voteDown
	elem.setAttribute('class', 'vote-down');
	elem.setAttribute('onclick', 'voteDown(this)');
}

function countVotes(vid) {
	return new Promise(function (resolve, reject) {
		var sumVotes = 0;
		roomRef.child('videos').child(vid).child('votes').once('value').then(function (snapshot) {
			snapshot.forEach( function(child) {
				sumVotes -= child.val();
			});
			resolve(sumVotes);
		});
	})
}