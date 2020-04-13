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
randomizeTagline();

function findRoom() {
	//document.getElementById("roomInput").submit();
	var inputElem = document.getElementById("roomForm");
	var inputNum = inputElem.elements[0].value;
	database.ref('closedrooms/' + inputNum).once("value").then(function(snapshot) {
		if (snapshot.exists() && inputNum != ''){
			window.location = 'https://auxxie-temp.firebaseapp.com/r/' + inputNum;
		} else {
			var labelElem= document.getElementById('form-label');
			if (document.body.contains(labelElem)) {
				labelElem.innerHTML = 'invalid room number!';
				labelElem.setAttribute('class', 'invalid');
				setTimeout(function() {
					labelElem.innerHTML = 'enter a room number';
					labelElem.removeAttribute('class');
				}, 5000);
			}
		}
	});
}

function randomizeTagline() {
	var tagline = taglines[Math.floor(Math.random() * taglines.length)];
	document.getElementById('tagline').innerHTML = tagline;
}