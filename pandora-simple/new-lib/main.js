// Initialize Firebase with 3.0 API
firebase.initializeApp(window.CONFIG);

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

renderUserModule();
renderSearchModule();