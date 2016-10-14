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
			var visitsRef = db.ref('prometheus/visits/' + u);
			visitsRef.once('value', function(visitsSnap){
				var visits = visitsSnap.val();
				var uid = visitsSnap.key;
				var latest = 0;
				for(var v in visits){
					if(visits[v]){
						var time = visits[v].meta.datetime.timestamp;
						if(time > latest){
							latest = time;
						}
					}
				}
				console.log('Updated last visit timestamp: prometheus/users/' + uid + '/lastVisit');
				db.ref('prometheus/users/' + uid + '/lastVisit').set(latest);
			});
			
		}
	}
});