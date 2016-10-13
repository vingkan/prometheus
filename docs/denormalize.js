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
			var visits = allUsers[u].visits;
			for(var v in visits){
				if(visits[v]){
					console.log('Moved visit to: prometheus/visits/' + u);
					//db.ref('prometheus/visits/' + u).push(visits[v]);
				}
			}			
		}
	}
});