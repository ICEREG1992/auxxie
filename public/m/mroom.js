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
window.onclick = function(event) {
  var formRef = document.getElementById('add-form');
  if (event.target == formRef) {
    formRef.style.display = "none";
  }
}

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

function joinRoom() {
	roomRef = database.ref('closedrooms/' + roomNum);
	incrementUsers();
	updateTimestamp();
	loadActiveQueue();
}

function incrementUsers() {
	roomRef.child('n').once("value").then(function(snapshot) {
		var userCount = snapshot.val();
		userCount++;
		var update = {};
		update['n'] = userCount;
		roomRef.update(update);
	});
}

function loadActiveQueue() {
	var queueElem = document.getElementById('queue');
	roomRef.child('videos').on('value', function(snapshot) {
		while (queueElem.firstChild) {
    		queueElem.removeChild(queueElem.lastChild);
 		}
		var vidCount = snapshot.numChildren();
		for (var i = 0; i < vidCount; i++) {
			var vid = snapshot.child(i);
			var entryElem = document.createElement('div');
			entryElem.setAttribute('class', 'entry');

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
			lengthElem.innerHTML = timeFormat(vid.child('length').val());

			var votesElem = document.createElement('div');
			votesElem.setAttribute('class', 'votes');

			var upElem = document.createElement('button');
			upElem.setAttribute('class', 'vote-up');
			upElem.setAttribute('onclick', 'voteUp(this)');
			upElem.innerHTML = '▲';

			var countElem = document.createElement('div');
			countElem.setAttribute('class', 'vote-count');
			countElem.innerHTML = vid.child('votes').val();

			var downElem = document.createElement('button');
			downElem.setAttribute('class', 'vote-down');
			downElem.setAttribute('onclick', 'voteDown(this)');
			downElem.innerHTML = '▼';

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
		}
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

function voteUp(elem) {
	updateTimestamp();
	var val = 1;
	var downButton = elem.parentElement.children[0];
	if (downButton.getAttribute('class') == 'vote-down-clicked') {
		downButton.setAttribute('class', 'vote-down');
		val = 2;
	}
	var vid = elem.parentElement.parentElement;
	var vidNumber;
	for (vidNumber = 0; (vid = vid.previousSibling); vidNumber++);
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		var tempVotes = snapshot.val();
		tempVotes++;
		var update = {};
		update['votes'] = tempVotes;
		roomRef.child('videos').child(vidNumber).update(update);
	});
	elem.setAttribute('class', 'vote-up-clicked');
	elem.setAttribute('onclick', 'unvoteUp(this)');
}

function voteDown(elem) {
	updateTimestamp();
	var val = 1;
	var upButton = elem.parentElement.children[0];
	if (upButton.getAttribute('class') == 'vote-up-clicked') {
		upButton.setAttribute('class', 'vote-up');
		val = 2;
	}
	var vid = elem.parentElement.parentElement;
	var vidNumber = 0;
	while((vid = vid.previousSibling) != null) {
  		i++;
	}
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		var tempVotes = snapshot.val();
		tempVotes -= val;
		var update = {};
		update['votes'] = tempVotes;
		roomRef.child('videos').child(vidNumber).update(update);
	});
	elem.setAttribute('class', 'vote-down-clicked');
	elem.setAttribute('onclick', 'unvoteDown(this)');
}

function unvoteUp(elem) {
	updateTimestamp();
	var vid = elem.parentElement.parentElement;
	var vidNumber;
	for (vidNumber = 0; (vid = vid.previousSibling); vidNumber++);
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		var tempVotes = snapshot.val();
		tempVotes--;
		var update = {};
		update['votes'] = tempVotes;
		roomRef.child('videos').child(vidNumber).update(update);
	});
	elem.setAttribute('class', 'vote-up');
	elem.setAttribute('onclick', 'voteUp(this)');
}

function unvoteDown(elem) {
	updateTimestamp();
	var vid = elem.parentElement.parentElement;
	var vidNumber;
	for (vidNumber = 0; (vid = vid.previousSibling); vidNumber++);
	roomRef.child('videos').child(vidNumber).child('votes').once('value').then(function(snapshot) {
		var tempVotes = snapshot.val();
		tempVotes++;
		var update = {};
		update['votes'] = tempVotes;
		roomRef.child('videos').child(vidNumber).update(update);
	});
	elem.setAttribute('class', 'vote-down');
	elem.setAttribute('onclick', 'voteDown(this)');
}

function timeFormat(time)
{   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}