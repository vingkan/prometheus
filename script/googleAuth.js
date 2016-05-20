var BASE_URL = "https://prometheusjs.firebaseio.com/";
var userID;
var authObject;

function checkUserInDatabase(authData){
	userID = authData.user.uid;
	var userData = {
		uid: userID,
		name: authData.user.displayName,
		email: authData.user.email,
		img: authData.user.photoURL
	}
	var path = "prometheus/users/" + userID;
	var userRef = firebase.database().ref(path);
	userRef.once('value', function(snapshot){
		if(!snapshot.exists()){
			var userDataRoute = firebase.database().ref(path + "/auth");
			userDataRoute.set(userData);
		}
		else{
			console.log('Successfully Logged In!');
		}
		prometheus.logon(userID, userData);
		location.href = 'contact.html';
	});
}

function googleLogin(){
	var auth = firebase.auth();
	var provider = new firebase.auth.GoogleAuthProvider();
	auth.signInWithPopup(provider).then(function(authData){
		console.log(authData);
		authObject = authData;
		checkUserInDatabase(authData);
	}).catch(function(error){
		console.log("An error occured during login.");
		console.log(error);
	});
}