// Initialize Firebase with 3.0 API
firebase.initializeApp(window.CONFIG);

/*var LIVE = false;

if(LIVE){
	loadFromFirebase('prometheusjs');
}
else{
	main(FB_DATA.prometheus);
}

$('#dashboard-key').blur(function(){
	loadFromFirebase(this.innerText.toLowerCase());
});*/

window.toggleLoading = function(assertion){
	if(assertion){
		document.body.classList.add('loading');
	}
	else{
		document.body.classList.remove('loading');
	}
}

window.toggleSpace = function(spaceID){
	var spaces = document.getElementsByClassName('space');
	for(var i = 0; i < spaces.length; i++){
		spaces[i].style.display = 'none';
	}
	var space = document.getElementById(spaceID);
		space.style.display = 'inline-block';
}

/*function main(data){
  //TEST DATA
}*/

/*var ignoreId = ['RKqN9KUHpaVRCiZ7t9fRtB0HWF12', '57323a772f5a2b64d5ceafc2', '56a6aec213cf349b97b3e58e', '575aeda1922f189bdcb6f091', '568eb4e705d347a26a94ecc4'];
for(var i = 0; i < ignoreId.length; i++){
	var ignoredUser = firebase.database().ref('prometheus/users/' + ignoreId[i]);
	ignoredUser.on('value', function(snapshot){
		ignoredUser.remove();
	});
}*/