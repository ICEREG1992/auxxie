var roomNum;
var roomref;
var currIndex;
currIndex = 0;

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


//Claims the room if it is empty, otherwise populates the elements welcoming user to current room
if (!urlParams.has('n')) {
	claimRoom();
} else {
	roomNum = urlParams.get('n');
	document.getElementById('roomtitle').innerHTML = 'welcome to room ' + roomNum;
}


// functions //


// authenticate the youtube data api
gapi.load('auth2', function() {
	gapi.auth2.init({
		client_id: '287328403783-5umbm14cbunh5dqpj3edk26fmb7h17jf.apps.googleusercontent.com'
	}).then(function (authInstance) {
		loadClient();
	});
})

// functions
//Load the client
function loadClient() {
	gapi.client.setApiKey("AIzaSyDaGqnEmD2ibUlo6YyQaUHgcNl3wsqqtPQ"); // my Browser key in Google API console
	return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(function() { console.log("GAPI client loaded for API"); },
			function(err) { console.error("Error loading gAPI client for API", err); });
}

//Claim the room if it has not yet been claimed
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

//This video is going to get a function at a particular index
function getVideoAtIndex(ind){
	
}

      // Load the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      var player;

      var linkArray = [];
      var index = 0;
      
      function onYouTubeIframeAPIReady() {
        //if (linkArray.length != 0) {
          document.getElementById("start").removeAttribute("disabled");
        //}
      }
      
      function onPlayerReady(event) {
        event.target.playVideo();
      }
      
      var playing = true;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED && playing) {
          playing = false;
          nextVideo();
        }
      }

      function nextVideo() {
        //player.cueVideoById('chd31lOa6xg');
        index++;
        if(index > linkArray.length - 1){
          index = 0;
        }
        player.loadVideoById(linkArray[index]);
      }

      function startPlaylist() {
        player = null;
        index = 0;
        player = new YT.Player('ytplayer', {
          height: '360',
          width: '640',
          videoId: 'UxIoZ1omTKY',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // Create an array to hold the links
      
      function pushValue() {
        // Get value from the input box
        var inputText = document.getElementById('linkInput').value;
        
        if (inputText != ""){
          // Simple parsing on input link
          if (inputText.includes("watch?v=")) {
            var inputTextParsed = inputText.substr(inputText.indexOf("v=") + 2, 11);
          }
          // append data to the array
          linkArray.push(inputTextParsed);
          document.getElementById('linkInput').value = '';
        }
    
		DisplayLinkList();
      }


	  function DisplayLinkList(){
	  	 // Simple code so I can see the array list
        var pval = "";
        for(i = 0; i < linkArray.length; i++) {
          pval = pval + linkArray[i] + "<br/>";
        }
    
        // display array data
        document.getElementById('pText').innerHTML = pval;
	  }


	  //Function stolen from the randomizer that im gonna use to shuffle the array
	  function shuffle(d) {
			var a, c, b = d.length;
			if (b) {
				while (--b) {
					c = Math.floor(Math.random() * (b + 1));
					a = d[c];
					d[c] = d[b];
					d[b] = a
				}
			}
			return d;
			
		}

		function randomize_videos() {
			linkArray = shuffle(linkArray);
			index = 0;
			DisplayLinkList();
		}