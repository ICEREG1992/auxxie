const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.database();

exports.deleteOldItems = functions.database.ref('/openrooms').onWrite((change, context) => {
  var ref = change.after.ref.parent.child('/closedrooms'); // reference to the items
  var cutoff = Date.now() - (10 * 1000);
  var oldItemsQuery = ref.orderByChild('timestamp').endAt(cutoff);
  return oldItemsQuery.once('value', function(snapshot) {
    // create a map with all children that need to be removed
    var closedUpdate = {};
    var openUpdate = {};
    snapshot.forEach(function(child) {
      closedUpdate[child.key] = null;
      openUpdate['/openrooms/' + child.key] = paddy(child.key, 6);
    });
    // execute all updates in one go and return the result to end the function
    ref.update(closedUpdate);
    return db.ref().update(openUpdate);
  });
});

function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}