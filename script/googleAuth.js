var userID;
var authObject;

function checkUserInDatabase(inData){
	var authData = inData.user.providerData[0];
	userID = authData.uid;
	var userData = {
		uid: userID,
		name: authData.displayName,
		email: authData.email,
		img: authData.photoURL
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