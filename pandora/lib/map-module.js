window.map = null;

window.renderMapModule = function(){

	var fb_url = 'prometheus/users';
	var fb = firebase.database().ref(fb_url);
	toggleLoading(true);
	fb.once('value', function(snapshot){
		var pointsList = [];
		var users = snapshot.val();
		for(var i in users){
			var u = users[i];
			var list = [];
			for(var n in u.visits){
				list.push(u.visits[n])
			}
			var last = list[list.length-1];
			if(last.meta.location !== 'NO_GEOLOCATION_EXCEPTION'){
				var point = {
					location: last.meta.location,
					profile: u.profile
				}
				if(point.location && point.profile){
					pointsList.push(point);
				}
			}
		}
		main(pointsList)
	});


	function main(pointsList){
		try{
			window.map = L.map('map-page');
			var map = window.map;
		}
		catch(e){
			var map = window.map;
		}
		var coords = pointsList[0].location;
		var zoom = 13;
		/*if(coords !== 'NO_GEOLOCATION_EXCEPTION'){*/
			map.setView([coords.latitude, coords.longitude], zoom);
		/*}*/
		var tile = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: 'OpenStreetMap'
		});
		tile.addTo(map);
		for(var c = 0; c < pointsList.length; c++){
			var user = pointsList[c];
			coords = user.location;
			/*if(coords !== 'NO_GEOLOCATION_EXCEPTION'){*/
				var marker = L.marker([coords.latitude, coords.longitude]);
				marker.addTo(map);
				var html = '<div class="map-tooltip-container">';
					html += '<img src="' + user.profile.img + '">';
					html += '<h4>' + user.profile.name + '</h4>';
					html += '</div>';
				marker.bindPopup(html).openPopup();
			/*}*/
		}
		toggleLoading(false);
	}

}

renderMapModule();