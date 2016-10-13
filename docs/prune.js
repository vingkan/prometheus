var targetConfig = {
	apiKey: "AIzaSyBXXQFcl6qtakmkFeh0jzy_jjjIDpb1DlY",
    authDomain: "prometheusjs.firebaseapp.com",
    databaseURL: "https://prometheusjs.firebaseio.com",
    storageBucket: "firebase-prometheusjs.appspot.com",
    messagingSenderId: "433905102741"
};

var targetFirebase = firebase.initializeApp(targetConfig, 'Target Firebase');
var db = targetFirebase.database();

db.ref('prometheus/users').once('value', function(usersSnap){
	var allUsers = usersSnap.val();
	for(var u in allUsers){
		if(allUsers[u]){
			console.log('Removed visits at: prometheus/users/' + u + '/visits');
			db.ref('prometheus/users/' + u + '/visits').remove();	
		}
	}
});