var BASE_URL = "https://prometheusjs.firebaseio.com/";
var userID;
var authObject;

function checkUserInDatabase(authData){
	userID = authData.google.id;
	var userData = {
		uid: userID,
		name: authData.google.displayName,
		email: authData.google.email,
		img: authData.google.profileImageURL
	}
	var path = BASE_URL + "/users/" + userID;
	var userRef = new Firebase(path);
	userRef.once('value', function(snapshot){
		if(!snapshot.exists()){
			var userDataRoute = new Firebase(path + "/auth");
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
	var ref = new Firebase(BASE_URL);
	ref.authWithOAuthPopup('google', function(error, authData){
		if(error){
			console.log(error);
		}
		else{
			console.log(authData);
			authObject = authData;
			checkUserInDatabase(authData);
		}
	},
	{
		scope: "email"
	});
}