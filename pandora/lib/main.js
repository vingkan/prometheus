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